#!/usr/bin/env python3
"""
Recorta Font Awesome a los íconos que usa el sitio.

Las fuentes completas pesan ~580 KB y el sitio usa unas decenas de íconos. Este script busca las clases
`fa-*` en el código, deja en cada fuente solo esos glifos y genera un CSS reducido:

  entrada: public/assets/fonts/fontawesome/css/all.min.css y webfonts/*.woff2 (originales, no se modifican)
  salida:  public/assets/fonts/fontawesome/css/subset.min.css y webfonts/subset/*.woff2

Volver a correrlo cada vez que se agregue un ícono nuevo en el código:

  pip install fonttools brotli
  python3 scripts/subset-fontawesome.py
"""

import re
import sys
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
FA_DIR = ROOT / 'public/assets/fonts/fontawesome'
SOURCE_CSS = FA_DIR / 'css/all.min.css'
OUTPUT_CSS = FA_DIR / 'css/subset.min.css'
OUTPUT_FONTS = FA_DIR / 'webfonts/subset'

# Dónde pueden aparecer clases de íconos (theme.js arma las flechas de los sliders con HTML)
SCAN_DIRS = ['app', 'components', 'lib', 'styles', 'public/assets/js']
SCAN_EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.scss', '.css'}

FONTS = ['fa-solid-900', 'fa-regular-400', 'fa-light-300', 'fa-brands-400']

ICON_RULE = re.compile(r'([^{}]+)\{content:"\\([0-9a-f]+)"\}')
ICON_SELECTOR = re.compile(r'^\.(fa-[a-z0-9-]+):before$')


def used_classes() -> set[str]:
    found = set()
    for folder in SCAN_DIRS:
        for path in (ROOT / folder).rglob('*'):
            if path.suffix in SCAN_EXTENSIONS and path.is_file():
                found.update(re.findall(r'\bfa-[a-z0-9-]+', path.read_text(errors='ignore')))
    return found


def build_css(css: str, used: set[str]) -> tuple[str, set[int]]:
    """Quita las reglas de íconos no usados y apunta las fuentes a la versión recortada."""
    codepoints: set[int] = set()

    def keep_used_icons(match: re.Match) -> str:
        selectors = match.group(1).split(',')
        icons = [ICON_SELECTOR.match(s) for s in selectors]
        if not all(icons):
            return match.group(0)  # no es una regla de ícono: se conserva tal cual
        kept = [s for s, m in zip(selectors, icons) if m.group(1) in used]
        if not kept:
            return ''
        codepoints.add(int(match.group(2), 16))
        return f'{",".join(kept)}{{content:"\\{match.group(2)}"}}'

    css = ICON_RULE.sub(keep_used_icons, css)

    # Reglas del estilo duotone (.fad): el sitio no lo usa
    def drop_duotone(match: re.Match) -> str:
        selectors = [s for s in match.group(1).split(',') if not s.lstrip().startswith('.fad')]
        return f'{",".join(selectors)}{{{match.group(2)}}}' if selectors else ''

    css = re.sub(r'(?<=[}\s])([^{}@]+)\{([^{}]*)\}', drop_duotone, css)

    # Solo woff2 (lo soportan todos los navegadores actuales) y sin la familia duotone, que no se usa
    def font_face(match: re.Match) -> str:
        block = match.group(0)
        name = re.search(r'webfonts/(fa-[a-z]+-\d+)\.woff2', block)
        if not name or name.group(1) not in FONTS:
            return ''
        src = f'src:url(../webfonts/subset/{name.group(1)}.woff2) format("woff2")'
        return re.sub(r'src:[^}]*', src, block)

    css = re.sub(r'@font-face\{[^}]*\}', font_face, css)
    return css, codepoints


def main() -> None:
    used = used_classes()
    css, codepoints = build_css(SOURCE_CSS.read_text(), used)
    if not codepoints:
        sys.exit('No se encontró ningún ícono de Font Awesome en el código')

    OUTPUT_FONTS.mkdir(parents=True, exist_ok=True)
    for font in FONTS:
        options = subset.Options()
        options.flavor = 'woff2'
        options.layout_features = []
        options.name_IDs = ['*']
        source = subset.load_font(str(FA_DIR / f'webfonts/{font}.woff2'), options)
        subsetter = subset.Subsetter(options)
        subsetter.populate(unicodes=codepoints)
        subsetter.subset(source)
        target = OUTPUT_FONTS / f'{font}.woff2'
        subset.save_font(source, str(target), options)
        print(f'{font}.woff2: {target.stat().st_size / 1024:.1f} KB')

    OUTPUT_CSS.write_text(css)
    print(f'subset.min.css: {len(css) / 1024:.1f} KB, {len(codepoints)} íconos')


if __name__ == '__main__':
    main()
