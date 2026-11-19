// Convierte los resultados exportados por R (app/datos-r) al formato compacto de la aplicación
// (app/public/datos). No recalcula recomendaciones: solo da formato legible a nombres y
// presentaciones y deriva el tipo de empaque para la ilustración de cada producto.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (f) => JSON.parse(readFileSync(join(raiz, "datos-r", f), "utf8"));

const productos = leer("productos.json");
const compradores = leer("compradores.json");
const metricas = leer("metricas.json");

// ---------- Nombre legible ----------
const COMERCIALES = new Set(["CIAL", "CIA", "CI", "GEN", "COLMED", "COLME", "INST", "INSTI", "PER", "ECU",
  "(PANAMA)", "(PANAMA", "PANAMA)", "(ALU)", "ALU-ALU", "-", "GOD", "PB", "SOBPB", "CIAL(ALU)", "UNDCIAL", "UND-COLME"]);
const CORTE = /^(CBG|CB|CD|TAB|TABLETAS|CAP|CAPS|CAPSULA|CJA|CJA\*30|CAJA|CJAX\d+.*|CAJAX\d+.*|CJAx.*|CAJAx.*|FCO|FCOX.*|FCOx.*|FRASCO|TUBO|TUBOX.*|TUBOx.*|TUB|TUBx\d+|BOLSA|BOLSAX.*|BOLSAx.*|LATA|TARRO|BOTELLA|BOTELLAX.*|JBE|JARABE|SUSP|SUSP\.|SUS|SOL|SOL\.|GOTAS|GOT|INY|INY\.|INY\.CJAX\d+|INY\.CJAx\d+|AMP|OVUL|OVULOS|OVULX\d+UND|OVULO|GTAB|G-TABS|GELTABS|GTABS|UNIGEL|POL|POLVO|POLV|UNGU|UNGUENTO|POMADA|CREMA|SPRAY|AEROSOL|X|x|\*|COMP|COMPR|EC|TAB\.|SOB|SACH|SACHETS|VIAL|LOCION|LOTION|MINIPACK|MP|DISPLAY|BOMBONERA|HB|CG|RISTRA|CAJ|CX\d+|GUMMY)$/;
const SIGLAS = new Set(["DHA", "HMB", "MSM", "KN95", "AR", "AE", "AC", "NF", "SR", "XR", "FDT", "HC", "AD", "PED", "UI", "B6",
  "D3", "C", "E", "D", "B", "A", "K", "M", "S", "G", "II", "HCL", "COVID-19", "DM20", "DM30", "P30", "G30", "GD50A", "G30A", "SL", "NJA", "VET", "LEX", "AL", "3"]);
const UNIDADES = { MG: "mg", ML: "mL", G: "g", MCG: "mcg", UG: "µg", UI: "UI", "MG/ML": "mg/mL", "MG/5ML": "mg/5 mL" };

