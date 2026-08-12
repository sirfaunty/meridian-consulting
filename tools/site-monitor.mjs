#!/usr/bin/env node
/**
 * site-monitor.mjs — Care-tier health check for a live brochure site.
 *
 * Zero dependencies. Runs on plain Node 18+. Designed to be run on a schedule
 * (e.g. a weekly Cowork scheduled task) and to emit a human-readable report
 * that can be emailed to you and the client.
 *
 * What it checks:
 *   1. Uptime      — key pages return HTTP 200
 *   2. SSL         — days until the TLS certificate expires
 *   3. Domain      — days until domain registration expires (RDAP)
 *   4. SEO health  — title, meta description, canonical, structured data,
 *                    sitemap.xml and robots.txt present
 *   5. Links       — internal links on the homepage that are broken
 *   6. Performance — homepage response time
 *
 * Usage:
 *   node tools/site-monitor.mjs                      # reads siteUrl from src/_data/brand.json
 *   node tools/site-monitor.mjs https://acme.com     # or pass a URL explicitly
 *   node tools/site-monitor.mjs https://acme.com report.md   # also write report to a file
 */

import tls from "node:tls";
import fs from "node:fs";
import { URL } from "node:url";

const TIMEOUT = 10000;

// ---- resolve target -------------------------------------------------------
function resolveSiteUrl() {
  if (process.argv[2] && process.argv[2].startsWith("http")) return process.argv[2];
  try {
    const brand = JSON.parse(fs.readFileSync(new URL("../src/_data/brand.json", import.meta.url)));
    if (brand.siteUrl) return brand.siteUrl;
  } catch { /* no brand.json nearby — that's fine */ }
  console.error("No site URL. Pass one: node tools/site-monitor.mjs https://example.com");
  process.exit(1);
}

const SITE = resolveSiteUrl().replace(/\/$/, "");
const HOST = new URL(SITE).hostname;
const REPORT_PATH = process.argv.find((a, i) => i >= 2 && a.endsWith(".md"));

const results = []; // { label, status: 'pass'|'warn'|'fail', detail }
const mark = (label, status, detail) => results.push({ label, status, detail });

// ---- helpers --------------------------------------------------------------
const UA = "Mozilla/5.0 (compatible; SiteMonitor/1.0; +care-plan health check)";

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    return await fetch(url, {
      redirect: "manual",
      signal: ctrl.signal,
      ...opts,
      headers: { "User-Agent": UA, "Accept": "*/*", ...(opts.headers || {}) },
    });
  } finally {
    clearTimeout(t);
  }
}

function checkCert(host) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: TIMEOUT }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!cert || !cert.valid_to) return resolve({ ok: false, err: "no certificate" });
      const days = Math.round((new Date(cert.valid_to).getTime() - Date.now()) / 86400000);
      resolve({ ok: true, days, validTo: cert.valid_to });
    });
    socket.on("error", (e) => resolve({ ok: false, err: e.message }));
    socket.on("timeout", () => { socket.destroy(); resolve({ ok: false, err: "timeout" }); });
  });
}

async function checkDomainExpiry(domain) {
  // RDAP is the modern, machine-readable WHOIS. rdap.org routes to the right registry.
  const root = domain.split(".").slice(-2).join(".");
  try {
    const r = await fetchWithTimeout(`https://rdap.org/domain/${root}`);
    if (!r.ok) return { ok: false, err: `RDAP ${r.status}` };
    const j = await r.json();
    const ev = (j.events || []).find((e) => e.eventAction === "expiration");
    if (!ev) return { ok: false, err: "no expiration in RDAP" };
    const days = Math.round((new Date(ev.eventDate).getTime() - Date.now()) / 86400000);
    return { ok: true, days, date: ev.eventDate };
  } catch (e) {
    return { ok: false, err: e.message };
  }
}

