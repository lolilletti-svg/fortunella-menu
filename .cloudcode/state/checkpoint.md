# Checkpoint — Fortunella Menú Digital

_Última actualización: 2026-10-19_

## Qué es este proyecto
Menú digital de la pizzería Fortunella (La Rioja), por QR. **Dos cartas** sobre la misma base de Supabase, editables por el dueño desde un panel web:
1. **Menú principal** — https://lolilletti-svg.github.io/fortunella-menu/ (QR `fortunella-qr.png`)
2. **Carta Patio Fortunella** (inauguración, diseño verano en acuarela) — https://fortunella-pizzas.github.io/ (QR `patio-verano-qr.png`)

Cliente: el Turco (dueño).

## Arquitectura (clave para retomar)
- **Datos** en Supabase (ref `txxoyivwhsoowkhwzzpp`, plan FREE). Tablas `modules` (con columna `menu`: `fortunella` | `patio`) e `items`. RLS: lectura pública, escritura autenticada.
- **Repo principal** `lolilletti-svg/fortunella-menu` (GitHub Pages): `index.html` (menú principal), `admin.html` + `js/admin.js` (panel, selector de carta), `js/menu.js` (filtra por `<body data-menu>`, emite `menu:rendered`), `js/render.js`, `js/config.js`.
- **Carta Patio** publicada en repo aparte `fortunella-pizzas/fortunella-pizzas.github.io` (org GitHub `fortunella-pizzas`, Lucía la creó; lolilletti-svg es admin). Clon local en `../fortunella-pizzas.github.io`.
  - Fuente: `tools/patio-verano/` → `base-patio.html` + `verano.css` + `verano.js` + `make_verano.py`.
  - Previsualizar: `python3 tools/patio-verano/make_verano.py .` → `_preview-patio.html` (gitignored), servir con `python3 -m http.server 8765`.
  - Publicar: `bash tools/patio-verano/publicar.sh` (copia index + js + data/patio-fallback.json + assets/patio).
  - `patio.html` y `patio-verano.html` del repo principal = redirecciones a fortunella-pizzas.github.io.
- Panel: https://lolilletti-svg.github.io/fortunella-menu/admin.html — usuario `admin@fortunella.menu`, contraseña la tiene Lucía. Probado por Lucía el 2026-10-12: funciona con la carta Patio.
- Conector MCP de Supabase autenticado (2026-10-12): se puede correr SQL directo.

## Estado
✅ Carta Patio en vivo y revisada (2026-10-19): 8 secciones (Entraditas, Sandwichería, Empanadas, Pizzas, Ensaladas, Dulce Fortunella, Bebidas sin/con alcohol). Pizzas en 3 pestañas (subgroup en DB) con 6 fotos reales (PIZZA_PHOTOS en verano.js). Menú principal sin cambios.
- Fotos originales: Drive del Turco, carpeta REDES › Pizzas (1j3P_vNV2Q8VsZ4Y-62enoe-qrXdOKRy1), una subcarpeta por pizza. Listar con curl embeddedfolderview (el conector Drive no muestra carpetas no abiertas).

## Pendientes
- Dueño: cervezas todas a $2.000 (¿real?); "muzarrella" en Doble Muzzarella y Porteña; ¿Napolitana/Capresse llevan tomates asados?
- Opcional: mudar el menú principal a la org `fortunella-pizzas` (con redirecciones para no romper su QR).
- `fortunella-motocross-*.html`: untracked, ajenos al menú, sin tocar.

## Lecciones
- GitHub Pages cachea 10 min: verificar en incógnito o con ?v=N.
- Al reemplazar imágenes usar nombre de archivo nuevo (caché del navegador).
- QR impresos: dejar borde blanco alrededor.
- Capturas headless del menú: la carga de Supabase a veces no llega a tiempo → reintentar o capturar el DOM ya renderizado.
