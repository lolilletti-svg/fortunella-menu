// Render puro del menú Fortunella (sin dependencias externas).
// Reproduce el markup y las clases CSS del diseño original a partir de los datos.
// Usado por menu.js (menú público) y admin.js (preview en vivo). Testeable headless con jsdom.

const nf = new Intl.NumberFormat("es-AR");

function el(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function money(value) {
  return "$" + nf.format(value);
}

// "CHICA $7.000 · GRANDE $13.000" | "$75.000" | "GRANDE $19.500"
export function formatPrices(prices) {
  if (!prices || !prices.length) return "";
  return prices
    .map((p) => (p.label ? `${p.label} ${money(p.value)}` : money(p.value)))
    .join(" · ");
}

// Nombre + suplemento inline (ej. "Un Viaje de Papas  + alioli $600")
function nameNode(doc, tag, className, name, note) {
  const node = el(doc, tag, className, name);
  if (note) {
    node.appendChild(doc.createTextNode(" "));
    const span = el(doc, "span", null, note);
    span.style.cssText =
      "font-size:8px;opacity:0.60;font-family:'Barlow Condensed',sans-serif;font-weight:400;";
    node.appendChild(span);
  }
  return node;
}

// Agrupa items por subgroup preservando el orden de aparición.
function groupBySubgroup(items) {
  const groups = [];
  const index = new Map();
  for (const it of items) {
    const key = it.subgroup || "";
    if (!index.has(key)) {
      index.set(key, { subgroup: it.subgroup || null, items: [] });
      groups.push(index.get(key));
    }
    index.get(key).items.push(it);
  }
  return groups;
}

function renderHeader(doc, section, mod) {
  if (mod.title_variant === "valientes") {
    const h = el(doc, "div", "valientes-header");
    h.appendChild(el(doc, "div", "valientes-title", mod.name));
    if (mod.subtitle) h.appendChild(el(doc, "div", "valientes-sub", mod.subtitle));
    section.appendChild(h);
    return;
  }
  const cls = "sec-title" + (mod.title_variant === "orange" ? " orange" : "");
  section.appendChild(el(doc, "span", cls, mod.name));
  if (mod.subtitle) section.appendChild(el(doc, "div", "sec-sub", mod.subtitle));
}

function renderPizzaGrid(doc, section, mod) {
  const grid = el(doc, "div", "pizza-grid");
  const normales = mod.items.filter((i) => !i.featured);
  const destacados = mod.items.filter((i) => i.featured);

  for (const it of normales) {
    const item = el(doc, "div", "pizza-item");
    item.appendChild(nameNode(doc, "p", "pizza-name", it.name, it.note));
    if (it.description) item.appendChild(el(doc, "p", "pizza-desc", it.description));
    item.appendChild(el(doc, "div", "pizza-prices", formatPrices(it.prices)));
    grid.appendChild(item);
  }

  // Relleno para que el/los destacados arranquen en fila completa (grid de 2 col).
  if (destacados.length && normales.length % 2 === 1) {
    const filler = el(doc, "div", "pizza-item");
    filler.style.background = "var(--cream)";
    grid.appendChild(filler);
  }

  for (const it of destacados) {
    const box = el(doc, "div", "box-degu");
    box.appendChild(el(doc, "div", "box-degu-title", `✦ ${it.name} ✦`));
    if (it.description) box.appendChild(el(doc, "div", "box-degu-body", it.description));
    box.appendChild(el(doc, "div", "box-degu-price", formatPrices(it.prices)));
    grid.appendChild(box);
  }
  section.appendChild(grid);
}

function renderList(doc, section, mod) {
  const groups = groupBySubgroup(mod.items);
  const hasSubgroups = groups.some((g) => g.subgroup);

  for (const g of groups) {
    if (g.subgroup) section.appendChild(el(doc, "div", "foc-sub-title", g.subgroup));
    const list = el(doc, "div", "items-list");
    if (hasSubgroups) list.style.borderTop = "none";
    for (const it of g.items) {
      const row = el(doc, "div", "list-item");
      const left = el(doc, "div", "item-left");
      left.appendChild(nameNode(doc, "p", "item-name", it.name, it.note));
      if (it.description) left.appendChild(el(doc, "p", "item-desc", it.description));
      row.appendChild(left);
      row.appendChild(el(doc, "span", "item-price", formatPrices(it.prices)));
      list.appendChild(row);
    }
    section.appendChild(list);
  }
}

function renderEmpTable(doc, section, mod) {
  const table = el(doc, "table", "emp-table");
  const labels = (mod.items[0]?.prices || []).map((p) => p.label);

  const thead = el(doc, "thead");
  const trh = el(doc, "tr");
  trh.appendChild(el(doc, "th"));
  for (const lbl of labels) trh.appendChild(el(doc, "th", null, lbl));
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = el(doc, "tbody");
  for (const it of mod.items) {
    const tr = el(doc, "tr");
    tr.appendChild(el(doc, "td", null, it.name));
    for (const p of it.prices) tr.appendChild(el(doc, "td", "emp-price", money(p.value)));
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  section.appendChild(table);
}

function renderPostreCards(doc, section, mod) {
  const row = el(doc, "div", "postres-row");
  for (const it of mod.items) {
    const card = el(doc, "div", "postre-card");
    card.appendChild(el(doc, "p", "postre-name", it.name));
    card.appendChild(el(doc, "p", "postre-price", formatPrices(it.prices)));
    row.appendChild(card);
  }
  section.appendChild(row);
}

function renderBebidasGrid(doc, section, mod) {
  const grid = el(doc, "div", "bebidas-grid");
  for (const g of groupBySubgroup(mod.items)) {
    const block = el(doc, "div", "bebida-block");
    if (g.subgroup) block.appendChild(el(doc, "p", "bebidas-group-title", g.subgroup));
    for (const it of g.items) {
      const r = el(doc, "div", "bebida-row");
      r.appendChild(el(doc, "span", "bebida-name", it.name));
      r.appendChild(el(doc, "span", "bebida-price", formatPrices(it.prices)));
      block.appendChild(r);
    }
    grid.appendChild(block);
  }
  section.appendChild(grid);
}

const RENDERERS = {
  "pizza-grid": renderPizzaGrid,
  list: renderList,
  "emp-table": renderEmpTable,
  "postre-cards": renderPostreCards,
  "bebidas-grid": renderBebidasGrid,
};

// Renderiza todos los módulos dentro de `root`. `doc` por defecto = document global.
export function renderMenu(root, modules, doc = (typeof document !== "undefined" ? document : null)) {
  if (!doc) throw new Error("renderMenu necesita un document");
  root.textContent = "";
  modules.forEach((mod, i) => {
    if (i > 0) root.appendChild(el(doc, "div", "asterisk-row", "✦ · ✦ · ✦"));
    const section = el(doc, "div", "section");
    renderHeader(doc, section, mod);
    const fn = RENDERERS[mod.layout_type];
    if (fn) fn(doc, section, mod);
    root.appendChild(section);
  });
}
