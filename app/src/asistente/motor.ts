// Motor del asistente: interpreta el mensaje con reglas y responde con datos del sistema de recomendación.
// No usa servicios externos ni inventa productos: todo sale del catálogo y de los resultados exportados por R.
import { buscar, cargarCompradores, normalizarTexto, pesos, type Categoria, type Producto } from "../datos";
import { completarCanasta } from "../canasta";
import { enlace } from "../ruta";

export interface ProductoRespuesta { p: Producto; nota?: string }
export interface Respuesta {
  texto: string;
  productos?: ProductoRespuesta[];
  enlace?: { texto: string; href: string };
  sugerencias?: string[];
  aviso?: boolean;
}
export interface Contexto {
  productos: Producto[];
  categorias: Categoria[];
  canasta: number[];
  agregar: (idx: number) => void;
}

const SUGERENCIAS_INICIO = ["Algo para la tos", "Vitaminas para niños", "¿Qué compran con la metformina?", "Recomiéndame para mi canasta"];

// Necesidades frecuentes → categoría. Las palabras se comparan sin tildes.
const NECESIDADES: [string, string[]][] = [
  ["respiratoria", ["tos", "gripa", "gripe", "resfriado", "congestion", "alergia", "alergico", "rinitis", "estornud", "asma", "mocos", "nariz", "garganta"]],
  ["dolor", ["dolor", "duele", "fiebre", "cabeza", "migrana", "inflamacion", "inflamado", "muscular", "golpe", "torcedura", "colico menstrual"]],
  ["digestiva", ["estomago", "acidez", "gastritis", "reflujo", "colon", "gases", "diarrea", "estrenimiento", "digestion", "agrieras", "colico", "probiotico", "fibra"]],
  ["piel", ["piel", "acne", "hongo", "granos", "picazon", "dermatitis", "herida", "sarpullido", "eccema"]],
  ["belleza", ["cabello", "pelo", "caida del cabello", "belleza", "unas", "colageno", "calvicie"]],
  ["bebe", ["bebe", "nino", "ninos", "nina", "infantil", "panal", "formula infantil", "leche de formula", "lactante", "recien nacido", "embarazo", "embarazada", "prenatal"]],
  ["vitaminas", ["vitamina", "vitaminas", "defensas", "cansancio", "energia", "suplemento", "inmune", "gomitas", "omega", "calcio", "zinc"]],
  ["diabetes", ["diabetes", "diabetico", "azucar", "glucosa", "glucometro", "insulina", "tiras", "lancetas", "tensiometro", "presion arterial en casa"]],
  ["corazon", ["presion", "tension", "hipertension", "colesterol", "triglicerido", "corazon", "peso", "adelgazar", "obesidad", "tiroides"]],
  ["femenina", ["anticonceptivo", "planificar", "planificacion", "vaginal", "flujo", "candidiasis", "menstruacion", "intima", "intimo"]],
  ["ojos", ["ojo", "ojos", "vista", "lagrima", "resequedad ocular", "oido", "oidos", "conjuntivitis"]],
  ["huesos", ["articulacion", "articulaciones", "rodilla", "huesos", "artrosis", "osteoporosis", "cartilago", "artritis"]],
  ["nervioso", ["dormir", "insomnio", "ansiedad", "depresion", "mareo", "vertigo", "memoria", "nervios"]],
  ["infecciones", ["infeccion", "antibiotico", "parasitos", "lombrices", "bacteria"]],
  ["proteccion", ["tapabocas", "mascarilla", "covid", "prueba de covid"]],
  ["mascotas", ["perro", "gato", "mascota", "caballo"]],
  ["dulces", ["dulce", "dulces", "gomas de dulce", "golosina"]],
];

const URGENCIA = ["dolor de pecho", "dolor en el pecho", "duele el pecho", "duele en el pecho", "presion en el pecho", "opresion en el pecho",
  "dolor fuerte en el pecho", "me falta el aire", "no puedo hablar", "se me duerme la cara", "perdi el conocimiento", "tome muchas pastillas", "no puedo respirar", "dificultad para respirar", "me ahogo", "desmay", "convuls",
  "sangrado abundante", "sangra mucho", "intoxic", "sobredosis", "envenen", "infarto", "derrame"];
const CRISIS = ["suicid", "quitarme la vida", "hacerme dano", "no quiero vivir", "matarme"];

