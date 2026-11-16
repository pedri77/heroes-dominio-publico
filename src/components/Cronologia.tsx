import {useEffect, useRef, useState} from 'react';
import {cronologia} from '../content';
import {progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * 1939–1946: una línea de tiempo que se traza con el scroll. Cada debut se enciende
 * cuando la tinta llega a su fecha; los contadores del HUD suben a la vez.
 *
 * Guion de scroll (p), sección de 400 svh, ventana 0.06 – 0.88:
 *   0.06 – 0.88  la línea recorre de dic. 1939 a 1947 (lineal); un debut por fecha
 *   0.88 – 0.96  aparece el contador de 28 años y se cierra la línea en rojo
 */

const ALTO_VH = 400;
const VENTANA = [0.06, 0.88] as const;
const D = cronologia.debuts;
const DESDE = 1939.75;
const HASTA = 1947.1;
const X0 = 40;
const X1 = 1160;
const EJE = 330;

const fecha = (d: (typeof D)[number]) => d.anio + (d.mes - 1) / 12;
const frac = (f: number) => (f - DESDE) / (HASTA - DESDE);
const PUNTOS = D.map((d, i) => ({x: X0 + frac(fecha(d)) * (X1 - X0), carril: i < 6 ? i : i - 6, f: frac(fecha(d))}));
const ANIOS = [1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function Cronologia() {
  const raizRef = useRef<HTMLElement>(null);
  const lineaRef = useRef<SVGPathElement>(null);
  const puntaRef = useRef<SVGGElement>(null);
  const puntoRefs = useRef<SVGGElement[]>([]);
  const filaRefs = useRef<HTMLLIElement[]>([]);
  const personajesRef = useRef<HTMLSpanElement>(null);
  const editorialesRef = useRef<HTMLSpanElement>(null);
  const aniosRef = useRef<HTMLSpanElement>(null);
  const [actual, setActual] = useState(-1);

  useEffect(() => {
    let pAnterior = -1;
    let ultimo = -2;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;

      const u = tramo(p, ...VENTANA);
      lineaRef.current!.style.strokeDashoffset = String(1 - u);
      puntaRef.current!.setAttribute('transform', `translate(${X0 + u * (X1 - X0)} ${EJE})`);

      let n = -1;
      const eds = new Set<string>();
      PUNTOS.forEach((pt, i) => {
        const on = u >= pt.f;
        puntoRefs.current[i].style.opacity = on ? '1' : '0.18';
        const fila = filaRefs.current[i];
        if (fila) fila.style.opacity = on ? '1' : '0.22';
        if (on) {
          n = i;
          eds.add(D[i].editorial);
        }
      });
      personajesRef.current!.textContent = String(n + 1);
      editorialesRef.current!.textContent = String(eds.size);
      aniosRef.current!.textContent = String(Math.round(tramo(p, 0.88, 0.96) * cronologia.aniosRenovar));
      if (n !== ultimo) {
        ultimo = n;
        setActual(n);
      }
    });
  }, []);

  const d = actual >= 0 ? D[actual] : null;

  return (
    <section ref={raizRef} id="cronologia" aria-labelledby="crono-titulo" className="relative bg-void" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 flex h-pantalla flex-col overflow-hidden px-4 pt-14 pb-8 sm:px-6 md:px-[6vw] md:pt-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="antetitulo text-rojo uppercase">{cronologia.antetitulo}</p>
            <h2 id="crono-titulo" className="mt-3 max-w-[18ch] font-display text-display text-texto uppercase">
              {cronologia.titulo}
            </h2>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-6 text-texto-2 md:mt-0 md:gap-10" aria-hidden="true">
            {[
              [personajesRef, cronologia.hud.personajes],
              [editorialesRef, cronologia.hud.editoriales],
              [aniosRef, cronologia.hud.anios],
            ].map(([ref, etiqueta], i) => (
              <div key={i}>
                <dd>
                  <span ref={ref as React.RefObject<HTMLSpanElement>} className={`font-cifra text-[2.5rem] leading-none tabular-nums md:text-[3.5rem] ${i === 2 ? 'text-rojo' : 'text-texto'}`}>
                    0
                  </span>
                </dd>
                <dt className="antetitulo mt-1 max-w-[12ch] text-texto-3 uppercase">{etiqueta as string}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Móvil: la línea es demasiado ancha para leer etiquetas; lista vertical que se enciende igual. */}
        <ol className="mt-6 flex min-h-0 flex-1 flex-col justify-start md:hidden" aria-hidden="true">
          {D.map((d, i) => (
            <li
              key={i}
              ref={(el) => {
                if (el) filaRefs.current[i] = el;
              }}
              className="grid grid-cols-[3.25rem_1fr_auto] items-baseline gap-2 border-b border-borde/60 py-[0.2rem]"
              style={{opacity: 0.22, transition: 'opacity 0.35s'}}
            >
              <span className="font-cifra text-[1rem] text-rojo">{d.anio}</span>
              <span className="font-display text-[1rem] text-texto uppercase">{d.heroe}</span>
              <span className="antetitulo text-[0.5625rem] text-texto-3 uppercase">{d.editorial}</span>
            </li>
          ))}
        </ol>

        <div className="relative flex min-h-0 flex-1 items-center max-md:hidden">
          <svg viewBox="0 0 1200 400" className="h-auto max-h-full w-full overflow-visible" role="img" aria-label={`Línea de tiempo con ${D.length} debuts entre 1939 y 1946.`}>
            <line x1={X0} x2={X1} y1={EJE} y2={EJE} stroke="oklch(94% 0.025 85)" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="3 7" />
            {ANIOS.map((a) => {
              const x = X0 + frac(a) * (X1 - X0);
              return (
                <g key={a}>
                  <line x1={x} x2={x} y1={EJE - 6} y2={EJE + 6} stroke="oklch(54% 0.025 50)" />
                  <text x={x} y={EJE + 34} textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="22" fill="oklch(54% 0.025 50)">
                    {a}
                  </text>
                </g>
              );
            })}
            <path ref={lineaRef} d={`M${X0} ${EJE} H${X1}`} pathLength={1} fill="none" stroke="oklch(58% 0.22 28)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset="1" />
            {PUNTOS.map((pt, i) => {
              const y = EJE - 46 - pt.carril * 46;
              return (
                <g
                  key={i}
                  ref={(el) => {
                    if (el) puntoRefs.current[i] = el;
                  }}
                  style={{opacity: 0.18, transition: 'opacity 0.35s'}}
                >
                  <line x1={pt.x} x2={pt.x} y1={EJE} y2={y + 8} stroke="oklch(94% 0.025 85)" strokeOpacity="0.45" />
                  <circle cx={pt.x} cy={EJE} r="8" fill="oklch(13% 0.012 30)" stroke="oklch(58% 0.22 28)" strokeWidth="3" />
                  <text className="max-md:hidden" x={pt.x + 8} y={y} fontFamily="Anton, Impact, sans-serif" fontSize="22" fill="oklch(94% 0.025 85)" style={{textTransform: 'uppercase'}}>
                    {D[i].heroe}
                  </text>
                  <text className="max-md:hidden" x={pt.x + 8} y={y + 20} fontFamily="JetBrains Mono, monospace" fontSize="12" fill="oklch(74% 0.03 70)">
                    {D[i].editorial}
                  </text>
                </g>
              );
            })}
            <g ref={puntaRef} transform={`translate(${X0} ${EJE})`}>
              <circle r="22" fill="oklch(58% 0.22 28)" fillOpacity="0.2" />
              <circle r="6" fill="oklch(94% 0.025 85)" />
            </g>
          </svg>
        </div>

        <div className="grid gap-3 border-t border-borde pt-5 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-10">
          <p className="antetitulo text-rojo uppercase max-md:hidden">{cronologia.nota}</p>
          <div key={actual} className="min-h-[3.5rem] animate-[entra-paso_0.5s_cubic-bezier(0.2,0.7,0.1,1)]" aria-live="polite">
            {d && (
              <>
                <h3 className="font-display text-[1.5rem] text-texto uppercase md:text-[2rem]">{d.heroe}</h3>
                <p className="text-body text-texto-2">
                  Debuta en {d.revista}, {MESES[d.mes - 1]} de {d.anio} · {d.editorial}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