// ---- run checks -----------------------------------------------------------
async function run() {
  // 1. Uptime + performance on the homepage
  let homeHtml = "";
  try {
    const t0 = Date.now();
    const r = await fetchWithTimeout(SITE);
    const ms = Date.now() - t0;
    homeHtml = await r.text();
    if (r.status >= 200 && r.status < 400) mark("Homepage online", "pass", `HTTP ${r.status}`);
    else mark("Homepage online", "fail", `HTTP ${r.status}`);
    mark("Response time", ms < 800 ? "pass" : ms < 2000 ? "warn" : "fail", `${ms} ms`);
  } catch (e) {
    mark("Homepage online", "fail", e.message);
  }

  // 2. Key pages
  for (const path of ["/about/", "/services/", "/blog/", "/contact/"]) {
    try {
      const r = await fetchWithTimeout(SITE + path);
      mark(`Page ${path}`, r.status >= 200 && r.status < 400 ? "pass" : "warn", `HTTP ${r.status}`);
    } catch (e) {
      mark(`Page ${path}`, "warn", e.message);
    }
  }

  // 3. SSL
  const cert = await checkCert(HOST);
  if (!cert.ok) mark("SSL certificate", "fail", cert.err);
  else mark("SSL certificate", cert.days > 21 ? "pass" : cert.days > 7 ? "warn" : "fail", `expires in ${cert.days} days (${cert.validTo})`);

  // 4. Domain expiry
  const dom = await checkDomainExpiry(HOST);
  if (!dom.ok) mark("Domain registration", "warn", `could not verify (${dom.err})`);
  else mark("Domain registration", dom.days > 45 ? "pass" : dom.days > 14 ? "warn" : "fail", `expires in ${dom.days} days (${dom.date.slice(0, 10)})`);

  // 5. SEO elements on homepage
  const has = (re) => re.test(homeHtml);
  mark("Page title", has(/<title>[^<]+<\/title>/i) ? "pass" : "fail", "");
  mark("Meta description", has(/<meta[^>]+name=["']description["'][^>]*>/i) ? "pass" : "warn", "");
  mark("Canonical URL", has(/<link[^>]+rel=["']canonical["'][^>]*>/i) ? "pass" : "warn", "");
  mark("Structured data (JSON-LD)", has(/application\/ld\+json/i) ? "pass" : "warn", "");

  // 6. sitemap + robots
  for (const [path, label] of [["/sitemap.xml", "Sitemap"], ["/robots.txt", "robots.txt"]]) {
    try {
      const r = await fetchWithTimeout(SITE + path);
      mark(label, r.ok ? "pass" : "warn", `HTTP ${r.status}`);
    } catch (e) {
      mark(label, "warn", e.message);
    }
  }

  // 7. Broken internal links on the homepage (sampled)
  const hrefs = [...homeHtml.matchAll(/href=["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((h) => h.startsWith("/") || h.startsWith(SITE))
    .map((h) => (h.startsWith("http") ? h : SITE + h));
  const unique = [...new Set(hrefs)].slice(0, 25);
  let broken = 0;
  await Promise.all(unique.map(async (u) => {
    try {
      const r = await fetchWithTimeout(u, { method: "GET" });
      if (r.status >= 400) broken++;
    } catch { broken++; }
  }));
  mark("Internal links", broken === 0 ? "pass" : "fail", `${broken} broken of ${unique.length} checked`);

  emit();
}

// ---- report ---------------------------------------------------------------
function emit() {
  const icon = { pass: "✅", warn: "⚠️", fail: "❌" };
  const fails = results.filter((r) => r.status === "fail").length;
  const warns = results.filter((r) => r.status === "warn").length;
  const overall = fails ? "❌ Action needed" : warns ? "⚠️ Review recommended" : "✅ All clear";

  const lines = [];
  lines.push(`# Site health report — ${HOST}`);
  lines.push("");
  lines.push(`Overall: **${overall}**  (${results.length} checks · ${warns} warnings · ${fails} failures)`);
  lines.push("");
  lines.push("| Check | Status | Detail |");
  lines.push("| --- | :---: | --- |");
  for (const r of results) lines.push(`| ${r.label} | ${icon[r.status]} | ${r.detail || ""} |`);
  lines.push("");
  lines.push(`_Generated by site-monitor for ${SITE}_`);

  const report = lines.join("\n");
  console.log(report);
  if (REPORT_PATH) fs.writeFileSync(REPORT_PATH, report);

  // Non-zero exit if anything failed — lets a scheduler flag it.
  process.exit(fails ? 1 : 0);
}

run();
