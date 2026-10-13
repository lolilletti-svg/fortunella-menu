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
