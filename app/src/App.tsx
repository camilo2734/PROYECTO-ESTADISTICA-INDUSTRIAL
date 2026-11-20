import { useEffect, useState } from "react";
import { cargarCategorias, cargarCompradores, cargarProductos, type Categoria, type IndiceCompradores, type Producto } from "./datos";
import { enlace, useRuta } from "./ruta";
import Buscador from "./componentes/Buscador";
import Icono from "./componentes/Icono";
import Inicio from "./vistas/Inicio";
import ProductoVista from "./vistas/ProductoVista";
import CompradoresVista from "./vistas/CompradoresVista";
import CompradorVista from "./vistas/CompradorVista";
import ComoFunciona from "./vistas/ComoFunciona";
import CanastaVista from "./vistas/CanastaVista";
import CatalogoVista from "./vistas/CatalogoVista";
import Asistente from "./asistente/Asistente";
import { useCanasta } from "./canasta";

export default function App() {
  const ruta = useRuta();
  const canasta = useCanasta();
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [indice, setIndice] = useState<IndiceCompradores | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [asistente, setAsistente] = useState(false);

  useEffect(() => {
    Promise.all([cargarProductos(), cargarCategorias()])
      .then(([p, c]) => { setProductos(p); setCategorias(c); })
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  // Los compradores pesan más: se cargan cuando se necesitan o, si no, apenas el navegador está libre.
  const necesitaCompradores = ruta.vista === "comprador" || ruta.vista === "compradores";
  useEffect(() => {
    if (indice) return;
    const cargar = () => cargarCompradores().then(setIndice).catch((e) => setError(String(e.message ?? e)));
    if (necesitaCompradores) { cargar(); return; }
    const t = window.setTimeout(cargar, 1200);
    return () => window.clearTimeout(t);
  }, [necesitaCompradores, indice]);

  useEffect(() => {
    const titulos: Record<string, string> = {
      inicio: "Vitrina | Droguería inteligente",
      compradores: "Elige un comprador | Vitrina",
      como: "Cómo funciona | Vitrina",
      canasta: "Tu canasta | Vitrina",
    };
    if (titulos[ruta.vista]) document.title = titulos[ruta.vista];
    else if (ruta.vista === "catalogo") {
      const c = categorias.find((x) => x.id === ruta.cat);
      document.title = `${c ? c.nombre : "Productos"} | Vitrina`;
    } else if (ruta.vista === "producto" && productos) {
      const p = productos.find((x) => x.id === ruta.id);
      document.title = `${p ? p.n : "Producto"} | Vitrina`;
    } else if (ruta.vista === "comprador") document.title = `Comprador ${ruta.id} | Vitrina`;
  }, [ruta, productos, categorias]);

  const activo = (...vs: string[]) => (vs.includes(ruta.vista) ? "page" : undefined);

  return (
    <>
      <a href="#contenido" className="saltar" onClick={(e) => {
        e.preventDefault();
        const m = document.getElementById("contenido");
        if (m) { m.setAttribute("tabindex", "-1"); m.focus(); }
      }}>Saltar al contenido</a>
      <header className="barra">
        <a className="marca" href={enlace.inicio()} aria-label="Vitrina, ir al inicio">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <rect x="11" y="3" width="10" height="26" rx="3" fill="#1F6F5C" />
            <rect x="3" y="11" width="26" height="10" rx="3" fill="#2E9A78" />
            <rect x="11" y="11" width="10" height="10" fill="#B97A12" />
          </svg>
          <span><strong>Vitrina</strong><small>Droguería inteligente</small></span>
        </a>
        <nav className="barra__nav" aria-label="Secciones">
          <a href={enlace.inicio()} aria-current={activo("inicio")}><Icono n="inicio" tam={18} /><span>Inicio</span></a>
          <a href={enlace.catalogo()} aria-current={activo("catalogo", "producto")}><Icono n="productos" tam={18} /><span>Productos</span></a>
          <a href={enlace.compradores()} aria-current={activo("compradores", "comprador")}><Icono n="compradores" tam={18} /><span>Compradores</span></a>
          <a href={enlace.como()} aria-current={activo("como")}><Icono n="grafico" tam={18} /><span>Cómo funciona</span></a>
        </nav>
        {ruta.vista !== "inicio" && productos && (
          <div className="barra__buscar"><Buscador productos={productos} placeholder="Buscar un producto…" /></div>
        )}
        <a href={enlace.canasta()} className="barra__carrito" aria-current={activo("canasta")}
          aria-label={`Tu canasta: ${canasta.items.length} ${canasta.items.length === 1 ? "producto" : "productos"}`}>
          <Icono n="carrito" tam={24} />
          <span className="insignia">{canasta.items.length}</span>
        </a>
      </header>

      {error ? (
        <main className="vacio" id="contenido">
          <h1>No se pudieron cargar los datos</h1>
          <p>{error}. Revisa tu conexión y recarga la página.</p>
          <button className="boton" type="button" onClick={() => window.location.reload()}>Recargar</button>
        </main>
      ) : !productos ? (
        <main className="cargando" role="status" id="contenido">
          <div className="estante estante--esqueleto" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <span key={i} />)}</div>
          Preparando el catálogo…
        </main>
      ) : ruta.vista === "producto" ? <ProductoVista productos={productos} categorias={categorias} id={ruta.id} canasta={canasta} />
        : ruta.vista === "catalogo" ? <CatalogoVista productos={productos} categorias={categorias} canasta={canasta} cat={ruta.cat} />
        : ruta.vista === "canasta" ? <CanastaVista productos={productos} canasta={canasta} />
        : ruta.vista === "compradores" ? <CompradoresVista productos={productos} indice={indice} filtro={ruta.filtro} />
        : ruta.vista === "comprador" ? <CompradorVista productos={productos} indice={indice} id={ruta.id} />
        : ruta.vista === "como" ? <ComoFunciona />
        : <Inicio productos={productos} categorias={categorias} canasta={canasta} abrirAsistente={() => setAsistente(true)} />}

      {productos && (
        <Asistente abierto={asistente} setAbierto={setAsistente} productos={productos} categorias={categorias} canasta={canasta} />
      )}

      <footer className="pie">
        <p>Proyecto 4 de Estadística Industrial, Universidad del Magdalena, 2026-II. Datos: facturas de un marketplace farmacéutico, 2013–2022.</p>
      </footer>
    </>
  );
}
