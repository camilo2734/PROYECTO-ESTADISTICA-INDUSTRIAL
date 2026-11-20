// Tipos y carga de los datos exportados desde R (ver analisis/recomendador.Rmd).
// La aplicación no recalcula nada: solo lee y muestra.

export type Empaque =
  | "caja" | "frasco" | "botella" | "gotero" | "tubo" | "sobre" | "bolsa"
  | "lata" | "spray" | "inyectable" | "tapabocas" | "equipo";

export interface ProductoRaw {
  id: string; n: string; pr: string; d: string; fo: string; ca: string; e: Empaque; li: string;
  iva: number; rx: 0 | 1; u: number; c: number; $: number;
  s: [number, number, number, number][]; // similares: [índice, compradores en común, lift, similitud]
  a: number[];                   // alternativas por contenido: [índice]
}
export interface CompradorRaw {
  id: string; f: number; d: string; h: string; k: number;
  hi: [number, number, number][]; // historial: [índice, unidades, facturas]
  r: [number, number, number][];  // recomendaciones: [índice, vecinos que lo compran, índice relacionado | -1]
}
export interface Producto extends ProductoRaw { idx: number; clave: string; }

export interface Metricas {
  configuracion: { preferencia: string; k: number; umbral: number; min_comunes_vista: number };
  datos: { lineas: number; facturas: number; compradores: number; productos: number; dispersion: number; desde: string; hasta: string };
  evaluacion: { modelo: string; n: number; aciertos: number; hit_rate: number; hit_li: number; hit_ls: number; precision: number; prec_li: number; prec_ls: number }[];
  pruebas: Record<string, string | number>[];
  usuarios_evaluados: number;
}

const base = import.meta.env.BASE_URL;

async function json<T>(archivo: string): Promise<T> {
  const r = await fetch(`${base}datos/${archivo}`);
  if (!r.ok) throw new Error(`No se pudo cargar ${archivo} (${r.status})`);
  return r.json() as Promise<T>;
}

export const normalizarTexto = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9%+.,/ ]/g, " ").replace(/\s+/g, " ").trim();

let productosP: Promise<Producto[]> | null = null;
export function cargarProductos() {
  productosP ??= json<ProductoRaw[]>("productos.json").then((ps) =>
    ps.map((p, idx) => ({ ...p, idx, clave: normalizarTexto(`${p.n} ${p.pr} ${p.d} ${p.fo}`) })));
  return productosP;
}

export interface IndiceCompradores {
  lista: CompradorRaw[];
  porId: Map<string, CompradorRaw>;
  porProducto: Map<number, string[]>; // producto -> compradores que lo compraron
}
let compradoresP: Promise<IndiceCompradores> | null = null;
export function cargarCompradores() {
  compradoresP ??= json<CompradorRaw[]>("compradores.json").then((lista) => {
    const porId = new Map(lista.map((c) => [c.id, c]));
    const porProducto = new Map<number, string[]>();
    for (const c of lista) for (const [i] of c.hi) {
      const arr = porProducto.get(i);
      if (arr) arr.push(c.id); else porProducto.set(i, [c.id]);
    }
    return { lista, porId, porProducto };
  });
  return compradoresP;
}

export interface Categoria { id: string; nombre: string; icono: string; n: number }
let categoriasP: Promise<Categoria[]> | null = null;
export const cargarCategorias = () => (categoriasP ??= json<Categoria[]>("categorias.json"));

let metricasP: Promise<Metricas> | null = null;
export const cargarMetricas = () => (metricasP ??= json<Metricas>("metricas.json"));

// ---------- Búsqueda por nombre ----------
// Puntúa coincidencias por palabra: prefijo de palabra > contiene. Tolera tildes y mayúsculas.
export function buscar(productos: Producto[], consulta: string, limite = 8): Producto[] {
  const q = normalizarTexto(consulta);
  if (q.length < 2) return [];
  const terminos = q.split(" ");
  const res: { p: Producto; puntos: number }[] = [];
  for (const p of productos) {
    let puntos = 0;
    let ok = true;
    for (const t of terminos) {
      const i = p.clave.indexOf(t);
      if (i < 0) { ok = false; break; }
      puntos += i === 0 ? 6 : p.clave[i - 1] === " " ? 4 : 1;
    }
    if (!ok) continue;
    if (normalizarTexto(p.n).startsWith(q)) puntos += 8;
    puntos += Math.log10(p.c + 1); // a igualdad, primero lo más comprado
    res.push({ p, puntos });
  }
  return res.sort((a, b) => b.puntos - a.puntos).slice(0, limite).map((x) => x.p);
}

// ---------- Formato ----------
const nf = new Intl.NumberFormat("es-CO");
export const miles = (n: number) => nf.format(n);
export const pct = (x: number, d = 1) => `${(x * 100).toLocaleString("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d })} %`;
const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const mesAnio = (iso: string) => { const [a, m] = iso.split("-"); return `${meses[+m - 1]} ${a}`; };
export const pesos = (n: number) => `$${nf.format(n)}`;
