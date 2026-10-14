    // Guirnalda: que entren copias ENTERAS de punta a punta, sin deformar el dibujo.
    // Calcula cuántas entran al tamaño buscado y escala todas por igual (alto y ancho).
    {
      const g = document.querySelector(".v-lights");
      const RATIO = 1100 / 192; // ancho/alto de guirnalda.webp
      const fit = () => {
        const w = g.clientWidth;
        if (!w) return;
        const target = window.innerWidth <= 768 ? 30 : 52; // alto deseado
        const n = Math.max(1, Math.round(w / (target * RATIO)));
        const cw = w / n;
        g.style.backgroundSize = `${cw}px ${cw / RATIO}px`;
        g.style.height = `${cw / RATIO}px`;
      };
      new ResizeObserver(fit).observe(g);
      fit();
    }

    // Decoración "verano": ilustración por sección + barra de navegación.
    // Se reconoce cada sección por su nombre, así si el dueño la renombra o agrega una nueva, no se rompe nada.
    const ART = [
      // [patrón del nombre, ilustración, etiqueta en la barra, clase extra]
      [/valiente/i, null, null],
      [/esper|empanad/i, "empanada-dorada", "Empanadas", "tilt-l"],
      [/sandwich|focac/i, "focaccia", "Sándwiches", "tilt-r"],
      [/pizza/i, "pizza", "Pizzas", ""],
      [/ensalad/i, "caesar-bowl", "Ensaladas", "tilt-l"],
      [/dulce|postre/i, "tiramisu", "Postres", "tilt-l"],
      [/bebida/i, "aperol", "Bebidas", "tall"],
    ];
    const slug = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const nf = new Intl.NumberFormat("es-AR");
    const SIZE = /\s+(\d+(?:[.,]\d+)?\s*(?:ml|cc|l))$/i;
    const money = (v) => "$" + nf.format(v);
    const el = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };

    function buildBebidas(items) {
      const wrap = el("div", "v-beb");
      const groups = new Map();
      for (const it of items) {
        const key = it.subgroup || "";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(it);
      }
      for (const [subgroup, list] of groups) {
        const sized = [], plain = [];
        for (const it of list) {
          const m = it.name.match(SIZE);
          const price = it.prices?.[0]?.value;
          if (m) sized.push({ base: it.name.replace(SIZE, "").trim(), size: m[1].replace(/\s+/g, ""), price });
          else plain.push({ name: it.name, price });
        }
        if (sized.length) {
          const sizes = [...new Set(sized.map((s) => s.size))];
          const bases = [...new Set(sized.map((s) => s.base))];
          const card = el("div", "v-beb-card");
          card.appendChild(el("p", "v-beb-title", subgroup ? `${subgroup}` : "Bebidas"));
          const t = el("table", "v-beb-table");
          const hr = el("tr");
          hr.appendChild(el("th"));
          sizes.forEach((s) => hr.appendChild(el("th", null, s.replace(/(\d)(ml|cc|l)$/i, "$1 $2").toUpperCase())));
          t.appendChild(el("thead")).appendChild(hr);
          const tb = t.appendChild(el("tbody"));
          for (const b of bases) {
            const tr = el("tr");
            tr.appendChild(el("td", "v-beb-name", b));
            for (const s of sizes) {
              const hit = sized.find((x) => x.base === b && x.size === s);
              tr.appendChild(el("td", "v-beb-price", hit && hit.price != null ? money(hit.price) : "—"));
            }
            tb.appendChild(tr);
          }
          card.appendChild(t);
          wrap.appendChild(card);
        }
        if (plain.length) {
          const card = el("div", "v-beb-card v-beb-side");
          card.appendChild(el("p", "v-beb-title", sized.length ? "Aguas y más" : subgroup || "Bebidas"));
          for (const p of plain) {
            const row = el("div", "v-beb-row");
            row.append(el("span", "v-beb-name", p.name), el("span", "v-beb-price", p.price != null ? money(p.price) : ""));
            card.appendChild(row);
          }
          wrap.appendChild(card);
        }
      }
      return wrap;
    }


    // ── Pizzas en subsecciones con mini banners ──────────────────────────
    // Si el ítem tiene "Subgrupo" cargado en el panel, se usa ese. Si no, este reparto propuesto.
    const PIZZA_GROUPS = [
      { title: "Clásicas", tagline: "Las de siempre", img: "pz-clasicas",
        names: ["Muzzarella", "Doble Muzzarella", "Margarita", "Fugazza", "Fugazza con Jamón", "Napolitana",
                "Napolitana con Jamón", "Capresse", "Calabresa", "Jamón y Morrón", "Especial", "4 Quesos",
                "Roquefort y Nuez", "Anchoas", "Cantimpalo", "Provolone", "Provolone con Jamón", "Ananás y Jamón",
                "Champiñones", "Palmitos", "Picante", "Porteña", "Jamón Crudo y Rúcula", "Panceta Ahumada"] },
      { title: "Clásicas reversionadas", tagline: "Con una vuelta de tuerca", img: "pz-reversionadas",
        names: ["Roquefort con Peras y Nuez", "Brócoli y Jamón", "Brócoli y Panceta", "Choclo Asado",
                "Choclo Asado y Queso Cremoso", "Ananás y Cerezas", "Veggie", "Popeye", "A Puro Huevo", "Un Viaje de Papas"] },
      { title: "Especiales", tagline: "Las joyas de la casa", img: "pz-especiales",
        names: ["Burrata y Mortadela", "Burrata y Jamón Crudo", "Carne", "Cherry Bocconcinos", "Chayera"] },
    ];
    const norm = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    // Deja solo lo distintivo: la base (salsa, muzzarella, tomates asados y aceitunas) ya la dice el subtítulo.
    function shortDesc(d) {
      if (!d) return "";
      let s = d.trim()
        .replace(/^salsa,\s*/i, "")
        .replace(/^muzz?arr?ella,\s*/i, "")
        .replace(/,?\s*tomates asados y aceitunas$/i, "")
        .replace(/,?\s*tomates asados y (aceitunas (?:negras|verdes))$/i, " · $1");
      s = s.replace(/^\s*·\s*/, "").trim();
      return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
    }

    function buildPizzas(sec, items) {
      const list = items.filter((i) => !i.featured);
      const groups = [];
      const byTitle = new Map();
      const ensure = (meta) => {
        if (!byTitle.has(meta.title)) { const g = { ...meta, items: [] }; byTitle.set(meta.title, g); groups.push(g); }
        return byTitle.get(meta.title);
      };
      PIZZA_GROUPS.forEach(ensure);
      for (const it of list) {
        let meta = null;
        if (it.subgroup) meta = PIZZA_GROUPS.find((g) => norm(g.title) === norm(it.subgroup)) || { title: it.subgroup, tagline: "", img: "pz-clasicas" };
        else meta = PIZZA_GROUPS.find((g) => g.names.some((n) => norm(n) === norm(it.name))) || PIZZA_GROUPS[0];
        ensure(meta).items.push(it);
      }
      const used = groups.filter((g) => g.items.length);

      const tabs = el("div", "v-pz-tabs");
      tabs.setAttribute("role", "tablist");
      const panels = [];
      used.forEach((g, gi) => {
        const b = el("button", "v-pz-tab");
        b.type = "button";
        b.setAttribute("role", "tab");
        const img = el("img"); img.src = `assets/patio/${g.img}.webp`; img.alt = ""; img.loading = "lazy";
        b.append(img, el("span", "v-pz-tab-title", g.title));
        if (g.tagline) b.appendChild(el("span", "v-pz-tab-tag", g.tagline));
        b.appendChild(el("span", "v-pz-tab-count", `${g.items.length} pizzas`));
        tabs.appendChild(b);

        const grid = el("div", "v-pz-grid");
        grid.setAttribute("role", "tabpanel");
        for (const it of g.items) {
          const card = el("div", "pizza-item v-pz-card");
          const nm = el("p", "pizza-name", it.name);
          if (it.note) nm.appendChild(el("span", "v-pz-note", " " + it.note));
          card.appendChild(nm);
          const d = shortDesc(it.description);
          if (d && norm(d) !== norm(it.name)) card.appendChild(el("p", "pizza-desc", d)); // no repetir "Calabresa / Calabresa"
          const pr = el("div", "v-pz-prices");
          for (const p of it.prices || []) {
            const row = el("span");
            if (p.label) row.appendChild(el("small", null, p.label.charAt(0) + p.label.slice(1).toLowerCase()));
            row.appendChild(document.createTextNode(money(p.value)));
            pr.appendChild(row);
          }
          card.appendChild(pr);
          grid.appendChild(card);
        }
        panels.push(grid);
        b.addEventListener("click", () => select(gi, true));
      });

      function select(i, scroll) {
        [...tabs.children].forEach((t, k) => { t.classList.toggle("active", k === i); t.setAttribute("aria-selected", k === i); });
        panels.forEach((p, k) => (p.hidden = k !== i));
        if (scroll && tabs.getBoundingClientRect().top < 70) tabs.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      const old = sec.querySelector(".pizza-grid");
      old.replaceWith(tabs);
      // orden: tabs, panel 0, panel 1...
      let ref = tabs; panels.forEach((p) => { ref.after(p); ref = p; });
      select(0, false);
    }

    document.addEventListener("menu:rendered", ({ detail }) => {
      const sections = [...document.querySelectorAll("#menu-root > .section")];
      const nav = document.getElementById("v-nav");
      nav.textContent = "";
      const watch = [];

      sections.forEach((sec, i) => {
        const mod = detail.modules[i];
        if (!mod) return;
        const rule = ART.find(([re]) => re.test(mod.name));
        if (rule && rule[1] === null) return; // "Solo para Valientes" va pegado a Sandwichería
        sec.id = "s-" + slug(mod.name);

        if (mod.layout_type === "pizza-grid" && sec.querySelector(".pizza-grid")) buildPizzas(sec, mod.items);

        // Bebidas: tabla bebida × tamaño (500ml, 1,5L…) + recuadro con las que no tienen tamaño
        const bebidas = sec.querySelector(".bebidas-grid");
        if (bebidas) bebidas.replaceWith(buildBebidas(mod.items));

        if (rule) {
          const fig = document.createElement("figure");
          fig.className = "v-art reveal " + (rule[3] || "");
          fig.setAttribute("aria-hidden", "true");
          const img = document.createElement("img");
          img.src = `assets/patio/${rule[1]}.webp`;
          img.alt = "";
          img.loading = "lazy";
          fig.appendChild(img);
          sec.prepend(fig);
          watch.push(fig);
        }

        const a = document.createElement("a");
        a.href = "#" + sec.id;
        a.textContent = rule ? rule[2] : mod.name;
        nav.appendChild(a);
      });

      // Aparición suave de las ilustraciones
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target)));
      }, { rootMargin: "0px 0px -10% 0px" });
      watch.forEach((el) => io.observe(el));

      // Marca en la barra la sección visible
      const links = [...nav.querySelectorAll("a")];
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((l) => {
            const on = l.hash === "#" + e.target.id;
            l.classList.toggle("active", on);
            if (on) nav.scrollTo({ left: l.offsetLeft - (nav.clientWidth - l.offsetWidth) / 2, behavior: "smooth" });
          });
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      links.forEach((l) => spy.observe(document.querySelector(l.hash)));
    });
