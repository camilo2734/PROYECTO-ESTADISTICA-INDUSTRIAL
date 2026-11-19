import { useEffect, useState } from "react";

// Enrutador por hash (#/producto/300000712). Funciona en cualquier hosting estático sin configuración.
export type Ruta =
  | { vista: "inicio" }
  | { vista: "producto"; id: string }
  | { vista: "compradores"; filtro?: string }
  | { vista: "comprador"; id: string }
  | { vista: "como" };

export function leerRuta(): Ruta {
  // Anclas simples (#producto-300000712): compatibles con cualquier hosting y con visores que solo admiten #nombre.
  const h = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  let m: RegExpMatchArray | null;
  if ((m = h.match(/^producto-(.+)$/))) return { vista: "producto", id: m[1] };
  if ((m = h.match(/^comprador-(.+)$/))) return { vista: "comprador", id: m[1] };
  if ((m = h.match(/^compradores(?:-(.+))?$/))) return { vista: "compradores", filtro: m[1] };
  if (h === "como-funciona") return { vista: "como" };
  return { vista: "inicio" };
}

export const enlace = {
  inicio: () => "#inicio",
  producto: (id: string) => `#producto-${id}`,
  comprador: (id: string) => `#comprador-${id}`,
  compradores: (filtro?: string) => (filtro ? `#compradores-${filtro}` : "#compradores"),
  como: () => "#como-funciona",
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
