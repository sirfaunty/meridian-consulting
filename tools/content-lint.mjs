#!/usr/bin/env node
/**
 * content-lint.mjs — SEO & quality gate for blog posts.
 *
 * This is what lets content publish safely without a human eyeballing every
 * post: it checks the things that matter for search and readability, and fails
 * the build (non-zero exit) if a post is missing essentials. Run it locally, in
 * CI on every new post, or as a step in the publishing workflow.
 *
 * Zero dependencies. The check logic is a pure function (lintPost) so it can be
 * unit-tested with fixtures — no files needed.
 *
 * Usage:
 *   node tools/content-lint.mjs                       # lint every post in src/blog/
 *   node tools/content-lint.mjs src/blog/my-post.md   # lint one file
 */

import fs from "node:fs";
import path from "node:path";

// ---- thresholds (tune to taste) ------------------------------------------
const RULES = {
  titleMin: 30, titleMax: 65,
  descMin: 120, descMax: 160,
  minWords: 300,
};

// ---- pure helpers ---------------------------------------------------------

export function parseFrontMatter(text) {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(text);
  if (!m) return { data: {}, body: text, hasFrontMatter: false };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return { data, body: m[2], hasFrontMatter: true };
}

export function lintPost(text) {
  const { data, body, hasFrontMatter } = parseFrontMatter(text);
  const findings = [];
  const add = (status, rule, detail) => findings.push({ status, rule, detail });

  if (!hasFrontMatter) add("fail", "front matter", "missing --- front matter block");

  // Title
  if (!data.title) add("fail", "title", "no title in front matter");
  else {
    const n = data.title.replace(/^["']|["']$/g, "").length;
    if (n < RULES.titleMin || n > RULES.titleMax)
      add("warn", "title length", `${n} chars (aim ${RULES.titleMin}–${RULES.titleMax})`);
    else add("pass", "title", `${n} chars`);
  }

  // Description / meta
  if (!data.description) add("fail", "meta description", "no description in front matter");
  else {
    const n = data.description.length;
    if (n < RULES.descMin || n > RULES.descMax)
      add("warn", "meta description length", `${n} chars (aim ${RULES.descMin}–${RULES.descMax})`);
    else add("pass", "meta description", `${n} chars`);
  }

  // Date
  if (!data.date) add("warn", "date", "no date in front matter");

  // Body: single H1 (title provides it; body should start at H2)
  if (/^#\s+/m.test(body)) add("warn", "heading structure", "body contains an H1 (#); use H2 (##) and below");
  if (!/^##\s+/m.test(body)) add("warn", "headings", "no H2 (##) sections found");
  else add("pass", "headings", "has H2 sections");

  // Word count
  const words = body.replace(/[#>*_`\-]/g, " ").split(/\s+/).filter(Boolean).length;
  if (words < RULES.minWords) add("warn", "length", `${words} words (aim ${RULES.minWords}+)`);
  else add("pass", "length", `${words} words`);

  // Internal link (helps SEO + keeps visitors on site)
  if (!/\]\((\/[^)]*)\)/.test(body)) add("warn", "internal link", "no internal links — add at least one");
  else add("pass", "internal link", "present");

  // Image alt text
  const emptyAlts = (body.match(/!\[\s*\]\(/g) || []).length;
  if (emptyAlts > 0) add("warn", "image alt text", `${emptyAlts} image(s) missing alt text`);

  const fails = findings.filter((f) => f.status === "fail").length;
  const warns = findings.filter((f) => f.status === "warn").length;
  return { findings, fails, warns, ok: fails === 0 };
}

// ---- report ---------------------------------------------------------------
function reportFor(file, result) {
  const icon = { pass: "✅", warn: "⚠️", fail: "❌" };
  const head = result.fails ? "❌" : result.warns ? "⚠️" : "✅";
  const lines = [`${head} ${file} — ${result.fails} fail · ${result.warns} warn`];
  for (const f of result.findings.filter((x) => x.status !== "pass"))
    lines.push(`   ${icon[f.status]} ${f.rule}: ${f.detail}`);
  return lines.join("\n");
}

// ---- main -----------------------------------------------------------------
function main() {
  const arg = process.argv[2];
  let files;
  if (arg) files = [arg];
  else {
    const dir = "src/blog";
    files = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => path.join(dir, f))
      : [];
  }
  if (files.length === 0) { console.log("No posts to lint."); return; }

  let totalFails = 0;
  for (const file of files) {
    const result = lintPost(fs.readFileSync(file, "utf8"));
    totalFails += result.fails;
    console.log(reportFor(file, result));
  }
  console.log(`\nLinted ${files.length} post(s). ${totalFails} failing.`);
  process.exit(totalFails ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
