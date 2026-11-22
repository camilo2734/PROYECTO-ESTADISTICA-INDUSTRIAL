import { useMemo, useState } from "react";
import type { Producto } from "../datos";
import { pesos } from "../datos";
import { completarCanasta, totalCanasta, type Canasta } from "../canasta";
import { enlace } from "../ruta";
import Buscador from "../componentes/Buscador";
import Empaque from "../componentes/Empaque";
import Icono from "../componentes/Icono";
import TarjetaVenta from "../componentes/TarjetaVenta";

interface Props { productos: Producto[]; canasta: Canasta }

interface Pedido { numero: string; lineas: { p: Producto; q: number }[]; total: number; fecha: string }

const lista = (nombres: string[]) =>
  nombres.length <= 1 ? nombres.join("") : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;

export default function CanastaVista({ productos, canasta }: Props) {
  const { items, agregar, cambiar, quitar, vaciar, cantidad, unidades } = canasta;
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const sugerencias = useMemo(() => completarCanasta(productos, items, 8), [productos, items]);
  const total = totalCanasta(productos, canasta);
  const conFormula = items.map((i) => productos[i]).filter((p) => p.rx === 1);

  const confirmar = () => {
    const numero = `VT-${String(Date.now()).slice(-6)}`;
    setPedido({
      numero,
      lineas: items.map((i) => ({ p: productos[i], q: cantidad(i) })),
      total,
      fecha: new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" }),
    });
    vaciar();
    window.scrollTo({ top: 0 });
  };

  if (pedido) {
    return (
      <main id="contenido" className="pedido">
        <div className="pedido__caja">
          <span className="pedido__ok"><Icono n="listo" tam={34} /></span>
          <h1>¡Pedido recibido!</h1>
          <p className="pedido__numero">Pedido <strong>{pedido.numero}</strong> · {pedido.fecha}</p>
          <ul className="pedido__lineas">
            {pedido.lineas.map(({ p, q }) => (
              <li key={p.idx}><span>{q} × {p.n}</span><span>{pesos(p.$ * q)}</span></li>
            ))}
          </ul>
          <p className="pedido__total"><span>Total</span><strong>{pesos(pedido.total)}</strong></p>
          <p className="pedido__nota">Este es un pedido de demostración: no se realizó ningún cobro ni se enviará ningún producto.</p>
          <a className="boton" href={enlace.inicio()}>Volver a la tienda</a>
        </div>
      </main>
    );
  }

  return (
    <main id="contenido">
      <header className="cabecera-vista">
        <h1>Tu canasta</h1>
        <p>{items.length ? `${unidades} ${unidades === 1 ? "unidad" : "unidades"} de ${items.length} ${items.length === 1 ? "producto" : "productos"}.` : "Agrega productos y aquí verás el total de tu compra."}</p>
      </header>

      <div className="caja">
        <section className="caja__lista" aria-labelledby="t-canasta">
          <h2 className="sr-only" id="t-canasta">Productos en tu canasta</h2>
          <div className="caja__buscar">
            <Buscador productos={productos} placeholder="Agrega un producto por su nombre…" alElegir={(p) => agregar(p.idx)} />
          </div>

          {items.length === 0 ? (
            <div className="caja__vacia">
              <Icono n="carrito" tam={48} />
              <p><strong>Tu canasta está vacía.</strong></p>
              <p>Busca un producto arriba, recorre el catálogo o deja que te armemos un paquete según lo que sientes.</p>
              <div className="caja__vacia-acciones">
                <a className="boton" href={enlace.malestares()}>¿Qué tienes? Ver paquetes</a>
                <a className="boton boton--secundario" href={enlace.catalogo()}>Ver productos</a>
              </div>
            </div>
          ) : (
            <>
              <ul className="caja__items">
                {items.map((i) => {
                  const p = productos[i];
                  const q = cantidad(i);
                  return (
                    <li key={i} className="caja__item">
                      <a href={enlace.producto(p.id)} className="caja__img" aria-hidden="true" tabIndex={-1}><Empaque p={p} tam={72} /></a>
                      <div className="caja__info">
                        <a href={enlace.producto(p.id)} className="caja__nombre">{p.n}</a>
                        <span className="caja__pres">{p.pr || p.fo}</span>
                        {p.rx === 1 && <span className="caja__rx">Requiere fórmula médica</span>}
                        <span className="caja__unitario">{pesos(p.$)} c/u</span>
                      </div>
                      <div className="cantidad" role="group" aria-label={`Cantidad de ${p.n}`}>
                        <button type="button" onClick={() => cambiar(i, q - 1)} aria-label={q === 1 ? `Quitar ${p.n}` : "Una menos"}>
                          <Icono n={q === 1 ? "basura" : "menos"} tam={16} />
                        </button>
                        <span aria-live="polite">{q}</span>
                        <button type="button" onClick={() => cambiar(i, q + 1)} disabled={q >= 20} aria-label="Una más"><Icono n="mas" tam={16} /></button>
                      </div>
                      <div className="caja__linea">
                        <strong>{pesos(p.$ * q)}</strong>
                        <button type="button" className="quitar" onClick={() => quitar(i)}>Quitar</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="enlace-secundario caja__vaciar" onClick={vaciar}>Vaciar canasta</button>
            </>
          )}
        </section>

        <aside className="resumen" aria-labelledby="t-resumen">
          <h2 id="t-resumen">Resumen del pedido</h2>
          <dl>
            <div><dt>Productos ({unidades})</dt><dd>{pesos(total)}</dd></div>
            <div><dt>Domicilio</dt><dd className="resumen__gratis">Gratis</dd></div>
          </dl>
          <p className="resumen__total"><span>Total</span><strong>{pesos(total)}</strong></p>
          {conFormula.length > 0 && (
            <p className="resumen__aviso"><Icono n="alerta" tam={18} />
              {lista(conFormula.map((p) => p.n))} {conFormula.length === 1 ? "requiere" : "requieren"} fórmula médica: tenla a mano al recibir tu pedido.</p>
          )}
          <button type="button" className="boton boton--ancho boton--grande" disabled={!items.length} onClick={confirmar}>
            Confirmar pedido
          </button>
          <a className="enlace-secundario resumen__seguir" href={enlace.catalogo()}>Seguir comprando</a>
        </aside>
      </div>

      {sugerencias.length > 0 && (
        <section className="seccion" aria-labelledby="t-sugerencias">
          <h2 className="seccion__titulo" id="t-sugerencias"><Icono n="juntos" tam={24} /> Completa tu compra</h2>
          <p className="seccion__bajada">Productos que suelen llevarse junto con los de tu canasta.</p>
          <div className="rejilla-venta">
            {sugerencias.map(({ p, relacionados }) => (
              <TarjetaVenta key={p.idx} p={p} canasta={canasta} porque={<>Va con {relacionados[0].q.n}</>} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
