// Verifica que renderMenu(fallback) reproduce fielmente el markup del index.html ORIGINAL.
// Compara nombres, precios y estructura entre el HTML original (git HEAD) y el render dinámico.
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { renderMenu } from "../js/render.js";

function textsByClass(doc, cls) {
  return [...doc.querySelectorAll("." + cls)].map((n) => n.textContent.trim().replace(/\s+/g, " "));
}

// ─── Original (versión commiteada en HEAD) ───
const originalHtml = execSync("git show HEAD:index.html", { encoding: "utf-8", cwd: ".." });
const orig = new JSDOM(originalHtml).window.document;

// ─── Render dinámico desde el fallback ───
const fallback = JSON.parse(readFileSync("../data/menu-fallback.json", "utf-8"));
const dom = new JSDOM("<!DOCTYPE html><body><div id='root'></div></body>");
const doc = dom.window.document;
renderMenu(doc.getElementById("root"), fallback.modules, doc);

let fails = 0;
function check(label, a, b) {
  const eq = JSON.stringify(a) === JSON.stringify(b);
  if (!eq) {
    fails++;
    console.log(`\n❌ ${label}`);
    console.log("  original:", JSON.stringify(a));
    console.log("  render:  ", JSON.stringify(b));
  } else {
    console.log(`✅ ${label} (${a.length} elementos)`);
  }
}

// Clases que deben coincidir exactamente entre original y render
for (const cls of [
  "sec-title", "sec-sub", "pizza-name", "pizza-desc", "pizza-prices",
  "valientes-title", "valientes-sub", "foc-sub-title",
  "item-name", "item-desc", "item-price",
  "emp-price", "postre-name", "postre-price",
  "bebidas-group-title", "bebida-name", "bebida-price",
  "box-degu-title", "box-degu-body", "box-degu-price",
]) {
  check(cls, textsByClass(orig, cls), textsByClass(doc, cls));
}

// Conteos estructurales
check("secciones (.section)", orig.querySelectorAll(".section").length, doc.querySelectorAll(".section").length);
check("separadores (.asterisk-row)", orig.querySelectorAll(".asterisk-row").length, doc.querySelectorAll(".asterisk-row").length);
check("pizza-item (incl. relleno)", orig.querySelectorAll(".pizza-item").length, doc.querySelectorAll(".pizza-item").length);
check("emp-table th", textsByClass(orig, "emp-table").length ? [...orig.querySelectorAll(".emp-table th")].map(n=>n.textContent) : [], [...doc.querySelectorAll(".emp-table th")].map(n=>n.textContent));

console.log(fails === 0 ? "\n🎉 TODO COINCIDE — el render es fiel al original." : `\n⚠️  ${fails} diferencia(s).`);
process.exit(fails === 0 ? 0 : 1);
