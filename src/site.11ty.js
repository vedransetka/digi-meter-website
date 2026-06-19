import { locales, pages } from "../eleventy.config.js";

export const data = {
  pagination: { data: "routes", size: 1, alias: "route" },
  permalink: data => `/${data.route.locale}/${data.route.page === "home" ? "index.html" : `${data.route.page}/index.html`}`,
  eleventyExcludeFromCollections: true,
  routes: locales.flatMap(locale => pages.map(page => ({ locale, page })))
};

export function render(data) {
  return this.renderLocalizedPage(data.route.locale, data.route.page);
}
