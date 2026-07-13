# Shubham Pendse — Portfolio (v2)

Personal portfolio of Shubham Pendse — Graphic Designer & UI/UX Designer.
Rebuilt as an editorial dark-glass portfolio with Astro + Pages CMS.

**Live**: https://shubhampendse8.github.io/portfolio-website/

## Stack

- [Astro](https://astro.build) — static-site generator, zero JS by default
- Vanilla CSS with design tokens (`src/styles/global.css`) — no framework CSS
- [Pages CMS](https://pagescms.org) — Git-backed content editor (`.pages.yml`)
- GitHub Pages — static hosting via GitHub Actions

## Local development

```bash
yarn install
yarn dev           # http://localhost:3000
yarn build         # builds to ./dist
yarn preview       # preview the production build
```

## Content editing (recommended path — no code required)

1. Go to https://pagescms.org and connect this repository.
2. Pages CMS reads `.pages.yml` and gives you friendly forms for:
   - **Site Settings** — name, email, socials, availability, resume, SEO, contact-form delivery
   - **Home Page**, **About Page**, **Contact Page**
   - **Projects** collection — every project is one file with all fields
3. Every save commits directly to the connected branch; GitHub Actions rebuilds and deploys.

### Adding a new project

1. In Pages CMS → **Projects** → **New project**.
2. Fill in `title`, `slug` (lowercase-with-hyphens), `client`, `year`.
3. Pick one or more **Categories** (Social Media, UI/UX, Branding, etc.).
4. Add **Thumbnail** + **Hero image** (uploads go to `public/uploads/`).
5. Set toggles: **Featured** (shows on home), **Published**, **Show on Homepage**.
6. Add any combination of **Case Study Sections** — text, images, galleries, before/after, video, outcome. Sections are addable, removable and reorderable.
7. Save. The project is automatically added to `/work`, its filter category, previous/next navigation, and (if featured) the homepage.

### Duplicating an existing project as a template

Pages CMS does not have one-click duplication yet. Fastest path:

1. Copy any file from `content/projects/*.json` (e.g. `visol-india.json`) to a new slug.
2. Open the new file in Pages CMS → change `title`, `slug` and content.
3. Or use the "New project" button and paste in the sections you need — the schema in `.pages.yml` includes every optional block, so nothing needs to be added manually.

## Contact form providers

Contact form delivery is configurable through **Site Settings → Contact Form Delivery**:

| Provider  | How to enable                                                                    |
| --------- | -------------------------------------------------------------------------------- |
| Formspree | Create a form at https://formspree.io → paste the endpoint URL into `formspree_endpoint`. |
| Web3Forms | Get a free access key at https://web3forms.com → paste it into `web3forms_key`.  |
| Mailto    | Default fallback. Opens the visitor's email client with a pre-filled message. **No fake success is ever shown** — the visitor is told the email client is opening.

Set `provider: auto` and the site picks whichever is configured. Set it explicitly (`formspree`, `web3forms`, or `mailto`) to force one.

## Deployment

The included GitHub Action (`.github/workflows/deploy.yml`) automatically builds and deploys to GitHub Pages on every push to `portfolio-v2-emergent` (rename in the workflow if you promote a different branch).

The site is configured for the project-page URL:

- **`site`**: `https://shubhampendse8.github.io`
- **`base`**: `/portfolio-website`

### Switching to a custom domain / root deployment

Open `astro.config.mjs` and change:

```js
const SITE = 'https://your-custom-domain.com';
const BASE = '/';   // was '/portfolio-website'
```

Then in **GitHub → Settings → Pages** → Custom Domain, add your domain and create a `public/CNAME` file with the domain. No other file changes are needed — every internal link, asset path and redirect uses `import.meta.env.BASE_URL`.

## Project structure

```
/
├── .pages.yml                # Pages CMS config
├── astro.config.mjs          # Site + base path + redirects
├── content/                  # All editable content (Pages CMS writes here)
│   ├── site.json
│   ├── home.json
│   ├── about.json
│   ├── contact.json
│   └── projects/
│       └── *.json            # One file per project
├── public/
│   ├── assets/               # Existing project images (preserved from v1)
│   └── uploads/              # New uploads from Pages CMS
├── src/
│   ├── layouts/BaseLayout.astro
│   ├── components/           # Nav, Footer, ProjectCard, Lightbox, CommandMenu, etc.
│   ├── pages/                # Astro routes (dynamic /projects/[slug].astro)
│   ├── lib/content.ts        # Content loader
│   └── styles/global.css     # Design tokens + globals
├── legacy/                   # Original v1 HTML/CSS/JS files (preserved for reference)
└── .github/workflows/deploy.yml
```

## Old URLs (backward compatibility)

These old routes still work via Astro redirects (see `astro.config.mjs`):

- `/projects.html` → `/work`
- `/social-media.html` → `/work?category=social-media`
- `/ui-ux.html` → `/work?category=ui-ux`
- `/about.html` → `/about`
- `/contact.html` → `/contact`
- `/visol-india.html` → `/projects/visol-india`

## Accessibility

- Semantic HTML, correct heading hierarchy on every page
- Keyboard-accessible navigation, filters, lightbox, command menu (`⌘K` / `Ctrl K`)
- Visible focus states everywhere
- `prefers-reduced-motion` and `prefers-reduced-transparency` respected
- Alt text on every image (Pages CMS enforces this per field)
- Colour contrast tested for dark and light themes
