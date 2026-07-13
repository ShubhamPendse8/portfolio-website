# Shubham Pendse Portfolio — PRD

## Original Problem Statement (summary)
Redesign the existing personal portfolio into a premium, production-ready "Dark Editorial Glass" creative portfolio. Preserve identity (dark theme, orange accents, bold typography), add refined Apple-inspired glass depth, better editorial layouts, reusable content architecture, Git-backed CMS (Pages CMS), and easy project updates without editing code. Deploy to GitHub Pages at `/portfolio-website/`.

## User Choices (from ask_human)
- **Contact form**: All three providers configurable — Formspree endpoint, Web3Forms key, mailto fallback. Default to mailto until a provider is configured. No fake success messages.
- **GitHub Pages base path**: `https://shubhampendse8.github.io/portfolio-website/` (project-page deploy). Custom-domain swap is documented in README.
- **UI/UX projects**: Kept all 4 concept projects with placeholders + CMS toggles for publish/featured/show_on_home.
- **Fiverr / availability**: Left editable CMS placeholders (user did not provide).
- **Fonts**: Editorial pairing — **Fraunces** (display) + **Instrument Sans** (body).

## Architecture
- **Stack**: Astro 4.16 (static SSG) + vanilla CSS with design tokens + Pages CMS for editing
- **Routing**: File-based; dynamic `/projects/[slug]` from `content/projects/*.json`
- **Content**: All editable content in `/content/` (site, home, about, contact, projects/). Read via `import.meta.glob` in `src/lib/content.ts`.
- **Design tokens**: `src/styles/global.css` — CSS variables for colours, type, spacing, radii, motion, shadows, breakpoints. Dark + light themes.
- **Deployment**: `.github/workflows/deploy.yml` — auto build & deploy to GitHub Pages on push.
- **Legacy URLs**: preserved via static redirect pages (`social-media.html.astro`, `ui-ux.html.astro`, `visol-india.html.astro`, `projects.html.astro`, `about.html.astro`, `contact.html.astro`).

## What's Been Implemented (2026-01)
- [x] Astro project scaffold + supervisor wiring (frontend on port 3000, base path `/portfolio-website`)
- [x] Design system: Dark Editorial Glass tokens, orange accents, Fraunces + Instrument Sans typography, subtle ambient warm glow + noise texture
- [x] Reusable components: Nav (floating glass), Footer, ProjectCard (featured/standard/compact variants), CaseStudySection (8 block types), Lightbox, CommandMenu (⌘K)
- [x] BaseLayout with theme init (no flash), OG/Twitter meta, favicons, canonical URLs, Fraunces + Instrument Sans font loading
- [x] Home page: hero + ticker + capabilities grid + featured work + about preview + final CTA glass panel
- [x] Work page: sticky filter bar (All + 6 categories), responsive project grid, deep-linkable `?category=xxx`
- [x] About page: hero + portrait + 6-step timeline + experience + tools (exact required order, no HTML/CSS) + 5-item philosophy + interests
- [x] Contact page: hero + meta panel + Elsewhere social panel + form (name/email/company/type/budget/message) with client-side validation + honeypot + configurable provider (Formspree/Web3Forms/mailto — no fake success on mailto)
- [x] Dynamic case study page: breadcrumbs, hero image, meta grid, flexible section renderer (rich_text, image_full, text_image, image_pair, gallery, before_after, video, outcome), Prev/Next/All navigation
- [x] Content migration: all 9 projects (5 real: Visol India / DK's Tabla / Travizia / WOW Tasty Bites / Isha Tours; 4 UI/UX concepts marked as concept)
- [x] Pages CMS config (`.pages.yml`) with friendly labels, categorised project fields, repeatable case-study blocks, contact-form provider selector
- [x] Light theme: warm off-white, dark charcoal text, restrained orange, glass surfaces adapted
- [x] Command menu (⌘K/Ctrl+K) with filter, keyboard navigation, theme toggle
- [x] Image lightbox with keyboard nav, mobile swipe, close/prev/next
- [x] Legacy URL redirect pages (meta-refresh + JS)
- [x] Robots.txt + custom sitemap.xml endpoint
- [x] GitHub Actions deploy workflow
- [x] Responsive: mobile (360/390), tablet (768), desktop (1024/1440+) — no horizontal overflow
- [x] Accessibility: skip link, semantic HTML, keyboard-accessible filters/menu/lightbox, focus states, alt text, `prefers-reduced-motion`, `prefers-reduced-transparency`

## Testing
- Frontend testing agent: **95% pass** (2 minor issues fixed post-report)
  - Fixed: robots.txt sitemap URL corrected to `sitemap.xml`
  - Fixed: hero image removed from lightbox to match `1 / 6` gallery counter

## Backlog / Future Enhancements
- **P1**: User to upload real UI/UX project screenshots to replace the 4 concept placeholders (via Pages CMS → Projects)
- **P1**: User to add Fiverr URL, Instagram/Behance links, current availability status via Site Settings
- **P2**: Optional Formspree or Web3Forms configuration for direct form submissions (currently mailto fallback)
- **P2**: Case-study video embed testing (block type ready in schema)
- **P3**: OG social sharing image can be regenerated to match new dark editorial style
- **P3**: Add scroll-linked page progress indicator on case studies

## Deployment Notes
- Site config: `SITE = 'https://shubhampendse8.github.io'`, `BASE = '/portfolio-website'`
- Custom domain swap: change both constants in `astro.config.mjs` + add `public/CNAME`
- Node 20 required (GitHub Actions uses 20)
- Build output: `./dist/` — deploy artifact for GitHub Pages
