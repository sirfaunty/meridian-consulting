#!/usr/bin/env node
/**
 * wp-import.mjs — WordPress → this stack content extractor.
 *
 * Pulls pages, posts, and media from a WordPress site's public REST API and
 * converts them into draft Markdown files, brand.json hints, and an old→new
 * URL redirects map. Gets a migration ~80% of the way; a human/Claude polish
 * pass then cleans copy and rebrands onto the template.
 *
 * The transform is a pure function (transformWp) so it can be unit-tested with
 * fixture data — no network required to verify the mapping logic.
 *
 * Usage (needs open network — run in GitHub Actions or on your own machine):
 *   node tools/wp-import.mjs https://oldsite.com            # live extract
 *   node tools/wp-import.mjs --fixture sample.json          # from saved JSON
 *   node tools/wp-import.mjs https://oldsite.com out/       # custom output dir
 *
 * Note: from a restricted/sandboxed network the live fetch may be blocked;
 * the --fixture path always works and is what the tests use.
 */

import fs from "node:fs";
import path from "node:path";

// ---------- pure helpers (unit-testable) ----------------------------------

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/&[a-z]+;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "page";
}

const ENTITIES = {
  "&amp;": "&", "&nbsp;": " ", "&quot;": '"', "&#039;": "'", "&#39;": "'",
  "&#8217;": "’", "&#8216;": "‘", "&#8220;": "“", "&#8221;": "”",
  "&#8211;": "–", "&#8212;": "—", "&hellip;": "…", "&lt;": "<", "&gt;": ">",
};
function decodeEntities(s) {
  return String(s || "").replace(/&[a-z0-9#]+;/gi, (m) => ENTITIES[m] ?? m);
}

/** Light HTML → Markdown for typical brochure content. Produces a clean draft. */
export function htmlToMarkdown(html) {
  let s = String(html || "");
  s = s.replace(/\r/g, "");
  // block elements → newlines
  s = s.replace(/<\/(p|div|section|article)>/gi, "\n\n");
  s = s.replace(/<br\s*\/?>(?=)/gi, "\n");
  // headings
  s = s.replace(/<h1[^>]*>(.*?)<\/h1>/gis, (_, t) => `\n# ${strip(t)}\n\n`);
  s = s.replace(/<h2[^>]*>(.*?)<\/h2>/gis, (_, t) => `\n## ${strip(t)}\n\n`);
  s = s.replace(/<h3[^>]*>(.*?)<\/h3>/gis, (_, t) => `\n### ${strip(t)}\n\n`);
  s = s.replace(/<h[4-6][^>]*>(.*?)<\/h[4-6]>/gis, (_, t) => `\n#### ${strip(t)}\n\n`);
  // images
  s = s.replace(/<img[^>]*?src=["']([^"']+)["'][^>]*?alt=["']([^"']*)["'][^>]*>/gi, (_, src, alt) => `\n![${alt}](${src})\n`);
  s = s.replace(/<img[^>]*?src=["']([^"']+)["'][^>]*>/gi, (_, src) => `\n![](${src})\n`);
  // links
  s = s.replace(/<a[^>]*?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis, (_, href, t) => `[${strip(t)}](${href})`);
  // emphasis
  s = s.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gis, (_, __, t) => `**${strip(t)}**`);
  s = s.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gis, (_, __, t) => `_${strip(t)}_`);
  // lists
  s = s.replace(/<li[^>]*>(.*?)<\/li>/gis, (_, t) => `- ${strip(t)}\n`);
  s = s.replace(/<\/?(ul|ol)[^>]*>/gi, "\n");
  // strip anything left
  s = strip(s);
  // collapse whitespace
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}
function strip(t) {
  return decodeEntities(String(t).replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").trim();
}

function pathFromLink(link, fallbackSlug) {
  try {
    const u = new URL(link);
    return u.pathname.endsWith("/") ? u.pathname : u.pathname + "/";
  } catch {
    return `/${fallbackSlug}/`;
  }
}

/**
 * Pure transform: WP API arrays -> files, redirects, brand hints.
 * @param {{pages:any[],posts:any[],media?:any[],siteInfo?:any}} data
 */
export function transformWp(data) {
  const files = [];
  const redirects = [];
  const media = [];
  const HOME_SLUGS = new Set(["home", "home-page", "front-page", "welcome"]);

  for (const p of data.pages || []) {
    const title = strip(p.title?.rendered || p.title || "Untitled");
    const slug = p.slug || slugify(title);
    const body = htmlToMarkdown(p.content?.rendered || p.content || "");
    const isHome = HOME_SLUGS.has(slug) || p.isHome;
    const newPath = isHome ? "/" : `/${slug}/`;
    const filePath = isHome ? "src/index.md" : `src/${slug}.md`;
    const layout = isHome ? "layouts/home.njk" : "layouts/page.njk";
    const fm = [
      "---",
      `layout: ${layout}`,
      `title: "${title.replace(/"/g, "'")}"`,
      `description: "TODO: 150-char SEO description"`,
      `permalink: ${newPath}`,
      "---",
      "",
    ].join("\n");
    files.push({ path: filePath, content: fm + body + "\n" });
    if (p.link) {
      const oldPath = pathFromLink(p.link, slug);
      if (oldPath !== newPath) redirects.push({ from: oldPath, to: newPath });
    }
  }

  for (const post of data.posts || []) {
    const title = strip(post.title?.rendered || post.title || "Untitled");
    const slug = post.slug || slugify(title);
    const date = (post.date || "").slice(0, 10) || "";
    const body = htmlToMarkdown(post.content?.rendered || post.content || "");
    const excerpt = strip(post.excerpt?.rendered || post.excerpt || "").slice(0, 150);
    const fm = [
      "---",
      `title: "${title.replace(/"/g, "'")}"`,
      date ? `date: ${date}` : `date: 2024-01-01`,
      `description: "${excerpt || "TODO: SEO description"}"`,
      "---",
      "",
    ].join("\n");
    files.push({ path: `src/blog/${slug}.md`, content: fm + body + "\n" });
    if (post.link) {
      const oldPath = pathFromLink(post.link, slug);
      const newPath = `/blog/${slug}/`;
      if (oldPath !== newPath) redirects.push({ from: oldPath, to: newPath });
    }
  }

  for (const m of data.media || []) {
    const url = m.source_url || m.url;
    if (url) media.push(url);
  }

  const brandHints = {
    businessName: strip(data.siteInfo?.name || ""),
    tagline: strip(data.siteInfo?.description || ""),
    siteUrl: data.siteInfo?.url || "",
    _note: "Draft hints extracted from WordPress. Review and complete brand.json manually.",
  };

  return { files, redirects, media, brandHints };
}

export function redirectsToText(redirects) {
  const lines = ["# Imported from WordPress — verify before launch.", "# FROM  TO  STATUS"];
  for (const r of redirects) lines.push(`${r.from}   ${r.to}   301`);
  return lines.join("\n") + "\n";
}

// ---------- I/O layer (network) -------------------------------------------

async function fetchAll(base, route) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${base.replace(/\/$/, "")}/wp-json/wp/v2/${route}?per_page=100&page=${page}`;
    const r = await fetch(url, { headers: { "User-Agent": "wp-import/1.0" } });
    if (!r.ok) break;
    const batch = await r.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

async function liveExtract(base) {
  const [pages, posts, media] = await Promise.all([
    fetchAll(base, "pages"),
    fetchAll(base, "posts"),
    fetchAll(base, "media"),
  ]);
  let siteInfo = {};
  try {
    const r = await fetch(`${base.replace(/\/$/, "")}/wp-json`, { headers: { "User-Agent": "wp-import/1.0" } });
    if (r.ok) { const j = await r.json(); siteInfo = { name: j.name, description: j.description, url: j.url || j.home }; }
  } catch { /* ignore */ }
  return { pages, posts, media, siteInfo };
}

function writeOutput(result, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of result.files) {
    const dest = path.join(outDir, f.path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, f.content);
  }
  fs.writeFileSync(path.join(outDir, "_redirects.imported"), redirectsToText(result.redirects));
  fs.writeFileSync(path.join(outDir, "brand.hints.json"), JSON.stringify(result.brandHints, null, 2));
  fs.writeFileSync(path.join(outDir, "media-to-download.txt"), result.media.join("\n") + "\n");
}

// ---------- main -----------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const fixtureIdx = args.indexOf("--fixture");
  const outDir = args.find((a) => a.endsWith("/")) || "migration-output/";

  let data;
  if (fixtureIdx !== -1) {
    data = JSON.parse(fs.readFileSync(args[fixtureIdx + 1], "utf8"));
  } else if (args[0] && args[0].startsWith("http")) {
    data = await liveExtract(args[0]);
  } else {
    console.error("Usage: node tools/wp-import.mjs https://oldsite.com   |   --fixture file.json");
    process.exit(1);
  }

  const result = transformWp(data);
  writeOutput(result, outDir);
  console.log(`Imported: ${result.files.length} files, ${result.redirects.length} redirects, ${result.media.length} media.`);
  console.log(`Output → ${outDir}  (drafts — polish and rebrand onto the template next)`);
}

// Only run main() when executed directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
