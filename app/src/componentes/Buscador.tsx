import { useEffect, useId, useMemo, useRef, useState } from "react";
import { buscar, type Producto } from "../datos";
import { enlace, ir } from "../ruta";
import Empaque from "./Empaque";

interface Props {
  productos: Producto[];
  grande?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  alElegir?: (p: Producto) => void; // por defecto, abre la vista del producto
}

// Campo de búsqueda por nombre con sugerencias (combobox accesible: flechas, Enter, Escape).
export default function Buscador({ productos, grande, autoFocus, placeholder, alElegir }: Props) {
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const id = useId();
  const caja = useRef<HTMLDivElement>(null);
  const resultados = useMemo(() => buscar(productos, q, 8), [productos, q]);

  useEffect(() => setActivo(0), [q]);
  useEffect(() => {
    const cerrar = (e: MouseEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false); };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const elegir = (p: Producto) => {
    setAbierto(false);
    setQ("");
    if (alElegir) alElegir(p); else ir(enlace.producto(p.id));
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAbierto(true); setActivo((a) => Math.min(a + 1, resultados.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActivo((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && resultados[activo]) { e.preventDefault(); elegir(resultados[activo]); }
    else if (e.key === "Escape") setAbierto(false);
  };

  const mostrar = abierto && q.trim().length >= 2;

  return (
    <div className={`buscador ${grande ? "buscador--grande" : ""}`} ref={caja}>
      <label htmlFor={`${id}-q`} className="sr-only">Buscar un producto por nombre</label>
      <svg className="buscador__lupa" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M15.5 15.5 L21 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <input
        id={`${id}-q`}
        type="search"
        role="combobox"
        aria-expanded={mostrar}
        aria-controls={`${id}-lista`}
        aria-activedescendant={mostrar && resultados[activo] ? `${id}-op-${activo}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        value={q}
        placeholder={placeholder ?? "Busca por nombre: vitamina E, loratadina, clotrimazol…"}
        onChange={(e) => { setQ(e.target.value); setAbierto(true); }}
        onFocus={() => setAbierto(true)}
        onKeyDown={teclas}
      />
      {mostrar && (
        <ul className="buscador__lista" id={`${id}-lista`} role="listbox">
          {resultados.length === 0 && (
            <li className="buscador__vacio" role="option" aria-selected="false">
              No hay productos con «{q}». Prueba con una sola palabra, por ejemplo el principio activo.
            </li>
          )}
          {resultados.map((p, i) => (
            <li key={p.id} id={`${id}-op-${i}`} role="option" aria-selected={i === activo}
              className={`buscador__op ${i === activo ? "es-activo" : ""}`}
              onMouseEnter={() => setActivo(i)} onMouseDown={(e) => { e.preventDefault(); elegir(p); }}>
              <Empaque p={p} tam={44} />
              <span>
                <strong>{p.n}</strong>
                <small>{p.pr || p.fo}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
