// Íconos de línea propios (trazo 1.8, 24×24). Sin dependencias externas.
const P: Record<string, JSX.Element> = {
  inicio: <><path d="M4 11 12 4l8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></>,
  productos: <><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /><path d="M12 12v4M10 14h4" /></>,
  compradores: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.8-3.5 3-5.3 5.5-5.3s4.7 1.8 5.5 5.3" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 13.6c2.4.2 4 1.9 4.6 4.6" /></>,
  grafico: <><path d="M4 20h16" /><rect x="6" y="11" width="3" height="7" /><rect x="11" y="6" width="3" height="12" /><rect x="16" y="9" width="3" height="9" /></>,
  carrito: <><path d="M3 4h2.5l2.2 10.5h10.2L20 7.5H6.4" /><circle cx="9.5" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></>,
  agregarCarrito: <><path d="M3 4h2.5l2.2 10.5h10.2L20 7.5H6.4" /><circle cx="9.5" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /><path d="M13 9v4M11 11h4" /></>,
  listo: <><path d="M5 12.5 10 17l9-10" /></>,
  robot: <><rect x="5" y="8" width="14" height="11" rx="3.5" /><path d="M12 4v4" /><circle cx="12" cy="3.5" r="1" /><circle cx="9.5" cy="13" r="1.2" /><circle cx="14.5" cy="13" r="1.2" /><path d="M10 16.2h4" /><path d="M3 12v3M21 12v3" /></>,
  chat: <><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" /></>,
  enviar: <><path d="M4 12 20 4l-5 16-3-7z" /><path d="m12 13 8-9" /></>,
  cerrar: <><path d="M6 6l12 12M18 6 6 18" /></>,
  izquierda: <><path d="M15 5l-7 7 7 7" /></>,
  derecha: <><path d="M9 5l7 7-7 7" /></>,
  lupa: <><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></>,
  usuarios: <><circle cx="8" cy="9" r="2.6" /><circle cx="16" cy="9" r="2.6" /><path d="M3.5 18c.6-2.7 2.3-4 4.5-4s3.9 1.3 4.5 4M11.5 18c.6-2.7 2.3-4 4.5-4s3.9 1.3 4.5 4" /></>,
  juntos: <><path d="M3 5h2l2 9h9l2-6H7" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></>,
  algoritmo: <><path d="M9 4a3 3 0 0 0-3 3v1a2.5 2.5 0 0 0 0 5v1a3 3 0 0 0 3 3h0" /><path d="M15 4a3 3 0 0 1 3 3v1a2.5 2.5 0 0 1 0 5v1a3 3 0 0 1-3 3" /><path d="M12 4v16" /></>,
  // categorías
  capsula: <><rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-35 12 12.5)" /><path d="m9.2 8.2 5.6 8" /></>,
  pulmones: <><path d="M12 4v8" /><path d="M12 10c-2 0-3-2-5-2-2.2 0-3 3-3 7 0 3 1 5 3 5s4-1.5 5-4" /><path d="M12 10c2 0 3-2 5-2 2.2 0 3 3 3 7 0 3-1 5-3 5s-4-1.5-5-4" /></>,
  rayo: <><path d="M13 3 6 13h5l-1 8 7-10h-5z" /></>,
  estomago: <><path d="M9 3v4c0 2-3 3-3 7a6 6 0 0 0 12 0c0-2-1-3-3-3s-3 1-4 1" /></>,
  piel: <><path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" /><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" /></>,
  gota: <><path d="M8 3h8l-1 4H9z" /><rect x="7" y="7" width="10" height="14" rx="3" /><path d="M10 12h4" /></>,
  biberon: <><path d="M10 3h4v3h-4z" /><path d="M9 6h6l1 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9z" /><path d="M8 12h3M8 15h3" /></>,
  glucometro: <><rect x="6" y="3" width="12" height="18" rx="3" /><rect x="8.5" y="6" width="7" height="5" rx="1" /><circle cx="12" cy="16" r="1.6" /></>,
  corazon: <><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /><path d="M7 12h3l1-2 2 4 1-2h3" /></>,
  flor: <><circle cx="12" cy="10" r="2.2" /><path d="M12 7.8C12 5 10 3.5 8.5 4.5S8 8 9.8 9M14.2 9C16 8 17.5 6 15.5 4.5S12 5 12 7.8M9.8 11c-1.8 1-3.3 3-1.3 4.5s3.5 0 3.5-3M14.2 11c1.8 1 3.3 3 1.3 4.5S12 15.5 12 12.2" /><path d="M12 15v6" /></>,
  ojo: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  hueso: <><path d="M8.5 6.5a2.3 2.3 0 1 0-3.2 3.2l.9.9-.3.3a2.3 2.3 0 1 0 3.2 3.2" /><path d="M15.5 17.5a2.3 2.3 0 1 0 3.2-3.2l-.9-.9.3-.3a2.3 2.3 0 1 0-3.2-3.2" /><path d="M9.1 13.9 13.9 9.1" /></>,
  cerebro: <><path d="M12 5a3 3 0 0 0-5.5 1.7A3 3 0 0 0 5 12a3 3 0 0 0 2 4.5A3 3 0 0 0 12 18z" /><path d="M12 5a3 3 0 0 1 5.5 1.7A3 3 0 0 1 19 12a3 3 0 0 1-2 4.5A3 3 0 0 1 12 18z" /><path d="M12 5v15" /></>,
  escudo: <><path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6z" /><path d="M12 9v6M9 12h6" /></>,
  tapabocas: <><path d="M5 9c3-2 11-2 14 0v5c-3 3-11 3-14 0z" /><path d="M5 10H3v3l2 1M19 10h2v3l-2 1" /><path d="M8 11h8M8 13.5h8" /></>,
  huella: <><circle cx="7" cy="10" r="1.6" /><circle cx="10.5" cy="6.5" r="1.6" /><circle cx="14.5" cy="6.5" r="1.6" /><circle cx="17.5" cy="10" r="1.6" /><path d="M12 12c-2.5 0-5 3.5-5 5.5 0 1.5 1 2 2.5 2 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1.5 0 2.5-.5 2.5-2 0-2-2.5-5.5-5-5.5z" /></>,
  dulce: <><circle cx="12" cy="12" r="4.5" /><path d="M7.7 10.6 3.5 8.5l1 7 3.2-2.1M16.3 10.6l4.2-2.1-1 7-3.2-2.1" /></>,
  caja: <><path d="M4 8 12 4l8 4v8l-8 4-8-4z" /><path d="M4 8l8 4 8-4M12 12v8" /></>,
};

export default function Icono({ n, tam = 22, className }: { n: string; tam?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} className={className} aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {P[n] ?? P.caja}
    </svg>
  );
}
