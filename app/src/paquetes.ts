// Paquetes por malestar y nivel. Solo productos de venta libre del catálogo; ninguno requiere fórmula médica.
// Cada paquete lleva un solo analgésico o antiinflamatorio oral, para no sumar medicamentos del mismo tipo.
export type Nivel = "leve" | "moderado" | "fuerte";

export interface ItemPaquete { id: string; para: string }
export interface PaqueteNivel { items: ItemPaquete[]; cuidados: string[] }
export interface Malestar {
  id: string;
  nombre: string;
  icono: string;
  frase: string;
  claves: string[];                 // palabras con que Messi lo reconoce (sin tildes)
  niveles: Record<Nivel, PaqueteNivel>;
  alarma: string[];                 // señales para consultar o llamar al 123
}

export const NIVELES: { id: Nivel; nombre: string; describe: string }[] = [
  { id: "leve", nombre: "Leve", describe: "Molestia pasajera; puedes seguir con tu día." },
  { id: "moderado", nombre: "Moderado", describe: "Te incomoda y te quita energía." },
  { id: "fuerte", nombre: "Fuerte", describe: "Te impide hacer tus actividades." },
];

const C = {
  dolofenGripa: "300011173", loratadina: "300000750", fexofenadina: "300007549", klearTos: "300001342",
  lemovit: "300001124", vitC: "300006406", gumivitCZinc: "300006095", protekta: "500001495",
  dolofen: "300000738", diclofen: "500000312", naproxeno: "300000792", glucosamina: "300001300",
  digesta: "300000943", omeprazol: "300000628", bioflor: "300008993", probioticos: "300005116", bonfibra: "300001779",
  lagrigen: "300007770", lagrifresh: "300000057", tearsoft: "300001289",
  oxidoZinc: "500001465", nistatinaZinc: "300001554",
  klearKids: "300000105", gumivitKidsC: "300001913", dolofenJarabe: "300000740",
  polivitaminas: "300000797",
};

