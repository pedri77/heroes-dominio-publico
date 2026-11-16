import {useEffect, useRef} from 'react';
import {carrete, commons, img} from '../content';
import {clamp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * La tirada: carrete horizontal fijado con las diez portadas.
 * La más cercana a la línea de foco se ve nítida y en color; el resto se atenúa y se desatura.
 *
 * Guion de scroll (p), sección de 360 svh:
 *   0.04 – 0.96  el carrete recorre todo su ancho; barra y contador siguen (lineal)
 */

const ALTO_VH = 360;
const N = carrete.portadas.length;
const dos = (n: number) => String(n).padStart(2, '0');

export function Carrete() {
  const raizRef = useRef<HTMLElement>(null);
  const pistaRef = useRef<HTMLOListElement>(null);
  const tarjetaRefs = useRef<HTMLLIElement[]>([]);
  const portadaRefs = useRef<HTMLImageElement[]>([]);
  const barraRef = useRef<HTMLSpanElement>(null);
  const cuentaRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      const pista = pistaRef.current;
      if (!raiz || !pista) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;

      const vw = window.innerWidth;
      const k = tramo(p, 0.04, 0.96);
      const recorrido = Math.max(0, pista.offsetLeft + pista.scrollWidth - vw * 0.94);
      pista.style.transform = `translate3d(${-k * recorrido}px, 0, 0)`;

      let cercana = 0;
      let mejor = Infinity;
      const foco = vw < 768 ? 0.5 : 0.62;
      tarjetaRefs.current.forEach((t, i) => {
        const r = t.getBoundingClientRect();
        const desvio = (r.left + r.width / 2 - vw * foco) / vw;
        const a = clamp(Math.abs(desvio) * 1.6);
        t.style.opacity = String(1 - a * 0.5);
        t.style.transform = `scale(${1 - a * 0.07}) rotate(${desvio * 4}deg)`;
        portadaRefs.current[i].style.filter = `saturate(${1 - a * 0.7}) brightness(${1 - a * 0.25})`;
        if (Math.abs(desvio) < mejor) {
          mejor = Math.abs(desvio);
          cercana = i;
        }
      });
      barraRef.current!.style.transform = `scaleX(${k})`;
      cuentaRef.current!.textContent = dos(cercana + 1);
    });
  }, []);

  return (
    <section ref={raizRef} id="tirada" aria-labelledby="tirada-titulo" className="relative bg-void" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 flex h-pantalla flex-col justify-center overflow-hidden pt-10 md:flex-row md:items-center md:justify-start md:pt-0">
        <div className="relative z-20 shrink-0 bg-void px-4 sm:px-6 md:flex md:w-[34vw] md:flex-col md:justify-center md:self-stretch md:pr-10 md:pl-[6vw] md:after:absolute md:after:inset-y-0 md:after:left-full md:after:w-24 md:after:bg-gradient-to-r md:after:from-void md:after:to-transparent">
          <p className="antetitulo text-rojo uppercase">{carrete.antetitulo}</p>
          <h2 id="tirada-titulo" className="mt-4 font-display text-display text-texto uppercase">
            {carrete.titulo}
          </h2>
          <p className="mt-5 max-w-[26rem] text-body text-texto-2 max-md:hidden">{carrete.cuerpo}</p>
          <div className="mt-8 flex items-center gap-4 antetitulo text-texto-3 uppercase max-md:mt-4" aria-hidden="true">
            <span>
              <span ref={cuentaRef} className="text-texto tabular-nums">
                01
              </span>{' '}
              / {dos(N)}
            </span>
            <span className="relative h-px w-32 bg-borde">
              <span ref={barraRef} className="absolute inset-0 origin-left bg-rojo" style={{transform: 'scaleX(0)'}} />
            </span>
          </div>
        </div>

        <ol ref={pistaRef} className="relative z-10 mt-6 flex gap-5 pl-4 will-change-transform sm:pl-6 md:mt-0 md:gap-8 md:pl-0">
          {carrete.portadas.map((r, i) => (
            <li
              key={r.img}
              ref={(el) => {
                if (el) tarjetaRefs.current[i] = el;
              }}
              className="w-[62vw] shrink-0 origin-bottom sm:w-[40vw] md:w-[clamp(15rem,22vw,21rem)]"
            >
              <a href={commons(r.fichero)} target="_blank" rel="noopener" className="group block">
                <div className="relative aspect-[5/7] overflow-hidden rounded-[3px] bg-superficie shadow-[0_24px_50px_oklch(5%_0.01_30/0.85)] ring-1 ring-borde transition-[box-shadow] duration-200 group-hover:ring-rojo">
                  <img
                    ref={(el) => {
                      if (el) portadaRefs.current[i] = el;
                    }}
                    src={img(r.img)}
                    alt={`Portada de ${r.titulo} (${r.fecha}), con ${r.heroe}.`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>
                <div className="pt-3">
                  <span className="antetitulo block text-rojo uppercase">
                    {r.fecha} · {r.editorial}
                  </span>
                  <span className="mt-1 block font-display text-[1.375rem] leading-tight text-texto uppercase">{r.heroe}</span>
                  <span className="mt-0.5 block text-[0.8125rem] text-texto-2">
                    {r.titulo} · {r.autor}
                  </span>
                  {r.nota && <span className="mt-1 block text-[0.75rem] text-texto-3 italic">{r.nota}</span>}
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
