import type { ReactNode } from "react";
import type { Producto } from "../datos";
import { enlace } from "../ruta";
import Empaque from "./Empaque";

interface Props {
  p: Producto;
  porque?: ReactNode;   // explicación en lenguaje sencillo
  detalle?: ReactNode;  // dato secundario (p. ej., compradores en común)
  fuerza?: number;      // 0–1, intensidad relativa de la recomendación
}

// Tarjeta de producto recomendado: imagen, nombre, presentación y por qué aparece.
export default function Tarjeta({ p, porque, detalle, fuerza }: Props) {
  return (
    <a className="tarjeta" href={enlace.producto(p.id)}>
      <div className="tarjeta__imagen"><Empaque p={p} tam={128} /></div>
      <div className="tarjeta__cuerpo">
        <h3 className="tarjeta__nombre">{p.n}</h3>
        <p className="tarjeta__pres">{p.pr || p.fo}</p>
        {porque && <p className="tarjeta__porque">{porque}</p>}
        {(detalle || fuerza !== undefined) && (
          <div className="tarjeta__pie">
            {fuerza !== undefined && (
              <span className="afinidad" title="Qué tan fuerte es la relación, comparada con la primera recomendación">
                <span className="afinidad__barra" style={{ width: `${Math.max(8, Math.round(fuerza * 100))}%` }} />
              </span>
            )}
            {detalle && <span className="tarjeta__detalle">{detalle}</span>}
          </div>
        )}
      </div>
    </a>
  );
}
