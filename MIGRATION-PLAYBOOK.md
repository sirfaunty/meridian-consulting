# Website Modernization Playbook

**Purpose:** a repeatable process for moving an existing WordPress or Wix brochure
site onto this stack. Migration is the front door to the whole business — it's how
a prospect becomes a managed, recurring client. Price it to win the relationship,
not the one-time job.

---

## The three paths (and which to lead with)

| Path | What it is | Effort for you | When to use |
| --- | --- | --- | --- |
| **A. Recreate exactly** | Pixel-match the old design + copy | **Highest** — bespoke, no template leverage | Only if a client insists; charge a premium |
| **B. Recreate + optimize** | Same look, but fast/mobile/SEO/clean | Medium–high | Client is attached to their current look |
| **C. Modernize on the template** | Keep their content + brand, rebuild on our template | **Lowest** — full template leverage | **Default offer** |

Counterintuitive but true: **Path C is the least work and the best outcome**,
because you pour their proven copy and images into a site you've already built and
tested instead of hand-matching an old design. Lead with C ("we'll make your site
faster, easier to find, and fully managed"). Reserve A/B for clients who love their
current look, and price A as a premium.

---

## The productized process

### 1. Audit (15–30 min)
- Note platform (WordPress / Wix / other), page count, and any dynamic features
  (forms, booking, e-commerce, membership). Brochure sites rarely have these;
  when present, plan a replacement (embed a form service, Calendly, etc.).
- Capture the current site map and top pages by traffic (for redirect priorities).
- Confirm **who owns the domain** and **where email is hosted** (critical — see step 6).

### 2. Extract the content
- **WordPress:** run the importer — `npm run import:wp -- https://oldsite.com`.
  It pulls pages, posts, and media via the REST API and writes draft Markdown,
  a `brand.hints.json`, a media list, and an old→new `_redirects.imported` map.
  (If the REST API is disabled, export via Tools → Export, or read pages directly.)
- **Wix:** no clean export — read the live pages (Claude via browser/WebFetch),
  and pull copy + images manually. For a few brochure pages this is quick.

### 3. Map & rebuild onto the template (Path C)
- Fill in `src/_data/brand.json` from the extracted hints (name, tagline, colors
  from their logo, services, contact, `seo` block).
- Move the draft page content into the template's Markdown files; polish copy.
- Move posts into `src/blog/`. Add images to `src/assets/images/`.

### 4. Optimize (the value-add)
- Unique title + meta description per page; clean heading structure.
- Confirm LocalBusiness schema, sitemap, and robots are populated (built in).
- Compress images; check mobile and speed (static build is already fast).

### 5. Preserve URLs (protect their SEO) — **do not skip**
- Merge `_redirects.imported` into `src/_redirects`, mapping every old URL to its
  new page (`/old-path  /new-path  301`). Missing this loses their Google rankings.

### 6. Cut over DNS **without breaking email** — **do not skip**
- The domain move only changes where the *website* points. If their **email** runs
  on the same domain, preserve the MX and mail-related DNS records exactly.
- Add the domain to your Cloudflare Pages project; update the A/CNAME for the site
  only. Verify email still sends/receives before and after.

### 7. Launch & convert to recurring
- Go live, confirm HTTPS (Cloudflare auto-provisions).
- Onboard them onto a recurring plan — this is the point of the whole exercise.
- Hand off using `CLAUDE.md` so ongoing edits stay safe.

---

## Pricing — migration as an acquisition wedge

The one-time fee is not where the money is; the recurring relationship is. Price
the migration to remove friction and capture the client.

| Offer | Scope | One-time | With a plan |
| --- | --- | --- | --- |
| **Modernization Lite** | Up to 5 pages, rebuilt on template, content migrated, redirects, launch | $1,200 | **Waived** with a 12-mo Care+ commitment |
| **Modernization Pro** | Up to 10 pages + blog import + on-page SEO + brand refresh | $2,500 | Half off with a 12-mo Growth commitment |
| **Exact-match (Path A)** | Pixel-match an existing bespoke design | +$1,500 premium | — |

**The wedge pitch:** *"We'll modernize and migrate your site for free when you start
a management plan."* You recover the (low, Claude-accelerated) migration effort over
the recurring term, and you've converted a one-off prospect into an ongoing client.
Target businesses stuck on slow, aging WordPress or paying monthly Wix fees — often
you can beat their current bill and give them a better, managed site.

---

## Pre-launch gotcha checklist
- [ ] Every important old URL has a 301 redirect to its new page.
- [ ] Email still works (MX / mail DNS untouched).
- [ ] All forms/booking replaced and tested.
- [ ] Titles, meta descriptions, and `seo` block filled in.
- [ ] Images migrated and compressed; no hotlinks to the old host.
- [ ] Client owns the domain; you manage DNS.
- [ ] Recurring plan signed before or at launch.
