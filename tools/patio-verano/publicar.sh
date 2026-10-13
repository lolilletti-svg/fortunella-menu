#!/bin/bash
# Publica la carta Patio en https://fortunella-pizzas.github.io
# Arma index.html con el generador y copia lo que la página necesita al repo de la organización.
# Uso (desde la raíz del proyecto): bash tools/patio-verano/publicar.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SITE="${SITE:-$ROOT/../fortunella-pizzas.github.io}"   # clon de fortunella-pizzas/fortunella-pizzas.github.io

[ -d "$SITE/.git" ] || git clone https://github.com/fortunella-pizzas/fortunella-pizzas.github.io "$SITE"

python3 "$ROOT/tools/patio-verano/make_verano.py" "$ROOT" "$SITE/index.html"
mkdir -p "$SITE/js" "$SITE/data" "$SITE/assets/patio"
cp "$ROOT/js/menu.js" "$ROOT/js/render.js" "$ROOT/js/config.js" "$SITE/js/"
cp "$ROOT/data/patio-fallback.json" "$SITE/data/"
rsync -a --delete "$ROOT/assets/patio/" "$SITE/assets/patio/"
touch "$SITE/.nojekyll"

cd "$SITE"
git add -A
if git diff --cached --quiet; then echo "Sin cambios para publicar."; exit 0; fi
git commit -q -m "${MSG:-Actualizar carta Patio}"
git push -q origin HEAD:main
echo "Publicado: https://fortunella-pizzas.github.io"
