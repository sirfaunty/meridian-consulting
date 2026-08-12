# New Client Checklist

A repeatable run-through for standing up a client site from this template. Most of it is filling in one config file. Budget ~30–60 minutes for a first pass, faster once you've done a few.

## 1. Create the project
- [ ] Copy the `brochure-base` folder to a new folder named for the client (e.g. `acme-dental`).
- [ ] Create a new **GitHub repository** and push the copy to it.

## 2. Brand & business details — `src/_data/brand.json`
- [ ] `businessName`, `tagline`, `domain`
- [ ] `contact`: phone, email, address, hours, mapUrl
- [ ] `social`: fill in the links they have; leave the rest as empty strings `""` (they'll hide automatically)
- [ ] `brandColors`: primary, accent, text, background (pull from their logo or brand guide)
- [ ] `nav`: adjust menu items if they want more/fewer pages
- [ ] `services`: the real list of services with short descriptions
- [ ] `cta`: the call-to-action label and link
- [ ] `siteUrl`: the final `https://` domain (used for canonical + schema)
- [ ] `seo` block: business type, address, city/region, price range, service area (powers local-search structured data)

## 3. Page wording — `src/*.md`
- [ ] `index.md` — homepage intro + meta `description`
- [ ] `about.md` — the real story + meta `description`
- [ ] `services.md` — intro line + meta `description`
- [ ] `contact.md` — check the wording (details pull from brand.json automatically)
- [ ] In each file, update the `description:` line — it's what shows under the link in Google.

## 4. Visual identity
- [ ] Replace `src/assets/images/favicon.svg` with something on-brand (or recolor the placeholder).
- [ ] Add the client's real logo and any photos to `src/assets/images/`.

## 4b. Content & SEO (upsell-ready)
- [ ] Delete the sample post `src/blog/welcome-to-our-blog.md` (or replace it with a real first article).
- [ ] If content is part of their plan, draft the first 1–3 blog posts in `src/blog/`.
- [ ] Confirm the `seo` block is filled in — this is what powers local search.

## 5. Test
- [ ] Run `npm install` then `npm run build` — confirm it builds with no errors.
- [ ] Run `npm start` and click through all pages on desktop and a narrow (mobile) window.
- [ ] Check the phone/email links work and the map link points to the right place.

## 6. Deploy on Cloudflare Pages
- [ ] In Cloudflare Pages, **Create a project → Connect to Git → select the repo**.
- [ ] Build command: `npm run build` — Output directory: `_site`.
- [ ] First deploy runs automatically; check the `*.pages.dev` preview URL.

## 7. Go live
- [ ] Add the client's **custom domain** in Cloudflare Pages and follow the DNS steps.
- [ ] Update `Sitemap:` domain in `src/robots.txt` (optional).
- [ ] Confirm HTTPS is active (Cloudflare provisions the certificate automatically).

## 8. Handoff
- [ ] Give the client the ongoing-edits path: describe changes in plain English → Claude edits `brand.json` / the Markdown files → change deploys.
- [ ] Point them (or yourself) at `CLAUDE.md` — it's the guardrail doc that keeps edits safe.
