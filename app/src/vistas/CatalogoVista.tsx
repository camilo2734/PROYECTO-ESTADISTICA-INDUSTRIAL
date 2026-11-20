import { useEffect, useMemo, useState } from "react";
import type { Categoria, Producto } from "../datos";
import { buscar, miles } from "../datos";
import type { Canasta } from "../canasta";
import { enlace } from "../ruta";
import Icono from "../componentes/Icono";
import TarjetaVenta from "../componentes/TarjetaVenta";

interface Props { productos: Producto[]; categorias: Categoria[]; canasta: Canasta; cat?: string }

type Orden = "compradores" | "nombre" | "precio-asc" | "precio-desc";
const POR_PAGINA = 24;

export default function CatalogoVista({ productos, categorias, canasta, cat }: Props) {
  const [orden, setOrden] = useState<Orden>("compradores");
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const categoria = categorias.find((c) => c.id === cat);
  useEffect(() => { setPagina(1); setFiltro(""); }, [cat]);

  const lista = useMemo(() => {
    let base = categoria ? productos.filter((p) => p.ca === categoria.id) : productos;
    if (filtro.trim().length >= 2) {
      const encontrados = new Set(buscar(base, filtro, 1000).map((p) => p.idx));
      base = base.filter((p) => encontrados.has(p.idx));
    }
    const ordenada = [...base];
    if (orden === "compradores") ordenada.sort((a, b) => b.c - a.c);
    if (orden === "nombre") ordenada.sort((a, b) => a.n.localeCompare(b.n, "es"));
    if (orden === "precio-asc") ordenada.sort((a, b) => a.$ - b.$);
    if (orden === "precio-desc") ordenada.sort((a, b) => b.$ - a.$);
    return ordenada;
  }, [productos, categoria, filtro, orden]);

  return (
    <main id="contenido">
      <nav className="migas" aria-label="Estás en">
        <a href={enlace.inicio()}>Inicio</a> <span aria-hidden="true">/</span>{" "}
        {categoria ? <><a href={enlace.catalogo()}>Productos</a> <span aria-hidden="true">/</span> <span>{categoria.nombre}</span></> : <span>Productos</span>}
      </nav>

      <div className="catalogo">
        <aside className="catalogo__menu" aria-label="Categorías">
          <h2>Categorías</h2>
          <ul>
            <li><a href={enlace.catalogo()} aria-current={!categoria ? "page" : undefined}>
              <Icono n="productos" tam={20} /><span>Todos los productos</span><small>{productos.length}</small></a></li>
            {categorias.filter((c) => c.n > 0).map((c) => (
              <li key={c.id}><a href={enlace.catalogo(c.id)} aria-current={categoria?.id === c.id ? "page" : undefined}>
                <Icono n={c.icono} tam={20} /><span>{c.nombre}</span><small>{c.n}</small></a></li>
            ))}
          </ul>
        </aside>

        <section className="catalogo__contenido">
          <header className="catalogo__cabeza">
            <h1>{categoria ? categoria.nombre : "Todos los productos"}</h1>
            <p>{miles(lista.length)} {lista.length === 1 ? "producto" : "productos"}</p>
          </header>
          <div className="catalogo__herramientas">
            <div className="campo campo--ancho">
              <label htmlFor="filtro-cat">Filtrar por nombre</label>
              <input id="filtro-cat" type="search" value={filtro} placeholder="Escribe parte del nombre…"
                onChange={(e) => { setFiltro(e.target.value); setPagina(1); }} />
            </div>
            <div className="campo">
              <label htmlFor="orden">Ordenar por</label>
              <select id="orden" value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
                <option value="compradores">Más comprados</option>
                <option value="nombre">Nombre (A–Z)</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>
          {categoria?.id === "otros" && (
            <p className="nota">Aquí están los productos cuya descripción no permite asignarles una categoría con seguridad.</p>
          )}
          {lista.length === 0 ? (
            <p className="nota">Ningún producto coincide con «{filtro}». Prueba con otra palabra o elige otra categoría.</p>
          ) : (
            <div className="rejilla-venta">
              {lista.slice(0, pagina * POR_PAGINA).map((p) => <TarjetaVenta key={p.idx} p={p} canasta={canasta} />)}
            </div>
          )}
          {lista.length > pagina * POR_PAGINA && (
            <button type="button" className="boton boton--secundario centrado" onClick={() => setPagina((x) => x + 1)}>
              Ver más productos ({miles(lista.length - pagina * POR_PAGINA)} restantes)
            </button>
          )}
          <p className="catalogo__nota">
            Las categorías se asignaron a partir del nombre de cada producto en la factura. Los precios son de referencia:
            la mediana del precio pagado en las facturas.
          </p>
        </section>
      </div>
    </main>
  );
}
