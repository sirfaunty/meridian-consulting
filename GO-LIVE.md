# Go-Live Runbook

The exact steps to take a site from a folder on your machine to live on the
internet. Written as the reusable per-client launch checklist — you'll run this
every time. Each phase is self-contained, so you can stop and resume.

**Fastest path tonight:** Phases 0–2 get you a live `https://<name>.pages.dev`
URL in ~20 minutes, with no domain and no cost. The custom domain (Phase 3) can
come later. That's the milestone to aim for tonight.

Accounts you'll need (all free tiers): **GitHub** and **Cloudflare**. A domain
registrar only for Phase 3.

---

## Phase 0 · Prep the site  ·  ~5 min  ·  (mostly already done)
- [ ] Pick the site folder (e.g. the church or consulting demo).
- [ ] Confirm it builds locally:
  ```bash
  cd <site-folder>
  npm install
  npm run build      # should output "_site" with your pages
  npm start          # optional: preview at http://localhost:8080
  ```
- [ ] In `src/_data/brand.json`, you can leave `siteUrl` as-is for now — we'll set
      the real domain in Phase 3.

## Phase 1 · Put it on GitHub  ·  ~10 min  ·  needs: GitHub account
- [ ] Create a free GitHub account, and (recommended) a free **organization** to
      hold all client repos under one roof.
- [ ] From the site folder, initialize and push. Easiest with the GitHub CLI (`gh`):
  ```bash
  cd <site-folder>
  git init
  git add .
  git commit -m "Initial site"
  gh repo create <your-org>/<client-name> --private --source=. --push
  ```
  **No `gh`?** Create an empty repo at github.com first, then:
  ```bash
  git init && git add . && git commit -m "Initial site"
  git branch -M main
  git remote add origin https://github.com/<your-org>/<client-name>.git
  git push -u origin main
  ```
- [ ] Confirm the files show up in the GitHub repo.

## Phase 2 · Deploy on Cloudflare Pages  ·  ~10 min  ·  needs: Cloudflare account  →  LIVE URL
- [ ] Create a free Cloudflare account.
- [ ] Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
- [ ] Authorize GitHub and select the repo.
- [ ] Set the build settings:
  - **Framework preset:** None
  - **Build command:** `npm run build`
  - **Build output directory:** `_site`
- [ ] **Save and Deploy.** In ~1 minute you'll have a live `https://<project>.pages.dev`.
      🎉 That's a real, live site — a good place to stop tonight.

## Phase 3 · Custom domain  ·  ~15 min + DNS wait  ·  needs: a domain
- [ ] If the client doesn't have a domain, register one (ideally **in the client's
      name**). You can buy it at-cost through Cloudflare, or any registrar.
- [ ] In the Pages project → **Custom domains** → **Set up a domain** → enter the domain.
- [ ] Follow Cloudflare's DNS instructions (it adds a CNAME/A record). If the domain
      is already on Cloudflare, it's automatic; if elsewhere, add the record they show
      at your registrar.
- [ ] **Do not touch MX / email records** — if the client uses email on this domain,
      leave those alone so mail keeps working.
- [ ] HTTPS provisions automatically. Wait for the padlock (minutes to a few hours).
- [ ] Set `siteUrl` in `brand.json` to the final `https://` domain, update the
      `Sitemap:` line in `src/robots.txt`, commit, and push (auto-deploys).

## Phase 4 · Post-launch SEO  ·  ~10 min
- [ ] The **health check** and **Dependabot** and **content check** are already in
      `.github/` — they turn on automatically once the repo is on GitHub. (Enable
      Actions if GitHub prompts you.)
- [ ] Add the site to **Google Search Console**, verify ownership, and submit
      `https://<domain>/sitemap.xml`.
- [ ] If this was a migration: double-check every old URL 301-redirects (in `_redirects`).

## Phase 5 · Wire the automation  ·  later, per the Operations Map
- [ ] Connect the repo so Claude can make edits/publish (GitHub token / App).
- [ ] Stand up the **Cowork scheduled task** ("the manager") for the weekly health
      summary + content sweep.
- [ ] Set up the **intake channel** (email / form / Drive) for content and edit requests.
- [ ] Move the client to reviewed or auto-publish mode.

---

## Tonight's realistic finish line
Phases 0 → 2: the site is **live on a `pages.dev` URL**. Everything after that —
domain, Search Console, automation — is a clean pickup for next time. Nothing in
Phases 0–2 is hard to redo, so there's no risk in stopping after any step.
