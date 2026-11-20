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
  const enCanasta = canasta.tiene(p.idx);
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
        <span className="venta__precio" title="Precio de referencia: mediana del precio pagado en las facturas">
          {p.$ > 0 ? pesos(p.$) : "Sin precio"}
        </span>
        <button type="button" className={`venta__boton ${enCanasta ? "es-agregado" : ""}`}
          onClick={() => (enCanasta ? canasta.quitar(p.idx) : canasta.agregar(p.idx))}
          aria-pressed={enCanasta}
          aria-label={enCanasta ? `Quitar ${p.n} de la canasta` : `Agregar ${p.n} a la canasta`}
          title={enCanasta ? "En tu canasta (clic para quitar)" : "Agregar a la canasta"}>
          <Icono n={enCanasta ? "listo" : "agregarCarrito"} tam={20} />
        </button>
      </div>
    </article>
  );
}
