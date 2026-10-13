# Genera patio-verano.html a partir de base-patio.html (la primera versión de la carta Patio) (mismo CSS base + capa "verano").
# Uso: python3 tools/patio-verano/make_verano.py . [archivo_salida]   (desde la raíz del proyecto)
# Para publicar en fortunella-pizzas.github.io usar tools/patio-verano/publicar.sh
# Editar verano.css / verano.js y volver a correrlo; el HTML resultante es autocontenido.
import sys, os
root = sys.argv[1]
s = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "base-patio.html"), encoding="utf-8").read()
lines = s.split("\n")

# Marcado del logo (con las ramitas) tal cual el original
hero_name = next(l for l in lines if 'class="hero-name"' in l).strip()

head_new = f'''  <!-- ─── TOLDO + LUCES ─── -->
  <img class="v-awning" src="assets/patio/techito.webp" alt="" aria-hidden="true">
  <div class="v-lights" aria-hidden="true"></div>

  <!-- ─── HERO PATIO ─── -->
  <header class="v-hero">
    {hero_name}
    <div class="v-patio">Patio</div>
    <div class="v-tagline">Un manjar en el patio</div>
    <img class="v-bondi" src="assets/patio/bondi.webp" alt="Ilustración del patio de Fortunella con el bondi y las luces">
    <div class="v-facts">Masa madre <span>✦</span> Horno de barro <span>✦</span> Ingredientes frescos</div>
  </header>

  <!-- ─── NAVEGACIÓN POR SECCIONES (la arma js al cargar el menú) ─── -->
  <nav class="v-nav" id="v-nav" aria-label="Secciones de la carta"></nav>

'''
start = s.index("  <!-- ─── HEADER ─── -->")
end = s.index("  <!-- ─── MENÚ DINÁMICO")
s = s[:start] + head_new + s[end:]

s = s.replace("<title>Patio Fortunella — Carta</title>", "<title>Patio Fortunella — Verano</title>")
s = s.replace('<body data-menu="patio">', '<body data-menu="patio" class="verano">')
s = s.replace('<div class="footer-tagline">Gracias por elegirnos</div>',
              '<div class="footer-tagline">Gracias por elegirnos</div>')

css = open(os.path.join(os.path.dirname(__file__), "verano.css"), encoding="utf-8").read()

# ── Ramitas de fondo en el pie: misma forma que las del logo, en azul más claro ──
from urllib.parse import quote
LEAF = ('<path d="M12 36 C11 28 10 18 13 3" stroke="{c}" stroke-width="1.3" fill="none" stroke-linecap="round"/>'
        '<path d="M12 31 C5 30 1 23 5 18 C8 23 10 28 12 31Z"/><path d="M12 31 C18 28 20 22 17 17 C14 22 13 27 12 31Z"/>'
        '<path d="M12 23 C5 21 2 14 6 10 C9 15 11 20 12 23Z"/><path d="M12 23 C18 20 21 14 17 10 C14 15 13 20 12 23Z"/>'
        '<path d="M13 15 C7 13 5 7 9 4 C11 8 12 12 13 15Z"/><path d="M13 15 C18 12 19 6 16 4 C13 8 13 12 13 15Z"/>'
        '<path d="M13 5 C10 2 11 0 13 0 C15 0 15 2 13 5Z"/>')
def leaf_uri(rot, color="#22397C", flip=False):
    # lienzo cuadrado para que la rotación no recorte la ramita
    t = f'translate(19 19) rotate({rot}) {"scale(-1 1) " if flip else ""}translate(-12 -19)'
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38" fill="{color}">'
           f'<g transform="{t}">{LEAF.format(c=color)}</g></svg>')
    return 'url("data:image/svg+xml,' + quote(svg) + '")'
# (x, y, tamaño px, rotación, espejada)
SPRIGS = [("2%", "88%", 120, -28, False), ("13%", "8%", 54, 24, True), ("27%", "100%", 70, -62, False),
          ("41%", "4%", 40, 38, True), ("58%", "96%", 48, -20, False), ("71%", "10%", 64, 30, True),
          ("86%", "100%", 82, 52, False), ("99%", "6%", 116, 160, True)]
layers = ",\n    ".join(f"{leaf_uri(r, flip=f)} {x} {y} / {sz}px {sz}px no-repeat" for x, y, sz, r, f in SPRIGS)
css += f"""
/* Pie: ramitas de fondo (detrás del texto) */
.verano .bottom-block::after {{
  content: "";
  position: absolute; inset: 0;
  background:
    {layers};
  pointer-events: none;
  z-index: 0;
}}
.verano .bottom-block > * {{ position: relative; z-index: 1; }}
@media (max-width: 768px) {{
  .verano .bottom-block::after {{ background-size: 60px 60px; opacity: .9; }}
}}
"""
js = open(os.path.join(os.path.dirname(__file__), "verano.js"), encoding="utf-8").read()
s = s.replace("</style>", css + "\n</style>", 1)
s = s.replace('  <script type="module" src="js/menu.js"></script>',
              '  <script type="module">\n' + js + '\n  </script>\n  <script type="module" src="js/menu.js"></script>')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(root, "_preview-patio.html")  # vista previa local (no se sube)
open(out, "w", encoding="utf-8").write(s)
print("ok", len(s)//1024, "KB")
