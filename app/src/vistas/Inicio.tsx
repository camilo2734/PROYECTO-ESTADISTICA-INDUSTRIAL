import { useMemo, useRef } from "react";
import type { Categoria, Producto } from "../datos";
import type { Canasta } from "../canasta";
import { completarCanasta } from "../canasta";
import { enlace } from "../ruta";
import Buscador from "../componentes/Buscador";
import Icono from "../componentes/Icono";
import TarjetaVenta, { type TipoInsignia } from "../componentes/TarjetaVenta";

interface Props {
  productos: Producto[];
  categorias: Categoria[];
  canasta: Canasta;
  abrirAsistente: () => void;
}

function Ilustracion() {
  return (
    <svg viewBox="0 0 320 220" className="portada2__ilustracion" aria-hidden="true">
      <ellipse cx="170" cy="198" rx="135" ry="12" fill="#1F6F5C" opacity=".1" />
      <path d="M262 150c30-40 42-82 30-110-30 18-46 60-30 110z" fill="#8FC9A9" />
      <path d="M262 150c4-35 14-72 30-110" stroke="#5FA383" strokeWidth="2" fill="none" />
      <path d="M58 168c-34-20-52-52-46-80 30 8 50 40 46 80z" fill="#A9D8BF" />
      <rect x="120" y="58" width="150" height="122" rx="18" fill="#FFFFFF" stroke="#CFE3DA" strokeWidth="2" />
      <path d="M168 58v-14a8 8 0 0 1 8-8h38a8 8 0 0 1 8 8v14" fill="none" stroke="#1F6F5C" strokeWidth="8" />
      <rect x="120" y="58" width="150" height="26" rx="13" fill="#E2F0EA" />
      <rect x="181" y="100" width="28" height="64" rx="5" fill="#1F6F5C" />
      <rect x="163" y="118" width="64" height="28" rx="5" fill="#1F6F5C" />
      <rect x="78" y="104" width="62" height="86" rx="12" fill="#F6FBF8" stroke="#CFE3DA" strokeWidth="2" />
      <rect x="84" y="88" width="50" height="22" rx="6" fill="#1F6F5C" />
      <rect x="84" y="128" width="50" height="34" rx="4" fill="#FFFFFF" stroke="#CFE3DA" />
      <rect x="104" y="133" width="10" height="24" rx="2" fill="#2E8B6F" />
      <rect x="97" y="140" width="24" height="10" rx="2" fill="#2E8B6F" />
      <g transform="rotate(-18 60 120)">
        <rect x="18" y="96" width="78" height="46" rx="8" fill="#DCE7F4" stroke="#B9CCE3" strokeWidth="2" />
        {[0, 1, 2].map((i) => <rect key={i} x={26 + i * 23} y="104" width="16" height="30" rx="8" fill="#FFFFFF" stroke="#B9CCE3" />)}
      </g>
      <g transform="rotate(-30 236 182)">
        <rect x="212" y="172" width="50" height="20" rx="10" fill="#FFFFFF" stroke="#CFE3DA" strokeWidth="2" />
        <path d="M237 172h15a10 10 0 0 1 0 20h-15z" fill="#2F5F94" />
      </g>
    </svg>
  );
}

function Carrusel({ children, etiqueta }: { children: React.ReactNode; etiqueta: string }) {
  const pista = useRef<HTMLDivElement>(null);
  const mover = (dir: number) => {
    const el = pista.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };
  return (
    <div className="carrusel">
      <button type="button" className="carrusel__flecha carrusel__flecha--izq" onClick={() => mover(-1)} aria-label={`Ver anteriores: ${etiqueta}`}>
        <Icono n="izquierda" tam={18} />
      </button>
      <div className="carrusel__pista" ref={pista} role="list" aria-label={etiqueta}>{children}</div>
      <button type="button" className="carrusel__flecha carrusel__flecha--der" onClick={() => mover(1)} aria-label={`Ver siguientes: ${etiqueta}`}>
        <Icono n="derecha" tam={18} />
      </button>
    </div>
  );
}

