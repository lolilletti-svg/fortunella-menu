// Panel de administración del menú Fortunella.
// Login por contraseña (usuario único) + CRUD de módulos e ítems contra Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAIL, supabaseConfigured } from "./config.js";

const LAYOUTS = [
  ["pizza-grid", "Grilla de pizzas (2 col, con precios CHICA/GRANDE)"],
  ["list", "Lista (nombre + descripción + precio)"],
  ["emp-table", "Tabla (empanadas: varias columnas de precio)"],
  ["postre-cards", "Tarjetas (postres)"],
  ["bebidas-grid", "Grilla de bebidas (2 col, con subgrupos)"],
];
const VARIANTS = [
  ["default", "Título normal (azul)"],
  ["orange", "Título naranja"],
  ["valientes", "Encabezado especial (caja naranja)"],
];

let sb = null;
let modules = [];
let editing = null; // { moduleId, item|null }

const $ = (id) => document.getElementById(id);
const show = (id, on = true) => ($(id).style.display = on ? "" : "none");

// ─── Arranque ─────────────────────────────────────────────────────
if (!supabaseConfigured()) {
  show("config-view");
} else {
  sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  boot();
}

async function boot() {
  const { data } = await sb.auth.getSession();
  if (data.session) enterApp();
  else show("login-view");
}

// ─── Login / logout ───────────────────────────────────────────────
$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("login-msg");
  msg.className = "msg";
  msg.textContent = "Entrando…";
  const { error } = await sb.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: $("pw").value,
  });
  if (error) {
    msg.className = "msg err";
    msg.textContent = "Contraseña incorrecta.";
    return;
  }
  enterApp();
});

$("logout").addEventListener("click", async () => {
  await sb.auth.signOut();
  location.reload();
});

async function enterApp() {
  show("login-view", false);
  show("app-view");
  await loadModules();
}

// ─── Carga ────────────────────────────────────────────────────────
async function loadModules() {
  const { data, error } = await sb.from("modules").select("*, items(*)").order("position");
  if (error) return flash("Error al cargar: " + error.message, true);
  modules = (data || []).map((m) => ({
    ...m,
    items: (m.items || []).slice().sort((a, b) => a.position - b.position),
  }));
  renderModules();
}

function flash(text, err = false) {
  const m = $("global-msg");
  m.className = "msg " + (err ? "err" : "ok");
  m.textContent = text;
  if (!err) setTimeout(() => (m.textContent = ""), 2500);
}

// ─── Render del panel ─────────────────────────────────────────────
function renderModules() {
  const root = $("modules");
  root.textContent = "";
  modules.forEach((mod, mi) => {
    const card = document.createElement("div");
    card.className = "module" + (mod._open ? " open" : "");

    const head = document.createElement("div");
    head.className = "module-head";
    head.innerHTML = `<span class="name"></span><span class="count">${mod.items.length} ítems</span><span>${mod._open ? "▾" : "▸"}</span>`;
    head.querySelector(".name").textContent = mod.name;
    head.addEventListener("click", () => { mod._open = !mod._open; renderModules(); });
    card.appendChild(head);

    const body = document.createElement("div");
    body.className = "module-body";

    // Campos del módulo
    const fields = document.createElement("div");
    fields.className = "module-fields";
    fields.appendChild(field("Nombre", inputEl(mod.name, (v) => (mod.name = v)), true));
    fields.appendChild(field("Subtítulo (opcional)", inputEl(mod.subtitle || "", (v) => (mod.subtitle = v || null)), true));
    fields.appendChild(field("Tipo de diseño", selectEl(LAYOUTS, mod.layout_type, (v) => (mod.layout_type = v))));
    fields.appendChild(field("Estilo del título", selectEl(VARIANTS, mod.title_variant, (v) => (mod.title_variant = v))));
    body.appendChild(fields);

    const modActions = document.createElement("div");
    modActions.className = "toolbar";
    modActions.appendChild(btn("Guardar módulo", "orange sm", () => saveModule(mod)));
    modActions.appendChild(btn("↑", "ghost sm", () => moveModule(mi, -1), mi === 0));
    modActions.appendChild(btn("↓", "ghost sm", () => moveModule(mi, 1), mi === modules.length - 1));
    modActions.appendChild(btn("Borrar módulo", "danger sm", () => deleteModule(mod)));
    body.appendChild(modActions);

    // Ítems
    const itemsBox = document.createElement("div");
    itemsBox.style.marginTop = "10px";
    mod.items.forEach((it, ii) => {
      const row = document.createElement("div");
      row.className = "item";
      const move = document.createElement("div");
      move.className = "move";
      move.appendChild(btn("↑", "", () => moveItem(mod, ii, -1), ii === 0));
      move.appendChild(btn("↓", "", () => moveItem(mod, ii, 1), ii === mod.items.length - 1));
      row.appendChild(move);

      const info = document.createElement("div");
      info.className = "info";
      const nm = document.createElement("div"); nm.className = "iname"; nm.textContent = it.name + (it.featured ? "  ★" : "");
      const pr = document.createElement("div"); pr.className = "iprices"; pr.textContent = pricesText(it.prices);
      info.appendChild(nm); info.appendChild(pr);
      if (it.subgroup) { const sg = document.createElement("div"); sg.className = "isub"; sg.textContent = it.subgroup; info.appendChild(sg); }
      row.appendChild(info);
      row.appendChild(btn("Editar", "ghost sm", () => openItem(mod, it)));
      itemsBox.appendChild(row);
    });
    body.appendChild(itemsBox);

    const addItemBar = document.createElement("div");
    addItemBar.className = "toolbar";
    addItemBar.appendChild(btn("+ Agregar ítem", "sm", () => openItem(mod, null)));
    body.appendChild(addItemBar);

    card.appendChild(body);
    root.appendChild(card);
  });
}