const CONECTORES = new Set(["DE", "Y", "EN", "CON", "SIN", "PARA", "DEL", "LA", "EL"]);
function tituloCompuesto(w, primero) {
  if (/[+/]/.test(w) && w.length > 1) return w.split(/([+/])/).map((x) => (/[+/]/.test(x) ? x : x ? tituloPalabra(x) : x)).join("");
  if (!primero && CONECTORES.has(w.toUpperCase())) return w.toLowerCase();
  return tituloPalabra(w);
}
function tituloPalabra(w) {
  const limpio = w.replace(/[(),]/g, "");
  const up = limpio.toUpperCase();
  if (UNIDADES[up]) return w.replace(limpio, UNIDADES[up]);
  if (/^\d/.test(limpio)) return w.replace(/MG/gi, "mg").replace(/ML/g, "mL").replace(/mcg/gi, "mcg").replace(/UI/gi, " UI").replace(/\s+/g, " ");
  if (SIGLAS.has(up) || /^[A-Z]?\d+[A-Z]*$/.test(up) || /^[A-Z]-[A-Z]+$/.test(up)) return w.toUpperCase();
  if (/^[+&/]$/.test(w)) return w;
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function normalizar(desc) {
  return desc.replace(/\s+/g, " ").trim()
    .replace(/\b(CJA|CAJA|FCO|TUBO|BOLSA|BOTELLA|CJ|TUB)\s*[xX*]\s*(\d+)/g, "$1 x $2")
    .replace(/(\d)(UNDS|UND|UN|SOBRES|SOBRE|SOB|und|un)\b/g, "$1 $2");
}
function nombreLegible(desc) {
  const d = normalizar(desc);
  // Separa "40 mg" pegados tipo "500mg" -> "500 mg" para mostrar
  const tokens = d.replace(/(\d)(MG|mg|ML|ml|mL|UI|MCG|mcg|G\b|g\b)/g, "$1 $2").split(" ");
  let corte = tokens.findIndex((t, i) => i > 0 && CORTE.test(t));
  if (corte <= 0) corte = tokens.length;
  let nombre = tokens.slice(0, corte).filter((t) => !COMERCIALES.has(t.toUpperCase()));
  // Limpieza de restos de promoción en el nombre
  const texto = nombre.map((w, i) => tituloCompuesto(w, i === 0)).join(" ")
    .replace(/\s+/g, " ").replace(/\s([,.])/g, "$1").trim();
  return texto || d;
}

// ---------- Presentación (expande abreviaturas del resto de la descripción) ----------
const ABREV = [
  [/\bCBG\b/gi, "cápsulas blandas"], [/\bCB\b/g, "cápsulas"], [/\bCD\b/g, "cápsulas duras"],
  [/\bTAB REC\b/gi, "tabletas recubiertas"], [/\bTAB\b/gi, "tabletas"], [/\bCOMPR?\b/gi, "comprimidos"],
  [/\bG-?TABS?\b|\bGTAB\b|\bGELTABS\b/gi, "gel-tabs"], [/\bCJA\b|\bCAJA\b|\bCAJ\b/gi, "caja"], [/\bFCO\b|\bFRASCO\b|\bFC\b/gi, "frasco"],
  [/\bTUB\b/gi, "tubo"], [/\bJBE\b/gi, "jarabe"], [/\bSUSP\.?\b|\bSUS\b/gi, "suspensión"], [/\bSOL\.? ?OFTAL\.?\b|\bSOL OFT\b/gi, "solución oftálmica"],
  [/\bSOB(RES)?\b|\bSACH(ETS)?\b/gi, "sobres"], [/\bINY\.?\b/gi, "inyectable"], [/\bAMP\b/gi, "ampollas"],
  [/\bUNDS?\b|\bUN\b|\bUNI\b/gi, "und."], [/\bOVUL\b/gi, "óvulos"], [/\bUNGU\b/gi, "ungüento"], [/\bPOL\b/gi, "polvo"],
  [/\bJER(ING)?A? PRELL(ENADA)?\b/gi, "jeringa prellenada"], [/\bMP\b/g, "minipack"], [/\bNJA\b|\bNRJA\b/gi, "naranja"],
  [/\bNTRO\b/gi, "neutro"], [/\bCAPS?\b|\bCAPSULA\b/gi, "cápsulas"], [/\bUNGUENTO\b/gi, "ungüento"], [/\bTOPICA\b/gi, "tópica"],
  [/\bPEDIAT\b/gi, "pediátrico"], [/\bVET\b/gi, "(uso veterinario)"], [/\bEC\b/g, "con cubierta entérica"], [/\bGELTAB\b/gi, "gel-tabs"],
  [/\bSOBRES?\b/gi, "sobres"], [/\bSAB\b/gi, "sabor"], [/\bGOT\b/gi, "gotas"], [/\bREC\b/gi, "recubiertas"],
];
function presentacion(desc) {
  const d = normalizar(desc);
  const n = nombreLegible(desc).split(" ").length;
  let resto = d.replace(/(\d)(MG|mg|ML|ml|mL|UI|g\b|G\b)/g, "$1 $2").split(" ").slice(n).join(" ");
  resto = resto.split(" ").filter((t) => !COMERCIALES.has(t.toUpperCase())).join(" ");
  for (const [re, r] of ABREV) resto = resto.replace(re, r);
  resto = resto.replace(/\s*[xX\*]\s*(\d)/g, " × $1").replace(/(\D)[xX](\d)/g, "$1 × $2")
    .replace(/(caja|frasco|tubo|bolsa|lata)×/gi, "$1 ×").replace(/\b(\d+) ?ml\b/gi, "$1 mL")
    .replace(/\s+/g, " ").trim();
  resto = resto.replace(/^(cápsulas blandas|cápsulas duras|cápsulas|tabletas recubiertas|tabletas|gel-tabs|comprimidos) (caja|frasco) × (\d+)( und\.)?/i, "$2 × $3 $1");
  resto = resto.replace(/^× (\d+) und\.?$/i, "× $1 unidades").replace(/\. (frasco|caja)/, " $1");
  resto = resto.charAt(0).toUpperCase() + resto.slice(1).toLowerCase().replace(/\bml\b/g, "mL").replace(/\bui\b/g, "UI");
  return resto;
}

// ---------- Empaque para la ilustración (deriva de la descripción y de la forma de R) ----------
function empaque(desc, forma) {
  const d = desc.toUpperCase();
  const t = (re) => re.test(d);
  if (forma === "Tapabocas") return "tapabocas";
  if (forma === "Equipo médico") return "equipo";
  if (forma === "Prueba diagnóstica") return "caja";
  if (forma === "Agujas y jeringas") return "caja";
  if (forma === "Tiras y lancetas") return "caja";
  if (forma === "Confitería") return "bolsa";
  if (forma === "Spray o aerosol") return "spray";
  if (forma === "Inyectable") return "inyectable";
  if (forma === "Solución oftálmica") return "gotero";
  if (forma === "Polvo en lata o tarro") return "lata";
  if (forma === "Parche transdérmico") return "sobre";
  if (t(/BOLSA|MINIPACK|\bMP\b|BOMBONERA|DISPLAY|RISTRA/)) return "bolsa";
  if (forma === "Ungüento" || forma === "Crema" || t(/TUBO|\bTUB/)) return "tubo";
  if (forma === "Uso vaginal") return t(/CREMA|TUBO/) ? "tubo" : "caja";
  if (forma === "Gotas o solución oral") return t(/GOTAS|GOT\b/) ? "gotero" : "botella";
  if (forma === "Jarabe" || forma === "Suspensión" || forma === "Loción o solución tópica") return "botella";
  if (forma === "Polvo en sobres") return "sobre";
  if (t(/\bFCO|FRASCO|FCOX|\bFC\b/)) return "frasco";
  if (forma === "Gomas") return "frasco";
  return "caja";
}

// ---------- Construcción ----------
const idx = new Map(productos.map((p, i) => [p.id, i]));
const prodApp = productos.map((p) => ({
  id: p.id,
  n: nombreLegible(p.nombre),
  pr: presentacion(p.nombre),
  d: p.nombre,
  fo: p.forma,
  e: empaque(p.nombre, p.forma),
  li: p.linea,
  iva: p.iva,
  rx: p.formula === "SI" ? 1 : 0,
  u: p.unidades,
  c: p.compradores,
  $: p.precio,
  // similares: [índice, compradores en común, lift]
  s: (p.similares || []).map((x) => [idx.get(x.id), x.c, x.l]),
  // alternativas por contenido: [índice]
  a: (p.alternativas || []).map((x) => idx.get(x.id)).filter((i) => i !== undefined),
}));

const compApp = compradores.map((c) => ({
  id: c.id,
  f: c.facturas,
  d: c.desde,
  h: c.hasta,
  k: c.vecinos,
  // historial: [índice, unidades, facturas]
  hi: (c.historial || []).map((x) => [idx.get(x.id), x.u, x.f]),
  // recomendaciones: [índice, vecinos que lo compran, índice del producto del historial más parecido o -1]
  r: (c.recs || []).map((x) => [idx.get(x.id), x.v, x.p ? idx.get(x.p) ?? -1 : -1]),
}));

// Verificaciones de integridad
for (const c of compApp) {
  const h = new Set(c.hi.map((x) => x[0]));
  for (const r of c.r) if (h.has(r[0])) throw new Error(`Recomendación ya comprada en ${c.id}`);
}
if (prodApp.some((p) => p.s.some((x) => x[0] === undefined))) throw new Error("Similar sin índice");

const out = join(raiz, "public", "datos");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "productos.json"), JSON.stringify(prodApp));
writeFileSync(join(out, "compradores.json"), JSON.stringify(compApp));
writeFileSync(join(out, "metricas.json"), JSON.stringify(metricas));

const formas = {};
for (const p of prodApp) formas[p.e] = (formas[p.e] || 0) + 1;
console.log(`Productos: ${prodApp.length} · compradores: ${compApp.length}`);
console.log("Empaques:", formas);
if (process.argv.includes("--muestra")) {
  for (const p of prodApp.slice(0, 60)) console.log(p.e.padEnd(10), "|", p.n.padEnd(34), "|", p.pr, " <= ", p.d);
}
