import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const locales = ["en", "el", "de", "fr", "nl", "pt"];
const pages = ["home", "about", "news", "outputs", "events", "partners", "platform", "contact", "privacy", "cookies", "impressum"];
const sourceName = page => page === "home" ? "index" : page;

function localizeDocument(html, locale, page) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const contentFile = path.join("content", "pages", locale, `${page}.json`);
  const fallbackFile = path.join("content", "pages", "en", `${page}.json`);
  const content = JSON.parse(fs.readFileSync(fs.existsSync(contentFile) ? contentFile : fallbackFile, "utf8"));

  $("html").attr("lang", locale);
  $("title").text(content.title);
  $('meta[name="description"]').attr("content", content.description);

  const textNodes = $("body").find("*").contents().filter((_, node) =>
    node.type === "text" && node.data.trim() && !["script", "style", "noscript"].includes(node.parent?.name)
  );
  textNodes.each((index, node) => {
    const item = content.strings.find(entry => entry.key === `text_${index}`);
    if (item?.value) node.data = node.data.replace(node.data.trim(), item.value);
  });

  for (const item of content.attributes || []) {
    const element = $(`[${item.attribute}]`).eq(item.index);
    if (element.length && item.value) element.attr(item.attribute, item.value);
  }

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    const match = href?.match(/^(index|about|news|outputs|events|partners|platform|contact|privacy|cookies|impressum)\.html(.*)$/);
    if (match) $(element).attr("href", `/${locale}/${match[1] === "index" ? "" : `${match[1]}/`}${match[2] || ""}`);
  });
  $("link[href], img[src], script[src]").each((_, element) => {
    const attr = element.tagName === "link" ? "href" : "src";
    const value = $(element).attr(attr);
    if (value && /^(assets|css|js)\//.test(value)) $(element).attr(attr, `/${value}`);
  });

  const selector = $("#lang-select");
  selector.find("option").removeAttr("selected");
  selector.find(`option[value="${locale}"]`).attr("selected", "selected");
  selector.find('option[value="it"]').remove();
  selector.attr("data-current-page", page);
  $("body").append('<script src="/js/locales.js"></script>');

  $('link[rel="alternate"][hreflang]').remove();
  for (const alternate of locales) {
    $("head").append(`<link rel="alternate" hreflang="${alternate}" href="/${alternate}/${page === "home" ? "" : `${page}/`}">`);
  }
  $("head").append(`<link rel="alternate" hreflang="x-default" href="/en/${page === "home" ? "" : `${page}/`}">`);
  return $.html();
}

export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "html output/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "html output/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "html output/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/js/locales.js": "js/locales.js" });

  eleventyConfig.addJavaScriptFunction("renderLocalizedPage", (locale, page) => {
    const html = fs.readFileSync(path.join("html output", `${sourceName(page)}.html`), "utf8");
    return localizeDocument(html, locale, page);
  });

  return { dir: { input: "src", output: "_site" } };
}

export { locales, pages };
