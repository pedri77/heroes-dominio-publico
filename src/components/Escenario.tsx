import {useEffect, useRef} from 'react';
import {escenario, img, quiosco} from '../content';
import {useMovimientoReducido} from '../hooks/useMovimientoReducido';
import {clamp, easeOutCubic, lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Escenario de entrada: un quiosco de 1940 que aparece al secarse la tinta.
 * Capas (de lejos a cerca): fondo con trama · pared de portadas · titular · Joan (recorte) · velo de tinta.
 *
 * Guion de scroll (p), sección de 440 svh:
 *   0.00 – 0.20  el velo de tinta se disipa hacia arriba (velo + motas)
 *   0.00 – 0.50  el fondo se asienta (zoom 1.12 → 1)
 *   0.04 – 0.42  la pared de portadas se enfoca y se ilumina (desenfoque 8 → 0, brillo 0.3 → 0.62)
 *   0.18 – 0.34  el titular se resuelve (desenfoque y espaciado se cierran)
 *   0.28 – 0.58  Joan sube desde abajo a primer plano
 *   0.62 – 0.72  el HUD se apaga
 *   0.70 – 1.00  salida: todo sube y el delantal de Joan cubre el encuadre con el color de la página
 */

const ALTO_VH = 440;

type Mota = {x: number; y: number; r: number; v: number; a: number};

export function Escenario() {
  const raizRef = useRef<HTMLElement>(null);
  const fondoRef = useRef<HTMLDivElement>(null);
  const paredRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLDivElement>(null);
  const joanRef = useRef<HTMLDivElement>(null);
  const veloRef = useRef<HTMLDivElement>(null);
  const nieblaRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const tintaRef = useRef<HTMLSpanElement>(null);
  const reducido = useMovimientoReducido();
  const reducidoRef = useRef(reducido);
  reducidoRef.current = reducido;

  useEffect(() => {
    const c = nieblaRef.current!;
    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const lienzo = nieblaRef.current!;
    const ctx = lienzo.getContext('2d')!;
    let semilla = 11;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    const motas: Mota[] = Array.from({length: 110}, () => ({x: azar(), y: azar(), r: 0.6 + azar() * 2.2, v: 0.3 + azar(), a: 0.12 + azar() * 0.45}));
    let pAnterior = -1;
    let tAnterior = 0;

    return enCadaFotograma((t) => {
      const dt = tAnterior ? Math.min(0.1, (t - tAnterior) / 1000) : 1 / 60;
      tAnterior = t;
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, rect} = progresoFijado(raiz);
      if (rect.bottom < 0) return;

      const niebla = 1 - tramo(p, 0, 0.2);
      if (niebla > 0.001) {
        const w = lienzo.clientWidth;
        const h = lienzo.clientHeight;
        const dpr = lienzo.width / Math.max(1, w);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        motas.forEach((m, i) => {
          if (!reducidoRef.current) {
            m.x += 0.004 * m.v * dt;
            m.y -= 0.007 * m.v * dt;
            if (m.x > 1) m.x -= 1;
            if (m.y < 0) m.y += 1;
          }
          ctx.fillStyle = i % 5 === 0 ? '#c8382c' : '#efe2c4';
          ctx.globalAlpha = m.a * niebla;
          ctx.beginPath();
          ctx.arc(m.x * w, (m.y - p * 0.7) * h, m.r * (1 + p * 5), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      } else if (lienzo.style.opacity !== '0') {
        ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      }

      if (Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;

      const salida = tramo(p, 0.7, 1);
      const asienta = easeOutCubic(tramo(p, 0, 0.5));

      veloRef.current!.style.opacity = String(niebla);
      veloRef.current!.style.transform = `translate3d(0, ${-tramo(p, 0, 0.2) * 22}vh, 0) scale(${1 + tramo(p, 0, 0.2) * 0.3})`;
      lienzo.style.opacity = String(niebla);

      fondoRef.current!.style.transform = `translate3d(0, ${lerp(0, -5, p) - salida * 8}vh, 0) scale(${lerp(1.12, 1, asienta)})`;

      const enfoque = easeOutCubic(tramo(p, 0.04, 0.42));
      const pared = paredRef.current!;
      pared.style.transform = `translate3d(-50%, ${lerp(6, -2, asienta) - salida * 26}vh, 0) rotateX(${lerp(14, 6, enfoque)}deg) scale(${lerp(1.18, 1, enfoque)})`;
      pared.style.filter = enfoque < 0.995 ? `blur(${(1 - enfoque) * 8}px) brightness(${lerp(0.3, 0.62, enfoque)})` : 'brightness(0.62)';

      const entra = easeOutCubic(tramo(p, 0.18, 0.34));
      const titulo = tituloRef.current!;
      titulo.style.opacity = String(entra * (1 - tramo(p, 0.78, 0.9)));
      titulo.style.letterSpacing = `${lerp(0.16, 0, entra)}em`;
      titulo.style.transform = `translate3d(0, ${-p * 8 - salida * 30}vh, 0)`;
      titulo.style.filter = entra < 0.99 ? `blur(${(1 - entra) * 12}px)` : '';

      const sube = easeOutCubic(tramo(p, 0.28, 0.58));
      const joan = joanRef.current!;
      joan.style.transform = `translate3d(0, ${lerp(46, 0, sube) - salida * 110}vh, 0) scale(${lerp(1.08, 1, sube)})`;
      joan.style.opacity = String(clamp(sube * 2.5));

      hudRef.current!.style.opacity = String(tramo(p, 0.02, 0.1) * (1 - tramo(p, 0.62, 0.72)));
      tintaRef.current!.textContent = `${Math.round(asienta * 100)} %`;
    });
  }, []);

  return (
    <section id="inicio" ref={raizRef} aria-label="Héroes de dominio público" className="relative" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 h-pantalla overflow-hidden bg-void [perspective:1200px]">
        {/* Fondo: resplandor rojo de imprenta y trama de puntos. */}
        <div ref={fondoRef} aria-hidden="true" className="absolute -inset-[6%] will-change-transform">
          <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_42%,oklch(36%_0.14_28),oklch(13%_0.012_30)_72%)]" />
          <div className="trama absolute inset-0 text-[oklch(8%_0.01_30/0.55)]" />
        </div>

        {/* Pared del quiosco: portadas reales en dos filas. */}
        <div
          ref={paredRef}
          aria-hidden="true"
          className="absolute top-[14%] left-1/2 grid w-[150vw] origin-[50%_0] grid-cols-5 gap-[1.4vw] will-change-transform md:top-[10%] md:w-[96vw]"
          style={{filter: 'blur(8px) brightness(0.3)'}}
        >
          {quiosco.map((n, i) => (
            <div key={n} className="relative aspect-[5/7] overflow-hidden rounded-[2px] bg-superficie shadow-[0_18px_40px_oklch(5%_0.01_30/0.8)]" style={{transform: `rotate(${((i * 37) % 7) - 3}deg) translateY(${(i % 3) * 6}px)`}}>
              <img src={img(n)} alt="" className="absolute inset-0 size-full object-cover" decoding="async" fetchPriority={i < 5 ? 'high' : 'auto'} onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          ))}
        </div>

        {/* Viñeteado para que el titular se lea sobre la pared. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_45%,transparent_30%,oklch(13%_0.012_30/0.85))]" />

        <div ref={tituloRef} className="pointer-events-none absolute inset-x-0 top-[17%] px-4 text-center md:top-[18%] md:pr-[40vw] md:pl-[6vw] md:text-left" style={{opacity: 0}}>
          <h1 className="font-display text-hero text-texto uppercase [text-shadow:0_6px_40px_oklch(8%_0.01_30/0.95),4px_4px_0_oklch(13%_0.012_30)]">
            {escenario.titulo}
            <br />
            <span className="text-rojo">{escenario.destacado}</span>
          </h1>
        </div>

        {/* Joan, recortada de America's Best Comics #18 (1946). Arrastra el delantal hacia la página. */}
        <div ref={joanRef} aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[58svh] will-change-transform md:right-[-2vw] md:left-auto md:h-[80svh] md:w-[40vw]" style={{opacity: 0}}>
          <img
            src={img('joan-recorte')}
            alt=""
            className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 [filter:drop-shadow(0_20px_40px_oklch(5%_0.01_30/0.9))]"
            decoding="async"
          />
          <div className="absolute inset-x-[-100vw] top-full h-[120vh] bg-void" />
        </div>

        {/* Velo de tinta sobre la lente. */}
        <div
          ref={veloRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 45% at 35% 40%, oklch(30% 0.1 28 / 0.55), transparent 70%), radial-gradient(50% 60% at 70% 64%, oklch(26% 0.06 50 / 0.45), transparent 70%), radial-gradient(85% 85% at 50% 50%, oklch(15% 0.014 30 / 0.93), oklch(10% 0.01 30 / 0.98))',
          }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
            <p className="antetitulo text-texto-2 uppercase">{escenario.antetitulo}</p>
            <p className="mt-4 font-display text-[1.75rem] text-texto uppercase md:text-[2.5rem]">{escenario.invitacion}</p>
            <span aria-hidden="true" className="mt-6 inline-block animate-bounce text-rojo motion-reduce:animate-none">
              ↓
            </span>
          </div>
        </div>
        <canvas ref={nieblaRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
        <div aria-hidden="true" className="grano pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />

        {/* HUD. */}
        <div ref={hudRef} aria-hidden="true" className="pointer-events-none absolute inset-4 font-mono text-[0.625rem] tracking-[0.14em] text-texto-2 uppercase sm:inset-6 md:text-etiqueta" style={{opacity: 0}}>
          <div className="esquinas absolute inset-0 text-texto-3" />
          <div className="absolute top-4 left-3 space-y-1 md:top-5 md:left-4">
            <p>
              {escenario.hud.tinta} <span ref={tintaRef} className="text-texto">0 %</span>
            </p>
          </div>
          <div className="absolute top-4 right-3 space-y-1 text-right md:top-5 md:right-4">
            <p>
              {escenario.hud.tirada} <span className="text-rojo">{escenario.hud.tiradaValor}</span>
            </p>
          </div>
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">{escenario.lugar}</div>
          <div className="absolute right-3 bottom-3 flex items-center gap-2 md:right-4 md:bottom-4">
            Desliza <span className="inline-block animate-bounce motion-reduce:animate-none">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
