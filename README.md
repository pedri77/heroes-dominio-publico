# Héroes de dominio público

Web de scroll cinematográfico con superhéroes de la Edad de Oro del cómic (1939–1947) cuyas obras están en dominio público en EE. UU.

- Datos: Wikidata (CC0) y los infobox de Wikipedia en inglés, con `scripts/datos.py` → `src/datos/heroes.json`.
- Imágenes: Wikimedia Commons, solo ficheros con licencia de dominio público. `scripts/preparar_imagenes.py` las pasa a WebP en `public/img/` y recorta la figura de Joan. Las descartadas (propaganda bélica explícita o Daredevil en portada) están listadas en el script.
- Créditos de cada imagen: en el pie de la web y en `CREDITOS.md`.
- Sin imágenes generadas con IA.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3007
npm run lint && npm run build
```

Regenerar datos e imágenes: `python3 -I scripts/datos.py` y `uv run scripts/preparar_imagenes.py` (descarga a `datos-crudos/`, que no está en el repositorio).

## Origen de la técnica

Hecha con la skill `web-cinematica` (Vite, React, Tailwind 4, Lenis, sin GSAP). La técnica de escenarios fijados viene de plantillas gratuitas de Scrolltide; el código está reescrito y no usa textos ni imágenes suyas.

## Aviso

Proyecto personal sin ánimo de lucro. Algunos personajes se han reutilizado después por otras editoriales, que pueden tener marcas sobre esas versiones; aquí solo se muestra material original de 1939–1947.