export default function Inicio({ productos, categorias, canasta, abrirAsistente }: Props) {
  const porCompradores = useMemo(() => [...productos].sort((a, b) => b.c - a.c), [productos]);
  const unicos = useMemo(() => {
    const vistos = new Set<string>();
    return porCompradores.filter((p) => (vistos.has(p.n) ? false : (vistos.add(p.n), true)));
  }, [porCompradores]);

  // Recomendados: si hay canasta, lo que la complementa; si no, lo más comprado
  const recomendados = useMemo(() => {
    if (canasta.items.length) {
      return completarCanasta(productos, canasta.items, 12).map((s, i) => ({
        p: s.p,
        insignia: { texto: i < 3 ? "Alta afinidad" : "Complementario", tipo: (i < 3 ? "afinidad" : "complemento") as TipoInsignia },
        porque: <>Va con {s.relacionados[0].q.n}</>,
      }));
    }
    // Sin canasta: el más comprado de cada categoría, para mostrar la variedad del catálogo
    const vistas = new Set<string>();
    const unoPorCategoria = unicos.filter((p) => (p.ca === "otros" || vistas.has(p.ca) ? false : (vistas.add(p.ca), true)));
    return unoPorCategoria.slice(0, 12).map((p) => ({ p, insignia: { texto: "Más comprado", tipo: "popular" as TipoInsignia }, porque: undefined }));
  }, [productos, canasta.items, unicos]);

  const visibles = categorias.filter((c) => c.id !== "otros" && c.n > 0);
  const destacadas = ["vitaminas", "bebe", "respiratoria"]
    .map((id) => categorias.find((c) => c.id === id)).filter((c): c is Categoria => !!c);

  return (
    <main className="inicio2" id="contenido">
      <div className="inicio2__superior">
        <section className="portada2">
          <div className="portada2__texto">
            <h1>Tu droguería <span>inteligente</span></h1>
            <p>Encuentra tus productos y recibe recomendaciones basadas en lo que compran miles de personas.</p>
            <div className="portada2__buscar">
              <Buscador productos={productos} grande autoFocus placeholder="Busca un producto (ej.: vitamina C, loratadina)" />
            </div>
            <div className="portada2__chips">
              <span><Icono n="rayo" tam={16} /> Más comprados:</span>
              {unicos.slice(0, 4).map((p) => (
                <a key={p.id} href={enlace.producto(p.id)} className="chip-rapido">{p.n}</a>
              ))}
            </div>
          </div>
          <Ilustracion />
        </section>

        <aside className="inicio2__lateral">
          <section className="tarjeta-lateral asistente-tarjeta">
            <div className="asistente-tarjeta__cabeza">
              <span className="robot"><Icono n="robot" tam={30} /></span>
              <h2>Messi, tu asistente</h2>
            </div>
            <p>¿No sabes qué producto buscar? Cuéntame qué necesitas y te recomiendo opciones.</p>
            <button type="button" className="boton boton--ancho" onClick={abrirAsistente}>
              <Icono n="chat" tam={18} /> Iniciar chat
            </button>
          </section>
          <section className="tarjeta-lateral porque-tarjeta">
            <h2><Icono n="grafico" tam={20} /> ¿Por qué estas recomendaciones?</h2>
            <ul>
              <li><span><Icono n="juntos" tam={20} /></span>Se compran juntos con frecuencia.</li>
              <li><span><Icono n="usuarios" tam={20} /></span>Personas con compras parecidas también los eligen.</li>
              <li><span><Icono n="algoritmo" tam={20} /></span>Calculadas con el análisis estadístico de 250.748 facturas.</li>
            </ul>
            <a className="enlace-secundario" href={enlace.como()}>Ver cómo funciona</a>
          </section>
        </aside>
      </div>

      <nav className="categorias" aria-label="Categorías">
        {visibles.slice(0, 7).map((c) => (
          <a key={c.id} href={enlace.catalogo(c.id)} className="categoria">
            <Icono n={c.icono} tam={30} />
            <span>{c.nombre}</span>
          </a>
        ))}
        <a href={enlace.catalogo()} className="categoria categoria--todas">
          <Icono n="productos" tam={30} />
          <span>Ver todas las categorías</span>
        </a>
      </nav>

      <section className="seccion" aria-labelledby="t-recomendados">
        <div className="seccion__cabeza">
          <div>
            <h2 className="seccion__titulo" id="t-recomendados"><Icono n="corazon" tam={24} /> Recomendados para ti</h2>
            <p className="seccion__bajada">
              {canasta.items.length
                ? "Productos que suelen comprarse junto con los de tu canasta."
                : "Lo más comprado de cada categoría. Agrega productos a tu canasta y estas sugerencias se ajustan a ti."}
            </p>
          </div>
          <a className="boton-contorno" href={enlace.canasta()}>Ver mi canasta <Icono n="derecha" tam={16} /></a>
        </div>
        <Carrusel etiqueta="Recomendados para ti">
          {recomendados.map(({ p, insignia, porque }) => (
            <div role="listitem" key={p.idx}><TarjetaVenta p={p} canasta={canasta} insignia={insignia} porque={porque} /></div>
          ))}
        </Carrusel>
      </section>

      {destacadas.map((c) => (
        <section className="seccion" key={c.id} aria-labelledby={`t-${c.id}`}>
          <div className="seccion__cabeza">
            <h2 className="seccion__titulo" id={`t-${c.id}`}><Icono n={c.icono} tam={24} /> Lo más comprado en {c.nombre.toLowerCase()}</h2>
            <a className="boton-contorno" href={enlace.catalogo(c.id)}>Ver los {c.n} productos <Icono n="derecha" tam={16} /></a>
          </div>
          <Carrusel etiqueta={c.nombre}>
            {porCompradores.filter((p) => p.ca === c.id).slice(0, 10).map((p) => (
              <div role="listitem" key={p.idx}><TarjetaVenta p={p} canasta={canasta} /></div>
            ))}
          </Carrusel>
        </section>
      ))}

      <section className="inicio__caminos">
        <a className="camino" href={enlace.compradores()}>
          <span className="camino__icono" aria-hidden="true"><Icono n="compradores" tam={28} /></span>
          <span><strong>Ver la tienda como un comprador</strong><span>Elige un comprador y mira su historial al lado de lo que le recomendamos.</span></span>
        </a>
        <a className="camino" href={enlace.canasta()}>
          <span className="camino__icono" aria-hidden="true"><Icono n="carrito" tam={28} /></span>
          <span><strong>Arma tu canasta</strong><span>Agrega varios productos y descubre qué los complementa.</span></span>
        </a>
        <button type="button" className="camino" onClick={abrirAsistente}>
          <span className="camino__icono" aria-hidden="true"><Icono n="robot" tam={28} /></span>
          <span><strong>Pregúntale a Messi</strong><span>Dile qué necesitas y te ayuda a encontrarlo.</span></span>
        </button>
      </section>
    </main>
  );
}
