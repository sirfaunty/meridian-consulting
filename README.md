# Brochure Site — Base Template

A reusable starting point for client brochure sites. Clone it, rebrand it in a few minutes, and deploy it free. Built to be maintained conversationally with Claude going forward — see `CLAUDE.md`.

## Why this exists

- **$0/month hosting.** Pure static site on Cloudflare Pages (unlimited bandwidth, free SSL, free custom domain). The only recurring cost is the client's domain (~$10–15/yr).
- **Fast to stand up.** All client-specific content lives in one config file plus four short page files. No code changes needed for a typical site.
- **Safe to maintain.** Content is separated from design, so edits — by you or by the client through Claude — can't easily break the layout. Every change is a Git commit, so anything is reversible.

## The stack

| Piece | Choice | Cost |
|-------|--------|------|
| Site generator | Eleventy (11ty) | Free |
| Hosting / CDN / SSL | Cloudflare Pages | Free |
| Source control / deploy trigger | GitHub | Free |
| Domain | Registrar of choice | ~$10–15/yr |

## Project layout

See the file map in **`CLAUDE.md`**. In short: edit `src/_data/brand.json` and the four Markdown files in `src/`; leave `_includes/`, `.eleventy.js`, and `styles.css` alone.

## Standing up a new client

Follow **`NEW-CLIENT-CHECKLIST.md`**. The short version:

1. Copy this folder to a new repo named for the client.
2. Fill in `src/_data/brand.json` with their real details and colors.
3. Replace the placeholder wording in the four `src/*.md` files.
4. Push to GitHub and connect the repo to Cloudflare Pages (build command `npm run build`, output `_site`).
5. Point the client's domain at Cloudflare and go live.

## Built-in automation (the Care plan, running itself)

Every site from this template ships with the deterministic half of "managed hosting" already wired up — all free:

- **`.github/workflows/site-health.yml`** — a weekly GitHub Action that runs the health monitor (uptime, SSL, domain expiry, SEO elements, broken links) with full network access, posts the report to the run summary, saves it as an artifact, and opens an issue if something needs attention.
- **`.github/dependabot.yml`** — native GitHub dependency + Action updates. When Eleventy or anything else has an update or security fix, Dependabot opens a PR; Cloudflare builds a preview of it automatically, so nothing goes live unreviewed. This is the "keep it patched" piece.
- **`tools/site-monitor.mjs`** — the zero-dependency check itself. Run locally with `npm run monitor -- https://theclient.com`.

Note on SSL: Cloudflare Pages auto-renews certificates, so the SSL check is a safety net, not a chore.

The **intelligent half** — reading the report, deciding what actually matters, writing the plain-English client update, publishing content, making edits — is where a **Cowork scheduled task** fits. The GitHub Action does the measuring; Claude does the judgment and the client-facing communication.

## Local preview (optional)

```bash
npm install
npm start      # http://localhost:8080
```

Cloudflare builds the production site automatically on every push, so local building is only for testing.
