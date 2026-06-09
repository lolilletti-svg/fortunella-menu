// Cargador del menú público Fortunella.
// Lee los datos desde Supabase; si no está configurado o falla, usa el fallback estático.
// El render lo hace js/render.js; el diseño (CSS, hero, banners, footer) vive en index.html.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfigured } from "./config.js";
import { renderMenu } from "./render.js";

const FALLBACK_URL = "data/menu-fallback.json";

async function loadData() {
  if (supabaseConfigured()) {
    try {
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await sb
        .from("modules")
        .select("*, items(*)")
        .order("position", { ascending: true });
      if (error) throw error;
      if (data && data.length) {
        return data.map((m) => ({
          ...m,
          items: (m.items || []).slice().sort((a, b) => a.position - b.position),
        }));
      }
    } catch (e) {
      console.warn("[menu] Supabase no respondió, uso fallback:", e.message);
    }
  }
  const res = await fetch(FALLBACK_URL, { cache: "no-cache" });
  return (await res.json()).modules;
}

(async function init() {
  const root = document.getElementById("menu-root");
  try {
    const modules = await loadData();
    renderMenu(root, modules);
  } catch (e) {
    console.error("[menu] Error fatal cargando el menú:", e);
    if (root) {
      root.textContent = "";
      const section = document.createElement("div");
      section.className = "section";
      section.innerHTML =
        '<span class="sec-title">Menú no disponible</span><div class="sec-sub">Volvé a intentar en unos segundos.</div>';
      root.appendChild(section);
    }
  }
})();
