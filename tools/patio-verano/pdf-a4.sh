#!/bin/bash
# Carta Patio para imprimir: PDF de 2 carillas (frente y dorso), con los datos actuales de Supabase.
# Uso (desde la raíz del proyecto): bash tools/patio-verano/pdf-a4.sh   → carta-patio-oficio.pdf
#   Para A4: PAPEL=a4 bash tools/patio-verano/pdf-a4.sh   → carta-patio-a4.pdf
# El diseño de la versión impresa está en tools/patio-verano/carta_a4.py. Necesita Google Chrome.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
export PAPEL="${PAPEL:-oficio}"
OUT="${1:-$ROOT/carta-patio-$PAPEL.pdf}"
HTML="$ROOT/_carta-a4.html"

python3 "$ROOT/tools/patio-verano/carta_a4.py" "$HTML" >/dev/null
"$CHROME" --headless=new --disable-gpu --virtual-time-budget=10000 --no-pdf-header-footer \
  --print-to-pdf="$OUT" "file://$HTML" 2>/dev/null
rm -f "$HTML"
echo "PDF listo: $OUT"
