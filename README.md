# Proyecto 4: sistema de recomendación para un marketplace farmacéutico

Estadística Industrial, 2026-II, Universidad del Magdalena.

El proyecto adapta el tutorial de Ander Fernández («Cómo programar un sistema de recomendación en R») a las facturas de Procaps (2013–2022). Construye recomendadores colaborativos ítem–ítem y usuario–usuario con similitud de coseno, los evalúa contra la línea base de «los más vendidos» y los presenta en una aplicación web llamada **Vitrina**.

## Estructura

```
analisis/
  recomendador.Rmd       R Markdown reproducible, fases 1 a 7 + bonificación
  recomendador.html      el mismo documento, renderizado
  datos/                 archive.zip (Book-Crossing), pro2.csv, cab.csv
app/
  datos-r/               resultados exportados por el Rmd (JSON)
  scripts/               preparar-datos.mjs: da formato legible a nombres y presentaciones
  src/                   aplicación web (React + TypeScript)
docs/
  bitacora_ia.md         bitácora de uso de IA
  informe.pdf            informe técnico (máximo 8 páginas)
firebase.json            configuración de Firebase Hosting
```

## Resultados principales

Partición temporal: entrenamiento hasta el 31/12/2020, prueba en 2021–2022, con 2.533 compradores evaluados.

| Modelo | Hit rate@10 (IC 95 %) | Precision@10 |
|---|---|---|
| Línea base: los 10 más vendidos | 63,4 % (61,5–65,3) | 0,112 |
| Ítem–ítem (coseno) | 65,4 % (63,5–67,2) | 0,121 |
| **Usuario–usuario, k = 100** | **67,0 % (65,1–68,8)** | **0,128** |

El usuario–usuario supera significativamente a la línea base (McNemar, valor-p = 1,3 × 10⁻⁶).

## Cómo reproducir el análisis

Requisitos: R 4.x con los paquetes `dplyr`, `tidyr`, `readr`, `ggplot2`, `cluster`, `lsa`, `jsonlite` y `rmarkdown`.

1. Abrir `analisis/recomendador.Rmd` en RStudio.
2. Pulsar **Knit**. Tarda unos 8 minutos.
3. El documento genera el HTML y actualiza los JSON en `app/datos-r/`.

## Cómo ejecutar y publicar la aplicación

Requisitos: Node.js 18 o superior.

```bash
cd app
npm install
npm run dev        # versión local en http://localhost:5173
npm run build      # genera app/dist (prepara los datos y compila)
```

Para publicar en Firebase Hosting, desde la raíz del repositorio:

```bash
npm install -g firebase-tools
firebase login
firebase use --add            # elegir el proyecto de Firebase del equipo
firebase deploy --only hosting
```

## Uso de IA

Todo el uso de IA está registrado en [`docs/bitacora_ia.md`](docs/bitacora_ia.md): herramienta, prompt, qué se aceptó, qué se corrigió y por qué.
