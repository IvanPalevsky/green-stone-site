/**
 * Собирает однофайловую версию сайта: index.html со встроенными CSS и JS.
 * Удобно, когда страницу нужно просто открыть двойным кликом или
 * передать одним файлом, без папки assets.
 *
 *   node site/build-standalone.mjs
 *   → green-stone-standalone.html в корне репозитория
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(here, p), "utf8");

const LINK = '<link rel="stylesheet" href="assets/css/main.css">';
const SCRIPT = '<script src="assets/js/main.js" defer></script>';
const NOTE = "<!-- собрано вручную: index.html + assets/css/main.css + assets/js/main.js -->";

let html = read("index.html");
for (const tag of [LINK, SCRIPT]) {
  if (!html.includes(tag)) {
    console.error("Не найдено в index.html: " + tag);
    process.exit(1);
  }
}

// Подстановка только через функцию: в строковой замене `$$`, `$&` и `$\'`
// имеют особый смысл, а в коде сплошь и рядом встречается `$$(...)`.
const put = (text) => () => text;

html = html
  .replace(NOTE, put("<!-- Однофайловая сборка: стили и скрипт встроены. Исходники — в папке site/ -->"))
  .replace(LINK, put("<style>\n" + read("assets/css/main.css") + "\n</style>"))
  .replace(SCRIPT, put("<script>\n" + read("assets/js/main.js") + "\n</script>"));

// Страховка: встроенный код должен совпасть с исходником байт в байт.
if (!html.includes(read("assets/js/main.js")) || !html.includes(read("assets/css/main.css"))) {
  console.error("Встроенный CSS или JS не совпал с исходником — сборка отменена.");
  process.exit(1);
}

const out = join(here, "..", "green-stone-standalone.html");
writeFileSync(out, html);
console.log("Готово: " + out + " (" + (Buffer.byteLength(html) / 1024).toFixed(1) + " KB)");