// ─── Helpers de UI ────────────────────────────────────────────────
function field(labelText, control, full = false) {
  const wrap = document.createElement("div");
  if (full) wrap.className = "full";
  const l = document.createElement("label"); l.textContent = labelText;
  wrap.appendChild(l); wrap.appendChild(control);
  return wrap;
}
function inputEl(value, onChange) {
  const i = document.createElement("input"); i.value = value;
  i.addEventListener("input", () => onChange(i.value.trim()));
  return i;
}
function selectEl(options, value, onChange) {
  const s = document.createElement("select");
  for (const [val, label] of options) {
    const o = document.createElement("option"); o.value = val; o.textContent = label;
    if (val === value) o.selected = true;
    s.appendChild(o);
  }
  s.addEventListener("change", () => onChange(s.value));
  return s;
}
function btn(text, cls, onClick, disabled = false) {
  const b = document.createElement("button");
  if (cls) b.className = cls;
  b.textContent = text; b.disabled = disabled;
  b.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
  return b;
}
const nf = new Intl.NumberFormat("es-AR");
function pricesText(prices) {
  if (!prices || !prices.length) return "—";
  return prices.map((p) => (p.label ? `${p.label} $${nf.format(p.value)}` : `$${nf.format(p.value)}`)).join(" · ");
}

// ─── CRUD módulos ─────────────────────────────────────────────────
async function saveModule(mod) {
  const { error } = await sb.from("modules").update({
    name: mod.name, subtitle: mod.subtitle, layout_type: mod.layout_type, title_variant: mod.title_variant,
  }).eq("id", mod.id);
  error ? flash("Error: " + error.message, true) : flash("Módulo guardado.");
}

async function addModule() {
  const maxPos = modules.reduce((m, x) => Math.max(m, x.position), 0);
  const { error } = await sb.from("modules").insert({
    name: "Nuevo módulo", layout_type: "list", title_variant: "default", position: maxPos + 10,
  });
  error ? flash("Error: " + error.message, true) : (flash("Módulo creado."), loadModules());
}
$("add-module").addEventListener("click", addModule);

async function deleteModule(mod) {
  if (!confirm(`¿Borrar el módulo "${mod.name}" y todos sus ítems?`)) return;
  const { error } = await sb.from("modules").delete().eq("id", mod.id);
  error ? flash("Error: " + error.message, true) : (flash("Módulo borrado."), loadModules());
}

async function moveModule(index, dir) {
  const a = modules[index], b = modules[index + dir];
  if (!b) return;
  const pa = a.position, pb = b.position;
  await sb.from("modules").update({ position: pb }).eq("id", a.id);
  await sb.from("modules").update({ position: pa }).eq("id", b.id);
  loadModules();
}

