import { useEffect, useState } from "react";

// Enrutador por hash (#/producto/300000712). Funciona en cualquier hosting estático sin configuración.
export type Ruta =
  | { vista: "inicio" }
  | { vista: "producto"; id: string }
  | { vista: "compradores"; filtro?: string }
  | { vista: "comprador"; id: string }
  | { vista: "como" }
  | { vista: "canasta" }
  | { vista: "catalogo"; cat?: string }
  | { vista: "malestares" }
  | { vista: "paquete"; malestar: string; nivel: string };

export function leerRuta(): Ruta {
  // Anclas simples (#producto-300000712): compatibles con cualquier hosting y con visores que solo admiten #nombre.
  const h = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  let m: RegExpMatchArray | null;
  if ((m = h.match(/^producto-(.+)$/))) return { vista: "producto", id: m[1] };
  if ((m = h.match(/^comprador-(.+)$/))) return { vista: "comprador", id: m[1] };
  if ((m = h.match(/^compradores(?:-(.+))?$/))) return { vista: "compradores", filtro: m[1] };
  if (h === "como-funciona") return { vista: "como" };
  if (h === "canasta") return { vista: "canasta" };
  if (h === "que-tienes") return { vista: "malestares" };
  if ((m = h.match(/^que-tienes-([a-z]+)(?:-(leve|moderado|fuerte))?$/))) return { vista: "paquete", malestar: m[1], nivel: m[2] ?? "moderado" };
  if ((m = h.match(/^productos(?:-(.+))?$/))) return { vista: "catalogo", cat: m[1] };
  return { vista: "inicio" };
}

export const enlace = {
  inicio: () => "#inicio",
  producto: (id: string) => `#producto-${id}`,
  comprador: (id: string) => `#comprador-${id}`,
  compradores: (filtro?: string) => (filtro ? `#compradores-${filtro}` : "#compradores"),
  como: () => "#como-funciona",
  canasta: () => "#canasta",
  catalogo: (cat?: string) => (cat ? `#productos-${cat}` : "#productos"),
  malestares: () => "#que-tienes",
  paquete: (malestar: string, nivel = "moderado") => `#que-tienes-${malestar}-${nivel}`,
};

export const ir = (href: string) => { window.location.hash = href.replace(/^#/, ""); };

export function useRuta() {
  const [ruta, setRuta] = useState<Ruta>(leerRuta);
  useEffect(() => {
    const f = () => {
      setRuta(leerRuta());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return ruta;
}
