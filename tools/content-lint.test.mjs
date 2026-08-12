// Zero-dependency tests for the content SEO linter.
// Run: node tools/content-lint.test.mjs
import assert from "node:assert";
import { lintPost, parseFrontMatter } from "./content-lint.mjs";

let pass = 0;
const ok = (name, fn) => { fn(); console.log(`  ✓ ${name}`); pass++; };

const GOOD = `---
title: "How to measure a mounted bearing bore in 20 seconds"
date: 2026-03-10
description: "No part number? Grab a caliper. Here's how to size a mounted bearing bore fast and order the right replacement the first time, every time."
---

Lost the part number? You can size most mounted bearings in about twenty seconds.

## Measure the shaft

The bore is the shaft diameter. Measure the shaft where the bearing sits. See our
[catalog](/services/) for sizes. ${"word ".repeat(320)}

## Note the housing

Look at how it mounts.
`;

const BAD = `No front matter at all.

Just a short body with no headings and no links.
`;

ok("parseFrontMatter splits data and body", () => {
  const { data, body, hasFrontMatter } = parseFrontMatter(GOOD);
  assert.strictEqual(hasFrontMatter, true);
  assert(data.title.includes("mounted bearing"));
  assert(body.includes("## Measure the shaft"));
});

ok("a well-formed post passes with no failures", () => {
  const r = lintPost(GOOD);
  assert.strictEqual(r.fails, 0, JSON.stringify(r.findings));
  assert.strictEqual(r.ok, true);
});

ok("good post detects H2, internal link, length", () => {
  const r = lintPost(GOOD);
  const rules = r.findings.filter((f) => f.status === "pass").map((f) => f.rule);
  assert(rules.includes("headings"));
  assert(rules.includes("internal link"));
  assert(rules.includes("length"));
});

ok("a post with no front matter fails", () => {
  const r = lintPost(BAD);
  assert(r.fails >= 1);
  assert.strictEqual(r.ok, false);
  const rules = r.findings.map((f) => f.rule);
  assert(rules.includes("front matter"));
  assert(rules.includes("title"));
  assert(rules.includes("meta description"));
});

ok("short description is flagged as a warning", () => {
  const post = `---\ntitle: "A perfectly reasonable length title for testing here"\ndate: 2026-01-01\ndescription: "Too short."\n---\n\n## Hi\n\n[home](/) ${"word ".repeat(320)}`;
  const r = lintPost(post);
  const desc = r.findings.find((f) => f.rule === "meta description length");
  assert(desc && desc.status === "warn");
});

ok("empty image alt text is flagged", () => {
  const post = `---\ntitle: "A perfectly reasonable length title for testing here"\ndate: 2026-01-01\ndescription: "${"x".repeat(130)}"\n---\n\n## Hi\n\n![](/img.png) [home](/) ${"word ".repeat(320)}`;
  const r = lintPost(post);
  assert(r.findings.some((f) => f.rule === "image alt text" && f.status === "warn"));
});

console.log(`\n${pass} checks passed.`);
