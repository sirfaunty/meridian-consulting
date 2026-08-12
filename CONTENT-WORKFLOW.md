# Content Publishing Workflow (Tier 3)

The repeatable process for the content service: a client sends a draft (or a
topic), and it comes out the other side as a published, SEO-optimized post — with
as little of your time in the middle as possible. The quality gate is what makes
"hands-off" safe.

---

## The pipeline

```
Intake  →  Draft + optimize  →  Quality gate  →  Preview  →  Publish  →  Notify
(client)     (Claude)           (content-lint)   (Cloudflare)  (merge)   (client + log)
```

### 1. Intake
Pick ONE channel per client so submissions are predictable:
- A dedicated email address (e.g. content@youragency.com)
- A simple form (Google Form / Typeform)
- A shared Drive/Dropbox folder they drop drafts into

The client sends a rough draft, bullet points, or just a topic. That's all they do.

### 2. Draft + optimize (Claude)
Claude turns the raw input into a finished post, using the site's `CLAUDE.md`
(structure) and brand voice. It:
- Writes a search-friendly **title** (30–65 chars) and **meta description** (120–160 chars).
- Structures the body with **H2/H3** headings (never a second H1).
- Adds at least one **internal link** to a relevant page/post.
- Adds **alt text** to every image.
- Keeps the brand's voice and reading level.
- Saves it to `src/blog/<slug>.md` with correct front matter.

### 3. Quality gate (automated)
`npm run content:lint` (and the **Content check** GitHub Action on every PR) verifies
the SEO essentials — front matter, title/description length, headings, internal links,
alt text, length. A post can't publish with failures. This is the check that replaces
you eyeballing every post.

### 4. Preview
Commit to a branch and open a PR → Cloudflare builds a **preview URL** automatically.
Review there if you want a human look; skip straight to publish for trusted clients.

### 5. Publish
Merge to the main branch → Cloudflare auto-deploys → the post is live, and it's
automatically added to the blog index and `sitemap.xml`.

### 6. Notify
Send the client the live URL. Log the post against their monthly plan allotment.

---

## Two operating modes
- **Reviewed (default at first):** Claude opens a PR; you approve the preview; merge publishes. One click of your attention per post.
- **Auto-publish (trusted clients):** the pipeline merges automatically once the quality gate passes. Zero touch. Move a client here once you trust the cadence.

## On a schedule (for content plans)
- **Weekly publish sweep:** a Cowork scheduled task takes anything queued and runs it through the pipeline (e.g. Monday mornings).
- **Monthly SEO/idea brief:** Claude proposes the next month's topics from the niche + the client's services, so you're never starting from a blank page.

## SEO optimization checklist (what Claude applies)
- Primary keyword in the title, first paragraph, and one H2.
- Meta description that reads like an ad, not a summary.
- Internal links to money pages (services / contact).
- Descriptive alt text; compressed images.
- Local terms where relevant ("[service] in [town]").
- One clear call to action near the end.
