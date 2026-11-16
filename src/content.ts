/** Todo el texto de la página vive aquí. Los componentes no llevan texto suelto. */

const BASE = import.meta.env.BASE_URL;
export const img = (n: string) => `${BASE}img/${n}.webp`;
export const commons = (fichero: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fichero.replace(/ /g, '_'))}`;

export const escenario = {
  antetitulo: 'Quiosco · 1940',
  invitacion: 'La tinta todavía está fresca',
  titulo: 'Héroes que',
  destacado: 'ya son de todos',
  lugar: 'Nueva York · 1939–1947',
  hud: {tinta: 'Tinta seca', tirada: 'Precio de portada', tiradaValor: '10 ¢'},
};

/** Portadas del quiosco del escenario (sin propaganda bélica explícita). */
export const quiosco = [
  'stardust--fantastic-comics-1',
  'black-terror--exciting-comics-9',
  'miss-masque--excitingcomics-53',
  'samson--fantastic-comics-no-3',
  'pyroman--startlingcomics18pyroman',
  'silver-streak--silver-streak-5',
  'fantomah--zomaxhad',
  'fantomah--jungle-comics-16-page-60',
  'stardust--fantasticcomics14',
  'pyroman--americasbestcomics2033',
];

export const intro = {
  antetitulo: 'Antes de que Marvel y DC fueran lo que son',
  titulo: 'En 1940 había decenas de editoriales de tebeos. La mayoría cerró y sus héroes se quedaron sin dueño.',
  cuerpo:
    'Sus páginas no renovaron el copyright cuando tocaba, así que hoy son dominio público: cualquiera puede leerlas, copiarlas y reutilizarlas. Esta web está hecha solo con ese material, sacado de Wikidata, Wikipedia y Wikimedia Commons.',
};

export type Portada = {
  img: string;
  titulo: string;
  fecha: string;
  heroe: string;
  editorial: string;
  autor: string;
  fichero: string;
  nota?: string;
};

export const carrete = {
  antetitulo: 'La tirada',
  titulo: 'Nueve páginas que ya no tienen dueño',
  cuerpo: 'Desliza: el quiosco pasa por delante de 1939 a 1947. Cada imagen enlaza a su ficha de licencia en Wikimedia Commons.',
  portadas: [
    {img: 'stardust--fantastic-comics-1', titulo: 'Fantastic Comics #1', fecha: 'Diciembre de 1939', heroe: 'Samson', editorial: 'Fox Feature Syndicate', autor: 'Lou Fine', fichero: 'Fantastic Comics 1.jpg'},
    {img: 'samson--fantastic-comics-no-3', titulo: 'Fantastic Comics #3', fecha: 'Febrero de 1940', heroe: 'Samson', editorial: 'Fox Feature Syndicate', autor: 'Lou Fine', fichero: 'Fantastic Comics no. 3.jpg'},
    {img: 'silver-streak--silver-streak-5', titulo: 'Silver Streak Comics #5', fecha: 'Julio de 1940', heroe: 'Silver Streak', editorial: 'Lev Gleason', autor: 'Jack Cole', fichero: 'Silver Streak 5.jpg'},
    {img: 'fantomah--jungle-comics-16-page-60', titulo: 'Jungle Comics #16', fecha: 'Abril de 1941', heroe: 'Fantomah', editorial: 'Fiction House', autor: 'firmado «W. B. Hovious»', fichero: 'Jungle Comics 16 page 60.jpg'},
    {img: 'black-terror--exciting-comics-9', titulo: 'Exciting Comics #9', fecha: '1941', heroe: 'Black Terror', editorial: 'Nedor', autor: 'Elmer Wexler', fichero: 'Exciting Comics 9.jpg'},
    {
      img: 'fighting-yank--startlingcomics10fightingyank',
      titulo: 'Startling Comics #10',
      fecha: 'Septiembre de 1941',
      heroe: 'Fighting Yank',
      editorial: 'Nedor',
      autor: 'Elmer Wexler',
      fichero: 'StartlingComics10FightingYank.jpg',
      nota: 'Propaganda de guerra: los enemigos llevan brazaletes nazis.',
    },
    {img: 'pyroman--startlingcomics18pyroman', titulo: 'Startling Comics #18', fecha: 'Diciembre de 1942', heroe: 'Pyroman', editorial: 'Nedor', autor: 'Jack Binder', fichero: 'StartlingComics18Pyroman.jpg'},
    {img: 'pyroman--americasbestcomics2033', titulo: "America's Best Comics #20, pág. 33", fecha: 'Diciembre de 1946', heroe: 'Pyroman', editorial: 'Nedor', autor: 'Autor desconocido', fichero: 'AmericasBestComics2033.jpg'},
    {img: 'miss-masque--excitingcomics-53', titulo: 'Exciting Comics #53', fecha: '1947', heroe: 'Miss Masque', editorial: 'Nedor', autor: 'Alex Schomburg', fichero: 'ExcitingComics 53.jpg'},
  ] satisfies Portada[],
};

export type Debut = {anio: number; mes: number; heroe: string; revista: string; editorial: string};

export const cronologia = {
  antetitulo: '1939 – 1946',
  titulo: 'Once debuts, cinco editoriales que ya no existen',
  nota: 'Fecha de portada del primer número, según Wikipedia',
  debuts: [
    {anio: 1939, mes: 12, heroe: 'Samson', revista: 'Fantastic Comics #1', editorial: 'Fox'},
    {anio: 1939, mes: 12, heroe: 'Stardust', revista: 'Fantastic Comics #1', editorial: 'Fox'},
    {anio: 1940, mes: 2, heroe: 'Fantomah', revista: 'Jungle Comics #2', editorial: 'Fiction House'},
    {anio: 1940, mes: 3, heroe: 'The Woman in Red', revista: 'Thrilling Comics #2', editorial: 'Nedor'},
    {anio: 1940, mes: 3, heroe: 'Silver Streak', revista: 'Silver Streak Comics #3', editorial: 'Lev Gleason'},
    {anio: 1940, mes: 9, heroe: 'Cat-Man', revista: 'Crash Comics #4', editorial: 'Holyoke'},
    {anio: 1941, mes: 1, heroe: 'Black Terror', revista: 'Exciting Comics #9', editorial: 'Nedor'},
    {anio: 1941, mes: 9, heroe: 'Fighting Yank', revista: 'Startling Comics #10', editorial: 'Nedor'},
    {anio: 1941, mes: 9, heroe: 'American Eagle', revista: "America's Best Comics #2", editorial: 'Nedor'},
    {anio: 1942, mes: 12, heroe: 'Pyroman', revista: 'Startling Comics #18', editorial: 'Nedor'},
    {anio: 1946, mes: 9, heroe: 'Miss Masque', revista: 'Exciting Comics #51', editorial: 'Nedor'},
  ] satisfies Debut[],
  editoriales: 5,
  aniosRenovar: 28,
  hud: {personajes: 'Personajes', editoriales: 'Editoriales cerradas', anios: 'Años de copyright sin renovar'},
};

export const hanks = {
  antetitulo: 'El raro del quiosco',
  titulo: 'Fletcher Hanks dibujaba como nadie',
  cuerpo:
    'Entre 1939 y 1941 creó a Fantomah, una mujer de la selva cuya cara se vuelve calavera, y a Stardust, un mago espacial que castiga a los villanos con una crueldad casi cómica. Trabajó para Fox y Fiction House y después dejó el oficio.',
  paginas: [
    {img: 'stardust--fantasticcomics14', pie: 'Stardust · Fantastic Comics #14', fichero: 'FantasticComics14.jpg'},
    {img: 'fantomah--zomaxhad', pie: 'Fantomah · Jungle Comics #14', fichero: 'Zomaxhad.png'},
    {img: 'fantomah--jungle-comics-51-page-40', pie: 'Fantomah según George Appel · Jungle Comics #51 (1944)', fichero: 'Jungle Comics 51 page 40.jpg'},
  ],
};

export const tesis = {
  etiqueta: 'Por qué son de todos',
  frase:
    'En EE. UU. un tebeo de los años cuarenta tenía *veintiocho años* de copyright y después había que *renovarlo.* Si la editorial ya había cerrado, nadie lo hacía, y la obra pasaba a *ser de todos.*',
  firma: 'Ley de copyright de EE. UU. de 1909, aplicable a obras publicadas antes de 1978',
};

export const creditos = {
  antetitulo: 'Créditos y fuentes',
  titulo: 'Todo lo que ves aquí se puede reutilizar',
  cuerpo:
    'Las imágenes vienen de Wikimedia Commons con licencia de dominio público. Los datos de personajes salen de Wikidata (CC0) y de los infobox de Wikipedia en inglés, mediante un script incluido en el repositorio.',
  aviso:
    'Proyecto personal sin ánimo de lucro. Algunos de estos personajes se han reutilizado después por otras editoriales, que pueden tener marcas sobre esas versiones; aquí solo se muestra el material original de 1939–1947. No hay imágenes generadas con IA.',
  extra: [{texto: "Joan, de America's Best Comics #18 (1946), arte de Alex Schomburg", fichero: 'Joan-has-followed-1946.png'}],
  volver: 'Volver al quiosco',
  wordmark: 'Dominio público',
};