// ─── CRUD ítems / modal ───────────────────────────────────────────
function openItem(mod, item) {
  editing = { mod, item };
  $("item-modal-title").textContent = item ? "Editar ítem" : "Nuevo ítem";
  $("f-name").value = item?.name || "";
  $("f-desc").value = item?.description || "";
  $("f-subgroup").value = item?.subgroup || "";
  $("f-note").value = item?.note || "";
  $("f-featured").checked = !!item?.featured;
  show("featured-wrap", mod.layout_type === "pizza-grid");
  $("item-delete").style.visibility = item ? "visible" : "hidden";

  // datalist de subgrupos existentes en el módulo
  const dl = $("subgroup-list"); dl.textContent = "";
  [...new Set(mod.items.map((i) => i.subgroup).filter(Boolean))].forEach((s) => {
    const o = document.createElement("option"); o.value = s; dl.appendChild(o);
  });

  renderPriceRows(item?.prices || [{ label: "", value: 0 }]);
  $("item-msg").textContent = "";
  $("item-overlay").classList.add("show");
}

function renderPriceRows(prices) {
  const box = $("prices"); box.textContent = "";
  prices.forEach((p) => box.appendChild(priceRow(p.label, p.value)));
}
function priceRow(label, value) {
  const row = document.createElement("div");
  row.className = "price-row";
  const lbl = document.createElement("input"); lbl.className = "lbl"; lbl.placeholder = "Etiqueta (ej. CHICA, vacío si única)"; lbl.value = label || "";
  const val = document.createElement("input"); val.className = "val"; val.type = "number"; val.placeholder = "Precio"; val.value = value ?? "";
  const del = document.createElement("button"); del.type = "button"; del.textContent = "✕";
  del.addEventListener("click", () => row.remove());
  row.append(lbl, val, del);
  return row;
}
$("add-price").addEventListener("click", () => $("prices").appendChild(priceRow("", "")));
$("item-cancel").addEventListener("click", () => $("item-overlay").classList.remove("show"));

$("item-save").addEventListener("click", async () => {
  const { mod, item } = editing;
  const prices = [...$("prices").querySelectorAll(".price-row")]
    .map((r) => ({ label: r.querySelector(".lbl").value.trim(), value: parseInt(r.querySelector(".val").value, 10) }))
    .filter((p) => !Number.isNaN(p.value));
  if (!$("f-name").value.trim()) return setItemMsg("Falta el nombre.", true);
  if (!prices.length) return setItemMsg("Agregá al menos un precio.", true);

  const payload = {
    module_id: mod.id,
    name: $("f-name").value.trim(),
    description: $("f-desc").value.trim() || null,
    subgroup: $("f-subgroup").value.trim() || null,
    note: $("f-note").value.trim() || null,
    featured: mod.layout_type === "pizza-grid" ? $("f-featured").checked : false,
    prices,
  };

  let error;
  if (item) {
    ({ error } = await sb.from("items").update(payload).eq("id", item.id));
  } else {
    const maxPos = mod.items.reduce((m, x) => Math.max(m, x.position), 0);
    ({ error } = await sb.from("items").insert({ ...payload, position: maxPos + 10 }));
  }
  if (error) return setItemMsg("Error: " + error.message, true);
  $("item-overlay").classList.remove("show");
  mod._open = true;
  flash("Ítem guardado.");
  loadModules();
});

$("item-delete").addEventListener("click", async () => {
  const { item } = editing;
  if (!item || !confirm(`¿Borrar "${item.name}"?`)) return;
  const { error } = await sb.from("items").delete().eq("id", item.id);
  if (error) return setItemMsg("Error: " + error.message, true);
  $("item-overlay").classList.remove("show");
  flash("Ítem borrado.");
  loadModules();
});

function setItemMsg(text, err) {
  const m = $("item-msg"); m.className = "msg " + (err ? "err" : "ok"); m.textContent = text;
}

async function moveItem(mod, index, dir) {
  const a = mod.items[index], b = mod.items[index + dir];
  if (!b) return;
  const pa = a.position, pb = b.position;
  await sb.from("items").update({ position: pb }).eq("id", a.id);
  await sb.from("items").update({ position: pa }).eq("id", b.id);
  mod._open = true;
  loadModules();
}
