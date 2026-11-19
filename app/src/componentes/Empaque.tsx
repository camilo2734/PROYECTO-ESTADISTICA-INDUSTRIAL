import { memo } from "react";
import type { Producto } from "../datos";

// Ilustración del empaque de cada producto, generada a partir de sus datos reales:
// la forma del empaque sale de la forma farmacéutica y la presentación (ver scripts/preparar-datos.mjs)
// y la etiqueta muestra el nombre real del producto. No se dibujan logos ni marcas inventadas.

const TONOS = [
  { base: "#1F6F5C", claro: "#D6EDE4" }, // verde botica
  { base: "#2F5F94", claro: "#DCE7F4" }, // azul
  { base: "#B97A12", claro: "#F6E7C8" }, // ámbar
  { base: "#A63D62", claro: "#F4DCE5" }, // frambuesa
  { base: "#5B4D9C", claro: "#E4E0F3" }, // violeta
  { base: "#17808F", claro: "#D4EEF1" }, // turquesa
];
function tono(linea: string) {
  let h = 0;
  for (let i = 0; i < linea.length; i++) h = (h * 31 + linea.charCodeAt(i)) >>> 0;
  return TONOS[h % TONOS.length];
}

// Parte el nombre en líneas que caben en la etiqueta
function lineas(texto: string, max: number, n: number) {
  const palabras = texto.split(" ");
  const out: string[] = [];
  let actual = "";
  for (const p of palabras) {
    if ((actual + " " + p).trim().length <= max) actual = (actual + " " + p).trim();
    else { if (actual) out.push(actual); actual = p; }
    if (out.length === n) break;
  }
  if (out.length < n && actual) out.push(actual);
  if (out.length === n && palabras.join(" ").length > out.join(" ").length) {
    out[n - 1] = out[n - 1].length > max - 1 ? out[n - 1].slice(0, max - 1) + "…" : out[n - 1] + "…";
  }
  return out.slice(0, n);
}

interface Props { p: Producto; tam?: number; className?: string }

