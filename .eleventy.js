// Eleventy configuration.
// You almost never need to touch this file when standing up a new client site.
// It defines HOW the site is built, not WHAT is on it. Client content lives in
// src/_data/brand.json and the Markdown files in src/. See CLAUDE.md.

module.exports = function (eleventyConfig) {
  // Copy static assets (CSS, JS, images) straight through to the built site.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Copy Cloudflare Pages + SEO files to the site root.
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // --- Small helper filters used in templates ---------------------------

  // Current year, for the footer copyright line.
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Turn a phone number like "(555) 123-4567" into a tel: link value.
  eleventyConfig.addFilter("telHref", (phone) =>
    phone ? "tel:" + String(phone).replace(/[^0-9+]/g, "") : ""
  );

  // Format a post date like "March 4, 2026".
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  // Machine-readable date for <time datetime="...">.
  eleventyConfig.addFilter("isoDate", (dateObj) =>
    dateObj ? new Date(dateObj).toISOString().slice(0, 10) : ""
  );

  // Blog posts collection — newest first. Drives the /blog/ index and the
  // content upsell. Add a post = drop a .md file in src/blog/.
  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/blog/*.md").reverse()
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    // Markdown files become .html pages; Nunjucks powers the layouts.
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
};
