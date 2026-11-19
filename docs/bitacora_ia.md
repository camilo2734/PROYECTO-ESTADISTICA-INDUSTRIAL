# Bitácora de uso de IA — Proyecto 4

Registro de cada uso de inteligencia artificial en el proyecto, según lo exige el enunciado: herramienta, prompt, qué se aceptó, qué se corrigió y por qué.

| # | Fecha | Herramienta | Uso |
|---|---|---|---|
| 1 | 19/11/2026 | Claude (Anthropic) | Análisis del enunciado, diagnóstico y plan de trabajo |
| 2 | 19/11/2026 | Claude (Anthropic) | Escritura del R Markdown (fases 1 a 7 y bonificación) |

---

## Entrada 1 — Diagnóstico del proyecto

- **Herramienta:** Claude.
- **Prompt (resumen):** se le entregó el ZIP del profesor (enunciado, `recbooks.Rmd`, `pro2.csv`, `cab.csv`, `archive.zip`) con la instrucción de analizarlo por completo antes de programar y de proponer metodología, arquitectura, diseño visual, riesgos y plan. El prompt completo está en `docs/prompts/01_diagnostico.md`.
- **Qué se aceptó:**
  - La arquitectura R → JSON → sitio web estático.
  - La definición de "compra nueva" para la evaluación.
  - El uso de pruebas pareadas (McNemar y t pareada) para comparar contra la línea base.
- **Qué se corrigió y por qué:**
  - El equipo es de 4 personas, no de 2 o 3 como fija el enunciado.
  - El plazo real va del 9 al 22 de noviembre, así que el cronograma se comprimió.

## Entrada 2 — R Markdown

- **Herramienta:** Claude.
- **Prompt (resumen):** "Escribe tú completo el Rmd", con las fases 1 a 7 del enunciado.
- **Qué se aceptó:**
  - La reproducción del tutorial con tres correcciones a errores del código base: el `left_join` de `recomendar()`, el índice de `item_recommendation()` y el uso de `top_n(10000)`.
  - La validación temporal 2019/2020 para elegir hiperparámetros sin tocar la prueba.
  - El coseno ajustado por popularidad para la vista de producto.
- **Qué verificó el equipo:**
  - Que el documento se ejecute de principio a fin sin errores.
  - Que la función de coseno coincida con `lsa::cosine`.
  - Que ninguna recomendación incluya productos ya comprados (`stopifnot` en el documento).
- **Qué se corrigió y por qué:** *(completar por el equipo)*.
