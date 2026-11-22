import type { ReactNode } from "react";
import type { Producto } from "../datos";
import type { Canasta } from "../canasta";
import { pesos } from "../datos";
import { enlace } from "../ruta";
import Empaque from "./Empaque";
import Icono from "./Icono";

export type TipoInsignia = "popular" | "complemento" | "afinidad" | "presentacion";
const ICONO_INSIGNIA: Record<TipoInsignia, string> = { popular: "rayo", complemento: "juntos", afinidad: "corazon", presentacion: "caja" };

interface Props {
  p: Producto;
  canasta: Canasta;
  insignia?: { texto: string; tipo: TipoInsignia };
  porque?: ReactNode;
}

// Tarjeta de producto de la tienda: insignia, imagen, nombre, presentación, precio y botón de canasta.
// El enlace y el botón son elementos hermanos (no se anida un botón dentro de un enlace).
export default function TarjetaVenta({ p, canasta, insignia, porque }: Props) {
  const q = canasta.cantidad(p.idx);
  return (
    <article className="venta">
      <a className="venta__enlace" href={enlace.producto(p.id)}>
        {insignia && (
          <span className={`insignia-venta insignia-venta--${insignia.tipo}`}>
            <Icono n={ICONO_INSIGNIA[insignia.tipo]} tam={14} />{insignia.texto}
          </span>
        )}
        <span className="venta__imagen"><Empaque p={p} tam={118} /></span>
        <span className="venta__nombre">{p.n}</span>
        <span className="venta__pres">{p.pr || p.fo}</span>
        {porque && <span className="venta__porque">{porque}</span>}
      </a>
      <div className="venta__pie">
        <span className="venta__precio">{p.$ > 0 ? pesos(p.$) : "Consultar"}</span>
        <button type="button" className={`venta__boton ${q ? "es-agregado" : ""}`}
          onClick={() => canasta.agregar(p.idx)}
          aria-label={q ? `${p.n}: ${q} en tu canasta. Agregar otra unidad` : `Agregar ${p.n} a la canasta`}
          title={q ? `${q} en tu canasta. Agregar otra` : "Agregar a la canasta"}>
          {q ? <span className="venta__cantidad">{q}</span> : <Icono n="agregarCarrito" tam={20} />}
        </button>
      </div>
    </article>
  );
}
