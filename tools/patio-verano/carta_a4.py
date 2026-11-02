# Carta Patio para imprimir: frente y dorso (oficio por defecto, o A4), con los datos actuales de Supabase.
# Uso (desde la raíz del proyecto): python3 tools/patio-verano/carta_a4.py [salida.html]
# Lo llama tools/patio-verano/pdf-a4.sh, que después lo pasa a PDF con Chrome.
#
# Sistema de diseño (mismo en las dos carillas):
#   1. Título principal  — solo en el frente (Patio / Fortunella).
#   2. Sección           — ilustración centrada arriba (siempre el mismo alto) + título con pincelada.
#   3. Subsección        — título manuscrito naranja + bajada, con una línea debajo.
#   4. Producto          — nombre · puntos · precio(s) en columnas fijas; descripción debajo.
#   Grilla de 2 columnas iguales y mismos márgenes en frente y dorso.
#   Mismo orden que la carta: Frente: título, Entraditas | Sandwichería, Empanadas, Pizzas (1er grupo).
#   Dorso: resto de las pizzas, Papas | Ensaladas, Kids | Dulce, Bebidas, pie.
import html, json, math, os, re, subprocess, sys

# Tamaño de hoja (mm) y escala de letra. Oficio argentino = 216 × 340: más alto que A4 → letra más grande.
PAPERS = {"oficio": (216, 340, 1.28), "a4": (210, 297, 1.0)}
PAPER = os.environ.get("PAPEL", "oficio").lower()
PAGE_W, PAGE_H, FONT_SCALE = PAPERS[PAPER]

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "_carta-a4.html")

# ── Datos ──────────────────────────────────────────────────────────────
cfg = open(os.path.join(ROOT, "js", "config.js"), encoding="utf-8").read()
url = re.search(r'SUPABASE_URL = "([^"]+)"', cfg).group(1)
key = re.search(r'SUPABASE_ANON_KEY = "([^"]+)"', cfg).group(1)
# curl y no urllib: el Python de python.org en Mac no trae certificados SSL
modules = json.loads(subprocess.run(
    ["curl", "-sf", "--max-time", "30", f"{url}/rest/v1/modules?select=*,items(*)&menu=eq.patio&order=position",
     "-H", f"apikey: {key}", "-H", f"Authorization: Bearer {key}"],
    capture_output=True, check=True).stdout)
for m in modules:
    m["items"].sort(key=lambda i: i["position"])

used = set()
def mod(pattern):
    m = next((m for m in modules if re.search(pattern, m["name"], re.I)), None)
    if m:
        used.add(m["id"])
    return m

e = html.escape
# Impresa sin precios: solo el "$" para completar a mano (así no hay que reimprimir cuando cambian).
# Para imprimirla con precios, poner SHOW_PRICES = True.
SHOW_PRICES = False
nf = lambda v: "$" + f"{v:,}".replace(",", ".") if SHOW_PRICES else "$"
NONE = "—" if SHOW_PRICES else "$"   # sin precios: también donde no hay ese tamaño va el $, para completar a mano
SIZE = re.compile(r"\s+(\d+(?:[.,]\d+)?\s*(?:ml|cc|l))$", re.I)

def short_desc(d):
    # Igual que en la web: la base (salsa, muzzarella, tomates asados y aceitunas) ya la dice el subtítulo
    if not d:
        return ""
    s = d.strip()
    s = re.sub(r"^salsa,\s*", "", s, flags=re.I)
    s = re.sub(r"^muzz?arr?ella,\s*", "", s, flags=re.I)
    s = re.sub(r",?\s*tomates asados y (aceitunas (?:negras|verdes))$", r" · \1", s, flags=re.I)
    s = re.sub(r",?\s*tomates asados y aceitunas$", "", s, flags=re.I)
    s = re.sub(r"^\s*·\s*", "", s).strip()
    return s[:1].upper() + s[1:] if s else ""

# ── Piezas ─────────────────────────────────────────────────────────────
CITRUS = ('<svg class="orn" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#CC3300"/>'
          '<circle cx="14" cy="14" r="10" fill="#FBF7EE"/><g stroke="#CC3300" stroke-width="1.3" stroke-linecap="round" opacity=".75">'
          '<path d="M14 5v18M5 14h18M7.6 7.6l12.8 12.8M20.4 7.6 7.6 20.4"/></g><circle cx="14" cy="14" r="1.6" fill="#CC3300"/></svg>')

