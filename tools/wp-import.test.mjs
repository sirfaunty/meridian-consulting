// Minimal zero-dependency test for the WordPress import transform.
// Run: node tools/wp-import.test.mjs
import fs from "node:fs";
import assert from "node:assert";
import { transformWp, htmlToMarkdown, slugify, redirectsToText } from "./wp-import.mjs";

let pass = 0;
const ok = (name, fn) => { fn(); console.log(`  ✓ ${name}`); pass++; };

const data = JSON.parse(fs.readFileSync(new URL("./__fixtures__/wp-sample.json", import.meta.url)));
const out = transformWp(data);

ok("home page maps to src/index.md at /", () => {
  const home = out.files.find((f) => f.path === "src/index.md");
  assert(home, "index.md missing");
  assert(home.content.includes("permalink: /"), "home permalink wrong");
  assert(home.content.includes("layouts/home.njk"), "home layout wrong");
});

ok("interior page maps to src/<slug>.md", () => {
  const about = out.files.find((f) => f.path === "src/about-us.md");
  assert(about, "about-us.md missing");
  assert(about.content.includes("permalink: /about-us/"));
  assert(about.content.includes("## Our Story"), "heading not converted");
  assert(about.content.includes("- Family owned"), "list not converted");
});

ok("post maps to src/blog/<slug>.md with date", () => {
  const post = out.files.find((f) => f.path === "src/blog/flossing-tips.md");
  assert(post, "post missing");
  assert(post.content.includes("date: 2023-06-12"));
  assert(post.content.includes("_favorite_"), "italic not converted");
  assert(post.content.includes("[contact us](https://oldsite.com/contact/)"), "link not converted");
});

ok("HTML entities are decoded", () => {
  const home = out.files.find((f) => f.path === "src/index.md");
  assert(home.content.includes("We’ve cared"), "apostrophe entity not decoded");
  assert(home.content.includes("**20 years**"), "bold not converted");
});

ok("redirects map old post URL to new blog URL", () => {
  const r = out.redirects.find((x) => x.from === "/2023/06/flossing-tips/");
  assert(r, "post redirect missing");
  assert.strictEqual(r.to, "/blog/flossing-tips/");
  const txt = redirectsToText(out.redirects);
  assert(txt.includes("/2023/06/flossing-tips/   /blog/flossing-tips/   301"));
});

ok("brand hints extracted from siteInfo", () => {
  assert.strictEqual(out.brandHints.businessName, "Bright Smile Dental");
  assert.strictEqual(out.brandHints.tagline, "Gentle family dentistry in Springfield");
});

ok("media urls collected", () => {
  assert.strictEqual(out.media.length, 1);
  assert(out.media[0].endsWith("logo.png"));
});

ok("slugify handles messy titles", () => {
  assert.strictEqual(slugify("Our Services & Pricing!"), "our-services-pricing");
});

ok("htmlToMarkdown strips unknown tags", () => {
  assert.strictEqual(htmlToMarkdown("<span class='x'>Hi <b>there</b></span>"), "Hi **there**");
});

console.log(`\n${pass} checks passed.`);
