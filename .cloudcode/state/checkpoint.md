# Checkpoint — Fortunella Menú Digital

_Última actualización: 2026-11-02_

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
✅ Carta Patio en vivo (2026-11-02): Entraditas, Sandwichería, Empanadas, Pizzas (3 pestañas, 6 fotos), Papas fritas, Ensalada, Menú kids, Dulce, **Bebidas** (una sola sección: Sin alcohol + Tragos | Porrones 330/710/1L + Vinos). Ilustraciones de todas las secciones con la misma superficie.
✅ **Carta para imprimir**: `bash tools/patio-verano/pdf-a4.sh` → `carta-patio-oficio.pdf` (oficio 216×340, letra ×1.28, sin precios: solo "$"). Diseño en `tools/patio-verano/carta_a4.py`. Entregada con el QR en `~/Downloads/Versión Patio Fortunella/`.
- Fotos originales: Drive del Turco, carpeta REDES › Pizzas (1j3P_vNV2Q8VsZ4Y-62enoe-qrXdOKRy1). Listar con curl embeddedfolderview.

## Pendientes
- Dueño: precios de Soda 500ml y Limonada (están en $0).
- Ilustración Menú kids: cajita estilo Cajita Feliz (McDonald's) → sugerido recortarla; Lucía no respondió.
- Opcional: mudar el menú principal a la org `fortunella-pizzas` (con redirecciones para no romper su QR).
- `fortunella-motocross-*.html`: untracked, ajenos al menú, sin tocar.

## Lecciones
- GitHub Pages cachea 10 min: verificar en incógnito o con ?v=N.
- Al reemplazar imágenes usar nombre de archivo nuevo (caché del navegador).
- QR impresos: dejar borde blanco alrededor.
- Capturas headless del menú: la carga de Supabase a veces no llega a tiempo → reintentar o capturar el DOM ya renderizado.
- PDF impreso: nada de backgrounds repetidos (Chrome los rasteriza borrosos) → SVG inline/`<img>`; sin `transform` espejado (Vista Previa no lo muestra); sin radial-gradient (manchas). Verificar con Quartz (swift PDFDocument) además de pdftoppm, ampliando los bordes.
- Lucía revisa el impreso con lupa: jerarquías claras, simetría, orden de la carta, aire; no achicar el aire de Bebidas.
