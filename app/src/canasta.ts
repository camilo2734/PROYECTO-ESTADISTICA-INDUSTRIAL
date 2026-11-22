import { useCallback, useEffect, useMemo, useState } from "react";
import type { Producto } from "./datos";

// Estado de la canasta: productos (en el orden en que se agregaron) con su cantidad.
// Se recuerda en el navegador si este lo permite; si no, vive solo en memoria.
const CLAVE = "vitrina-canasta";
const MAX = 20;

interface Linea { i: number; q: number }

function leer(): Linea[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE) ?? "[]");
    if (!Array.isArray(v)) return [];
    // Compatible con la versión anterior, que guardaba solo índices
    return v
      .map((x) => (Number.isInteger(x) ? { i: x, q: 1 } : x))
      .filter((x): x is Linea => x && Number.isInteger(x.i) && Number.isInteger(x.q) && x.q > 0)
      .map((x) => ({ i: x.i, q: Math.min(MAX, x.q) }));
  } catch {
    return [];
  }
}

export interface Canasta {
  items: number[];                       // índices de producto, sin repetir
  cantidad: (idx: number) => number;
  unidades: number;                      // total de unidades
  agregar: (idx: number, q?: number) => void;
  cambiar: (idx: number, q: number) => void;
  quitar: (idx: number) => void;
  vaciar: () => void;
  tiene: (idx: number) => boolean;
  agregarVarios: (idxs: number[]) => void;
  ultimo: { idxs: number[]; vez: number } | null;  // lo último agregado (abre el panel lateral)
  cerrarAviso: () => void;
}

export function useCanasta(): Canasta {
  const [lineas, setLineas] = useState<Linea[]>(leer);
  const [ultimo, setUltimo] = useState<{ idxs: number[]; vez: number } | null>(null);
  useEffect(() => {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(lineas)); } catch { /* solo en memoria */ }
  }, [lineas]);

  const agregar = useCallback((i: number, q = 1) => {
    setLineas((xs) => {
      const l = xs.find((x) => x.i === i);
      return l ? xs.map((x) => (x.i === i ? { i, q: Math.min(MAX, x.q + q) } : x)) : [...xs, { i, q: Math.min(MAX, q) }];
    });
    setUltimo({ idxs: [i], vez: Date.now() });
  }, []);
  const agregarVarios = useCallback((idxs: number[]) => {
    setLineas((xs) => {
      let ys = xs;
      for (const i of idxs) ys = ys.some((x) => x.i === i) ? ys.map((x) => (x.i === i ? { i, q: Math.min(MAX, x.q + 1) } : x)) : [...ys, { i, q: 1 }];
      return ys;
    });
    setUltimo({ idxs, vez: Date.now() });
  }, []);
  const cambiar = useCallback((i: number, q: number) =>
    setLineas((xs) => (q <= 0 ? xs.filter((x) => x.i !== i) : xs.map((x) => (x.i === i ? { i, q: Math.min(MAX, q) } : x)))), []);
  const quitar = useCallback((i: number) => setLineas((xs) => xs.filter((x) => x.i !== i)), []);
  const vaciar = useCallback(() => setLineas([]), []);
  const cerrarAviso = useCallback(() => setUltimo(null), []);

  return useMemo(() => {
    const mapa = new Map(lineas.map((l) => [l.i, l.q]));
    return {
      items: lineas.map((l) => l.i),
      cantidad: (i: number) => mapa.get(i) ?? 0,
      unidades: lineas.reduce((s, l) => s + l.q, 0),
      agregar, agregarVarios, cambiar, quitar, vaciar,
      tiene: (i: number) => mapa.has(i),
      ultimo, cerrarAviso,
    };
  }, [lineas, ultimo, agregar, agregarVarios, cambiar, quitar, vaciar, cerrarAviso]);
}

export function totalCanasta(productos: Producto[], c: Canasta): number {
  return c.items.reduce((s, i) => s + productos[i].$ * c.cantidad(i), 0);
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