ART_AREA = 120 * min(FONT_SCALE, 1.2) ** 2  # mm²: todas las ilustraciones de sección ocupan la misma superficie (se ven del mismo tamaño)
def art_img(name):
    path = os.path.join(ROOT, "assets", "patio", f"{name}.webp")
    out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", path], capture_output=True, text=True).stdout
    w, h = (int(re.search(rf"{k}: (\d+)", out).group(1)) for k in ("pixelWidth", "pixelHeight"))
    hh = math.sqrt(ART_AREA * h / w)
    return f'<img src="assets/patio/{name}.webp" alt="" style="height:{hh:.1f}mm; width:{hh * w / h:.1f}mm">'

def sec_head(name, sub=None, arts=()):
    """Nivel 2. Siempre el mismo hueco para la ilustración; sin ilustración va el gajo de naranja."""
    imgs = "".join(art_img(a) for a in arts) or CITRUS
    s = f'<div class="sec-sub">{e(sub)}</div>' if sub else ""
    return f'<header class="sec-head"><div class="art">{imgs}</div><h2>{e(name)}</h2>{s}</header>'

def sub_head(name, tag=""):
    """Nivel 3."""
    t = f'<span class="tag">{e(tag)}</span>' if tag else ""
    return f'<div class="sub-head"><span class="st">{e(name)}</span>{t}</div>'

def colhead(labels):
    cells = "".join(f'<span class="pc">{e(l)}</span>' for l in labels)
    return f'<div class="row colhead"><span class="n"></span>{cells}</div>' if labels else ""

def item(name, prices, desc="", note=""):
    """Nivel 4. prices: lista ya formateada, una por columna."""
    if note and not SHOW_PRICES:
        note = re.sub(r"\$\s*[\d.,]+", "$", note)  # "+ alioli $600" → "+ alioli $"
    nt = f' <small>{e(note)}</small>' if note else ""
    cells = "".join(f'<span class="pc p">{p}</span>' for p in prices)
    d = f'<div class="d">{e(desc)}</div>' if desc else ""
    return f'<div class="it"><div class="row"><span class="n">{e(name)}{nt}</span><span class="dots"></span>{cells}</div>{d}</div>'

def halves(lst):
    k = math.ceil(len(lst) / 2)
    return lst[:k], lst[k:]

def simple_items(m, desc_fn=lambda d: d or ""):
    return [item(it["name"], [" · ".join(nf(p["value"]) for p in it["prices"])], desc_fn(it.get("description")), it.get("note") or "")
            for it in m["items"]]

def section_simple(m, art=None):
    if not m:
        return ""
    return (f'<section class="sec">{sec_head(m["name"], m.get("subtitle"), [art] if art else [])}'
            f'{"".join(simple_items(m))}</section>')

# ── Pizzas (subsecciones a 2 columnas; los primeros grupos cierran el frente, el resto abre el dorso) ──
PZ_FRONT = 1
pz = mod(r"pizza")
TAG = {"Clásicas": "Las de siempre", "Clásicas reversionadas": "Con una vuelta de tuerca", "Especiales": "Las joyas de la casa"}
groups = {}
for it in pz["items"]:
    groups.setdefault(it.get("subgroup") or "Clásicas", []).append(it)

def pizza_item(it):
    pr = {(p.get("label") or "").upper(): p["value"] for p in it["prices"]}
    d = short_desc(it.get("description"))
    if d.lower() == it["name"].lower():
        d = ""
    return item(it["name"], [nf(pr[k]) if k in pr else NONE for k in ("CHICA", "GRANDE")], d, it.get("note") or "")

def pz_sub(g, items):
    a, b = halves([pizza_item(i) for i in items])
    ch = colhead(["Chica", "Grande"])
    return (f'<div class="sub">{sub_head(g, TAG.get(g, ""))}'
            f'<div class="two"><div>{ch}{"".join(a)}</div><div>{ch if b else ""}{"".join(b)}</div></div></div>')

