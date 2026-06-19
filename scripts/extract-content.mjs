import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const locales = ["en", "el", "de", "fr", "nl", "pt"];
const pages = ["home", "about", "news", "outputs", "events", "partners", "platform", "contact", "privacy", "cookies", "impressum"];
const attributes = ["aria-label", "title", "placeholder", "alt"];

for (const page of pages) {
  const filename = page === "home" ? "index.html" : `${page}.html`;
  const $ = cheerio.load(fs.readFileSync(path.join("html output", filename), "utf8"), { decodeEntities: false });
  const strings = [];
  $("body").find("*").contents().filter((_, node) =>
    node.type === "text" && node.data.trim() && !["script", "style", "noscript"].includes(node.parent?.name)
  ).each((index, node) => {
    strings.push({ key: `text_${index}`, source: node.data.trim(), value: node.data.trim() });
  });
  const translatableAttributes = [];
  for (const attribute of attributes) {
    $(`[${attribute}]`).each((index, element) => {
      const value = $(element).attr(attribute);
      if (!value || /^(https?:|\/|assets\/)/.test(value)) return;
      translatableAttributes.push({ index, attribute, source: value, value });
    });
  }
  const model = {
    page,
    title: $("title").text().trim(),
    description: $('meta[name="description"]').attr("content") || "",
    translation_status: "needs_translation",
    strings,
    attributes: translatableAttributes
  };
  for (const locale of locales) {
    const dir = path.join("content", "pages", locale);
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, `${page}.json`);
    if (!fs.existsSync(target) || process.argv.includes("--force")) {
      fs.writeFileSync(target, `${JSON.stringify({ ...model, translation_status: locale === "en" ? "source" : "needs_translation" }, null, 2)}\n`);
    }
  }
}

console.log(`Extracted ${pages.length} pages for ${locales.length} locales.`);
