import type { Producto } from "../datos";
import { pesos } from "../datos";
import { MALESTARES } from "../paquetes";
import { enlace } from "../ruta";
import Icono from "../componentes/Icono";

interface Props { productos: Producto[] }

// «¿Qué tienes?»: el cliente elige su malestar en lugar de buscar un medicamento.
export default function MalestaresVista({ productos }: Props) {
  const porId = new Map(productos.map((p) => [p.id, p]));
  const desde = (ids: string[]) => ids.map((id) => porId.get(id)?.$ ?? 0).reduce((a, b) => a + b, 0);

  return (
    <main id="contenido">
      <header className="cabecera-vista cabecera-vista--malestar">
        <h1>¿Qué tienes?</h1>
        <p>Cuéntanos qué sientes y qué tan fuerte es. Te armamos un paquete con lo necesario para sentirte mejor.</p>
      </header>

      <ul className="malestares">
        {MALESTARES.map((m) => (
          <li key={m.id}>
            <a className="malestar" href={enlace.paquete(m.id, "moderado")}>
              <span className="malestar__icono"><Icono n={m.icono} tam={30} /></span>
              <span className="malestar__texto">
                <strong>{m.nombre}</strong>
                <span>{m.frase}</span>
                <small>Paquetes desde {pesos(desde(m.niveles.leve.items.map((x) => x.id)))}</small>
              </span>
              <Icono n="derecha" tam={20} className="malestar__flecha" />
            </a>
          </li>
        ))}
      </ul>

      <p className="nota-salud"><Icono n="alerta" tam={18} />
        Los paquetes incluyen solo productos de venta libre y no reemplazan la consulta médica. Lee siempre el empaque.
        Ante una emergencia, llama a la línea <strong>123</strong>.</p>
    </main>
  );
}