pz_subs = [pz_sub(g, items) for g, items in groups.items()]
pz_front = f'<section class="sec">{sec_head(pz["name"], pz.get("subtitle"), ["pizza"])}{"".join(pz_subs[:PZ_FRONT])}</section>'
# la continuación no es una sección nueva: mismo título, sin repetir la ilustración
pz_back = (f'<section class="sec cont">{sec_head(pz["name"], "Continuación", ["pizza"])}{"".join(pz_subs[PZ_FRONT:])}</section>'
           if len(pz_subs) > PZ_FRONT else "")

emp = mod(r"empanad")
emp_html = ""
if emp:
    labels = {(p.get("label") or "").upper() for it in emp["items"] for p in it["prices"]}
    sub = " · ".join(x for x in (emp.get("subtitle"), "Precio por unidad" if labels == {"UNID."} else "") if x)
    a, b = halves([item(it["name"], [nf(it["prices"][0]["value"])]) for it in emp["items"]])
    emp_html = (f'<section class="sec">{sec_head(emp["name"], sub, ["empanada-dorada"])}'
                f'<div class="two"><div>{"".join(a)}</div><div>{"".join(b)}</div></div></section>')

# ── Secciones de a pares (mismo alto de título en cada fila) ──────────
ART = {"entrad": "croquetas", "sandwich|focac": "focaccia", "papa": "papas-fritas", "ensalad": "caesar-bowl",
       "kids|niñ": "menu-kids-milanesa", "dulce|postre": "tiramisu"}
def art_for(m):
    return next((a for p, a in ART.items() if re.search(p, m["name"], re.I)), None)

def pair_rows(rows):
    return "".join(
        f'<div class="two row-sec"><div>{section_simple(l, art_for(l)) if l else ""}</div>'
        f'<div>{section_simple(r, art_for(r)) if r else ""}</div></div>'
        for l, r in rows)

front_rows = pair_rows([[mod(r"entrad"), mod(r"sandwich|focac")]])
beb_sin, beb_con = mod(r"sin alcohol"), mod(r"con alcohol")
back_list = [mod(r"papa"), mod(r"ensalad"), mod(r"kids|niñ"), mod(r"dulce|postre")]
back_list = [m for m in back_list if m] + [m for m in modules if m["id"] not in used]  # + secciones nuevas
back_rows = pair_rows([back_list[i:i + 2] + [None] * (2 - len(back_list[i:i + 2])) for i in range(0, len(back_list), 2)])

# ── Bebidas: una sección, subsecciones repartidas en 2 columnas ──────
def drink_blocks(m):
    if not m:
        return []
    by = {}
    for it in m["items"]:
        by.setdefault(it.get("subgroup") or m["name"], []).append(it)
    out = []
    for sg, its in by.items():
        sized, plain = [], []
        for it in its:
            mt = SIZE.search(it["name"])
            v = it["prices"][0]["value"] if it["prices"] else None
            (sized if mt else plain).append(
                (SIZE.sub("", it["name"]).strip(), mt.group(1).replace(" ", "") if mt else "", v))
        body, n = "", 0
        if sized:
            ml = lambda t: float(t.lower().rstrip("ml").replace(",", ".")) * (1 if t.lower().endswith("ml") else 1000)
            sizes = sorted(dict.fromkeys(s for _, s, _ in sized), key=ml)  # columnas de menor a mayor
            bases = list(dict.fromkeys(b for b, _, _ in sized))
            body += colhead([re.sub(r"(\d)(ml|cc|l)$", r"\1 \2", s, flags=re.I).upper() for s in sizes])
            for b in bases:
                vals = [next((v for bb, ss, v in sized if bb == b and ss == s), None) for s in sizes]
                body += item(b, [nf(v) if v is not None else NONE for v in vals])
            n += len(bases) + 1
        for name, _, v in plain:
            body += item(name, [nf(v) if v is not None else ""])
            n += 1
        out.append((n + 2, f'<div class="sub">{sub_head(sg[:1].upper() + sg[1:].lower())}{body}</div>'))
    return out

