import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';

import { NAVIDAD_ACTIVA, CieloEstrellado } from './navidad/Navidad';

const LOGO = '/logo.png';
const BULBS = 18;
const BULB_COLORS = ['#F5C451', '#EF4444', '#FFFFFF', '#22C55E'];

/* 💡 Bombillo del anillo: se enciende cuando la aguja pasa por su ángulo */
function BombilloAnillo({ index, sweep, built }) {
  const angle = (index / BULBS) * 360;
  const rad = (angle * Math.PI) / 180;
  const on = useTransform(sweep, [Math.max(angle - 1, 0), angle + 6], [0.15, 1]);
  const color = BULB_COLORS[index % BULB_COLORS.length];
  return (
    <motion.span
      className={`nv-ring-bulb ${built ? 'nv-ring-bulb--on' : ''}`}
      style={{
        left: `${50 + Math.sin(rad) * 64}%`,
        top: `${50 - Math.cos(rad) * 64}%`,
        opacity: on,
        '--nv-c': color,
        animationDelay: `${(index % 6) * 0.25}s`,
      }}
    />
  );
}

/* ✨ Destello dorado al completar el logo */
function Destello() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <motion.svg
            key={i}
            viewBox="0 0 20 20"
            className="absolute left-1/2 top-1/2 w-3 h-3 -ml-1.5 -mt-1.5"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{ x: Math.cos(a) * 150, y: Math.sin(a) * 150, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <path d="M10,0 l2.6,7.4 7.4,2.6 -7.4,2.6 -2.6,7.4 -2.6,-7.4 -7.4,-2.6 7.4,-2.6z" fill="#F5C451" />
          </motion.svg>
        );
      })}
    </div>
  );
}
const TITLE = 'FIEBRITICOS';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Intro: el parche del logo se "borda" poco a poco.
 * 1) Se dibuja el contorno  2) aparece la camiseta del centro
 * 3) una aguja recorre el borde revelando el anillo con el texto
 * 4) brillo final + título letra por letra
 */
export default function WelcomeSplash({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [built, setBuilt] = useState(false);
  const reduceMotion = useReducedMotion();

  // Guardamos onFinish en un ref para que un re-render del padre no reinicie la intro
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const outline = useMotionValue(0); // 0 → 1 (trazo del contorno)
  const center = useMotionValue(0);  // 0 → 27 (% radio del centro)
  const sweep = useMotionValue(0);   // 0 → 360 (grados del anillo)

  const centerMask = useTransform(center, (r) =>
    `radial-gradient(ellipse ${r}% ${r}% at 50% 50%, #000 97%, transparent 100%)`
  );
  const ringMask = useTransform(sweep, (d) =>
    `conic-gradient(#000 0deg ${d}deg, transparent ${Math.min(d + 0.5, 360)}deg 360deg)`
  );
  const needleOpacity = useTransform(sweep, [0, 8, 350, 360], [0, 1, 1, 0]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (reduceMotion) {
        outline.set(1); center.set(27); sweep.set(360);
        setBuilt(true);
        await wait(900);
      } else {
        animate(outline, 1, { duration: 0.7, ease: 'easeInOut' });
        await wait(350);
        if (cancelled) return;
        await animate(center, 27, { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] });
        if (cancelled) return;
        await animate(sweep, 360, { duration: 1.1, ease: [0.65, 0, 0.35, 1] });
        if (cancelled) return;
        setBuilt(true);
        await wait(1000);
      }
      if (cancelled) return;
      setIsVisible(false);
      await wait(600); // deja terminar el fade de salida
      if (!cancelled) onFinishRef.current?.();
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0A1128] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Luz de estadio que se enciende al completar el logo */}
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: built ? 1 : 0.4 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18)_0%,transparent_65%)] pointer-events-none"
          />

          {/* 🎄 Cielo de noche buena */}
          {NAVIDAD_ACTIVA && <CieloEstrellado />}

          {/* ---------- LOGO EN CONSTRUCCIÓN ---------- */}
          <motion.div
            animate={built && !reduceMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative w-44 h-44 sm:w-56 sm:h-56"
          >
            {/* 🎄 Anillo de luces que se encienden con la aguja */}
            {NAVIDAD_ACTIVA && Array.from({ length: BULBS }).map((_, i) => (
              <BombilloAnillo key={i} index={i} sweep={sweep} built={built} />
            ))}
            {NAVIDAD_ACTIVA && built && !reduceMotion && <Destello />}

            {/* 1) Contorno que se dibuja como una costura */}
            <svg viewBox="0 0 100 100" className="absolute -inset-3 w-[calc(100%+1.5rem)] h-[calc(100%+1.5rem)] -rotate-90">
              <motion.circle
                cx="50" cy="50" r="48"
                fill="none"
                stroke="#22C55E"
                strokeWidth="1.2"
                strokeLinecap="round"
                style={{ pathLength: outline }}
                className="drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]"
              />
            </svg>

            {/* 2) Centro (camiseta) */}
            <motion.img
              src={LOGO}
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{ maskImage: centerMask, WebkitMaskImage: centerMask }}
              className="absolute inset-0 w-full h-full object-contain select-none"
            />

            {/* 3) Anillo con el texto, revelado por la aguja */}
            <motion.img
              src={LOGO}
              alt="Fiebriticos Costa Rica"
              draggable={false}
              style={{ maskImage: ringMask, WebkitMaskImage: ringMask }}
              className="absolute inset-0 w-full h-full object-contain select-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
            />

            {/* Aguja brillante que recorre el borde */}
            <motion.div
              style={{ rotate: sweep, opacity: needleOpacity }}
              className="absolute inset-0 pointer-events-none"
            >
              <span className="absolute left-1/2 top-[3%] -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_4px_rgba(34,197,94,0.9)]" />
            </motion.div>

            {/* 4) Brillo final */}
            {built && !reduceMotion && (
              <div className="absolute inset-[4%] rounded-full overflow-hidden pointer-events-none">
                <motion.div
                  initial={{ x: '-120%' }}
                  animate={{ x: '120%' }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                />
              </div>
            )}
          </motion.div>

          {/* ---------- TEXTOS ---------- */}
          <div className="text-center mt-10 z-10 h-20">
            {built && (
              <>
                <h1 className="text-2xl sm:text-3xl font-black italic tracking-wider text-white uppercase flex justify-center" aria-label="Fiebriticos.CR">
                  {[...TITLE].map((ch, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.035, duration: 0.3 }}
                      aria-hidden="true"
                    >
                      {ch}
                    </motion.span>
                  ))}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: TITLE.length * 0.035 + 0.05, duration: 0.3 }}
                    className="text-fiebriVerde"
                    aria-hidden="true"
                  >
                    .CR
                  </motion.span>
                </h1>

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className={`h-[2px] mx-auto my-2 ${NAVIDAD_ACTIVA ? 'bg-gradient-to-r from-transparent via-[#F5C451] to-transparent' : 'bg-fiebriVerde'}`}
                />

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] ${NAVIDAD_ACTIVA ? 'nv-oro-texto' : 'text-gray-400'}`}
                >
                  {NAVIDAD_ACTIVA ? '✦ Felices fiestas, fiebres ✦' : 'Saltando a la cancha...'}
                </motion.p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
