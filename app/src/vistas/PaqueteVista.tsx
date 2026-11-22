import { useMemo } from "react";
import type { Producto } from "../datos";
import { pesos } from "../datos";
import { completarCanasta, type Canasta } from "../canasta";
import { MALESTARES, NIVELES, malestarPorId, type Nivel } from "../paquetes";
import { enlace } from "../ruta";
import Empaque from "../componentes/Empaque";
import Icono from "../componentes/Icono";
import TarjetaVenta from "../componentes/TarjetaVenta";

interface Props { productos: Producto[]; canasta: Canasta; malestar: string; nivel: string }

export default function PaqueteVista({ productos, canasta, malestar, nivel }: Props) {
  const m = malestarPorId(malestar);
  const n = (NIVELES.find((x) => x.id === nivel)?.id ?? "moderado") as Nivel;
  const porId = useMemo(() => new Map(productos.map((p) => [p.id, p])), [productos]);
  const items = useMemo(
    () => (m ? m.niveles[n].items.map((x) => ({ ...x, p: porId.get(x.id) })).filter((x): x is typeof x & { p: Producto } => !!x.p) : []),
    [m, n, porId],
  );
  const complementos = useMemo(() => completarCanasta(productos, items.map((x) => x.p.idx), 4), [productos, items]);

  if (!m) {
    return (
      <main className="vacio" id="contenido">
        <h1>No encontramos ese malestar</h1>
        <a className="boton" href={enlace.malestares()}>Ver todos los malestares</a>
      </main>
    );
  }

  const total = items.reduce((s, x) => s + x.p.$, 0);
  const todosEnCanasta = items.every((x) => canasta.tiene(x.p.idx));
  const fuerte = n === "fuerte";

  return (
    <main id="contenido">
      <nav className="migas" aria-label="Estás en">
        <a href={enlace.malestares()}>¿Qué tienes?</a> <span aria-hidden="true">/</span> <span>{m.nombre}</span>
      </nav>

      <header className="paquete__cabeza">
        <span className="malestar__icono malestar__icono--grande"><Icono n={m.icono} tam={40} /></span>
        <div>
          <h1>{m.nombre}</h1>
          <p>{m.frase}</p>
        </div>
      </header>

      <div className="niveles" role="radiogroup" aria-label="¿Qué tan fuerte es?">
        <span className="niveles__titulo">¿Qué tan fuerte es?</span>
        {NIVELES.map((x) => (
          <a key={x.id} href={enlace.paquete(m.id, x.id)} role="radio" aria-checked={x.id === n}
            className={`nivel nivel--${x.id} ${x.id === n ? "es-activo" : ""}`}>
            <strong>{x.nombre}</strong><span>{x.describe}</span>
          </a>
        ))}
      </div>

      {fuerte && (
        <div className="aviso-medico" role="note">
          <Icono n="alerta" tam={24} />
          <p><strong>Si tus síntomas son fuertes, consulta a tu médico.</strong> Este paquete te ayuda a sentirte mejor mientras tanto,
            pero no reemplaza una valoración médica.</p>
        </div>
      )}

      <div className="paquete">
        <section className="paquete__caja" aria-labelledby="t-paquete">
          <h2 id="t-paquete"><Icono n="paquete" tam={24} /> Tu paquete para {m.nombre.toLowerCase()} {NIVELES.find((x) => x.id === n)!.nombre.toLowerCase()}</h2>
          <ul className="paquete__items">
            {items.map(({ p, para }) => (
              <li key={p.idx}>
                <a href={enlace.producto(p.id)} className="paquete__img"><Empaque p={p} tam={76} /></a>
                <div>
                  <a href={enlace.producto(p.id)} className="paquete__nombre">{p.n}</a>
                  <span className="paquete__pres">{p.pr || p.fo}</span>
                  <span className="paquete__para">{para}</span>
                </div>
                <strong>{pesos(p.$)}</strong>
              </li>
            ))}
          </ul>
          <div className="paquete__total">
            <span>Total del paquete <small>({items.length} {items.length === 1 ? "producto" : "productos"})</small></span>
            <strong>{pesos(total)}</strong>
          </div>
          {todosEnCanasta ? (
            <a className="boton boton--ancho boton--grande boton--secundario" href={enlace.canasta()}>✓ Ya está en tu canasta: ver canasta</a>
          ) : (
            <button type="button" className="boton boton--ancho boton--grande" onClick={() => canasta.agregarVarios(items.map((x) => x.p.idx))}>
              <Icono n="agregarCarrito" tam={20} /> Agregar paquete a la canasta
            </button>
          )}
        </section>

        <aside className="paquete__lado">
          <section className="cuidados">
            <h2>Cuidados en casa</h2>
            <ul>{m.niveles[n].cuidados.map((c) => <li key={c}>{c}</li>)}</ul>
          </section>
          <section className="alarma">
            <h2><Icono n="alerta" tam={20} /> Busca atención médica si tienes</h2>
            <ul>{m.alarma.map((a) => <li key={a}>{a}</li>)}</ul>
            <p>En una emergencia, llama a la línea <strong>123</strong>.</p>
          </section>
        </aside>
      </div>

      {complementos.length > 0 && (
        <section className="seccion" aria-labelledby="t-tambien">
          <h2 className="seccion__titulo" id="t-tambien"><Icono n="juntos" tam={24} /> Quienes llevan estos productos también compran</h2>
          <div className="rejilla-venta">
            {complementos.map(({ p }) => <TarjetaVenta key={p.idx} p={p} canasta={canasta} />)}
          </div>
        </section>
      )}

      <section className="seccion" aria-labelledby="t-otros">
        <h2 className="seccion__titulo" id="t-otros">Otros malestares</h2>
        <div className="chips-malestar">
          {MALESTARES.filter((x) => x.id !== m.id).map((x) => (
            <a key={x.id} href={enlace.paquete(x.id, n)} className="chip-rapido"><Icono n={x.icono} tam={16} /> {x.nombre}</a>
          ))}
        </div>
      </section>

      <p className="nota-salud"><Icono n="alerta" tam={18} />
        Solo productos de venta libre. Lee siempre el empaque y sigue sus indicaciones. Si estás embarazada, tomas otros medicamentos
        o es para un niño, pregunta antes a tu médico o farmacéutico.</p>
    </main>
  );
}
