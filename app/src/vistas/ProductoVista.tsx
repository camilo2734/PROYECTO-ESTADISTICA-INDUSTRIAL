import type { Categoria, Producto } from "../datos";
import { miles, pesos } from "../datos";
import { enlace } from "../ruta";
import Empaque from "../componentes/Empaque";
import Tarjeta from "../componentes/Tarjeta";
import type { Canasta } from "../canasta";

interface Props { productos: Producto[]; categorias: Categoria[]; id: string; canasta: Canasta }

export default function ProductoVista({ productos, categorias, id, canasta }: Props) {
  const p = productos.find((x) => x.id === id);
  if (!p) {
    return (
      <main className="vacio" id="contenido">
        <h1>Este producto no está en el catálogo</h1>
        <p>El enlace puede estar incompleto. Busca el producto por su nombre desde el inicio.</p>
        <a className="boton" href={enlace.inicio()}>Ir al inicio</a>
      </main>
    );
  }
  const cat = categorias.find((c) => c.id === p.ca);
  const similares = p.s.map(([i, c, l]) => ({ q: productos[i], c, l }));
  const maxC = Math.max(1, ...similares.map((x) => x.l));
  const alternativas = p.a.map((i) => productos[i]).filter((x) => !similares.some((s) => s.q.idx === x.idx)).slice(0, 6);

  const razonAlternativa = (q: Producto) =>
    q.li === p.li && q.fo === p.fo ? `Misma línea y misma forma: ${q.fo.toLowerCase()}.`
      : q.li === p.li ? "De la misma línea de productos."
        : `También es ${q.fo.toLowerCase()}.`;

  return (
    <main id="contenido">
      <nav className="migas" aria-label="Estás en">
        <a href={enlace.catalogo()}>Productos</a> <span aria-hidden="true">/</span>{" "}
        {cat && <><a href={enlace.catalogo(cat.id)}>{cat.nombre}</a> <span aria-hidden="true">/</span>{" "}</>}
        <span>{p.n}</span>
      </nav>

      <section className="ficha">
        <div className="ficha__imagen"><Empaque p={p} tam={240} /></div>
        <div className="ficha__texto">
          <h1 className="ficha__nombre">{p.n}</h1>
          <p className="ficha__pres">{p.pr}</p>
          <ul className="chips" aria-label="Características">
            {cat && <li><a href={enlace.catalogo(cat.id)}>{cat.nombre}</a></li>}
            <li>{p.fo}</li>
            {p.rx === 1 && <li className="chip--alerta">Requiere fórmula médica</li>}
            <li>{p.iva === 0 ? "Sin IVA" : `IVA ${p.iva} %`}</li>
          </ul>
          {p.$ > 0 && (
            <p className="ficha__precio">{pesos(p.$)} <small>precio de referencia (mediana pagada en las facturas)</small></p>
          )}
          <p className="ficha__dato">
            Lo han comprado <strong>{miles(p.c)}</strong> {p.c === 1 ? "persona" : "personas"}
            {p.u > p.c ? <> ({miles(p.u)} unidades en total)</> : null}.
          </p>
          <p className="ficha__factura">Nombre en la factura: {p.d}</p>
          <div className="ficha__acciones">
            {canasta.tiene(p.idx) ? (
              <a className="boton boton--secundario" href={enlace.canasta()}>✓ En tu canasta: ver sugerencias</a>
            ) : (
              <button type="button" className="boton" onClick={() => canasta.agregar(p.idx)}>Agregar a la canasta</button>
            )}
            <a className="enlace-secundario" href={enlace.compradores(p.id)}>Ver compradores de este producto</a>
          </div>
        </div>
      </section>

      <section className="seccion" aria-labelledby="t-similares">
        <h2 className="seccion__titulo" id="t-similares">Quienes compran este producto también compran</h2>
        {similares.length === 0 ? (
          <p className="nota">
            Muy pocas personas han comprado este producto, así que todavía no hay suficientes compras en común para
            recomendar otros con confianza.
          </p>
        ) : (
          <div className="rejilla">
            {similares.map(({ q, c, l }) => (
              <Tarjeta key={q.id} p={q} fuerza={l / maxC}
                porque={<>{miles(c)} {c === 1 ? "comprador" : "compradores"} de <em>{p.n}</em> también {c === 1 ? "lo compró" : "lo compraron"}.</>}
                detalle={l >= 1.2 ? `Se compran juntos ${l.toLocaleString("es-CO")} veces más de lo esperado` : "Se compran juntos con frecuencia"} />
            ))}
          </div>
        )}
      </section>

      {alternativas.length > 0 && (
        <section className="seccion" aria-labelledby="t-alternativas">
          <h2 className="seccion__titulo" id="t-alternativas">Otras presentaciones parecidas</h2>
          <p className="seccion__bajada">Productos con características parecidas a este: misma línea, misma forma o tratamiento fiscal.</p>
          <div className="carril">
            {alternativas.map((q) => <Tarjeta key={q.id} p={q} porque={razonAlternativa(q)} />)}
          </div>
        </section>
      )}
    </main>
  );
}
