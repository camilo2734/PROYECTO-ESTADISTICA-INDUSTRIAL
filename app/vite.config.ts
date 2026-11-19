import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativa: la app funciona igual en Firebase Hosting, GitHub Pages o abierta desde una subcarpeta.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { target: "es2020", chunkSizeWarningLimit: 800 },
});
