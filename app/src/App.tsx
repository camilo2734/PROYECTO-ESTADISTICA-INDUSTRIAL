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
import MalestaresVista from "./vistas/MalestaresVista";
import PaqueteVista from "./vistas/PaqueteVista";
import PanelCanasta from "./componentes/PanelCanasta";
import Asistente from "./asistente/Asistente";
import { useCanasta } from "./canasta";
import { malestarPorId } from "./paquetes";

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
      malestares: "¿Qué tienes? | Vitrina",
    };
    if (titulos[ruta.vista]) document.title = titulos[ruta.vista];
    else if (ruta.vista === "catalogo") {
      const c = categorias.find((x) => x.id === ruta.cat);
      document.title = `${c ? c.nombre : "Productos"} | Vitrina`;
    } else if (ruta.vista === "producto" && productos) {
      const p = productos.find((x) => x.id === ruta.id);
      document.title = `${p ? p.n : "Producto"} | Vitrina`;
    } else if (ruta.vista === "paquete") document.title = `${malestarPorId(ruta.malestar)?.nombre ?? "Paquete"} | Vitrina`;
    else if (ruta.vista === "comprador") document.title = `Comprador ${ruta.id} | Vitrina`;
  }, [ruta, productos, categorias]);

  // Lo agregado mientras el chat estaba abierto no abre el panel después
  const { cerrarAviso } = canasta;
  useEffect(() => { if (!asistente) cerrarAviso(); }, [asistente, cerrarAviso]);
  // Al cambiar de página se cierra el panel
  useEffect(() => { cerrarAviso(); }, [ruta, cerrarAviso]);

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
          <a href={enlace.malestares()} aria-current={activo("malestares", "paquete")}><Icono n="termometro" tam={18} /><span>¿Qué tienes?</span></a>
        </nav>
        {ruta.vista !== "inicio" && productos && (
          <div className="barra__buscar"><Buscador productos={productos} placeholder="Buscar un producto…" /></div>
        )}
        <a href={enlace.canasta()} className="barra__carrito" aria-current={activo("canasta")}
          aria-label={`Tu canasta: ${canasta.unidades} ${canasta.unidades === 1 ? "unidad" : "unidades"}`}>
          <Icono n="carrito" tam={24} />
          <span className="insignia">{canasta.unidades}</span>
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
        : ruta.vista === "comprador" ? <CompradorVista productos={productos} indice={indice} id={ruta.id} canasta={canasta} />
        : ruta.vista === "como" ? <ComoFunciona />
        : ruta.vista === "malestares" ? <MalestaresVista productos={productos} />
        : ruta.vista === "paquete" ? <PaqueteVista productos={productos} canasta={canasta} malestar={ruta.malestar} nivel={ruta.nivel} />
        : <Inicio productos={productos} categorias={categorias} canasta={canasta} abrirAsistente={() => setAsistente(true)} />}

      {productos && <PanelCanasta productos={productos} canasta={canasta} visible={ruta.vista !== "canasta" && !asistente} />}

      {productos && (
        <Asistente abierto={asistente} setAbierto={setAsistente} productos={productos} categorias={categorias} canasta={canasta} />
      )}

      <footer className="pie">
        <p>Vitrina · Droguería inteligente</p>
        <nav className="pie__enlaces" aria-label="Información del proyecto">
          <a href={enlace.como()}>Cómo funciona</a>
          <a href={enlace.compradores()}>Ver la tienda como un comprador</a>
        </nav>
        <p className="pie__proyecto">Proyecto 4 de Estadística Industrial, Universidad del Magdalena, 2026-II.</p>
      </footer>
    </>
  );
}
