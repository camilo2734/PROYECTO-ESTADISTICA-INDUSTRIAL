import { useMemo } from "react";
import type { Producto } from "../datos";
import { miles } from "../datos";
import { completarCanasta, type Canasta } from "../canasta";
import { enlace } from "../ruta";
import Buscador from "../componentes/Buscador";
import Empaque from "../componentes/Empaque";
import Tarjeta from "../componentes/Tarjeta";

interface Props { productos: Producto[]; canasta: Canasta }

// Canastas de ejemplo para empezar con un clic (productos reales del catálogo)
const EJEMPLOS: { etiqueta: string; ids: string[] }[] = [
  { etiqueta: "Metformina 850 mg", ids: ["300001925"] },
  { etiqueta: "Novamil Premium 1 y Nistatina + óxido de zinc", ids: ["500000293", "300001554"] },
  { etiqueta: "Lagrifresh", ids: ["300000057"] },
];

const lista = (nombres: string[]) =>
  nombres.length <= 1 ? nombres.join("") : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;

export default function CanastaVista({ productos, canasta }: Props) {
  const { items, agregar, quitar, vaciar } = canasta;
  const sugerencias = useMemo(() => completarCanasta(productos, items), [productos, items]);
  const maxPuntaje = Math.max(1e-9, ...sugerencias.map((s) => s.puntaje));
  const porId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);

  const cargarEjemplo = (ids: string[]) => {
    vaciar();
    ids.forEach((id) => { const p = porId.get(id); if (p) agregar(p.idx); });
  };

  return (
    <main id="contenido">
      <header className="cabecera-vista">
        <h1>Arma tu canasta</h1>
        <p>Agrega los productos que llevarías y te mostramos lo que mejor los complementa, según lo que compran juntas otras personas.</p>
      </header>

      <div className="canasta">
        <section className="canasta__lista" aria-labelledby="t-canasta">
          <div className="canasta__cabeza">
            <h2 className="seccion__titulo" id="t-canasta">Tu canasta</h2>
            <span className="canasta__conteo">{items.length} {items.length === 1 ? "producto" : "productos"}</span>
          </div>
          <Buscador productos={productos} placeholder="Agrega un producto por su nombre…" alElegir={(p) => agregar(p.idx)} />

          {items.length === 0 ? (
            <div className="canasta__vacia">
              <p>Tu canasta está vacía. Busca un producto arriba o empieza con un ejemplo:</p>
              <ul>
                {EJEMPLOS.map((ej) => (
                  <li key={ej.etiqueta}>
                    <button type="button" className="ejemplo" onClick={() => cargarEjemplo(ej.ids)}>{ej.etiqueta}</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <ul className="canasta__items">
                {items.map((i) => {
                  const p = productos[i];
                  return (
                    <li key={i} className="canasta__item">
                      <a href={enlace.producto(p.id)} className="canasta__producto">
                        <Empaque p={p} tam={52} />
                        <span><strong>{p.n}</strong><small>{p.pr || p.fo}</small></span>
                      </a>
                      <button type="button" className="quitar" onClick={() => quitar(i)} aria-label={`Quitar ${p.n} de la canasta`}>Quitar</button>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="boton boton--secundario" onClick={vaciar}>Vaciar canasta</button>
            </>
          )}
          <p className="canasta__metodo">
            <strong>Cómo se calcula:</strong> cada producto sugerido suma su similitud con todos los de tu canasta (coseno ajustado por
            popularidad, calculado en R). Lo que se relaciona con varios de tus productos sube en la lista.
          </p>
        </section>

        <section className="canasta__sugerencias" aria-labelledby="t-sugerencias" aria-live="polite">
          <h2 className="seccion__titulo" id="t-sugerencias">Para completar tu canasta</h2>
          {items.length === 0 ? (
            <p className="seccion__bajada">Aquí aparecerán las sugerencias en cuanto agregues un producto.</p>
          ) : sugerencias.length === 0 ? (
            <p className="nota">Los productos de tu canasta tienen muy pocas compras en común con otros, así que no hay sugerencias con suficiente respaldo. Prueba agregando otro producto.</p>
          ) : (
            <>
              <p className="seccion__bajada">Ordenadas de la que más complementa tu canasta a la que menos.</p>
              <div className="rejilla rejilla--dos">
                {sugerencias.map(({ p, puntaje, relacionados }) => {
                  const fuerte = relacionados[0];
                  const mismoNombre = items.map((i) => productos[i]).find((q) => q.n === p.n);
                  return (
                    <div key={p.idx} className="sugerencia">
                      <Tarjeta p={p} fuerza={puntaje / maxPuntaje}
                        porque={mismoNombre
                          ? <>Otra presentación de <em>{mismoNombre.n}</em>, que ya está en tu canasta.</>
                          : <>Se compra junto con <em>{lista(relacionados.map((r) => r.q.n))}</em>.</>}
                        detalle={<>{miles(fuerte.c)} compradores de {fuerte.q.n} también lo compraron</>} />
                      <button type="button" className="agregar" onClick={() => agregar(p.idx)}>
                        Agregar a la canasta
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
