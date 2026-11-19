import { useMemo, useState } from "react";
import type { IndiceCompradores, Producto, CompradorRaw } from "../datos";
import { mesAnio, miles } from "../datos";
import { enlace, ir } from "../ruta";
import Buscador from "../componentes/Buscador";
import Empaque from "../componentes/Empaque";

interface Props { productos: Producto[]; indice: IndiceCompradores | null; filtro?: string }

const POR_PAGINA = 24;

export default function CompradoresVista({ productos, indice, filtro }: Props) {
  const [codigo, setCodigo] = useState("");
  const [pagina, setPagina] = useState(1);
  const productoFiltro = filtro ? productos.find((p) => p.id === filtro) : undefined;

  const lista = useMemo(() => {
    if (!indice) return [];
    let base: CompradorRaw[] = indice.lista;
    if (productoFiltro) base = (indice.porProducto.get(productoFiltro.idx) ?? []).map((id) => indice.porId.get(id)!);
    const q = codigo.replace(/\D/g, "");
    if (q) base = base.filter((c) => c.id.includes(q));
    // Primero los compradores con un historial típico (alrededor de 25 productos); los mayoristas quedan al final
    return [...base].sort((a, b) => Math.abs(a.hi.length - 25) - Math.abs(b.hi.length - 25));
  }, [indice, productoFiltro, codigo]);

  const alAzar = () => {
    if (!indice) return;
    const fuente = lista.length ? lista : indice.lista;
    const c = fuente[Math.floor(Math.random() * fuente.length)];
    ir(enlace.comprador(c.id));
  };

  return (
    <main id="contenido">
      <header className="cabecera-vista">
        <h1>Elige un comprador</h1>
        <p>
          Cada comprador aparece con el código de cliente que trae la factura. Al abrirlo verás lo que ya compró
          y lo que le recomendamos, sin repetir nada de lo que ya tiene.
        </p>
      </header>

      <div className="filtros">
        <div className="campo">
          <label htmlFor="codigo">Código del comprador</label>
          <input id="codigo" inputMode="numeric" placeholder="Por ejemplo, 700000082" value={codigo}
            onChange={(e) => { setCodigo(e.target.value); setPagina(1); }}
            onKeyDown={(e) => { if (e.key === "Enter" && lista.length === 1) ir(enlace.comprador(lista[0].id)); }} />
        </div>
        <div className="campo campo--ancho">
          <span className="campo__etiqueta" id="et-compro">Que haya comprado</span>
          {productoFiltro ? (
            <div className="filtro-activo" aria-labelledby="et-compro">
              <Empaque p={productoFiltro} tam={36} />
              <span>{productoFiltro.n}</span>
              <a href={enlace.compradores()} className="filtro-activo__quitar" aria-label={`Quitar el filtro ${productoFiltro.n}`}>Quitar</a>
            </div>
          ) : (
            <Buscador productos={productos} placeholder="Busca un producto…"
              alElegir={(p) => { setPagina(1); ir(enlace.compradores(p.id)); }} />
          )}
        </div>
        <button className="boton" type="button" onClick={alAzar} disabled={!indice}>Elegir uno al azar</button>
      </div>

      {!indice ? (
        <div className="cargando" role="status">Cargando compradores…</div>
      ) : (
        <>
          <p className="conteo" role="status">
            {lista.length === 0 ? "Ningún comprador coincide. Revisa el código o quita el filtro."
              : `${miles(lista.length)} ${lista.length === 1 ? "comprador" : "compradores"}${productoFiltro ? ` compraron ${productoFiltro.n}` : ""}`}
          </p>
          <ul className="compradores">
            {lista.slice(0, pagina * POR_PAGINA).map((c) => (
              <li key={c.id}>
                <a className="comprador-item" href={enlace.comprador(c.id)}>
                  <span className="comprador-item__codigo">Comprador {c.id}</span>
                  <span className="comprador-item__resumen">
                    {c.hi.length} productos distintos, {miles(c.f)} {c.f === 1 ? "compra" : "compras"}, {mesAnio(c.d)} a {mesAnio(c.h)}
                  </span>
                  <span className="comprador-item__muestra" aria-hidden="true">
                    {c.hi.slice(0, 3).map(([i]) => <Empaque key={i} p={productos[i]} tam={40} />)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {lista.length > pagina * POR_PAGINA && (
            <button className="boton boton--secundario centrado" type="button" onClick={() => setPagina((x) => x + 1)}>
              Ver más compradores
            </button>
          )}
        </>
      )}
    </main>
  );
}
