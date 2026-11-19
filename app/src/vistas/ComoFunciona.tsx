import { useEffect, useState } from "react";
import { cargarMetricas, miles, pct, type Metricas } from "../datos";

const NOMBRES: Record<string, string> = {
  "Más vendidos (sin excluir comprados)": "Lo más vendido, aunque ya lo tenga",
  "Línea base: más vendidos": "Lo más vendido que aún no tiene",
  "Ítem–ítem (coseno ajustado)": "Productos que se compran juntos (ajustado)",
  "Ítem–ítem (coseno)": "Productos que se compran juntos",
  "Usuario–usuario": "Compradores parecidos (el que usamos)",
};

export default function ComoFunciona() {
  const [m, setM] = useState<Metricas | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { cargarMetricas().then(setM).catch(() => setError(true)); }, []);

  const filas = m ? [...m.evaluacion].sort((a, b) => a.hit_rate - b.hit_rate) : [];
  const base = m?.evaluacion.find((e) => e.modelo === "Línea base: más vendidos");
  const uu = m?.evaluacion.find((e) => e.modelo === "Usuario–usuario");
  const prueba = m?.pruebas.find((p) => p.Modelo === "Usuario–usuario");

  return (
    <main id="contenido" className="lectura">
      <header className="cabecera-vista">
        <h1>Cómo elegimos las recomendaciones</h1>
        <p>Nada de lo que ves es inventado: cada recomendación sale de las compras reales registradas en las facturas.</p>
      </header>

      <ol className="pasos">
        <li>
          <h2>Leemos las compras</h2>
          <p>
            {m ? <>{miles(m.datos.facturas)} facturas de {miles(m.datos.compradores)} compradores y {m.datos.productos} productos, </> : null}
            entre julio de 2013 y marzo de 2022. De cada persona solo nos importa qué productos ha comprado.
          </p>
        </li>
        <li>
          <h2>Comparamos patrones de compra</h2>
          <p>
            Dos productos se parecen si los compran las mismas personas. Dos compradores se parecen si compran los mismos
            productos. Lo medimos con la similitud de coseno y descontamos lo que se explica solo porque un producto es muy
            popular.
          </p>
        </li>
        <li>
          <h2>Recomendamos lo que aún no tienes</h2>
          <p>
            En un producto, mostramos lo que más se compra junto con él. Para un comprador, buscamos a los
            {m ? ` ${m.configuracion.k}` : ""} compradores más parecidos y sugerimos lo que ellos compran y él todavía no.
          </p>
        </li>
      </ol>

      <section className="seccion" aria-labelledby="t-acierta">
        <h2 className="seccion__titulo" id="t-acierta">¿Acierta más que mostrar lo más vendido?</h2>
        <p className="seccion__bajada">
          Probamos cada método con las compras hasta diciembre de 2020 y revisamos si sus 10 sugerencias aparecían entre
          las compras nuevas de 2021 y 2022 {m ? `de ${miles(m.usuarios_evaluados)} compradores` : ""}. La barra es el porcentaje de
          compradores con al menos un acierto; la línea fina, el margen de error (intervalo de confianza del 95 %).
        </p>
        {error && <p className="nota">No se pudieron cargar los resultados. Recarga la página para intentarlo de nuevo.</p>}
        {m && (
          <figure className="grafico">
            <svg viewBox="0 0 720 260" role="img" aria-label="Porcentaje de compradores con al menos un acierto, por método">
              {[0.3, 0.4, 0.5, 0.6, 0.7].map((x) => {
                const px = 330 + ((x - 0.3) / 0.45) * 330;
                return (
                  <g key={x}>
                    <line x1={px} x2={px} y1={10} y2={232} stroke="#D6E0DC" />
                    <text x={px} y={250} textAnchor="middle" fontSize="12" fill="#4E6662">{pct(x, 0)}</text>
                  </g>
                );
              })}
              {filas.map((f, i) => {
                const y = 22 + i * 44;
                const esc = (x: number) => 330 + ((x - 0.3) / 0.45) * 330;
                const elegido = f.modelo === "Usuario–usuario";
                const esBase = f.modelo === "Línea base: más vendidos";
                return (
                  <g key={f.modelo}>
                    <text x={318} y={y + 15} textAnchor="end" fontSize="13" fill="#16302D" fontWeight={elegido ? 700 : 400}>
                      {NOMBRES[f.modelo] ?? f.modelo}
                    </text>
                    <rect x={330} y={y} width={esc(f.hit_rate) - 330} height={22} rx={3}
                      fill={elegido ? "#1F6F5C" : esBase ? "#B97A12" : "#A9C8BE"} />
                    <line x1={esc(f.hit_li)} x2={esc(f.hit_ls)} y1={y + 11} y2={y + 11} stroke="#16302D" strokeWidth={2} />
                    <line x1={esc(f.hit_li)} x2={esc(f.hit_li)} y1={y + 5} y2={y + 17} stroke="#16302D" strokeWidth={2} />
                    <line x1={esc(f.hit_ls)} x2={esc(f.hit_ls)} y1={y + 5} y2={y + 17} stroke="#16302D" strokeWidth={2} />
                    <text x={esc(f.hit_ls) + 8} y={y + 15} fontSize="12" fill="#16302D">{pct(f.hit_rate)}</text>
                  </g>
                );
              })}
            </svg>
            {base && uu && prueba && (
              <figcaption>
                Con compradores parecidos, el {pct(uu.hit_rate)} de las personas recibió al menos una sugerencia que luego compró,
                frente al {pct(base.hit_rate)} con la lista de lo más vendido. La diferencia es estadísticamente significativa
                (prueba de McNemar, valor-p {Number(prueba["Valor-p McNemar"]).toExponential(1).replace(".", ",")}).
              </figcaption>
            )}
          </figure>
        )}
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Qué significan las imágenes</h2>
        <p>
          Los datos de la farmacia no traen fotografías. Cada imagen es una ilustración generada a partir del propio producto:
          el tipo de empaque corresponde a su forma farmacéutica y presentación (caja, frasco, tubo, gotero, lata…) y la
          etiqueta muestra su nombre real. No se dibujan logotipos ni marcas.
        </p>
      </section>
    </main>
  );
}
