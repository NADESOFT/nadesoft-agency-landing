# Nadesoft — Agency Landing Page

The public marketing site for **Nadesoft**, a software engineering agency providing dedicated development pods and fixed-scope SaaS builds for US & EU startups. Zero hiring time, zero hassle — bring the idea, we design, build, deploy, and maintain it.

Live at: **https://nadesoft.bd** (once DNS is configured — see [Deployment](#deployment-github-pages--custom-domain) below)

---

## Overview

This is a single-page, fully static site — no framework, no build step, no bundler. It's built with Tailwind CSS (via CDN) and Lucide Icons (via CDN), and is designed to be as fast to deploy and as cheap to maintain as possible while still looking like a polished, top-tier SaaS/dev-tools product page (Vercel / Linear / Stripe-tier visual bar).

### Sections

| Section | Purpose |
|---|---|
| Nav | Sticky header, anchor navigation, primary CTA |
| Hero | Positioning statement, dual CTAs, live stats bar |
| Trust strip | Quick proof-of-credibility bullets |
| Services | Backend, Full-Stack, Cloud/DevOps offering breakdown |
| Engagement Models | Dedicated Pod ($10k–$20k/mo) vs. Fixed-Scope MVP ($5,000+) |
| How We Work | 4-step process from first call to shipped product |
| Tech Ecosystem | Categorized stack badges (Backend, Frontend/Mobile, DB, Cloud/DevOps) |
| Case Studies | Smart Pathshala & KidsAI Platform, with metrics and tech tags |
| Contact | Lead capture form (writes to Google Sheets) |
| Footer | Nav, contact, copyright |

---

## Tech Stack

- **HTML5** — single file, semantic markup
- **[Tailwind CSS](https://tailwindcss.com/)** — via the Play CDN (`cdn.tailwindcss.com`), no build step
- **[Lucide Icons](https://lucide.dev/)** — via CDN (`unpkg.com/lucide`)
- **[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)** — via Google Fonts
- **Vanilla JavaScript** — mobile menu, scroll-reveal animations, form submission — no framework, no dependencies to install
- **Google Apps Script** — serverless backend for the lead form, writing submissions straight into a Google Sheet

No `npm install`, no `node_modules`, nothing to compile. Clone it and open `index.html`.

---

## Project Structure

```
.
├── index.html                    # The entire site — markup, styles, and scripts
├── assets/
│   ├── favicon.ico               # Multi-size favicon generated from the brand mark
│   ├── apple-touch-icon.png      # iOS home-screen icon
│   ├── logo-icon.png             # Icon-only mark, transparent background (nav/footer)
│   ├── logo-icon-square.png      # Padded square version of the icon mark
│   ├── logo-full.png             # Icon + wordmark lockup, transparent background
│   └── logo-512.png              # Large square icon (social/meta use)
├── google-apps-script/
│   └── Code.gs                   # Backend script for the contact form → Google Sheets
├── CNAME                         # GitHub Pages custom domain config (nadesoft.bd)
├── LICENSE
├── .gitignore
└── README.md
```

---

## Local Development

No build tooling is required. Any of the following works:

```bash
# Option 1 — just open it
open index.html          # macOS
start index.html         # Windows

# Option 2 — Python's built-in server
python -m http.server 5500

# Option 3 — Node's `serve`
npx serve .

# Option 4 — VS Code
# Right-click index.html → "Open with Live Server"
```

Then visit `http://localhost:5500` (or whatever port your tool of choice uses).

> Always hard-refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) after edits — Tailwind's CDN script and cached JS can otherwise mask changes.

---

## Deployment (GitHub Pages + Custom Domain)

This repo is ready to deploy to GitHub Pages as-is.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to **Settings → Pages** in your GitHub repo.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
3. Set **Branch** to `main` and folder to `/ (root)`.
4. Save.

### 3. Point your domain (`nadesoft.bd`) at GitHub Pages

A `CNAME` file containing `nadesoft.bd` is already committed to the repo root — GitHub Pages reads this automatically once Pages is enabled.

At your domain registrar / DNS provider, add these records for the **apex domain** (`nadesoft.bd`):

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

If you also want `www.nadesoft.bd` to work, add:

| Type | Host | Value |
|---|---|---|
| CNAME | `www` | `<your-username>.github.io` |

DNS propagation can take anywhere from a few minutes to 24 hours. Once it resolves, go back to **Settings → Pages**, confirm the custom domain shows a green checkmark, and enable **Enforce HTTPS**.

---

## Lead Form → Google Sheets

The contact form doesn't use a third-party form service — it posts directly to a **Google Apps Script Web App**, which writes each submission as a new row in a Google Sheet you own. This keeps leads in your own Google account with zero recurring cost and zero third-party data handling.

### Setup

1. Create a new Google Sheet (e.g. **"Nadesoft Leads"**). Add headers to row 1: `Timestamp | Name | Email | Engagement Type | Project Brief`.
2. In the Sheet: **Extensions → Apps Script**.
3. Delete the starter code and paste in the contents of [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
4. **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize the requested permissions, and copy the **Web app URL** (ends in `/exec`).
6. In [`index.html`](index.html), find the line near the bottom `<script>` block:
   ```js
   const SHEET_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
   Replace `YOUR_DEPLOYMENT_ID` with your actual deployed URL.

> If you edit `Code.gs` later, you must create a **new deployment version** (Manage deployments → Edit → New version) for the changes to take effect — updating the script alone does not update a live deployment.

---

## Customization

| What | Where |
|---|---|
| Colors / accent | `tailwind.config` block in `<head>` of `index.html` (currently indigo `#4f46e5` / `#6366f1` on slate-950) |
| Copy / headlines | Directly in the relevant `<section>` in `index.html` |
| Logo | Swap files in `assets/` — see [Regenerating brand assets](#regenerating-brand-assets) if you update the source logo |
| Stats / proof points | Hero "Floating Stats Bar" section |
| Case studies | `#work` section — duplicate a card block to add more |
| Engagement pricing | `#engagement` section |
| Contact endpoint | `SHEET_ENDPOINT` constant, see [Lead Form](#lead-form--google-sheets) above |

### Regenerating brand assets

The files in `assets/` were generated from a single source logo by chroma-keying out its black background and cropping the icon mark from the wordmark. If you get a new source logo, the same process (Python + Pillow) can regenerate `logo-icon.png`, `logo-full.png`, and the favicon set.

---

## Browser Support

Targets all evergreen browsers (Chrome, Edge, Firefox, Safari — desktop & mobile). Uses `backdrop-filter`, CSS Grid, and `IntersectionObserver`; no polyfills are included, as these are supported in every browser still in general use.

---

## License

Proprietary — see [LICENSE](LICENSE). This repository is public for transparency and portfolio purposes; it is not open-source software. The Nadesoft name, logo, and brand assets may not be reused or redistributed.

---

## Contact

**Nadesoft** — contact@nadesoft.com
