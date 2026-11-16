# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=10"]
# ///
"""Convierte datos-crudos/imagenes/* a WebP en public/img/ y recorta la figura de Joan.

Uso: uv run scripts/preparar_imagenes.py
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "datos-crudos" / "imagenes"
DESTINO = RAIZ / "public" / "img"
ALTO_MAX = 1400
# Descartadas: propaganda bélica explícita en portada (esvásticas, Hitler) o personaje fuera de la selección.
DESCARTADAS = {"black-terror--americasbestcomics1001", "black-terror--exciting-comics-39", "cat-man-y-kitten--cat-man-no-20-et-es-go", "miss-masque--americasbestcomics2326-27", "silver-streak--silver-streak-8"}  # #8: Daredevil en portada


def recortar_fondo_blanco(im: Image.Image, umbral: int = 232) -> Image.Image:
    """Relleno por inundación desde los bordes: el blanco conectado con el borde pasa a transparente."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    visto = bytearray(w * h)
    cola = deque()
    for x in range(w):
        cola.extend([(x, 0), (x, h - 1)])
    for y in range(h):
        cola.extend([(0, y), (w - 1, y)])
    while cola:
        x, y = cola.popleft()
        i = y * w + x
        if visto[i]:
            continue
        visto[i] = 1
        r, g, b, _ = px[x, y]
        if min(r, g, b) < umbral:
            continue
        px[x, y] = (r, g, b, 0)
        if x > 0:
            cola.append((x - 1, y))
        if x < w - 1:
            cola.append((x + 1, y))
        if y > 0:
            cola.append((x, y - 1))
        if y < h - 1:
            cola.append((x, y + 1))
    return im.crop(im.getbbox())


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    for f in sorted(ORIGEN.iterdir()):
        if f.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        nombre = f.stem
        if nombre in DESCARTADAS:
            continue
        im = Image.open(f)
        if "joan-has-followed" in nombre:
            im = recortar_fondo_blanco(im)
            nombre = "joan-recorte"
        else:
            im = im.convert("RGB")
        if im.height > ALTO_MAX:
            im = im.resize((round(im.width * ALTO_MAX / im.height), ALTO_MAX), Image.LANCZOS)
        out = DESTINO / f"{nombre}.webp"
        im.save(out, "WEBP", quality=80, method=6)
        print(f"{out.relative_to(RAIZ)}  {im.width}x{im.height}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
