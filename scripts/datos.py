# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Genera src/datos/heroes.json desde Wikidata (CC0), Wikipedia (infobox) y Wikimedia Commons.

Solo se aceptan imágenes cuya licencia en Commons es de dominio público.
Uso: uv run --python 3.12 python -I scripts/datos.py
"""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

UA = "heroes-pd-portfolio/0.1 (static site build; python-urllib)"
RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "src" / "datos" / "heroes.json"
IMGS = RAIZ / "datos-crudos" / "imagenes"

# Lista blanca curada a mano: personajes de editoriales extintas, sin marca viva conocida
# ni choque de nombre con Marvel o DC. (titulo_enwiki, nombre_mostrado)
CANDIDATOS = [
    ("Black Terror", "Black Terror"),
    ("Fighting Yank", "Fighting Yank"),
    ("Woman in Red (comics)", "The Woman in Red"),
    ("Pyroman", "Pyroman"),
    ("Miss Masque", "Miss Masque"),
    ("Fantomah", "Fantomah"),
    ("Stardust the Super Wizard", "Stardust"),
    ("Señorita Rio", "Señorita Rio"),
    ("Cat-Man and Kitten", "Cat-Man y Kitten"),
    ("Miss Victory", "Miss Victory"),
    ("The Flame (Fox Feature Syndicate)", "The Flame"),
    ("Samson (Fox Feature Syndicate)", "Samson"),
    ("Silver Streak (comics)", "Silver Streak"),
    ("American Eagle (Nedor Comics)", "American Eagle"),
]

LICENCIAS_PD = re.compile(r"^(public domain|pd[- ]|cc0)", re.I)


CACHE = RAIZ / "datos-crudos" / "cache"


def get_json(url: str, params: dict) -> dict:
    import hashlib
    url = f"{url}?{urllib.parse.urlencode(params)}"
    CACHE.mkdir(parents=True, exist_ok=True)
    fc = CACHE / (hashlib.sha1(url.encode()).hexdigest() + ".json")
    if fc.exists():
        return json.loads(fc.read_text())
    for intento in range(6):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.load(r)
            fc.write_text(json.dumps(d))
            time.sleep(1.5)
            return d
        except Exception as e:  # noqa: BLE001
            ra = getattr(e, "headers", None) and e.headers.get("Retry-After")
            espera = int(ra) if ra and ra.isdigit() else 15 * (intento + 1)
            print(f"  aviso {e!r}, reintento en {espera}s", file=sys.stderr)
            time.sleep(espera)
    raise RuntimeError(f"falló {url}")


def wiki(titulo: str) -> dict:
    """Wikitext del infobox + QID de Wikidata desde enwiki."""
    d = get_json("https://en.wikipedia.org/w/api.php", {
        "action": "query", "format": "json", "redirects": 1, "titles": titulo,
        "prop": "revisions|pageprops|images", "rvprop": "content", "rvslots": "main",
        "imlimit": 50,
    })
    pag = next(iter(d["query"]["pages"].values()))
    if "missing" in pag:
        return {}
    texto = pag["revisions"][0]["slots"]["main"]["*"]
    return {
        "titulo": pag["title"],
        "qid": pag.get("pageprops", {}).get("wikibase_item"),
        "texto": texto,
        "imagenes": [i["title"] for i in pag.get("images", [])],
    }


def campo_infobox(texto: str, *claves: str) -> str | None:
    for k in claves:
        m = re.search(rf"^\s*\|\s*{k}\s*=\s*(.+)$", texto, re.M)
        if m and m.group(1).strip():
            v = m.group(1)
            v = re.sub(r"<ref[^>]*/>|<ref[^>]*>.*?</ref>|<!--.*?-->", "", v)
            v = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", v)
            v = re.sub(r"''+", "", v)
            v = re.sub(r"\{\{[^}]*\}\}|<[^>]+>", " ", v)
            v = re.sub(r"\s+", " ", v).strip(" ,;")
            if v:
                return v
    return None


def wikidata(qid: str) -> dict:
    d = get_json("https://www.wikidata.org/w/api.php", {
        "action": "wbgetentities", "format": "json", "ids": qid,
        "props": "labels|descriptions|claims|sitelinks", "languages": "es|en",
    })
    return d["entities"][qid]


def etiquetas(qids: list[str]) -> dict[str, str]:
    if not qids:
        return {}
    d = get_json("https://www.wikidata.org/w/api.php", {
        "action": "wbgetentities", "format": "json", "ids": "|".join(qids[:50]),
        "props": "labels", "languages": "es|en",
    })
    out = {}
    for q, e in d["entities"].items():
        l = e.get("labels", {})
        out[q] = (l.get("es") or l.get("en") or {}).get("value", q)
    return out


def ids_claim(ent: dict, prop: str) -> list[str]:
    out = []
    for c in ent.get("claims", {}).get(prop, []):
        v = c["mainsnak"].get("datavalue", {}).get("value")
        if isinstance(v, dict) and "id" in v:
            out.append(v["id"])
        elif isinstance(v, str):
            out.append(v)
    return out


def info_commons(titulos: list[str]) -> list[dict]:
    """Metadatos de licencia de ficheros (en Commons o enwiki con licencia PD)."""
    res = []
    for i in range(0, len(titulos), 40):
        lote = titulos[i:i + 40]
        d = get_json("https://commons.wikimedia.org/w/api.php", {
            "action": "query", "format": "json", "titles": "|".join(lote),
            "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 1600,
        })
        for p in d.get("query", {}).get("pages", {}).values():
            ii = (p.get("imageinfo") or [None])[0]
            if not ii or not ii.get("mime", "").startswith("image/") or ii["mime"] == "image/svg+xml":
                continue
            md = ii.get("extmetadata", {})
            lic = re.sub(r"<[^>]+>", "", md.get("LicenseShortName", {}).get("value", "")).strip()
            if not LICENCIAS_PD.match(lic):
                continue
            autor = re.sub(r"<[^>]+>", "", md.get("Artist", {}).get("value", "")).strip()
            desc = re.sub(r"<[^>]+>", "", md.get("ImageDescription", {}).get("value", "")).strip()
            res.append({
                "fichero": p["title"],
                "url": ii.get("thumburl") or ii["url"],
                "pagina": ii.get("descriptionurl"),
                "ancho": ii.get("width"), "alto": ii.get("height"),
                "licencia": lic, "autor": autor or "Desconocido",
                "descripcion": desc[:300],
            })
    return res


def buscar_commons(nombre: str) -> list[str]:
    d = get_json("https://commons.wikimedia.org/w/api.php", {
        "action": "query", "format": "json", "list": "search", "srnamespace": 6,
        "srsearch": f'"{nombre}" comics', "srlimit": 15,
    })
    return [s["title"] for s in d.get("query", {}).get("search", [])]


def slug(s: str) -> str:
    s = s.lower().replace("ñ", "n")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def main() -> None:
    heroes = []
    for titulo, nombre in CANDIDATOS:
        print(f"· {nombre}", file=sys.stderr)
        w = wiki(titulo)
        time.sleep(0.5)
        if not w:
            print("  sin artículo en enwiki, se descarta", file=sys.stderr)
            continue
        ent = wikidata(w["qid"]) if w.get("qid") else {}
        t = w["texto"]
        creadores_q = ids_claim(ent, "P170")
        pub_q = ids_claim(ent, "P123")
        nombres = etiquetas(creadores_q + pub_q)
        ficheros = [f for f in w["imagenes"] if not re.search(r"\.svg$", f, re.I)]
        ficheros += [f"File:{x}" for x in ids_claim(ent, "P18")]
        ficheros += buscar_commons(nombre.split(" y ")[0])
        ficheros = list(dict.fromkeys(ficheros))
        imgs = info_commons(ficheros)
        time.sleep(0.5)
        heroes.append({
            "id": slug(nombre),
            "nombre": nombre,
            "qid": w.get("qid"),
            "wikipedia": f"https://en.wikipedia.org/wiki/{urllib.parse.quote(w['titulo'].replace(' ', '_'))}",
            "descripcion_es": ent.get("descriptions", {}).get("es", {}).get("value"),
            "descripcion_en": ent.get("descriptions", {}).get("en", {}).get("value"),
            "editorial": [nombres.get(q, q) for q in pub_q] or [campo_infobox(t, "publisher")],
            "creadores": [nombres.get(q, q) for q in creadores_q] or [campo_infobox(t, "creators", "creator")],
            "debut": campo_infobox(t, "debut", "first appearance"),
            "alter_ego": campo_infobox(t, "alter_ego", "real name"),
            "poderes": campo_infobox(t, "powers", "abilities"),
            "imagenes": imgs,
        })
        print(f"  {len(imgs)} imágenes PD", file=sys.stderr)
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(heroes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(heroes)} personajes → {SALIDA.relative_to(RAIZ)}", file=sys.stderr)


if __name__ == "__main__":
    main()