export const MALESTARES: Malestar[] = [
  {
    id: "gripa", nombre: "Gripa y resfriado", icono: "pulmones", frase: "Congestión, estornudos, malestar general.",
    claves: ["gripa", "gripe", "resfriado", "resfrio", "congestion", "mocos", "estornud", "malestar general"],
    niveles: {
      leve: { items: [{ id: C.lemovit, para: "Vitamina C para tus defensas" }, { id: C.protekta, para: "Tapabocas para no contagiar a otros" }],
        cuidados: ["Toma abundantes líquidos.", "Descansa y abrígate."] },
      moderado: { items: [{ id: C.dolofenGripa, para: "Alivia el malestar de la gripa" }, { id: C.loratadina, para: "Calma estornudos y congestión" },
        { id: C.lemovit, para: "Vitamina C para tus defensas" }, { id: C.protekta, para: "Tapabocas para no contagiar a otros" }],
        cuidados: ["Toma abundantes líquidos.", "Descansa y evita cambios bruscos de temperatura."] },
      fuerte: { items: [{ id: C.dolofenGripa, para: "Alivia el malestar de la gripa" }, { id: C.loratadina, para: "Calma estornudos y congestión" },
        { id: C.klearTos, para: "Para la tos" }, { id: C.vitC, para: "Vitamina C para tus defensas" }, { id: C.protekta, para: "Tapabocas para no contagiar a otros" }],
        cuidados: ["Guarda reposo e hidrátate.", "Si en 3 días no mejoras, consulta a tu médico."] },
    },
    alarma: ["dificultad para respirar", "fiebre alta por más de 3 días", "dolor en el pecho"],
  },
  {
    id: "tos", nombre: "Tos", icono: "pulmones", frase: "Tos seca o con flema, garganta irritada.",
    claves: ["tos", "garganta", "flema", "carraspera"],
    niveles: {
      leve: { items: [{ id: C.klearTos, para: "Para la tos" }, { id: C.gumivitCZinc, para: "Vitamina C y zinc" }],
        cuidados: ["Bebe líquidos tibios.", "Evita el humo y el aire frío."] },
      moderado: { items: [{ id: C.klearTos, para: "Para la tos" }, { id: C.loratadina, para: "Si la tos viene con alergia o congestión" },
        { id: C.lemovit, para: "Vitamina C para tus defensas" }], cuidados: ["Bebe líquidos tibios.", "Duerme con la cabeza un poco elevada."] },
      fuerte: { items: [{ id: C.klearTos, para: "Para la tos" }, { id: C.loratadina, para: "Si la tos viene con alergia o congestión" },
        { id: C.vitC, para: "Vitamina C para tus defensas" }, { id: C.protekta, para: "Tapabocas para no contagiar a otros" }],
        cuidados: ["Descansa e hidrátate.", "Una tos que dura más de 2 semanas debe revisarla un médico."] },
    },
    alarma: ["dificultad para respirar", "tos con sangre", "silbido al respirar"],
  },
  {
    id: "cabeza", nombre: "Dolor de cabeza", icono: "cerebro", frase: "Tensión, cansancio, dolor después de pantallas.",
    claves: ["dolor de cabeza", "cabeza", "migrana", "jaqueca", "cefalea"],
    niveles: {
      leve: { items: [{ id: C.dolofen, para: "Analgésico para el dolor" }], cuidados: ["Hidrátate.", "Descansa la vista de las pantallas."] },
      moderado: { items: [{ id: C.dolofen, para: "Analgésico para el dolor" }, { id: C.lagrifresh, para: "Alivia los ojos cansados por pantallas" }],
        cuidados: ["Descansa en un lugar con poca luz.", "Hidrátate y come a tus horas."] },
      fuerte: { items: [{ id: C.dolofen, para: "Analgésico para el dolor" }, { id: C.lagrifresh, para: "Alivia los ojos cansados por pantallas" }],
        cuidados: ["Descansa en un lugar oscuro y silencioso.", "Si el dolor se repite con frecuencia, consulta a tu médico."] },
    },
    alarma: ["dolor súbito y muy intenso", "visión borrosa o doble", "dificultad para hablar", "debilidad en un lado del cuerpo"],
  },
  {
    id: "muscular", nombre: "Dolor muscular y golpes", icono: "hueso", frase: "Esfuerzo físico, golpes, torceduras leves.",
    claves: ["dolor muscular", "musculo", "golpe", "torcedura", "esguince", "espalda", "dolor de cuerpo", "duele el cuerpo", "cuerpo cortado", "contractura"],
    niveles: {
      leve: { items: [{ id: C.diclofen, para: "Aerosol para aplicar sobre la zona" }], cuidados: ["Aplica frío las primeras 48 horas.", "Evita forzar la zona."] },
      moderado: { items: [{ id: C.diclofen, para: "Aerosol para aplicar sobre la zona" }, { id: C.naproxeno, para: "Antiinflamatorio para el dolor" }],
        cuidados: ["Reposo relativo de la zona.", "Frío local las primeras 48 horas."] },
      fuerte: { items: [{ id: C.diclofen, para: "Aerosol para aplicar sobre la zona" }, { id: C.naproxeno, para: "Antiinflamatorio para el dolor" },
        { id: C.glucosamina, para: "Apoyo para tus articulaciones" }], cuidados: ["Inmoviliza y eleva la zona.", "Si no puedes apoyar o mover la zona, consulta a tu médico."] },
    },
    alarma: ["deformidad o hinchazón grande", "no poder apoyar o mover la zona", "golpe fuerte en la cabeza"],
  },
  {
    id: "acidez", nombre: "Acidez y gases", icono: "estomago", frase: "Agrieras, ardor, llenura después de comer.",
    claves: ["acidez", "agrieras", "reflujo", "gastritis", "ardor", "gases", "llenura", "indigestion"],
    niveles: {
      leve: { items: [{ id: C.digesta, para: "Alivia los gases y la llenura" }], cuidados: ["Come despacio y en porciones pequeñas.", "Evita acostarte justo después de comer."] },
      moderado: { items: [{ id: C.omeprazol, para: "Reduce la acidez" }, { id: C.digesta, para: "Alivia los gases y la llenura" }],
        cuidados: ["Evita café, picantes y comidas grasosas.", "Cena al menos 2 horas antes de dormir."] },
      fuerte: { items: [{ id: C.omeprazol, para: "Reduce la acidez" }, { id: C.digesta, para: "Alivia los gases y la llenura" },
        { id: C.probioticos, para: "Probióticos para tu digestión" }], cuidados: ["Evita alcohol, café y picantes.", "Si la acidez es frecuente, consulta a tu médico."] },
    },
    alarma: ["vómito con sangre", "heces negras", "dolor en el pecho"],
  },
  {
    id: "estrenimiento", nombre: "Estreñimiento", icono: "estomago", frase: "Digestión lenta, pocas idas al baño.",
    claves: ["estrenimiento", "estrenido", "digestion lenta", "no puedo ir al bano"],
    niveles: {
      leve: { items: [{ id: C.bonfibra, para: "Gomas con fibra" }], cuidados: ["Toma 8 vasos de agua al día.", "Come frutas y verduras."] },
      moderado: { items: [{ id: C.bonfibra, para: "Gomas con fibra" }, { id: C.probioticos, para: "Probióticos para tu digestión" }],
        cuidados: ["Toma abundante agua.", "Camina al menos 30 minutos al día."] },
      fuerte: { items: [{ id: C.bonfibra, para: "Gomas con fibra" }, { id: C.bioflor, para: "Probióticos en sobres" }],
        cuidados: ["Toma abundante agua.", "Si dura más de una semana, consulta a tu médico."] },
    },
    alarma: ["dolor abdominal fuerte", "sangre en las heces", "vómito"],
  },
  {
    id: "alergia", nombre: "Alergia", icono: "flor", frase: "Estornudos, picazón en nariz y ojos.",
    claves: ["alergia", "alergico", "rinitis", "picazon en la nariz", "polvo", "polen"],
    niveles: {
      leve: { items: [{ id: C.loratadina, para: "Antialérgico" }], cuidados: ["Evita el polvo y el humo.", "Ventila tu casa."] },
      moderado: { items: [{ id: C.fexofenadina, para: "Antialérgico" }, { id: C.lagrifresh, para: "Alivia los ojos irritados" }],
        cuidados: ["Lava tu ropa de cama con frecuencia.", "Evita el polvo y las mascotas en el cuarto."] },
      fuerte: { items: [{ id: C.fexofenadina, para: "Antialérgico" }, { id: C.lagrifresh, para: "Alivia los ojos irritados" },
        { id: C.protekta, para: "Tapabocas para reducir el polvo" }], cuidados: ["Evita lo que te causa la alergia.", "Si se repite con frecuencia, consulta a tu médico."] },
    },
    alarma: ["hinchazón de labios, lengua o cara", "dificultad para respirar o tragar"],
  },
  {
    id: "ojos", nombre: "Ojos secos o cansados", icono: "ojo", frase: "Resequedad, ardor, muchas horas frente a pantallas.",
    claves: ["ojos secos", "ojo seco", "resequedad", "ojos cansados", "ardor en los ojos", "ojos rojos", "ojos irritados"],
    niveles: {
      leve: { items: [{ id: C.lagrigen, para: "Lágrimas artificiales" }], cuidados: ["Parpadea con frecuencia.", "Descansa la vista cada 20 minutos."] },
      moderado: { items: [{ id: C.lagrifresh, para: "Lágrimas artificiales" }], cuidados: ["Descansa la vista cada 20 minutos.", "Baja el brillo de las pantallas."] },
      fuerte: { items: [{ id: C.tearsoft, para: "Lágrimas artificiales de mayor duración" }],
        cuidados: ["Descansa la vista.", "Si la molestia sigue, consulta a un oftalmólogo."] },
    },
    alarma: ["dolor fuerte en el ojo", "pérdida o disminución de la visión", "golpe en el ojo"],
  },
  {
    id: "panalitis", nombre: "Pañalitis del bebé", icono: "biberon", frase: "Piel roja o irritada en la zona del pañal.",
    claves: ["panalitis", "pañalitis", "rozadura", "escaldadura", "panal"],
    niveles: {
      leve: { items: [{ id: C.oxidoZinc, para: "Pomada protectora" }], cuidados: ["Cambia el pañal con frecuencia.", "Deja la piel al aire unos minutos."] },
      moderado: { items: [{ id: C.nistatinaZinc, para: "Ungüento para la piel irritada" }], cuidados: ["Cambia el pañal con frecuencia.", "Limpia con agua tibia, sin frotar."] },
      fuerte: { items: [{ id: C.nistatinaZinc, para: "Ungüento para la piel irritada" }, { id: C.oxidoZinc, para: "Pomada protectora" }],
        cuidados: ["Limpia con agua tibia y seca sin frotar.", "Consulta al pediatra si no mejora en 3 días."] },
    },
    alarma: ["fiebre en el bebé", "ampollas o heridas abiertas", "el bebé no quiere comer"],
  },
  {
    id: "defensas", nombre: "Defensas bajas y cansancio", icono: "escudo", frase: "Te enfermas seguido o te sientes sin energía.",
    claves: ["defensas", "cansancio", "cansado", "sin energia", "agotado", "debil"],
    niveles: {
      leve: { items: [{ id: C.gumivitCZinc, para: "Vitamina C y zinc en gomas" }], cuidados: ["Duerme de 7 a 8 horas.", "Come frutas y verduras."] },
      moderado: { items: [{ id: C.lemovit, para: "Vitamina C" }, { id: C.polivitaminas, para: "Vitaminas y minerales" }],
        cuidados: ["Duerme bien.", "Haz actividad física suave."] },
      fuerte: { items: [{ id: C.vitC, para: "Vitamina C" }, { id: C.polivitaminas, para: "Vitaminas y minerales" }],
        cuidados: ["Descansa.", "Un cansancio que dura semanas debe revisarlo un médico."] },
    },
    alarma: ["pérdida de peso sin razón", "fiebre que no se va", "mareos o desmayos"],
  },
];

export const malestarPorId = (id: string) => MALESTARES.find((m) => m.id === id);