# Sin alcohol encabeza la izquierda y la primera de con alcohol (Porrones) la derecha;
# el resto va, de mayor a menor, a la columna más corta → columnas parejas
sin, con = drink_blocks(beb_sin), drink_blocks(beb_con)
first = (sin[:1] or con[:1]) + (con[:1] if sin else con[1:2])
rest = sorted([b for b in sin + con if b not in first], key=lambda b: -b[0])
cols = ([first[0][1]] if first else [], [first[1][1]] if len(first) > 1 else [])
h = [first[0][0] if first else 0, first[1][0] if len(first) > 1 else 0]
for n, b in rest:
    i = 0 if h[0] <= h[1] else 1
    cols[i].append(b); h[i] += n
drinks_html = (f'<section class="sec drinks">{sec_head("Bebidas", None, ["cola", "aperol"])}'
               f'<div class="two"><div>{"".join(cols[0])}</div><div>{"".join(cols[1])}</div></div></section>')

# Ondas de los costados: un solo trazo vectorial de punta a punta (como fondo repetido, Chrome lo
# guarda en el PDF como imagen de baja resolución y se ve borroso). Mismo dibujo que la web, en mm.
def wave_svg(side):
    w, per, n = 3.6, 9.8, math.ceil(PAGE_H / 9.8)
    xo, xi = (2.62, -0.65) if side == "l" else (3.6 - 2.62, 3.6 + 0.65)   # derecho = espejo del izquierdo
    d = f"M{xo} 0" + "".join(f" Q{xi} {per * k + per / 4:.3f} {xo} {per * k + per / 2:.3f}"
                              f" Q{xi} {per * k + 3 * per / 4:.3f} {xo} {per * (k + 1):.3f}" for k in range(n))
    return (f'<svg class="wave {side}" viewBox="0 0 {w} {PAGE_H}" preserveAspectRatio="none">'
            f'<path d="{d}" fill="none" stroke="#0F2560" stroke-width=".245" stroke-opacity=".45"/></svg>')
WAVES = wave_svg("l") + wave_svg("r")
# Festón del pie: semicírculos de 4 mm de punta a punta (vectorial, mismo motivo que la web)
SCALLOPS = (f'<svg class="scallops" viewBox="0 0 {PAGE_W} 2.2" preserveAspectRatio="none"><path fill="#0F2560" d="M0 2.2'
            + "".join(f" A1.95 1.95 0 0 1 {4 * k + 4:.2f} 2.2" for k in range(math.ceil(PAGE_W / 4))) + ' V2.4 H0 Z"/></svg>')

# Logo con ramitas (mismo marcado que la web)
base = open(os.path.join(os.path.dirname(__file__), "base-patio.html"), encoding="utf-8").read()
hero_name = next(l for l in base.splitlines() if 'class="hero-name"' in l)
leaf_l = re.search(r'<svg class="hero-leaf-svg left".*?</svg>', hero_name).group(0)
leaf_r = re.search(r'<svg class="hero-leaf-svg right".*?</svg>', hero_name).group(0)

