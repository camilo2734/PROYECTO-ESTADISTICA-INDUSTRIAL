import { useEffect, useState } from "react";
import { cargarCompradores, cargarProductos, type IndiceCompradores, type Producto } from "./datos";
import { enlace, useRuta } from "./ruta";
import Buscador from "./componentes/Buscador";
import Inicio from "./vistas/Inicio";
import ProductoVista from "./vistas/ProductoVista";
import CompradoresVista from "./vistas/CompradoresVista";
import CompradorVista from "./vistas/CompradorVista";
import ComoFunciona from "./vistas/ComoFunciona";

export default function App() {
  const ruta = useRuta();
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [indice, setIndice] = useState<IndiceCompradores | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarProductos().then(setProductos).catch((e) => setError(String(e.message ?? e)));
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
      inicio: "Vitrina | Recomendador de farmacia",
      compradores: "Elige un comprador | Vitrina",
      como: "Cómo funciona | Vitrina",
    };
    if (titulos[ruta.vista]) document.title = titulos[ruta.vista];
    else if (ruta.vista === "producto" && productos) {
      const p = productos.find((x) => x.id === ruta.id);
      document.title = `${p ? p.n : "Producto"} | Vitrina`;
    } else if (ruta.vista === "comprador") document.title = `Comprador ${ruta.id} | Vitrina`;
  }, [ruta, productos]);

  const activo = (v: string) => (ruta.vista === v || (v === "compradores" && ruta.vista === "comprador") ? "page" : undefined);

  return (
    <>
      <a href="#contenido" className="saltar" onClick={(e) => {
        e.preventDefault();
        const m = document.getElementById("contenido");
        if (m) { m.setAttribute("tabindex", "-1"); m.focus(); }
      }}>Saltar al contenido</a>
      <header className="barra">
        <a className="marca" href={enlace.inicio()} aria-label="Vitrina, ir al inicio">
          <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="6" y="9" width="20" height="19" rx="4" fill="#B97A12" /><rect x="9" y="4" width="14" height="6" rx="2" fill="#1F6F5C" /><rect x="10" y="15" width="12" height="7" rx="1.5" fill="#FAFBF9" /></svg>
          <span>Vitrina</span>
        </a>
        {ruta.vista !== "inicio" && productos && (
          <div className="barra__buscar"><Buscador productos={productos} placeholder="Buscar un producto…" /></div>
        )}
        <nav className="barra__nav" aria-label="Secciones">
          <a href={enlace.inicio()} aria-current={activo("inicio") || activo("producto")}>Productos</a>
          <a href={enlace.compradores()} aria-current={activo("compradores")}>Compradores</a>
          <a href={enlace.como()} aria-current={activo("como")}>Cómo funciona</a>
        </nav>
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
      ) : ruta.vista === "producto" ? <ProductoVista productos={productos} id={ruta.id} />
        : ruta.vista === "compradores" ? <CompradoresVista productos={productos} indice={indice} filtro={ruta.filtro} />
          : ruta.vista === "comprador" ? <CompradorVista productos={productos} indice={indice} id={ruta.id} />
            : ruta.vista === "como" ? <ComoFunciona />
              : <Inicio productos={productos} />}

      <footer className="pie">
        <p>Proyecto 4 de Estadística Industrial, Universidad del Magdalena, 2026-II. Datos: facturas de un marketplace farmacéutico, 2013–2022.</p>
      </footer>
    </>
  );
}
