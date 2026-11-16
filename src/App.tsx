import {useEffect} from 'react';
import {Carrete} from './components/Carrete';
import {Creditos} from './components/Creditos';
import {Cronologia} from './components/Cronologia';
import {Escenario} from './components/Escenario';
import {Hanks} from './components/Hanks';
import {Intro} from './components/Intro';
import {PalabraAPalabra} from './components/patrones/PalabraAPalabra';
import {tesis} from './content';
import {useMovimientoReducido} from './hooks/useMovimientoReducido';
import {iniciarScroll} from './lib/scroll';

/** Guion: quiosco → contexto → tirada → 1939–1946 → Fletcher Hanks → por qué son de todos → créditos. */
export default function App() {
  const reducido = useMovimientoReducido();
  useEffect(() => iniciarScroll(reducido), [reducido]);
  return (
    <main>
      <Escenario />
      <Intro />
      <Carrete />
      <Cronologia />
      <Hanks />
      <PalabraAPalabra frase={tesis.frase} firma={tesis.firma} etiqueta={tesis.etiqueta} />
      <Creditos />
    </main>
  );
}
