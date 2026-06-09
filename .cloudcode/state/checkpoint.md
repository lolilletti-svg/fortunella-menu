# Checkpoint — Fortunella Menú Digital

_Última actualización: 2026-06-09_

## Qué es este proyecto
Menú digital de la pizzería Fortunella (La Rioja), accesible por QR. **Ya no es estático**: el dueño edita precios/ítems/secciones desde un panel web y se reflejan solos en el menú.

## Arquitectura (clave para retomar)
- **Datos** en Supabase · **Diseño** estático en GitHub Pages (`lolilletti-svg/fortunella-menu`, rama `main`).
- `index.html` (menú público) + `js/menu.js` + `js/render.js` leen de Supabase, con fallback a `data/menu-fallback.json`.
- `admin.html` + `js/admin.js`: panel con login (contraseña) + CRUD.
- `js/config.js`: URL + anon key (públicas).
- Modelo: tablas `modules` e `items` (ver `tools/schema.sql`).

## Datos de Supabase
- Proyecto ref: `txxoyivwhsoowkhwzzpp` · org Lolilletti94 · plan FREE.
- URL: `https://txxoyivwhsoowkhwzzpp.supabase.co` (en `js/config.js`).
- Auth: usuario único `admin@fortunella.menu`. La **contraseña la tiene Lucía** (no está en el repo). Rotar desde dashboard → Authentication → Users.
- RLS activo: lectura pública, escritura solo autenticada. Signups públicos desactivados.

## URLs
- Menú (QR): https://lolilletti-svg.github.io/fortunella-menu/
- Panel: https://lolilletti-svg.github.io/fortunella-menu/admin.html
- Guía PDF: https://lolilletti-svg.github.io/fortunella-menu/GUIA-DUENO.pdf
- Video: https://lolilletti-svg.github.io/fortunella-menu/GUIA-VIDEO.mp4

## Estado
✅ COMPLETO y en vivo. Menú dinámico, panel, seguridad verificada, guía PDF + video explainer entregados. Todo en GitHub.

## Si hay que volver a tocar
- Cambiar precios → es tarea del dueño en el panel, NO editar código.
- Setup Supabase desde cero → `tools/SETUP-SUPABASE.md`.
- Regenerar PDF/video → ver `README.md` y `docs/BITACORA.md`.
- Verificar render sin Supabase → `cd tools && npm install && node test-render.mjs`.

## Pendientes (opcionales)
- Tel/Instagram al pie del PDF/video.
- Regenerar `menu-fallback.json` desde la DB tras cambios grandes.
- `fortunella-motocross-*.html`: untracked, ajenos al menú, sin tocar.
