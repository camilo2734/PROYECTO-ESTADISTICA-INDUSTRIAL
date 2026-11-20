// Clasificación de productos en categorías de la tienda.
// Variable DERIVADA de la descripción de la factura y de la forma farmacéutica calculada en R:
// los datos de Procaps no traen categorías. Se aplican reglas en orden de prioridad; la primera
// que coincide asigna la categoría. Lo que no puede clasificarse con seguridad queda en "Otros".
// La lista resultante se exporta a docs/clasificacion_categorias.csv para revisión del equipo.

export const CATEGORIAS = [
  { id: "vitaminas", nombre: "Vitaminas y suplementos", icono: "capsula" },
  { id: "respiratoria", nombre: "Salud respiratoria y alergias", icono: "pulmones" },
  { id: "dolor", nombre: "Dolor e inflamación", icono: "rayo" },
  { id: "digestiva", nombre: "Salud digestiva", icono: "estomago" },
  { id: "piel", nombre: "Dermatología", icono: "piel" },
  { id: "belleza", nombre: "Belleza y cuidado personal", icono: "gota" },
  { id: "bebe", nombre: "Mamá y bebé", icono: "biberon" },
  { id: "diabetes", nombre: "Diabetes y equipos de control", icono: "glucometro" },
  { id: "corazon", nombre: "Corazón y metabolismo", icono: "corazon" },
  { id: "femenina", nombre: "Salud femenina", icono: "flor" },
  { id: "ojos", nombre: "Ojos y oídos", icono: "ojo" },
  { id: "huesos", nombre: "Huesos y articulaciones", icono: "hueso" },
  { id: "nervioso", nombre: "Sistema nervioso", icono: "cerebro" },
  { id: "infecciones", nombre: "Antibióticos y antiparasitarios", icono: "escudo" },
  { id: "proteccion", nombre: "Protección y pruebas", icono: "tapabocas" },
  { id: "mascotas", nombre: "Mascotas", icono: "huella" },
  { id: "dulces", nombre: "Dulces", icono: "dulce" },
  { id: "otros", nombre: "Otros", icono: "caja" },
];

// [categoría, expresión regular sobre la descripción en mayúsculas]
const REGLAS = [
  ["proteccion", /TAPA ?BOCAS|PROTEKTA|KN95|TEST COVID/],
  ["dulces", /TROLLI|GLOWWORMS|CLASSIC BEARS|SQUIGGLES|CATERPILLAR/],
  ["mascotas", /CARPRODYL|O3 HORSE/],
  ["diabetes", /METFORMINA|G\.?-?MET\b|PREDIAL|METGLITAL|SIL ?NORBORAL|TIRAS|LANCETA|LANREG|GLUC[OÓ]METRO|GLUCOQUICK|DIAMOND|DIMOND|AGUJ|JERINGA|NANOPASS|INSULINA|GLUVID|DIABETRICS|TENSI[OÓ]METRO|TERM[OÓ]METRO|B[AÁ]SCULA/],
  ["femenina", /YAEL|ISBELA|VERONIQ|ADELLA|MARCELLE|EVINET|ALACTIN|SAFORELLE|ILANA|VAXIDUO|METROZIN|METRONIST|FEMDUO|CLINDAMIZOL|OVUL|VAGINAL/],
  ["ojos", /OFT|LAGRIFRESH|LAGRIGEN|TEARSOFT|DORZOPT|LATANOX|BRIMODOR|ALAP\b|EYE ZUL|BLEFADEX|TOBRACORT|LEVOMAX|VISOCAP|VISOMEGA|OTOSEC/],
  ["respiratoria", /LORATADINA|LEVOCETIRIZINA|FEXOFENADINA|ALERCET|KLEAR|XALAR|BRONER|MOMETASONA|FLUXAL|LEVOTREX|GRIPA/],
  ["bebe", /NOVAMIL|PEDIAVIT|KIDS|NI[ÑN]OS|NISTATINA\+OXIDO|OXIDO DE ZINC|GESTAVIT|GESTAFER|FORTZINK|FORT-ZINK/],
  ["digestiva", /OMEPRAZOL|ESOMEPRAZOL|PANTOPRAZOL|EZOLIUM|LANSOPEP|REFLUYET|TRIMEBUTINA|DIGESTA|IFAXIM|CLOPERAX|MUVETT|BIOFLOR|ECOSYS|PROBIOTICO|BONFIBRA|FIBRA/],
  ["huesos", /GLUCOSAMINA|GLUCO 500|GLUCOSA 500|CONDROI|FLEXURE|FLEXIGEL|BONESE|IBANDRONICO/],
  ["dolor", /DOLOFEN|DICLOFEN|DICLOFENAC|MELOXICAM|NAPROXENO|GELPIN|BIENEX|NIMESULIDA|TRAMADOL|INDOMETACINA|ACETAMINOF|PROXIGEL|INFLAXEN|KEPROFEN|BETAMETASO|BETADUO|DEXAMETASONA/],
  ["corazon", /VARTERAL|VALSARTAN|ENALAPRIL|ROSUVASTATINA|ATORVASTATINA|ATOVAROL|EZETIMIBA|GEMFIBROZILO|CARDIOSOL|ATEPLAX|EPAX|EPACOR|CLENOX|ORLISTAT|LEVOTIROXINA|GOUTEX/],
  ["nervioso", /SERTRALINA|QUETIAPINA|KETIAN|ZOLPIDEM|ZOPICLONA|PROLANZ|ISPERIN|NEURACT|VERTIGEN/],
  ["infecciones", /AZITROMICINA|CLARITROMICINA|ZITRIM|PAMOX|ERITROMICINA|CLORANFENICOL|RIFAMPICINA|NITAZOXANIDA|NYTAX|FLUCONAZOL|FLUNAZOL|IVERBLAN|ALBISEC|VALTROIS|METRONIF/],
  ["belleza", /FOLISTER|MINOXIDIL|COLAGENO|VITYBELL|ETONIC|DRYDERMA/],
  ["piel", /CLOTRIMAZOL|FUNGIBLAN|GENTAMICINA 0,1|CROMUS|ISOTRETINOINA|ISOFACE|RIFAMICINA/],
  ["vitaminas", /VITAMINA|\bVIT\b|VIT[- .]|GUMIVIT|GUMMY|GUMI |LEMOVIT|B-VIT|COMPLEJO B|POLIVIT|MULTIVIT|OMEGA|OMEGEL|CALCIO|CALCITRIOL|DEFEROL|D-FEROL|AQUASOL|BACALAO|NUTRIGEL|PREVENTIA|PLENIV|LIFERTRON|BENEXOL|EPAPURE|CROMEGA|GINKGO|SULBUTIAMINA|LIPOTIC|DELISOY|RETIBLAN/],
];

export function categoria(descripcion, forma) {
  const d = descripcion.toUpperCase();
  if (forma === "Solución oftálmica") return "ojos";
  if (forma === "Uso vaginal") return "femenina";
  for (const [cat, re] of REGLAS) if (re.test(d)) return cat;
  return "otros";
}