const VACIAS = new Set(["busco", "buscar", "quiero", "necesito", "tienes", "tienen", "tiene", "hay", "algo", "para", "el", "la", "los", "las", "un",
  "una", "unos", "unas", "de", "del", "me", "mi", "mis", "por", "favor", "que", "compran", "comprar", "con", "junto", "juntos", "agrega", "agregar",
  "agregame", "anade", "canasta", "carrito", "a", "al", "y", "o", "recomienda", "recomiendame", "recomendar", "producto", "productos", "precio",
  "cuanto", "cuesta", "vale", "sirve", "bueno", "buena", "mejor", "dame", "muestrame", "mostrar", "ver", "se", "lo", "le", "es", "en", "mas",
  "otra", "otro", "otras", "otros", "llevan", "combina", "complementa", "parecido", "similar", "similares", "como", "puedo", "tomar", "usar", "hola"]);

const contiene = (t: string, ps: string[]) => ps.some((p) => t.includes(p));
const limpiar = (t: string) => t.split(" ").filter((w) => w && !VACIAS.has(w)).join(" ");

function mejoresCoincidencias(productos: Producto[], q: string, n = 3): Producto[] {
  if (q.length < 2) return [];
  let r = buscar(productos, q, n);
  if (r.length === 0) {
    // Si la frase completa no aparece, se prueba palabra por palabra (de la más larga a la más corta)
    for (const w of q.split(" ").sort((a, b) => b.length - a.length)) {
      if (w.length < 3) continue;
      r = buscar(productos, w, n);
      if (r.length) break;
    }
  }
  return r;
}

const notaRx = (p: Producto) => (p.rx ? "Requiere fórmula médica" : undefined);

function porNecesidad(ctx: Contexto, t: string): { cat: Categoria; palabra: string } | null {
  for (const [id, palabras] of NECESIDADES) {
    const palabra = palabras.find((w) => new RegExp(`(^| )${w}`).test(t));
    if (palabra) {
      const cat = ctx.categorias.find((c) => c.id === id);
      if (cat) return { cat, palabra };
    }
  }
  for (const c of ctx.categorias) {
    const nombre = normalizarTexto(c.nombre);
    if (c.id !== "otros" && (t.includes(nombre) || nombre.split(" ").some((w) => w.length > 5 && t.includes(w)))) return { cat: c, palabra: nombre };
  }
  return null;
}

function respuestaProducto(encontrados: Producto[]): Respuesta {
  const p = encontrados[0];
  return {
    texto: encontrados.length > 1 ? "Encontré estos productos:" : "Encontré este producto:",
    productos: encontrados.map((q) => ({ p: q, nota: notaRx(q) ?? (q.$ ? `Precio de referencia: ${pesos(q.$)}` : undefined) })),
    sugerencias: [`¿Qué compran con ${p.n}?`, `Agrega ${p.n} a la canasta`, "Ver mi canasta"],
  };
}

