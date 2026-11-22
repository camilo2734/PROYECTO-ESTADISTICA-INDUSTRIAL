import { useEffect, useMemo, useRef } from "react";
import type { Producto } from "../datos";
import { pesos } from "../datos";
import { completarCanasta, totalCanasta, type Canasta } from "../canasta";
import { enlace, ir } from "../ruta";
import Empaque from "./Empaque";
import Icono from "./Icono";

interface Props { productos: Producto[]; canasta: Canasta; visible: boolean }

// Panel lateral que aparece al agregar un producto: confirma, muestra el subtotal y sugiere qué más llevar.
export default function PanelCanasta({ productos, canasta, visible }: Props) {
  const { ultimo, cerrarAviso } = canasta;
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const abierto = visible && !!ultimo;

  useEffect(() => {
    if (!abierto) return;
    cerrarRef.current?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrarAviso(); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abierto, ultimo?.vez, cerrarAviso]);

  const sugerencias = useMemo(
    () => (abierto ? completarCanasta(productos, canasta.items, 3) : []),
    [abierto, productos, canasta.items],
  );
  if (!abierto || !ultimo) return null;

  const agregados = ultimo.idxs.map((i) => productos[i]);
  const total = totalCanasta(productos, canasta);

  return (
    <div className="panel-canasta" role="presentation">
      <div className="panel-canasta__fondo" onClick={cerrarAviso} />
      <aside className="panel-canasta__caja" role="dialog" aria-modal="true" aria-labelledby="t-panel">
        <div className="panel-canasta__cabeza">
          <h2 id="t-panel"><span className="panel-canasta__ok"><Icono n="listo" tam={18} /></span>
            {agregados.length > 1 ? `Agregaste ${agregados.length} productos` : "Agregado a tu canasta"}</h2>
          <button type="button" ref={cerrarRef} className="panel-canasta__cerrar" onClick={cerrarAviso} aria-label="Cerrar">
            <Icono n="cerrar" tam={20} />
          </button>
        </div>

        <ul className="panel-canasta__agregados">
          {agregados.map((p) => (
            <li key={p.idx}>
              <Empaque p={p} tam={56} />
              <span><strong>{p.n}</strong><small>{p.pr || p.fo}</small></span>
              <b>{pesos(p.$)}</b>
            </li>
          ))}
        </ul>

        <div className="panel-canasta__total">
          <span>Subtotal ({canasta.unidades} {canasta.unidades === 1 ? "unidad" : "unidades"})</span>
          <strong>{pesos(total)}</strong>
        </div>
        <div className="panel-canasta__acciones">
          <button type="button" className="boton boton--ancho" onClick={() => { cerrarAviso(); ir(enlace.canasta()); }}>
            Ver canasta y finalizar
          </button>
          <button type="button" className="boton boton--secundario boton--ancho" onClick={cerrarAviso}>Seguir comprando</button>
        </div>

        {sugerencias.length > 0 && (
          <section className="panel-canasta__sugerencias" aria-labelledby="t-panel-sug">
            <h3 id="t-panel-sug">Completa tu compra</h3>
            <ul>
              {sugerencias.map(({ p }) => (
                <li key={p.idx}>
                  <a href={enlace.producto(p.id)} onClick={cerrarAviso}><Empaque p={p} tam={48} /></a>
                  <span><a href={enlace.producto(p.id)} onClick={cerrarAviso}>{p.n}</a><small>{pesos(p.$)}</small></span>
                  <button type="button" className="panel-canasta__mas" onClick={() => canasta.agregar(p.idx)}
                    aria-label={`Agregar ${p.n}`}><Icono n="mas" tam={18} /></button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}
