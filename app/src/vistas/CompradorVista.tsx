import type { IndiceCompradores, Producto } from "../datos";
import { mesAnio, miles } from "../datos";
import { enlace } from "../ruta";
import Empaque from "../componentes/Empaque";
import TarjetaVenta from "../componentes/TarjetaVenta";
import type { Canasta } from "../canasta";

interface Props { productos: Producto[]; indice: IndiceCompradores | null; id: string; canasta: Canasta }

export default function CompradorVista({ productos, indice, id, canasta }: Props) {
  if (!indice) return <main className="cargando" role="status" id="contenido">Cargando el historial del comprador…</main>;
  const c = indice.porId.get(id);
  if (!c) {
    return (
      <main className="vacio" id="contenido">
        <h1>No encontramos al comprador {id}</h1>
        <p>Revisa el código o elige otro comprador de la lista.</p>
        <a className="boton" href={enlace.compradores()}>Ver la lista de compradores</a>
      </main>
    );
  }
  const unidades = c.hi.reduce((s, h) => s + h[1], 0);

  return (
    <main id="contenido">
      <nav className="migas" aria-label="Estás en">
        <a href={enlace.compradores()}>Compradores</a> <span aria-hidden="true">/</span> <span>Comprador {c.id}</span>
      </nav>

      <header className="perfil">
        <div>
          <h1>Comprador {c.id}</h1>
          <p>
            Ha comprado <strong>{c.hi.length} productos distintos</strong> ({miles(unidades)} unidades) en{" "}
            {miles(c.f)} {c.f === 1 ? "compra" : "compras"}, entre {mesAnio(c.d)} y {mesAnio(c.h)}.
          </p>
        </div>
        <a className="boton boton--secundario" href={enlace.compradores()}>Elegir otro comprador</a>
      </header>

      <div className="dos-columnas">
        <section className="historial" aria-labelledby="t-historial">
          <h2 className="seccion__titulo" id="t-historial">Ya compraste</h2>
          <p className="seccion__bajada">Ordenado de lo que más compraste a lo que menos.</p>
          <ol className="historial__lista">
            {c.hi.map(([i, u, f]) => {
              const p = productos[i];
              return (
                <li key={i}>
                  <a href={enlace.producto(p.id)} className="historial__item">
                    <Empaque p={p} tam={48} />
                    <span>
                      <strong>{p.n}</strong>
                      <small>{p.pr}</small>
                    </span>
                    <span className="historial__cantidad">
                      {u} {u === 1 ? "und." : "und."}
                      <small>{f} {f === 1 ? "vez" : "veces"}</small>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="recomendaciones" aria-labelledby="t-recs">
          <h2 className="seccion__titulo" id="t-recs">Te puede interesar</h2>
          <p className="seccion__bajada">Elegidos para ti a partir de lo que ya compraste.</p>
          {c.r.length === 0 ? (
            <p className="nota">Todavía no tenemos sugerencias para ti. Mira lo más comprado en el inicio.</p>
          ) : (
            <div className="rejilla-venta rejilla-venta--dos">
              {c.r.map(([i, , rel], k) => {
                const q = productos[i];
                const relacionado = rel >= 0 ? productos[rel] : null;
                return (
                  <TarjetaVenta key={i} p={q} canasta={canasta}
                    insignia={k < 3 ? { texto: "Para ti", tipo: "afinidad" } : undefined}
                    porque={relacionado ? <>Va con {relacionado.n}, que ya compraste</> : undefined} />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