export async function responder(mensaje: string, ctx: Contexto): Promise<Respuesta> {
  const t = normalizarTexto(mensaje);
  const { productos } = ctx;

  if (!t) return { texto: "Escríbeme qué producto buscas o qué necesitas.", sugerencias: SUGERENCIAS_INICIO };

  // 1. Seguridad primero
  if (contiene(t, CRISIS)) {
    return { aviso: true, texto: "Lo que sientes importa y no tienes que pasarlo solo. Si piensas en hacerte daño, busca ayuda ahora mismo: llama a la línea de emergencias **123** o acude a urgencias, y cuéntale a alguien de confianza." };
  }
  if (contiene(t, URGENCIA)) {
    return { aviso: true, texto: "Eso puede ser una emergencia. Llama a la línea **123** o acude a urgencias de inmediato. Messi solo ayuda a encontrar productos y no reemplaza la atención médica." };
  }

  // 2. Saludo, ayuda y agradecimiento
  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|ayuda|ayudame|menu|que puedes hacer|que haces)\b/.test(t)) {
    return { texto: "¡Hola! Soy Messi, el asistente de Vitrina. Puedo buscar productos por nombre, sugerirte opciones según lo que necesitas, decirte qué se compra junto con un producto y completar tu canasta. ¿Por dónde empezamos?", sugerencias: SUGERENCIAS_INICIO };
  }
  if (/^(gracias|muchas gracias|listo|ok|perfecto|vale)\b/.test(t)) {
    return { texto: "¡Con gusto! Si necesitas algo más, aquí estoy.", sugerencias: ["Ver mi canasta", "Lo más comprado"] };
  }

  // 3. Comprador por código
  const codigo = t.match(/\b(\d{9})\b/);
  if (codigo || /\bcomprador\b/.test(t)) {
    if (!codigo) return { texto: "Escríbeme el código del comprador (9 dígitos, por ejemplo 700000082) y te muestro lo que le recomendamos.", enlace: { texto: "Ver la lista de compradores", href: enlace.compradores() } };
    const indice = await cargarCompradores();
    const c = indice.porId.get(codigo[1]);
    if (!c) return { texto: `No encontré al comprador ${codigo[1]}. Revisa el código o elige uno de la lista.`, enlace: { texto: "Ver la lista de compradores", href: enlace.compradores() } };
    return {
      texto: `El comprador ${c.id} ha comprado ${c.hi.length} productos distintos. Estas son sus principales recomendaciones, según los ${c.k} compradores más parecidos a él:`,
      productos: c.r.slice(0, 4).map(([i, v]) => ({ p: productos[i], nota: `${v} de sus ${c.k} compradores parecidos lo compran` })),
      enlace: { texto: "Ver su historial y todas sus recomendaciones", href: enlace.comprador(c.id) },
    };
  }

  // 4. Cómo funciona
  if (/(como funciona|por que (me )?recomiend|como recomiend|algoritmo|coseno|como eligen|de donde salen)/.test(t)) {
    return {
      texto: "Las recomendaciones salen de 250.748 facturas reales. Dos productos se consideran relacionados si los compran las mismas personas más de lo que se esperaría por azar (similitud de coseno ajustada). Para un comprador, busco a los 100 compradores con compras más parecidas a las suyas y le sugiero lo que ellos compran y él todavía no.",
      enlace: { texto: "Ver cómo funciona y qué tan bien acierta", href: enlace.como() },
    };
  }

  const q = limpiar(t);

  // 5. Agregar a la canasta
  if (/\b(agrega|agregar|agregame|anade|anadir|pon|mete)\b/.test(t) && q) {
    const [p] = mejoresCoincidencias(productos, q, 1);
    if (!p) return { texto: `No encontré «${mensaje}» en el catálogo. Prueba con el nombre del producto o del principio activo.` };
    ctx.agregar(p.idx);
    const sug = completarCanasta(productos, [...new Set([...ctx.canasta, p.idx])], 3);
    return {
      texto: `Listo, agregué **${p.n}** a tu canasta.${sug.length ? " Con lo que llevas, también se suele comprar:" : ""}`,
      productos: sug.map((s) => ({ p: s.p, nota: `Va con ${s.relacionados[0].q.n}` })),
      enlace: { texto: "Ver mi canasta", href: enlace.canasta() },
    };
  }

  // 6. Canasta
  if (/\b(canasta|carrito|que me falta|completar|complementar)\b/.test(t) && !/\bcon\b/.test(t)) {
    if (!ctx.canasta.length) {
      return { texto: "Tu canasta está vacía. Dime un producto y lo agrego, por ejemplo «agrega metformina».", sugerencias: ["Agrega metformina", "Agrega Novamil Premium 1", "Lo más comprado"] };
    }
    const sug = completarCanasta(productos, ctx.canasta, 4);
    return {
      texto: sug.length ? `Tienes ${ctx.canasta.length} ${ctx.canasta.length === 1 ? "producto" : "productos"} en tu canasta. Esto es lo que mejor los complementa:` : "Los productos de tu canasta tienen pocas compras en común con otros, así que no tengo sugerencias con suficiente respaldo.",
      productos: sug.map((s) => ({ p: s.p, nota: `Se compra junto con ${s.relacionados.map((r) => r.q.n).slice(0, 2).join(" y ")}` })),
      enlace: { texto: "Ver mi canasta", href: enlace.canasta() },
    };
  }

  // 7. Qué se compra con un producto
  if (/(que (mas )?(se )?(compran|compra|llevan|lleva)|junto con|combina|complement|parecido a|similar a|va con|acompan)/.test(t) && q) {
    const [p] = mejoresCoincidencias(productos, q, 1);
    if (p) {
      if (!p.s.length) return { texto: `Muy pocas personas han comprado **${p.n}**, así que todavía no tengo productos relacionados con suficiente respaldo.`, productos: [{ p }] };
      return {
        texto: `Quienes compran **${p.n}** también suelen comprar:`,
        productos: p.s.slice(0, 4).map(([i, c, l]) => ({ p: productos[i], nota: `${c.toLocaleString("es-CO")} compradores en común${l >= 1.2 ? `, ${l.toLocaleString("es-CO")} veces más de lo esperado` : ""}` })),
        enlace: { texto: `Ver ${p.n}`, href: enlace.producto(p.id) },
      };
    }
  }

  // 8. Lo más comprado
  if (/(mas (vendido|comprado|popular)|populares|lo que mas compran|recomiendame algo$|recomiendame$)/.test(t)) {
    const top = [...productos].sort((a, b) => b.c - a.c).filter((p, i, arr) => arr.findIndex((x) => x.n === p.n) === i).slice(0, 4);
    return { texto: "Esto es lo que más compran las personas en Vitrina:", productos: top.map((p) => ({ p, nota: `Lo han comprado ${p.c.toLocaleString("es-CO")} personas` })) };
  }

  // 9. Precio
  if (/(precio|cuanto (cuesta|vale))/.test(t) && q) {
    const [p] = mejoresCoincidencias(productos, q, 1);
    if (p) return { texto: p.$ ? `El precio de referencia de **${p.n}** (${p.pr}) es ${pesos(p.$)}. Es la mediana de lo que se pagó en las facturas.` : `No tengo precio registrado para **${p.n}**.`, productos: [{ p }] };
  }

  // 10. Producto nombrado con claridad (p. ej., «vitamina e 400»)
  const coincidencias = mejoresCoincidencias(productos, q || t, 3);
  const fuerte = coincidencias[0] && q.length >= 4 && normalizarTexto(coincidencias[0].n).includes(q);
  if (fuerte) return respuestaProducto(coincidencias);

  // 11. Necesidad o síntoma → categoría
  const nec = porNecesidad(ctx, t);
  if (nec) {
    // Cada término del mensaje (con plural reducido y sinónimos) que aparece en el producto suma prioridad
    const SINONIMOS: Record<string, string[]> = {
      nino: ["kids", "pediat", "nino"], nina: ["kids", "pediat"], infantil: ["kids", "pediat", "novamil"],
      bebe: ["novamil", "pediavit", "bebe"], vitamina: ["vitamin", "vit ", "gumivit", "multi"], tos: ["tos"], gripa: ["gripa"],
    };
    const terminos = q.split(" ").filter((w) => w.length >= 3).map((w) => {
      const base = w.replace(/(es|s)$/, "");
      return [w, base, ...(SINONIMOS[base] ?? SINONIMOS[w] ?? [])];
    });
    // Principios activos habituales para necesidades frecuentes (solo ordenan; no recomiendan dosis)
    const HABITUALES: [RegExp, string[]][] = [
      [/acidez|reflujo|gastritis|agrieras/, ["omeprazol", "esomeprazol", "pantoprazol", "lansopep", "ezolium", "refluyet"]],
      [/gases|colon|colico/, ["trimebutina", "simeticona", "digesta", "muvett"]],
      [/diarrea/, ["bioflor", "ecosys", "probiotic"]],
      [/estrenimiento/, ["fibra", "bonfibra"]],
      [/fiebre|cabeza|migrana/, ["dolofen", "acetaminof", "naproxeno"]],
      [/alergi|rinitis|estornud/, ["loratadina", "levocetirizina", "fexofenadina", "alercet", "levotrex"]],
      [/hongo/, ["clotrimazol", "fungiblan", "fluconazol"]],
      [/acne/, ["isotretinoina", "isoface"]],
      [/lagrima|reseq|ojos? sec/, ["lagri", "tearsoft"]],
      [/articulacion|rodilla|cartilago|artrosis/, ["glucosamina", "flexure", "condro"]],
      [/defensas|inmune/, ["vitamina c", "zinc", "lemovit"]],
    ];
    for (const [re, activos] of HABITUALES) if (re.test(t)) terminos.push(activos);
    const enCat = productos.filter((p) => p.ca === nec.cat.id);
    const puntaje = (p: Producto) => terminos.filter((vs) => vs.some((v) => p.clave.includes(v))).length * 1e6 + p.c;
    const vistos = new Set<string>();
    const top = [...enCat].sort((a, b) => puntaje(b) - puntaje(a)).filter((p) => (vistos.has(p.n) ? false : (vistos.add(p.n), true))).slice(0, 4);
    return {
      texto: `Para eso te puedo mostrar productos de **${nec.cat.nombre}**. Estos son los más comprados. Recuerda que esto no reemplaza la consulta con un médico o farmacéutico.`,
      productos: top.map((p) => ({ p, nota: notaRx(p) })),
      enlace: { texto: `Ver los ${nec.cat.n} productos de ${nec.cat.nombre}`, href: enlace.catalogo(nec.cat.id) },
    };
  }

  // 12. Coincidencia parcial con un producto
  if (coincidencias.length) return respuestaProducto(coincidencias);

  return {
    texto: "No estoy seguro de haberte entendido. Puedes escribirme el nombre de un producto, contarme qué necesitas (por ejemplo «algo para la acidez») o pedirme que complete tu canasta.",
    sugerencias: SUGERENCIAS_INICIO,
  };
}

export const MENSAJE_INICIAL: Respuesta = {
  texto: "¡Hola! Soy Messi, el asistente de Vitrina. Cuéntame qué necesitas o qué producto buscas y te recomiendo opciones con base en lo que compran otras personas.",
  sugerencias: SUGERENCIAS_INICIO,
};
