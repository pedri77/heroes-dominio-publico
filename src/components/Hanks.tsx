import {useEffect, useRef} from 'react';
import {commons, hanks, img} from '../content';
import {easeOutCubic, lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Fletcher Hanks: tres páginas que caen sobre la mesa, una tras otra, y se abren en abanico.
 *
 * Guion de scroll (p), sección de 380 svh:
 *   texto fijo desde el principio (la sección nunca entra vacía); se apaga al abrir el abanico
 *   0.12 – 0.36  página 1 sube desde abajo
 *   0.30 – 0.54  página 2 sube y tapa a la 1
 *   0.48 – 0.72  página 3 sube y tapa a la 2
 *   0.72 – 0.92  las tres se abren en abanico, centradas, y el texto cede
 */

const ALTO_VH = 380;
const ENTRADAS = [0.12, 0.3, 0.48];
const GIRO = [-7, 2, 8];
const ABRE_ESCRITORIO = [-27, 0, 27];
const ABRE_MOVIL = [-22, 0, 22];

export function Hanks() {
  const raizRef = useRef<HTMLElement>(null);
  const textoRef = useRef<HTMLDivElement>(null);
  const paginaRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00005) return;
      pAnterior = p;

      const movil = window.innerWidth < 768;
      const abre = easeOutCubic(tramo(p, 0.72, 0.92));
      textoRef.current!.style.opacity = String(1 - tramo(p, 0.7, 0.8));
      paginaRefs.current.forEach((el, i) => {
        const k = easeOutCubic(tramo(p, ENTRADAS[i], ENTRADAS[i] + 0.24));
        const x = lerp(i * 1.5 + (movil ? 0 : 18), (movil ? ABRE_MOVIL : ABRE_ESCRITORIO)[i], abre);
        const giro = lerp(GIRO[i], GIRO[i] * 0.4, abre);
        const escala = lerp(1, movil ? 0.62 : 0.86, abre);
        el.style.transform = `translate3d(calc(-50% + ${x}vw), ${lerp(110, 0, k)}vh, 0) rotate(${giro}deg) scale(${escala})`;
      });
    });
  }, []);

  return (
    <section ref={raizRef} id="hanks" aria-labelledby="hanks-titulo" className="relative bg-void" style={{height: `${ALTO_VH}svh`}}>
      <div className="sticky top-0 h-pantalla overflow-hidden">
        <div aria-hidden="true" className="trama absolute inset-0 text-[oklch(58%_0.22_28/0.07)]" />
        <div ref={textoRef} className="relative z-0 px-4 pt-14 sm:px-6 md:max-w-[38rem] md:px-[6vw] md:pt-[22svh]">
          <p className="antetitulo text-rojo uppercase">{hanks.antetitulo}</p>
          <h2 id="hanks-titulo" className="mt-3 font-display text-display text-texto uppercase">
            {hanks.titulo}
          </h2>
          <p className="mt-4 text-body text-texto-2 max-md:text-[0.875rem]">{hanks.cuerpo}</p>
        </div>

        {hanks.paginas.map((pg, i) => (
          <figure
            key={pg.img}
            ref={(el) => {
              if (el) paginaRefs.current[i] = el;
            }}
            className="absolute bottom-[5svh] left-1/2 z-10 m-0 w-[min(58vw,46svh)] origin-bottom will-change-transform md:bottom-[6svh] md:w-[min(26vw,52svh)]"
            style={{transform: 'translate3d(-50%, 110vh, 0)'}}
          >
            <a href={commons(pg.fichero)} target="_blank" rel="noopener" className="block bg-papel p-1.5 shadow-[0_30px_60px_oklch(5%_0.01_30/0.9)]">
              <img src={img(pg.img)} alt={pg.pie} loading="lazy" decoding="async" className="block aspect-[5/7] w-full object-cover" />
            </a>
            <figcaption className="antetitulo mt-2 text-center text-texto-2 uppercase max-md:hidden">{pg.pie}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
