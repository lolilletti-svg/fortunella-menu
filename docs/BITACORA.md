# Bitácora — Fortunella Menú Digital

## 2026-10-12 — Carta "Patio Fortunella" (inauguración) con diseño de verano

### Lo que se hizo
**1. Segunda carta en la misma base** (commit `8ef78ee`)
- Supabase: columna `modules.menu` (`fortunella` | `patio`) + 7 secciones Patio copiadas con los precios vigentes (migración `tools/patio-migration.sql`, aplicada vía conector MCP de Supabase).
- Secciones: Mientras esperás (empanadas) · Sandwichería · Solo para Valientes · Nuestras deliciosas pizzas (sin Box) · Ensaladas de verano · Dulce Fortunella · Bebidas (solo sin alcohol).
- `js/menu.js` filtra por `<body data-menu>`; panel con selector "Carta que estás editando".
- `data/menu-fallback.json` refrescado con los precios en vivo (el dueño había subido pizzas).

**2. Diseño de verano en acuarela** (`patio-verano.html` → hoy `fortunella-pizzas.github.io`)
- Toldo y guirnalda en acuarela (kit de ChatGPT), bondi del patio, "Patio" manuscrito, bajada "Un manjar en el patio".
- Ilustración por sección (empanada dorada, focaccia, pizza, bowl César, tiramisú, Aperol).
- Barra de secciones fija; tarjeta única (borde azul + sombra teja, sin inclinar) en todas las secciones; empanadas y bebidas en tabla dentro del mismo marco; bebidas como tabla bebida × tamaño + "Aguas y más".
- Pie azul con ramitas del logo en azul más claro de fondo.
- Generador: `tools/patio-verano/` (base-patio.html + verano.css + verano.js + make_verano.py).

**3. Dirección propia sin "lolilletti-svg"**
- Organización GitHub `fortunella-pizzas` (creada por Lucía) → repo `fortunella-pizzas.github.io` → https://fortunella-pizzas.github.io/
- `tools/patio-verano/publicar.sh` publica la carta en ese repo.
- `patio.html` y `patio-verano.html` del repo principal redirigen ahí (QR viejos de Patio siguen andando).
- QR definitivo `patio-verano-qr.png` (ECC H), verificado con lector a 1080/270/108 px.
- Menú principal (`index.html`, `fortunella-qr.png`) sin cambios.

### Estado actual
✅ Carta Patio en vivo en https://fortunella-pizzas.github.io/ con datos de Supabase. Panel probado por Lucía con la contraseña: edita la carta Patio. Mensaje para el cliente (el Turco) armado.

### Notas técnicas
- Al reemplazar una imagen, usar **nombre de archivo nuevo**: el navegador cacheaba la vieja.
- Guirnalda: se repite en copias enteras; un script calcula cuántas entran (ResizeObserver) y escala sin deformar.
- Toldo: recortado a la franja de lados rectos (el dibujo en perspectiva dejaba huecos en las esquinas).
- `fortunella-qr.png` se lee con el detector solo agregando borde blanco: al imprimir QR, dejar margen.
- Herramientas Python en `venv/` (ahora en .gitignore) + `requirements.txt`.

### Próximos pasos
- Cargar precios de ensaladas Criolla, Mixta y Rúcula y Parmesano (desde el panel).
- Confirmar si se vende Aperol (hoy ilustra Bebidas, pero solo hay bebidas sin alcohol).
- Opcional: mudar también el menú principal a `fortunella-pizzas` (con redirecciones).

## 2026-06-08 / 09 — Menú dinámico editable + entregables

### Lo que se hizo

**1. Correcciones de precios** (commit `408e70a`)
- Roquefort con Peras y Nuez (chica): $8.500 → **$9.600**
- Tiramisú: $6.000 → **$6.500**

**2. Transformación a menú editable** (commit `7839e3b`) — el cambio grande
- El menú dejó de ser HTML estático: ahora los datos viven en **Supabase** y el diseño en **GitHub Pages**.
- Se separó **datos** de **diseño**: `index.html` conserva todo el CSS/hero/footer y los datos se inyectan en `#menu-root` vía JS.
- Nuevos: `js/render.js` (render puro), `js/menu.js` (carga Supabase→fallback), `js/config.js` (credenciales públicas), `admin.html` + `js/admin.js` (panel con login + CRUD completo), `data/menu-fallback.json` (respaldo).
- Migración: `tools/seed.json` (7 módulos, 81 ítems extraídos del HTML original) → `tools/load-seed.sql`.
- Modelo de datos: `modules` (name, subtitle, layout_type, title_variant, position) + `items` (module_id, subgroup, name, description, prices JSONB, note, featured, position).
- **Verificado headless** (`tools/test-render.mjs` con jsdom): el render dinámico reproduce el HTML original **idéntico** (nombres, precios, clases, estructura).

**3. Setup de Supabase** (manual por dashboard — el conector MCP no autenticó)
- Proyecto creado (ref `txxoyivwhsoowkhwzzpp`, org Lolilletti94, plan FREE).
- Corridos `schema.sql` + `load-seed.sql`. RLS habilitado (lectura pública, escritura solo autenticada).
- Signups públicos desactivados + usuario único `admin@fortunella.menu` creado.
- Credenciales (URL + anon key) cargadas en `js/config.js`.
- **Seguridad verificada por REST**: sin login, UPDATE devuelve 0 filas e INSERT da 401 (RLS). El dato quedó intacto.
- **Prueba end-to-end OK**: login → editar precio → guardar → se refleja en el menú.

**4. Entregables para el cliente** (commits `97e8925`, `4e54dfe`)
- `GUIA-DUENO.md` + `GUIA-DUENO.pdf`: instructivo de 1 página con la marca (3 pasos, tabla, FAQ).
- `GUIA-VIDEO.mp4`: explainer animado vertical 9:16 (~20s) para WhatsApp, generado con Chrome (placas) + ffmpeg (xfade). Fuente: `tools/slides.html`.
- Limpieza: borrados 3 HTML obsoletos (`fortunella-menu-FINAL.html` de 20MB, `foc-subtitles` y su copia).

### Estado actual
✅ Sistema completo, en vivo y verificado (menú dinámico, panel, seguridad, guía, video). El dueño edita sin intervención de Lucía.

### Notas técnicas
- **Video — bug evitado**: combinar `-loop -t` con `zoompan` en ffmpeg multiplica frames (salía de 6 min). Solución: placas estáticas + `xfade` con `offset = k*(D-T)`.
- **PDF — 1 página**: NO usar `min-height:297mm` (fuerza desborde a pág 2 por redondeo); dejar altura auto y el marco `::before` con `position:fixed`.
- La contraseña del dueño se comparte aparte, nunca en repo/PDF/video.

### Próximos pasos posibles (no urgentes)
- Agregar teléfono/Instagram al pie del PDF/video si se quiere.
- Regenerar `data/menu-fallback.json` desde la DB cuando el menú cambie mucho.
- `fortunella-motocross-*.html` (untracked, ajenos al menú) quedan sin tocar.
