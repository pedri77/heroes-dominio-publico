import {carrete, commons, creditos, hanks} from '../content';
import {useAjustarTexto} from '../hooks/useAjustarTexto';
import {useAparecer} from '../hooks/useAparecer';
import {irA} from '../lib/scroll';

/** Cierre: créditos de cada imagen con su ficha de Commons y wordmark de borde a borde. */
export function Creditos() {
  const ref = useAparecer<HTMLElement>();
  const marca = useAjustarTexto<HTMLSpanElement>();
  const fuentes = [
    ...carrete.portadas.map((p) => ({texto: `${p.titulo} (${p.fecha}), ${p.autor}`, fichero: p.fichero})),
    ...hanks.paginas.map((p) => ({texto: p.pie, fichero: p.fichero})),
    ...creditos.extra,
  ];
  return (
    <footer ref={ref} aria-labelledby="creditos-titulo" className="relative bg-void px-4 pt-[14svh] pb-6 sm:px-6 md:px-[6vw]">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p data-aparece className="antetitulo text-rojo uppercase">
            {creditos.antetitulo}
          </p>
          <h2 id="creditos-titulo" data-aparece style={{'--i': 1} as React.CSSProperties} className="mt-4 font-display text-display text-texto uppercase">
            {creditos.titulo}
          </h2>
          <p data-aparece style={{'--i': 2} as React.CSSProperties} className="mt-6 text-body text-texto-2">
            {creditos.cuerpo}
          </p>
          <p data-aparece style={{'--i': 3} as React.CSSProperties} className="mt-4 text-[0.8125rem] leading-relaxed text-texto-3">
            {creditos.aviso}
          </p>
          <button
            type="button"
            onClick={() => irA('#inicio')}
            data-aparece
            style={{'--i': 4} as React.CSSProperties}
            className="mt-8 rounded-full border border-borde px-5 py-2.5 text-[0.875rem] font-semibold text-texto transition-colors duration-200 hover:border-rojo hover:text-rojo"
          >
            ↑ {creditos.volver}
          </button>
        </div>
        <ul data-aparece style={{'--i': 2} as React.CSSProperties} className="columns-1 gap-8 text-[0.8125rem] leading-relaxed text-texto-2 sm:columns-2">
          {fuentes.map((f) => (
            <li key={f.fichero} className="mb-2 break-inside-avoid">
              <a href={commons(f.fichero)} target="_blank" rel="noopener" className="underline decoration-borde underline-offset-4 transition-colors hover:text-texto hover:decoration-rojo">
                {f.texto}
              </a>{' '}
              <span className="text-texto-3">· dominio público</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-[10svh] overflow-hidden pt-[0.12em]" aria-hidden="true">
        <span ref={marca} className="inline-block font-display leading-[1.05] whitespace-nowrap text-rojo uppercase">
          {creditos.wordmark}
        </span>
      </div>
    </footer>
  );
}