function EmpaqueSvg({ p, tam = 160, className }: Props) {
  const t = tono(p.li);
  const nombre = lineas(p.n, p.e === "gotero" || p.e === "spray" ? 11 : 14, 2);
  const etiqueta = (x: number, y: number, ancho: number, alto: number, centro = true) => {
    const cx = x + ancho / 2;
    return (
      <g>
        <rect x={x} y={y} width={ancho} height={alto} rx={3} fill="#FFFFFF" />
        <rect x={x} y={y} width={ancho} height={5} rx={2} fill={t.base} />
        {nombre.map((l, i) => (
          <text key={i} x={centro ? cx : x + 6} y={y + 17 + i * 11.5} textAnchor={centro ? "middle" : "start"}
            fontSize={10} fontWeight={700} fill="#16302D" fontFamily="'Atkinson Hyperlegible', sans-serif">{l}</text>
        ))}
        <rect x={centro ? cx - 14 : x + 6} y={y + alto - 9} width={28} height={3} rx={1.5} fill={t.base} opacity={0.5} />
      </g>
    );
  };

  let figura: JSX.Element;
  switch (p.e) {
    case "frasco":
      figura = (<g>
        <ellipse cx="80" cy="146" rx="46" ry="5" fill="#16302D" opacity=".08" />
        <rect x="36" y="56" width="88" height="88" rx="16" fill={t.claro} stroke={t.base} strokeOpacity=".25" />
        <rect x="44" y="30" width="72" height="30" rx="7" fill={t.base} />
        <rect x="44" y="52" width="72" height="5" fill="#000" opacity=".12" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={50 + i * 9.5} y="33" width="3" height="20" rx="1.5" fill="#fff" opacity=".18" />)}
        {etiqueta(40, 74, 80, 46)}
        <rect x="114" y="66" width="5" height="68" rx="2.5" fill="#fff" opacity=".55" />
      </g>);
      break;
    case "botella":
      figura = (<g>
        <ellipse cx="80" cy="147" rx="34" ry="4.5" fill="#16302D" opacity=".08" />
        <path d="M66 40 h28 v14 c0 6 18 10 18 26 v58 a8 8 0 0 1 -8 8 h-48 a8 8 0 0 1 -8 -8 v-58 c0 -16 18 -20 18 -26 z" fill="#7A4E12" />
        <path d="M66 40 h28 v14 c0 6 18 10 18 26 v58 a8 8 0 0 1 -8 8 h-48 a8 8 0 0 1 -8 -8 v-58 c0 -16 18 -20 18 -26 z" fill="url(#vidrio)" />
        <rect x="63" y="22" width="34" height="20" rx="4" fill={t.base} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={67 + i * 7.5} y="25" width="2.5" height="14" rx="1" fill="#fff" opacity=".2" />)}
        {etiqueta(52, 82, 56, 50)}
        <rect x="101" y="84" width="4" height="50" rx="2" fill="#fff" opacity=".25" />
      </g>);
      break;
    case "gotero":
      figura = (<g>
        <ellipse cx="80" cy="147" rx="28" ry="4" fill="#16302D" opacity=".08" />
        <path d="M74 14 L86 14 L84 44 L76 44 Z" fill={t.base} />
        <rect x="68" y="42" width="24" height="18" rx="3" fill={t.base} />
        <path d="M70 60 h20 c4 6 18 10 18 22 v56 a8 8 0 0 1 -8 8 h-40 a8 8 0 0 1 -8 -8 v-56 c0 -12 14 -16 18 -22 z" fill="#FFFFFF" stroke={t.base} strokeOpacity=".35" />
        {etiqueta(56, 86, 48, 46)}
      </g>);
      break;
    case "tubo":
      figura = (<g>
        <ellipse cx="82" cy="150" rx="40" ry="4" fill="#16302D" opacity=".08" />
        <g transform="rotate(-8 80 85)">
          <rect x="46" y="16" width="68" height="12" rx="2" fill={t.base} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={50 + i * 8} y="18" width="2" height="8" fill="#fff" opacity=".3" />)}
          <path d="M48 28 h64 l-12 98 h-40 z" fill="#FFFFFF" stroke={t.base} strokeOpacity=".3" />
          <path d="M48 28 h64 l-2 14 h-60 z" fill={t.claro} />
          {etiqueta(56, 54, 48, 46)}
          <rect x="66" y="126" width="28" height="20" rx="3" fill={t.base} />
        </g>
      </g>);
      break;
    case "sobre": {
      const zig = (y: number) => Array.from({ length: 12 }, (_, i) => `l${4} ${i % 2 ? -4 : 4}`).join(" ").replace(/^/, `M38 ${y} `);
      figura = (<g>
        <ellipse cx="80" cy="148" rx="50" ry="4.5" fill="#16302D" opacity=".08" />
        <rect x="58" y="34" width="72" height="96" rx="4" fill={t.claro} transform="rotate(8 94 82)" stroke={t.base} strokeOpacity=".25" />
        <g transform="rotate(-5 80 85)">
          <path d={`${zig(36)} L86 128 ${Array.from({ length: 12 }, (_, i) => `l-4 ${i % 2 ? 4 : -4}`).join(" ")} Z`} fill="#FFFFFF" stroke={t.base} strokeOpacity=".35" />
          <rect x="38" y="40" width="48" height="10" fill={t.base} />
          {etiqueta(38, 60, 48, 46)}
        </g>
      </g>);
      break;
    }
    case "bolsa":
      figura = (<g>
        <ellipse cx="80" cy="148" rx="48" ry="4.5" fill="#16302D" opacity=".08" />
        <path d="M40 24 h80 l4 104 c0 8 -6 14 -14 14 h-60 c-8 0 -14 -6 -14 -14 z" fill={t.base} />
        <rect x="42" y="34" width="76" height="3" fill="#fff" opacity=".35" />
        <path d="M44 24 h72" stroke="#fff" strokeOpacity=".3" strokeWidth="4" />
        {[0, 1, 2].map((i) => <circle key={i} cx={62 + i * 18} cy={124} r={6} fill={["#F4B740", "#E5576E", "#7BC67E"][i]} opacity=".9" />)}
        {etiqueta(46, 50, 68, 50)}
      </g>);
      break;
    case "lata":
      figura = (<g>
        <ellipse cx="80" cy="146" rx="48" ry="6" fill="#16302D" opacity=".08" />
        <path d="M34 42 v96 a46 10 0 0 0 92 0 v-96 z" fill={t.claro} />
        <path d="M34 108 v30 a46 10 0 0 0 92 0 v-30 a46 10 0 0 1 -92 0 z" fill={t.base} />
        <ellipse cx="80" cy="42" rx="46" ry="10" fill={t.base} />
        <ellipse cx="80" cy="40" rx="40" ry="7" fill="#fff" opacity=".25" />
        {etiqueta(44, 58, 72, 44)}
        <rect x="116" y="52" width="5" height="82" rx="2.5" fill="#fff" opacity=".45" />
      </g>);
      break;
    case "spray":
      figura = (<g>
        <ellipse cx="80" cy="148" rx="30" ry="4" fill="#16302D" opacity=".08" />
        <rect x="70" y="10" width="20" height="16" rx="3" fill="#16302D" opacity=".75" />
        <rect x="88" y="14" width="10" height="5" rx="2" fill="#16302D" opacity=".75" />
        <path d="M60 30 q20 -8 40 0 v6 h-40 z" fill="#C9D3CF" />
        <rect x="56" y="36" width="48" height="108" rx="10" fill={t.base} />
        {etiqueta(58, 66, 44, 48)}
        <rect x="96" y="42" width="4" height="96" rx="2" fill="#fff" opacity=".3" />
      </g>);
      break;
    case "inyectable":
      figura = (<g>
        <ellipse cx="80" cy="148" rx="52" ry="4.5" fill="#16302D" opacity=".08" />
        <rect x="28" y="52" width="104" height="92" rx="5" fill="#FFFFFF" stroke={t.base} strokeOpacity=".3" />
        <rect x="28" y="52" width="104" height="14" rx="5" fill={t.base} />
        {etiqueta(34, 74, 64, 46, false)}
        <g transform="translate(104 20)">
          <rect x="0" y="0" width="20" height="10" rx="3" fill={t.base} />
          <rect x="3" y="10" width="14" height="8" fill="#C9D3CF" />
          <rect x="0" y="18" width="20" height="44" rx="5" fill="#EAF4FB" stroke="#9FB3BD" />
          <rect x="3" y="40" width="14" height="19" rx="3" fill={t.claro} />
        </g>
      </g>);
      break;
    case "tapabocas":
      figura = (<g>
        <ellipse cx="80" cy="148" rx="52" ry="4.5" fill="#16302D" opacity=".08" />
        <rect x="26" y="62" width="108" height="82" rx="5" fill={t.claro} stroke={t.base} strokeOpacity=".3" />
        {etiqueta(32, 92, 70, 44, false)}
        <g transform="translate(48 14)">
          <path d="M-6 20 c-14 0 -14 26 0 26 M70 20 c14 0 14 26 0 26" stroke="#9FB3BD" strokeWidth="2.5" fill="none" />
          <path d="M0 10 q32 -12 64 0 v42 q-32 14 -64 0 z" fill="#FFFFFF" stroke="#9FB3BD" />
          {[22, 32, 42].map((y) => <path key={y} d={`M2 ${y} q30 -6 60 0`} stroke="#C9D7DD" fill="none" />)}
        </g>
      </g>);
      break;
    case "equipo":
      figura = (<g>
        <ellipse cx="80" cy="148" rx="40" ry="4.5" fill="#16302D" opacity=".08" />
        <rect x="44" y="18" width="72" height="126" rx="18" fill="#F1F5F3" stroke="#9FB3BD" />
        <rect x="52" y="30" width="56" height="38" rx="6" fill="#16302D" />
        <text x="80" y="56" textAnchor="middle" fontSize="16" fill="#7EE0B5" fontFamily="'Atkinson Hyperlegible', sans-serif" fontWeight={700}>---</text>
        <circle cx="66" cy="128" r="6" fill={t.base} />
        <circle cx="94" cy="128" r="6" fill={t.base} opacity=".55" />
        {etiqueta(50, 74, 60, 42)}
      </g>);
      break;
    default: // caja
      figura = (<g>
        <ellipse cx="78" cy="148" rx="54" ry="5" fill="#16302D" opacity=".08" />
        <path d="M30 40 l14 -12 h84 l-14 12 z" fill={t.base} opacity=".82" />
        <path d="M114 40 l14 -12 v100 l-14 12 z" fill={t.base} opacity=".62" />
        <rect x="30" y="40" width="84" height="100" fill="#FFFFFF" stroke={t.base} strokeOpacity=".25" />
        <rect x="30" y="40" width="84" height="20" fill={t.base} />
        <rect x="30" y="120" width="84" height="20" fill={t.claro} />
        {etiqueta(36, 66, 72, 46)}
      </g>);
  }

  return (
    <svg viewBox="0 0 160 160" width={tam} height={tam} className={className} role="img"
      aria-label={`Ilustración del empaque: ${p.n}`}>
      <defs>
        <linearGradient id="vidrio" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".05" />
          <stop offset=".75" stopColor="#fff" stopOpacity=".18" />
          <stop offset="1" stopColor="#000" stopOpacity=".15" />
        </linearGradient>
      </defs>
      {figura}
    </svg>
  );
}

export default memo(EmpaqueSvg);
