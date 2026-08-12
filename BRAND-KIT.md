# Brand Kit — the standardized brand token schema

The site's entire look is driven by a small, fixed set of **brand tokens**. This is
deliberate: no matter what a brand deliverable looks like (a PDF style guide, a slide,
a Figma export, a logo file), it always maps onto the *same* handful of fields. That
fixed target is what makes brand integration fast and repeatable — you're never
re-plumbing the template, only filling in tokens.

Every token lives in `src/_data/brand.json`.

---

## The token schema

### Colors — `brandColors`
| Token | Required | Role |
| --- | --- | --- |
| `primary` | ✅ | Headings, header, buttons, links, footer |
| `accent` | ✅ | Primary call-to-action buttons, highlights |
| `text` | ✅ | Body text |
| `background` | ✅ | Page background |
| `surface` | optional | Card / section background (defaults to a light grey) |
| `border` | optional | Hairlines and card borders (defaults) |
| `muted` | optional | Secondary text (defaults) |

Any valid CSS color works (`#hex`, `rgb()`, etc.). Change the four required colors and the whole site re-skins.

### Typography — `typography`
| Token | Role |
| --- | --- |
| `headingFont` | Font for headings (exact name, e.g. `"Playfair Display"`) |
| `bodyFont` | Font for body text (e.g. `"Inter"`) |
| `useGoogleFonts` | `true` loads both from Google Fonts automatically — no other setup |

Leave the font names empty to use the built-in defaults (Georgia headings, system body). If a font isn't on Google Fonts (a licensed brand typeface), see "Custom fonts" below.

### Logo — `logo`
| Token | Role |
| --- | --- |
| `image` | Path to the logo (e.g. `/assets/images/logo.svg`). If set, it replaces the business-name text in the header. |
| `alt` | Accessibility text (defaults to the business name) |
| `height` | Display height in pixels (default 40) |

Drop the logo file into `src/assets/images/`. SVG is best (crisp at any size); PNG is fine.

---

## Mapping a brand deliverable onto the tokens

Whatever form the brand asset takes, this is where each piece lands:

| From the brand deliverable | → Token |
| --- | --- |
| Primary / brand color | `brandColors.primary` |
| Secondary / action color | `brandColors.accent` |
| Text & background colors | `brandColors.text`, `brandColors.background` |
| Neutral / grey palette | `brandColors.surface`, `border`, `muted` |
| Headline typeface | `typography.headingFont` |
| Body typeface | `typography.bodyFont` |
| Logo (primary lockup) | `logo.image` (file → `assets/images/`) |
| Favicon / icon mark | `assets/images/favicon.svg` |

### How to bring one in
1. **Share the deliverable.** Readable formats include PDF, PowerPoint/Keynote, Word, images (PNG/JPG/SVG), or a Figma/Canva export. Claude reads the colors, fonts, and logo out of it.
2. **Claude extracts the tokens** and fills in `brand.json`, and drops the logo/favicon files into `assets/images/`.
3. **Build** — the site re-skins to the brand. Done.

The same extracted brand kit is reusable beyond the site — social headers, content, decks — so it's worth standardizing once per client.

### Custom / licensed fonts (not on Google Fonts)
Add the font files (`.woff2`) to `src/assets/fonts/`, add an `@font-face` block to the top of `styles.css`, and set `typography.headingFont` / `bodyFont` to the family name with `useGoogleFonts: false`. This is the only case that touches the stylesheet.
