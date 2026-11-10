// 🎄 DECORACIÓN NAVIDEÑA FIEBRITICOS
// Concepto: "Noche buena tica" — bombillos, estrellas y esferas en línea fina.
// Para quitar la temporada basta con poner NAVIDAD_ACTIVA en false.

export const NAVIDAD_ACTIVA = true;

const BULB_COLORS = ["#F5C451", "#EF4444", "#FFFFFF", "#F5C451", "#22C55E"];

/* 💡 Guirnalda de bombillos que cuelga bajo el header */
export function Guirnalda() {
  if (!NAVIDAD_ACTIVA) return null;
  const segments = Array.from({ length: 32 });

  return (
    <div className="nv-garland" aria-hidden="true">
      {segments.map((_, i) => {
        const color = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <svg key={i} className="nv-garland-seg" viewBox="0 0 80 26" width="80" height="26">
            <path d="M0,2 Q40,16 80,2" fill="none" stroke="#0B1F5C" strokeWidth="1.4" strokeLinecap="round" />
            <g className="nv-bulb" style={{ "--nv-c": color, animationDelay: `${(i * 0.37) % 3}s` }}>
              <rect x="37.5" y="8" width="5" height="4" rx="1" fill="#0B1F5C" />
              <ellipse cx="40" cy="17" rx="4" ry="6" fill={color} />
              <ellipse cx="38.6" cy="15" rx="1.1" ry="2" fill="#fff" opacity="0.55" />
            </g>
          </svg>
        );
      })}
    </div>
  );
}

/* ✨ Estrellas que titilan sobre el fondo azul (posiciones fijas, sin azar en cada render) */
const STARS = Array.from({ length: 34 }, (_, i) => {
  const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    left: `${(r(1) * 100).toFixed(2)}%`,
    top: `${(r(2) * 85).toFixed(2)}%`,
    size: 1.5 + r(3) * 2.5,
    delay: `${(r(4) * 4).toFixed(2)}s`,
    dur: `${(2.5 + r(5) * 3).toFixed(2)}s`,
    gold: r(6) > 0.7,
  };
});

export function CieloEstrellado() {
  if (!NAVIDAD_ACTIVA) return null;
  return (
    <div className="nv-sky" aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={i}
          className={`nv-star ${s.gold ? "nv-star--gold" : ""}`}
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }}
        />
      ))}
    </div>
  );
}

/* 🔮 Esferas en línea fina colgando de hilos */
function Esfera({ x, len, r, delay, gold }) {
  const stroke = gold ? "#F5C451" : "rgba(255,255,255,0.75)";
  return (
    <g className="nv-ornament" style={{ transformOrigin: `${x}px 0px`, animationDelay: delay }}>
      <line x1={x} y1="0" x2={x} y2={len} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <rect x={x - 4} y={len} width="8" height="6" rx="1.5" fill="none" stroke={stroke} strokeWidth="1.4" />
      <circle cx={x} cy={len + 6 + r} r={r} fill="rgba(255,255,255,0.03)" stroke={stroke} strokeWidth="1.4" />
      <path
        d={`M${x - r * 0.8},${len + 6 + r} Q${x},${len + 6 + r * 1.35} ${x + r * 0.8},${len + 6 + r}`}
        fill="none" stroke={stroke} strokeWidth="1" opacity="0.6"
      />
    </g>
  );
}

export function EsferasColgantes() {
  if (!NAVIDAD_ACTIVA) return null;
  return (
    <svg className="nv-ornaments" viewBox="0 0 260 260" aria-hidden="true">
      <Esfera x={40} len={70} r={16} delay="0s" />
      <Esfera x={110} len={140} r={24} delay="-1.2s" gold />
      <Esfera x={180} len={40} r={13} delay="-2.1s" />
      <Esfera x={235} len={105} r={18} delay="-0.6s" gold />
      {/* ⭐ estrellita */}
      <path
        className="nv-twinkle"
        d="M180,150 l3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 7,-3z"
        fill="#F5C451"
      />
    </svg>
  );
}

/* 🃏 Mini guirnalda que cuelga sobre la foto de cada card (dos curvas, 6 bombillos) */
const quad = (p0, p1, p2, t) => (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;
const CARD_BULBS = [
  ...[0.22, 0.5, 0.78].map((t) => ({ x: quad(0, 25, 50, t), y: quad(0, 20, 4, t) })),
  ...[0.22, 0.5, 0.78].map((t) => ({ x: quad(50, 75, 100, t), y: quad(4, 20, 0, t) })),
];

export function GuirnaldaCard() {
  if (!NAVIDAD_ACTIVA) return null;
  return (
    <div className="nv-card-garland" aria-hidden="true">
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d="M0,0 Q25,20 50,4 Q75,20 100,0" fill="none" stroke="#0B1F5C" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      {CARD_BULBS.map((b, i) => (
        <span
          key={i}
          className="nv-card-bulb"
          style={{
            left: `${b.x}%`,
            top: `${b.y}px`,
            "--nv-c": BULB_COLORS[i % BULB_COLORS.length],
            animationDelay: `${(i * 0.45) % 2.7}s`,
          }}
        />
      ))}
    </div>
  );
}

/* 🏷️ Etiqueta de regalo colgante */
export function EtiquetaRegalo() {
  if (!NAVIDAD_ACTIVA) return null;
  return (
    <div className="nv-gift-tag" aria-hidden="true">
      <span className="nv-gift-string" />
      <span className="nv-gift-body">
        <span className="nv-gift-hole" />
        <EstrellaMini className="w-2 h-2" />
        Regalo ideal
      </span>
    </div>
  );
}

/* ⏳ Contador de días para Navidad (header) */
export function ContadorNavidad() {
  if (!NAVIDAD_ACTIVA) return null;
  const hoy = new Date();
  const y = hoy.getFullYear();
  const navidad = new Date(y, 11, 25);
  const inicioHoy = new Date(y, hoy.getMonth(), hoy.getDate());
  const dias = Math.round((navidad - inicioHoy) / 86400000);

  let corto, largo;
  if (dias > 1) { corto = `${dias} días`; largo = `Faltan ${dias} días para Navidad`; }
  else if (dias === 1) { corto = "Mañana"; largo = "¡Mañana es Navidad!"; }
  else if (dias === 0) { corto = "¡Hoy!"; largo = "¡Feliz Navidad, fiebres!"; }
  else { corto = `${y + 1}`; largo = `¡Feliz ${y + 1}, fiebres!`; }
  if (hoy.getMonth() === 0) { corto = `${y}`; largo = `¡Feliz ${y}, fiebres!`; }

  return (
    <div className="nv-countdown" title={largo}>
      <EstrellaMini className="nv-twinkle-self w-3 h-3" />
      <span className="sm:hidden">{corto}</span>
      <span className="hidden sm:inline">{largo}</span>
    </div>
  );
}

/* ⭐ Estrella dorada pequeña para usar en textos */
export function EstrellaMini({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
      <path d="M10,0 l2.6,7.4 7.4,2.6 -7.4,2.6 -2.6,7.4 -2.6,-7.4 -7.4,-2.6 7.4,-2.6z" fill="#F5C451" />
    </svg>
  );
}
