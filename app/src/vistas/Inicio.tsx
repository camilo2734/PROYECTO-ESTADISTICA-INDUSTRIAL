import { useMemo } from "react";
import type { Producto } from "../datos";
import { enlace } from "../ruta";
import Buscador from "../componentes/Buscador";
import Empaque from "../componentes/Empaque";

export default function Inicio({ productos }: { productos: Producto[] }) {
  // Estante: productos muy comprados, uno por tipo de empaque para mostrar la variedad del catálogo
  const estante = useMemo(() => {
    const vistos = new Set<string>();
    const out: Producto[] = [];
    for (const p of [...productos].sort((a, b) => b.c - a.c)) {
      if (vistos.has(p.e)) continue;
      vistos.add(p.e);
      out.push(p);
      if (out.length === 7) break;
    }
    return out;
  }, [productos]);

  const masComprados = useMemo(() => [...productos].sort((a, b) => b.c - a.c).slice(0, 8), [productos]);

  return (
    <main className="inicio" id="contenido">
      <section className="portada">
        <h1 className="portada__titulo">¿Qué producto buscas?</h1>
        <p className="portada__bajada">
          Escribe el nombre y te mostramos lo que suelen comprar junto con él las personas que también lo compran.
        </p>
        <Buscador productos={productos} grande autoFocus />
        <div className="estante" aria-label="Algunos productos del catálogo">
          {estante.map((p) => (
            <a key={p.id} href={enlace.producto(p.id)} className="estante__item" title={p.n}>
              <Empaque p={p} tam={112} />
            </a>
          ))}
          <div className="estante__tabla" aria-hidden="true" />
        </div>
      </section>

      <section className="inicio__caminos">
        <a className="camino" href={enlace.compradores()}>
          <span className="camino__icono" aria-hidden="true">
            <svg viewBox="0 0 48 48"><circle cx="24" cy="17" r="8" /><path d="M8 42c2-9 8-14 16-14s14 5 16 14" /></svg>
          </span>
          <span>
            <strong>Ver la tienda como un comprador</strong>
            <span>Elige un comprador y mira su historial al lado de lo que le recomendamos.</span>
          </span>
        </a>
        <a className="camino" href={enlace.canasta()}>
          <span className="camino__icono" aria-hidden="true">
            <svg viewBox="0 0 48 48"><path d="M8 16h32l-4 22H12z" /><path d="M17 16l7-9 7 9" /></svg>
          </span>
          <span>
            <strong>Arma tu canasta</strong>
            <span>Agrega varios productos y descubre qué los complementa.</span>
          </span>
        </a>
        <a className="camino" href={enlace.como()}>
          <span className="camino__icono" aria-hidden="true">
            <svg viewBox="0 0 48 48"><path d="M8 38h32" /><rect x="11" y="24" width="6" height="14" /><rect x="21" y="14" width="6" height="24" /><rect x="31" y="20" width="6" height="18" /></svg>
          </span>
          <span>
            <strong>Cómo elegimos las recomendaciones</strong>
            <span>De dónde salen y qué tan bien aciertan frente a mostrar solo lo más vendido.</span>
          </span>
        </a>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Los más comprados</h2>
        <div className="rejilla rejilla--compacta">
          {masComprados.map((p) => (
            <a key={p.id} className="mini" href={enlace.producto(p.id)}>
              <Empaque p={p} tam={84} />
              <span><strong>{p.n}</strong><small>{p.pr}</small></span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