page = f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Patio Fortunella — Carta {PAPER}</title>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Bebas+Neue&family=Barlow:wght@400;500&family=Barlow+Condensed:wght@500;600;700&family=Caveat:wght@700&display=swap" rel="stylesheet">
<style>
@page {{ size: {PAGE_W}mm {PAGE_H}mm; margin: 0; }}
:root {{
  --blue:#0F2560; --orange:#CC3300; --cream:#F5F0E6; --paper:#FBF7EE; --sun:#F3C66B;
  --line:rgba(15,37,96,.25);
  --gut:11mm;          /* separación entre columnas */
  --pw:{11 if SHOW_PRICES else 15}mm;           /* ancho de cada columna de precio (sin precios: lugar para escribirlos a mano) */
  --art:11mm;          /* alto del hueco de la ilustración de sección */
}}
* {{ box-sizing:border-box; margin:0; padding:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
html, body {{ background:#888; }}
body {{ font-family:'Barlow',sans-serif; color:var(--blue); }}
@media print {{ html, body {{ background:none; }} .sheet {{ margin:0 !important; }} }}

/* La carta va de borde a borde de la hoja */
.sheet {{ width:{PAGE_W}mm; height:{PAGE_H}mm; margin:0 auto 10mm; break-after:page; overflow:hidden; }}
.card {{ height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column;
  background: var(--cream); }}   /* fondo parejo: los lavados de acuarela de la web en papel se ven como manchas */
/* Bordes ondulados a los costados, como en la carta web: trazo vectorial continuo (ver WAVES) */
.wave {{ position:absolute; top:0; width:3.6mm; height:{PAGE_H}mm; z-index:1; pointer-events:none; }}
.wave.l {{ left:2.5mm; }} .wave.r {{ right:2.5mm; }}
.content {{ flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:0 12mm; }}

/* 1 · Título principal: toldo, guirnalda, logo, micro */
/* toldo: se recorta arriba (rayas) y se conserva el festón de abajo, sin deformar */
.awning {{ display:block; width:100%; height:17mm; object-fit:cover; object-position:bottom; position:relative; z-index:2; }}
.lights {{ display:flex; margin-top:-3.3mm; position:relative; z-index:3; }}   /* 4 copias enteras de punta a punta */
.lights img {{ display:block; width:{PAGE_W / 4}mm; height:auto; }}
.hero {{ text-align:center; padding-top:1mm; }}
.patio {{ font-family:'Caveat',cursive; font-weight:700; font-size:34pt; color:var(--orange); line-height:.8;
  display:inline-block; transform:rotate(-5deg); text-shadow:1.2px 1.2px 0 rgba(243,198,107,.65); }}
.fortu {{ font-family:'Great Vibes',cursive; font-size:38pt; line-height:.9; margin-top:-1mm; display:flex; align-items:center; justify-content:center; gap:2.5mm; }}
.fortu svg {{ width:4.6mm; height:7.4mm; }}
.tagline {{ font-family:'Bebas Neue',sans-serif; font-size:6.5pt; letter-spacing:.4em; margin-top:1mm; }}
.bondi {{ display:block; width:80mm; height:auto; margin:1mm auto 0; }}

/* 2 · Sección */
.sec-head {{ text-align:center; margin-bottom:2mm; }}
/* hueco fijo y dibujos apoyados abajo → los títulos de una misma fila quedan a la misma altura */
.sec-head .art {{ height:var(--art); display:flex; justify-content:center; align-items:flex-end; gap:3mm; margin-bottom:.8mm; }}
.drinks .sec-head .art {{ height:auto; }}   /* vasos altos: el hueco se adapta (Bebidas va sola en su fila) */
.sec-head .orn {{ width:5mm; height:5mm; align-self:center; }}
.sec-head h2 {{ font-family:'Bebas Neue',sans-serif; font-weight:400; font-size:12.5pt; letter-spacing:.1em; line-height:1;
  display:inline-block; padding:0 1mm 1.2mm;
  background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 12'%3E%3Cpath d='M3 7 C40 2 78 10 118 5 S168 9 197 4' fill='none' stroke='%23CC3300' stroke-width='3.6' stroke-linecap='round' opacity='.85'/%3E%3C/svg%3E") center bottom / 80% 1.8mm no-repeat; }}
.sec-sub {{ font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:5.4pt; letter-spacing:.14em; text-transform:uppercase; opacity:.6; margin-top:.8mm; }}

/* 3 · Subsección */
.sub {{ margin-top:2mm; }}
.sub:first-child {{ margin-top:0; }}
.sub-head {{ display:flex; align-items:baseline; gap:2mm; border-bottom:.8px solid var(--blue); padding-bottom:.4mm; margin-bottom:.5mm; }}
.sub-head .st {{ font-family:'Caveat',cursive; font-weight:700; font-size:10.5pt; color:var(--orange); line-height:1; }}
.sub-head .tag {{ font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:5.4pt; letter-spacing:.14em; text-transform:uppercase; opacity:.58; }}

/* 4 · Producto */
.two {{ display:grid; grid-template-columns:1fr 1fr; column-gap:var(--gut); }}
.it {{ padding:.5mm 0; break-inside:avoid; }}
.row {{ display:flex; align-items:baseline; gap:1.1mm; }}
.n {{ flex:0 1 auto; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:7.3pt; text-transform:uppercase; letter-spacing:.02em; line-height:1.15; }}
.n small {{ font-weight:500; font-size:5.8pt; text-transform:none; opacity:.7; letter-spacing:0; }}
.dots {{ flex:1 1 auto; min-width:3mm; border-bottom:.7px dotted rgba(15,37,96,.35); transform:translateY(-.8mm); }}
.pc {{ flex:none; width:var(--pw); text-align:right; font-family:'Barlow Condensed',sans-serif; white-space:nowrap; }}
.p {{ font-weight:700; font-size:7.3pt; color:var(--orange); }}
{'' if SHOW_PRICES else '.pc.p, .colhead .pc { text-align:left; padding-left:2mm; }   /* $ y encabezados a la izquierda: queda lugar para escribir el número */'}
.colhead {{ padding:.1mm 0 0; }}
.colhead .n {{ flex:1; }}
.colhead .pc {{ font-weight:600; font-size:5pt; letter-spacing:.12em; text-transform:uppercase; opacity:.55; }}
.d {{ font-size:5.7pt; line-height:1.2; opacity:.72; margin-top:.2mm; padding-right:calc(var(--pw) + 4mm); }}
.sub .two .d, .sec .two .d {{ padding-right:calc(2 * var(--pw) + 3mm); }}

/* Dorso */
.row-sec > div {{ display:flex; flex-direction:column; }}
.cont .sec-head .art {{ display:none; }}
.row-sec + .row-sec {{ margin-top:2.5mm; }}
.cont + .row-sec {{ margin-top:7mm; }}   /* aire entre las pizzas del dorso y Papas fritas | Ensaladas */
.drinks {{ margin-top:5mm; }}   /* separa Bebidas de Dulce Fortunella */
.drinks .pc {{ width:calc(var(--pw) * .82); }}   /* 4 tamaños en Sin alcohol: que los nombres no se partan */
.drinks .it {{ padding:.78mm 0; }}
.drinks .sub {{ margin-top:4mm; }}
.drinks .sub:first-child {{ margin-top:0; }}
.drinks .colhead {{ padding-bottom:.4mm; }}

/* Pie (de borde a borde, con festón, como en la web) */
.foot {{ background:var(--blue); color:var(--cream); text-align:center; padding:1.5mm 12mm 1.7mm; position:relative; z-index:2; }}
.foot .scallops {{ position:absolute; left:0; bottom:calc(100% - .2mm); width:100%; height:2.2mm; display:block; }}
.foot .thanks {{ font-family:'Caveat',cursive; font-weight:700; font-size:11.5pt; color:var(--orange); line-height:1; }}
.foot .info {{ font-family:'Barlow Condensed',sans-serif; font-size:5.3pt; letter-spacing:.14em; opacity:.6; margin-top:.4mm; }}
</style></head>
<body>

<!-- ══ FRENTE ══ -->
<div class="sheet front"><div class="card">{WAVES}
  <img class="awning" src="assets/patio/techito.webp" alt="">
  <div class="lights"><img src="assets/patio/guirnalda.webp" alt=""><img src="assets/patio/guirnalda.webp" alt=""><img src="assets/patio/guirnalda.webp" alt=""><img src="assets/patio/guirnalda.webp" alt=""></div>
  <div class="content" style="padding-bottom:9mm">
    <header class="hero">
      <div class="patio">Patio</div>
      <div class="fortu">{leaf_l}Fortunella{leaf_r}</div>
      <div class="tagline">Un manjar en el patio</div>
      <img class="bondi" src="assets/patio/bondi.webp" alt="">
    </header>
    {front_rows}
    {emp_html}
    {pz_front}
  </div>
</div></div>

<!-- ══ DORSO ══ -->
<div class="sheet"><div class="card">{WAVES}
  <div class="content" style="padding-top:5mm; padding-bottom:5mm">
    {pz_back}
    {back_rows}
    {drinks_html}
  </div>
  <footer class="foot">{SCALLOPS}
    <div class="thanks">Gracias por confiar en nosotros</div>
    <div class="info">@fortunella.pizzas · La Rioja, Argentina</div>
  </footer>
</div></div>
</body></html>"""

# Letra proporcional a la hoja: escala todos los tamaños en pt de los estilos
head, rest = page.split("</style>", 1)
head = re.sub(r"(\d+(?:\.\d+)?)pt", lambda m: f"{float(m.group(1)) * FONT_SCALE:.2f}pt", head)
page = head + "</style>" + rest

open(OUT, "w", encoding="utf-8").write(page)
print(OUT)
