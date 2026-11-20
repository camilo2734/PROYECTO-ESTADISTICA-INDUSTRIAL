import { useCallback, useEffect, useState } from "react";
import type { Producto } from "./datos";

// Estado de la canasta: lista de índices de producto. Se recuerda en el navegador si este lo permite.
const CLAVE = "vitrina-canasta";

function leer(): number[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => Number.isInteger(x)) : [];
  } catch {
    return [];
  }
}

export interface Canasta {
  items: number[];
  agregar: (idx: number) => void;
  quitar: (idx: number) => void;
  vaciar: () => void;
  tiene: (idx: number) => boolean;
}

export function useCanasta(): Canasta {
  const [items, setItems] = useState<number[]>(leer);
  useEffect(() => {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(items)); } catch { /* sin almacenamiento: solo en memoria */ }
  }, [items]);
  const agregar = useCallback((i: number) => setItems((xs) => (xs.includes(i) ? xs : [...xs, i])), []);
  const quitar = useCallback((i: number) => setItems((xs) => xs.filter((x) => x !== i)), []);
  const vaciar = useCallback(() => setItems([]), []);
  const tiene = useCallback((i: number) => items.includes(i), [items]);
  return { items, agregar, quitar, vaciar, tiene };
}

export interface Sugerencia {
  p: Producto;
  puntaje: number;                         // suma de similitudes con los productos de la canasta
  relacionados: { q: Producto; c: number; s: number }[]; // productos de la canasta que lo sustentan
}

// Recomendación ítem–ítem para un conjunto de productos: score_j = Σ_i sim(i, j), con sim el coseno
// ajustado por popularidad exportado por R (los 12 similares de cada producto de la canasta).
export function completarCanasta(productos: Producto[], items: number[], n = 12): Sugerencia[] {
  const acumulado = new Map<number, Sugerencia>();
  for (const i of items) {
    const q = productos[i];
    for (const [j, c, , s] of q.s) {
      if (items.includes(j)) continue;
      const actual = acumulado.get(j) ?? { p: productos[j], puntaje: 0, relacionados: [] };
      actual.puntaje += s;
      actual.relacionados.push({ q, c, s });
      acumulado.set(j, actual);
    }
  }
  return [...acumulado.values()]
    .map((x) => ({ ...x, relacionados: x.relacionados.sort((a, b) => b.s - a.s) }))
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, n);
}
