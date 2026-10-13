# 🍕 Fortunella — Menú Digital Editable

Menú digital de la pizzería Fortunella (La Rioja, Argentina), accesible por **QR**. Tiene **dos cartas**: el menú de siempre y la carta **Patio Fortunella** (inauguración del patio, diseño de verano en acuarela). El dueño edita precios, ítems y secciones desde un **panel web** y los cambios aparecen **solos** en el menú, sin intervención técnica.

## 🔗 Enlaces

| | URL |
|---|---|
| 🍕 **Menú principal (QR `fortunella-qr.png`)** | https://lolilletti-svg.github.io/fortunella-menu/ |
| 🌙 **Carta Patio (QR `patio-verano-qr.png`)** | https://fortunella-pizzas.github.io/ |
| 🔧 **Panel del dueño (edita las dos cartas)** | https://lolilletti-svg.github.io/fortunella-menu/admin.html |
| 📄 **Guía del dueño (PDF)** | https://lolilletti-svg.github.io/fortunella-menu/GUIA-DUENO.pdf |
| 🎬 **Video explainer** | https://lolilletti-svg.github.io/fortunella-menu/GUIA-VIDEO.mp4 |

## 🏗️ Cómo funciona

Los **datos** (módulos e ítems) viven en **Supabase**; el **diseño** es estático en **GitHub Pages**. El menú lee los datos al cargar y arma la carta; el panel los edita.

```
┌──────────────────┐   lee (anon + RLS)   ┌─────────────────┐
│ index.html       │ ───────────────────▶ │   Supabase      │
│ (menú público)   │                      │  modules        │
│ + js/menu.js     │                      │  items          │
│ + js/render.js   │                      │  + Auth (1 user)│
└──────────────────┘                      │                 │
┌──────────────────┐  escribe (login)     │                 │
│ admin.html       │ ───────────────────▶ └─────────────────┘
│ + js/admin.js    │
└──────────────────┘
```

- **Dos cartas, una base**: la columna `modules.menu` (`fortunella` | `patio`) indica a qué carta pertenece cada sección. Cada página elige la suya con `<body data-menu="...">`; el panel tiene un selector "Carta que estás editando".
- **Carta Patio** se publica en un repo aparte de la organización GitHub `fortunella-pizzas` (`fortunella-pizzas.github.io`) para que la dirección no muestre `lolilletti-svg`. `patio.html` y `patio-verano.html` de este repo solo redirigen ahí (los QR viejos siguen andando).
- **Si Supabase no responde**, el menú muestra `data/menu-fallback.json` (snapshot) en vez de quedar vacío.
- **Seguridad**: la `anon key` es pública por diseño; la escritura está protegida por **Row Level Security** (solo usuarios autenticados) y el panel pide contraseña. Verificado: sin login no se puede escribir.

## 📁 Estructura

```
index.html              Menú público (diseño + contenedor #menu-root)
admin.html              Panel de administración
js/
  config.js             URL + anon key de Supabase (públicas)
  render.js             Render puro del menú (reutilizable, sin dependencias)
  menu.js               Carga datos (Supabase → fallback) y renderiza
  admin.js              Login + CRUD de módulos e ítems
data/
  menu-fallback.json    Respaldo si Supabase se cae
tools/                  Utilidades offline (NO se sirven al público)
  schema.sql            Tablas + RLS + policies
  load-seed.sql         Carga inicial de datos (81 ítems)
  seed.json             Fuente de datos legible
  SETUP-SUPABASE.md     Pasos de configuración de Supabase
  test-render.mjs       Test headless (render fiel al original)
  guia-dueno.html       Fuente del PDF de la guía
  slides.html           Fuente (6 placas) del video explainer
patio.html, patio-verano.html   Redirecciones a https://fortunella-pizzas.github.io/
assets/patio/           Acuarelas de la carta Patio (WebP livianos)
data/patio-fallback.json Respaldo de la carta Patio
tools/patio-verano/     Carta Patio: base-patio.html + verano.css + verano.js,
                        make_verano.py (genera la página) y publicar.sh (la publica)
tools/patio-migration.sql  Migración que creó la carta Patio (columna menu + datos)
GUIA-DUENO.md / .pdf    Guía para el dueño
GUIA-VIDEO.mp4          Video explainer vertical (~20s)
docs/BITACORA.md        Historial de trabajo
```

## 🛠️ Tareas comunes

**Configurar Supabase desde cero** → seguir `tools/SETUP-SUPABASE.md`.

**Cambiar precios/ítems** → no requiere tocar código: el dueño usa el panel. Ver `GUIA-DUENO.md`.

**Regenerar el PDF de la guía:**
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf="GUIA-DUENO.pdf" "file://$PWD/tools/guia-dueno.html"
```

**Regenerar el video** (requiere ffmpeg + Chrome): capturar las 6 placas de `tools/slides.html#1..#6` con Chrome `--screenshot` a `tools/frames/`, y unirlas con ffmpeg usando `xfade` (ver `docs/BITACORA.md`).

**Cambiar el diseño de la carta Patio** → editar `tools/patio-verano/verano.css` / `verano.js`, previsualizar con `python3 tools/patio-verano/make_verano.py .` (genera `_preview-patio.html`, abrir con `python3 -m http.server`) y publicar con `bash tools/patio-verano/publicar.sh`.

**Verificar el render** (sin Supabase): `cd tools && npm install && node test-render.mjs`.

## 🚀 Deploy

GitHub Pages sirve `main` automáticamente. Hacer cambios → commit → `git push origin main` → se publica solo (~1 min). La URL del QR nunca cambia.

La carta Patio se publica aparte con `tools/patio-verano/publicar.sh` (repo `fortunella-pizzas/fortunella-pizzas.github.io`).
