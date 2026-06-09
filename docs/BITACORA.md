# Bitácora — Fortunella Menú Digital

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
