import { Fragment, useEffect, useRef, useState } from "react";
import type { Categoria, Producto } from "../datos";
import type { Canasta } from "../canasta";
import { enlace, ir } from "../ruta";
import Empaque from "../componentes/Empaque";
import Icono from "../componentes/Icono";
import { MENSAJE_INICIAL, responder, type Respuesta } from "./motor";

interface Mensaje { de: "usuario" | "asistente"; texto?: string; r?: Respuesta }
interface Props {
  abierto: boolean;
  setAbierto: (v: boolean) => void;
  productos: Producto[];
  categorias: Categoria[];
  canasta: Canasta;
}

// Texto con **negrita**
function Rico({ t }: { t: string }) {
  return <>{t.split(/(\*\*[^*]+\*\*)/g).map((x, i) => (x.startsWith("**") ? <strong key={i}>{x.slice(2, -2)}</strong> : <Fragment key={i}>{x}</Fragment>))}</>;
}

export default function Asistente({ abierto, setAbierto, productos, categorias, canasta }: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ de: "asistente", r: MENSAJE_INICIAL }]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const lista = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => { if (abierto) setTimeout(() => entrada.current?.focus(), 50); }, [abierto]);
  useEffect(() => { lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" }); }, [mensajes, pensando]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape" && abierto) setAbierto(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto, setAbierto]);

  const enviar = async (t: string) => {
    const limpio = t.trim();
    if (!limpio || pensando) return;
    setTexto("");
    setMensajes((m) => [...m, { de: "usuario", texto: limpio }]);
    setPensando(true);
    const [r] = await Promise.all([
      responder(limpio, { productos, categorias, canasta: canasta.items, agregar: canasta.agregar }),
      new Promise((ok) => setTimeout(ok, 450)), // pausa breve para que la respuesta no aparezca de golpe
    ]);
    setMensajes((m) => [...m, { de: "asistente", r }]);
    setPensando(false);
  };

  const navegar = (href: string) => {
    ir(href);
    if (window.matchMedia("(max-width: 720px)").matches) setAbierto(false);
  };

  if (!abierto) {
    return (
      <button type="button" className="asistente-boton" onClick={() => setAbierto(true)} aria-label="Abrir a Messi, el asistente virtual">
        <Icono n="robot" tam={26} /><span>Messi</span>
      </button>
    );
  }

  return (
    <section className="asistente" role="dialog" aria-modal="false" aria-labelledby="asistente-titulo">
      <header className="asistente__cabeza">
        <span className="robot robot--claro"><Icono n="robot" tam={26} /></span>
        <div>
          <h2 id="asistente-titulo">Messi</h2>
          <p>Tu asistente en Vitrina</p>
        </div>
        <button type="button" className="asistente__cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar a Messi">
          <Icono n="cerrar" tam={20} />
        </button>
      </header>

      <div className="asistente__mensajes" ref={lista} aria-live="polite">
        {mensajes.map((m, i) => m.de === "usuario" ? (
          <p key={i} className="burbuja burbuja--usuario">{m.texto}</p>
        ) : (
          <div key={i} className="respuesta">
            <p className={`burbuja ${m.r?.aviso ? "burbuja--aviso" : ""}`}><Rico t={m.r!.texto} /></p>
            {m.r?.productos?.length ? (
              <ul className="respuesta__productos">
                {m.r.productos.map(({ p, nota }) => {
                  const enCanasta = canasta.tiene(p.idx);
                  return (
                    <li key={p.idx} className="mini-producto">
                      <Empaque p={p} tam={52} />
                      <div className="mini-producto__texto">
                        <strong>{p.n}</strong>
                        <small>{p.pr || p.fo}</small>
                        {nota && <em>{nota}</em>}
                        <div className="mini-producto__acciones">
                          <button type="button" onClick={() => navegar(enlace.producto(p.id))}>Ver</button>
                          <button type="button" onClick={() => (enCanasta ? canasta.quitar(p.idx) : canasta.agregar(p.idx))} aria-pressed={enCanasta}>
                            {enCanasta ? "✓ En la canasta" : "Agregar"}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {m.r?.enlace && (
              <button type="button" className="respuesta__enlace" onClick={() => navegar(m.r!.enlace!.href)}>
                {m.r.enlace.texto} <Icono n="derecha" tam={14} />
              </button>
            )}
            {m.r?.sugerencias && i === mensajes.length - 1 && (
              <div className="respuesta__sugerencias">
                {m.r.sugerencias.map((s) => (
                  <button type="button" key={s} onClick={() => (s === "Ver mi canasta" ? navegar(enlace.canasta()) : enviar(s))}>{s}</button>
                ))}
              </div>
            )}
          </div>
        ))}
        {pensando && <p className="burbuja burbuja--pensando" aria-label="Messi está escribiendo"><span /><span /><span /></p>}
      </div>

      <form className="asistente__entrada" onSubmit={(e) => { e.preventDefault(); enviar(texto); }}>
        <label htmlFor="asistente-texto" className="sr-only">Escribe tu mensaje</label>
        <input id="asistente-texto" ref={entrada} value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe qué necesitas…" autoComplete="off" />
        <button type="submit" aria-label="Enviar" disabled={!texto.trim() || pensando}><Icono n="enviar" tam={20} /></button>
      </form>
      <p className="asistente__nota">Orientación para encontrar productos. No reemplaza la consulta médica.</p>
    </section>
  );
}
