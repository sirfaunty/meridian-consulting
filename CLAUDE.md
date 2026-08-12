# Operating manual for this website

This file tells Claude how to safely make changes to this site. **Read it before editing anything.** It is written so that a non-technical owner can ask for changes in plain English and Claude can carry them out correctly, without breaking the design.

---

## What this site is

A brochure website built with **Eleventy (11ty)**, a static site generator. Content is written in simple files; Eleventy turns them into plain HTML. The live site is hosted **free on Cloudflare Pages** and rebuilds automatically whenever changes are saved to the connected GitHub repository.

The single most important idea: **content is separated from design.** The words, colors, and business details live in easy-to-edit files. The layout and styling live in template files that should almost never be touched. Editing content is safe. Editing templates is where things break — so don't, unless the request is specifically about design and there is no other way.

---

## Golden rules (guardrails)

1. **Prefer `src/_data/brand.json` first.** The business name, phone, email, address, hours, colors, navigation menu, and the list of services all live there. Most change requests are answered by editing this one file. Never rename the keys (the words on the left of each colon) — only change the values.
2. **Page wording lives in the four Markdown files** in `src/` (`index.md`, `about.md`, `services.md`, `contact.md`). Edit the text below the `---` block. Do not remove or reorder the `---` front-matter block at the top, and do not change `layout:` or `permalink:` lines.
3. **Do not edit anything in `src/_includes/` or `.eleventy.js` or `styles.css`** unless the request is explicitly about the site's design/structure and cannot be done any other way. If you must, explain the risk first.
4. **Never invent business facts.** If a request needs a real phone number, price, address, or claim you don't have, ask for it rather than guessing.
5. **One change at a time, then confirm.** After a change, describe what you changed in plain language so the owner can verify it on the preview before it goes live.
6. **When unsure, stop and ask.** A small clarifying question is always better than a wrong edit to a client's live site.

---

## File map

```
src/
  _data/brand.json          ← business info, colors, nav, services,   (EDIT FREELY)
                              and the "seo" block for local search
  index.md                  ← Home page wording                      (EDIT TEXT)
  about.md                  ← About page wording                     (EDIT TEXT)
  services.md               ← Services page intro                    (EDIT TEXT)
  contact.md                ← Contact page wording                   (EDIT TEXT)
  blog/                     ← Blog posts, one .md file per post       (ADD FILES)
  blog.njk                  ← Blog index page (auto-lists posts)      (AVOID)
  assets/images/            ← Logos and photos                       (ADD FILES)
  assets/css/styles.css     ← Site design                            (AVOID)
  assets/js/main.js         ← Small interactions                     (AVOID)
  sitemap.njk               ← Auto-generated sitemap.xml             (DO NOT TOUCH)
  _includes/                ← Page layouts + SEO schema partial      (DO NOT TOUCH)
.eleventy.js                ← Build configuration                    (DO NOT TOUCH)
```

---

## Common requests → exactly what to do

**"Change our phone number / email / address / hours"**
Edit the matching value under `contact` in `src/_data/brand.json`.

**"Change our brand colors"**
Edit the four values under `brandColors` in `brand.json`. Changing them re-skins the whole site automatically — no other files needed.

**"Change our fonts / add our logo"**
Fonts and logo are brand tokens in `brand.json` too — set `typography.headingFont`/`bodyFont` (with `useGoogleFonts: true`) and point `logo.image` at a file in `assets/images/`. See `BRAND-KIT.md` for the full brand token schema and how to map a brand deliverable onto it.

**"Add / remove / reword a service"**
Edit the `services` list in `brand.json`. Each service is a `title` and a `description`. The Home and Services pages update automatically.

**"Change the menu / navigation links"**
Edit the `nav` list in `brand.json`.

**"Reword the homepage / about page / etc."**
Edit the text under the `---` block in the matching `.md` file in `src/`. Standard Markdown works: `## Heading`, blank line between paragraphs, `[link text](https://url)`.

**"Add a new page"** (e.g. a Pricing or FAQ page)
1. Create a new file `src/pricing.md`.
2. Copy the front-matter block from `about.md` and change `title`, `description`, and `permalink` (e.g. `permalink: /pricing/`).
3. Add the page to the `nav` list in `brand.json` so it appears in the menu.

**"Change the logo / add a photo"**
Add the image file to `src/assets/images/`, then reference it. For a real image logo in the header, that's a small template change — flag it as a design edit and proceed carefully.

**"Update the copyright year"**
Nothing to do — the footer year updates automatically.

---

## Content & SEO work (the recurring services)

**Publish a blog post** (the content service)
1. Create a file in `src/blog/`, e.g. `src/blog/5-tips-for-spring.md`.
2. Add front matter at the top:
   ```
   ---
   title: "5 tips for spring maintenance"
   date: 2026-03-04
   description: "A one-line summary for search results and the blog index."
   ---
   ```
3. Write the article body in Markdown below the `---`. The post's page, URL,
   date, blog-index listing, and sitemap entry are all created automatically.
   Nothing else to touch.

**Add a local landing page** (the local-SEO play)
A page targeting "[service] in [town]" is just a normal page. Copy `about.md`
to e.g. `src/plumbing-springfield.md`, set `permalink: /plumbing-springfield/`,
write location-specific copy, and (optionally) add it to `nav` in brand.json.

**Set up local SEO / structured data**
Fill in the `seo` block in `brand.json` (business type, address, city/region,
price range, service area). This generates the LocalBusiness structured data
that helps the business show up in local search and map results. It's applied
site-wide automatically — no template edits.

**Good SEO defaults are already built in:** every page has a unique title and
meta description, a canonical URL, social-share tags, structured data, and the
site auto-generates `sitemap.xml` and `robots.txt`. The static build is already
fast and mobile-friendly, which is most of technical SEO handled for free.

---

## How changes go live

1. Make the edit in the repository.
2. Save / commit the change.
3. Cloudflare Pages detects the commit and rebuilds the site (about 30 seconds).
4. The change appears on the live domain.

**Preview before public:** any change pushed to a non-production branch (or opened as a pull request) gets its own temporary preview URL from Cloudflare. Use that to check a change before merging it to the live site.

**Rollback:** because every change is a commit, any mistake can be undone by reverting to the previous commit in GitHub. Nothing is ever permanently broken.

---

## Building locally (optional, for testing)

```
npm install      # first time only
npm start        # live preview at http://localhost:8080
npm run build    # produces the final site in _site/
```

The owner does **not** need to do this — Cloudflare builds the site in the cloud. It's only here for testing.

---

## Per-client setup note

When this template is cloned for a new client, the values in `brand.json` and the wording in the four Markdown files are placeholders (currently "Acme Co."). Replace them with the real business details before launch. See `NEW-CLIENT-CHECKLIST.md`.
