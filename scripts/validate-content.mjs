#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Content validation — runs before every production build.
 *
 * Validates all editable content files (content/**.json) against Zod schemas
 * so invalid data never replaces a working live deployment.
 *
 * Exits with code 1 and a clear "file → field → problem" message on failure.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT = join(ROOT, 'content');

// ---------- helpers ---------------------------------------------------------

const CATEGORY_VALUES = ['social-media', 'ui-ux', 'branding', 'presentations', 'print', 'motion'];

/** Accept both a string and an array of strings, and normalise to array. */
const stringOrStringArray = z.preprocess((val) => {
  if (val == null) return [];
  if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
  return val;
}, z.array(z.string()).default([]));

const linkSchema = z.object({ label: z.string(), url: z.string() });
const imageEntry = z.object({ src: z.string(), alt: z.string().default('') });

// ---------- section schemas -------------------------------------------------

const sectionSchema = z.union([
  z.object({ type: z.literal('rich_text'), heading: z.string().optional(), body: z.string(), images: z.array(imageEntry).default([]) }),
  z.object({ type: z.literal('image_full'), heading: z.string().optional(), image: z.string(), alt: z.string().default(''), caption: z.string().optional() }),
  z.object({ type: z.literal('text_image'), heading: z.string().optional(), body: z.string(), image: z.string(), alt: z.string().default(''), image_position: z.enum(['left', 'right']).default('right') }),
  z.object({ type: z.literal('image_pair'), heading: z.string().optional(), images: z.array(imageEntry).length(2) }),
  z.object({
    type: z.literal('gallery'),
    heading: z.string().optional(),
    images: z.array(imageEntry).min(1),
    fit: z.enum(['cover', 'contain']).optional(),
    ratio: z.enum(['square', 'portrait', 'landscape']).optional(),
  }),
  z.object({ type: z.literal('before_after'), heading: z.string().optional(), before: imageEntry, after: imageEntry, caption: z.string().optional() }),
  z.object({ type: z.literal('video'), heading: z.string().optional(), url: z.string().optional(), file: z.string().optional(), poster: z.string().optional() }),
  z.object({ type: z.literal('outcome'), heading: z.string().default('Outcome'), body: z.string() }),

  // NEW block types
  z.object({
    type: z.literal('project_snapshot'),
    heading: z.string().default('Project Snapshot'),
    client: z.string().optional(),
    industry: z.string().optional(),
    year: z.string().optional(),
    duration: z.string().optional(),
    role: z.string().optional(),
    team: z.string().optional(),
    services: z.array(z.string()).default([]),
    deliverables: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
  }),
  z.object({
    type: z.literal('audience_constraints'),
    heading: z.string().optional(),
    audience: z.string().optional(),
    constraints: z.string().optional(),
    brief: z.string().optional(),
  }),
  z.object({
    type: z.literal('process'),
    heading: z.string().default('Process'),
    steps: z.array(z.object({ title: z.string(), body: z.string().optional() })).min(1),
  }),
  z.object({
    type: z.literal('concepts'),
    heading: z.string().default('Concepts & Iterations'),
    body: z.string().optional(),
    images: z.array(imageEntry).default([]),
  }),
  z.object({
    type: z.literal('design_rationale'),
    heading: z.string().default('Design Decisions'),
    body: z.string().optional(),
    items: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  }),
  z.object({ type: z.literal('reflection'), heading: z.string().default('Reflection'), body: z.string() }),
  z.object({
    type: z.literal('cta'),
    heading: z.string().optional(),
    body: z.string().optional(),
    primary: linkSchema.optional(),
    secondary: linkSchema.optional(),
  }),
]).superRefine((val, ctx) => {
  if (val.type === 'video' && !val.url && !val.file) {
    ctx.addIssue({ code: 'custom', message: 'video block needs either a `url` or a `file`' });
  }
});

// ---------- top-level schemas -----------------------------------------------

const projectSchema = z.object({
  title: z.string().min(1, 'title is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, digits, and hyphens only'),
  client: z.string().optional().default(''),
  year: z.string().optional().default(''),
  categories: stringOrStringArray,
  disciplines: stringOrStringArray,
  summary: z.string().optional().default(''),
  thumbnail: z.string().optional().default(''),
  thumbnail_alt: z.string().optional().default(''),
  hero_image: z.string().optional().default(''),
  hero_image_alt: z.string().optional().default(''),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  show_on_home: z.boolean().default(false),
  order: z.number().default(100),
  role: z.string().optional().default(''),
  tools: stringOrStringArray,
  services: stringOrStringArray,
  outcome: z.string().optional().default(''),
  seo: z.object({ title: z.string().optional().default(''), description: z.string().optional().default('') }).optional().default({ title: '', description: '' }),
  // NEW optional snapshot fields (also editable as a block, but accepted here for convenience)
  industry: z.string().optional().default(''),
  duration: z.string().optional().default(''),
  team: z.string().optional().default(''),
  deliverables: stringOrStringArray,
  sections: z.array(sectionSchema).default([]),
})
.superRefine((val, ctx) => {
  if (val.published) {
    if (!val.summary) ctx.addIssue({ code: 'custom', path: ['summary'], message: 'summary is required for published projects' });
    if (val.categories.length === 0) ctx.addIssue({ code: 'custom', path: ['categories'], message: 'published projects need at least one category' });
    for (const [i, c] of val.categories.entries()) {
      if (!CATEGORY_VALUES.includes(c)) ctx.addIssue({ code: 'custom', path: ['categories', i], message: `unknown category "${c}" — must be one of ${CATEGORY_VALUES.join(', ')}` });
    }
  }
});

const siteSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  email: z.string().email(),
  linkedin: z.string().optional().default(''),
  fiverr: z.string().optional().default(''),
  instagram: z.string().optional().default(''),
  behance: z.string().optional().default(''),
  location: z.string().min(1),
  availability: z.string().optional().default(''),
  years_experience: z.string().optional().default(''),
  resume: z.string().optional().default(''),
  avatar: z.string().optional().default(''),
  footer_text: z.string().optional().default(''),
  seo: z.object({ title: z.string().min(1), description: z.string().min(1), og_image: z.string().optional().default('') }),
  contact_form: z.object({
    provider: z.enum(['auto', 'formspree', 'web3forms', 'mailto']).default('auto'),
    formspree_endpoint: z.string().optional().default(''),
    web3forms_key: z.string().optional().default(''),
  }).default({ provider: 'auto', formspree_endpoint: '', web3forms_key: '' }),
  expertise_ticker: z.array(z.string()).default([]),
  analytics: z.object({
    provider: z.enum(['none', 'plausible', 'umami', 'ga4']).default('none'),
    domain: z.string().optional().default(''),
    site_id: z.string().optional().default(''),
    script_url: z.string().optional().default(''),
  }).optional().default({ provider: 'none', domain: '', site_id: '', script_url: '' }),
});

const homeSchema = z.object({
  hero: z.object({
    eyebrow: z.string().optional().default(''),
    heading: z.string().min(1),
    subheading: z.string().min(1),
    primary_cta: linkSchema,
    secondary_cta: linkSchema,
    resume_cta: linkSchema.optional(), // now optional — resume comes from site.json
    avatar_caption: z.object({ left: z.string().default(''), right: z.string().default('') }).optional().default({ left: '', right: '' }),
  }),
  capabilities: z.array(z.object({
    title: z.string(),
    description: z.string(),
    glyph: z.enum(['brand', 'social', 'uiux', 'deck', 'print', 'motion']),
  })).default([]),
  experience_snapshot: z.object({
    heading: z.string().default('Experience'),
    body: z.string().default(''),
    stats: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }).optional().default({ heading: 'Experience', body: '', stats: [] }),
  working_process: z.object({
    heading: z.string().default('How I work'),
    steps: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  }).optional().default({ heading: 'How I work', steps: [] }),
  about_preview: z.object({
    heading: z.string(),
    body: z.string(),
    cta: linkSchema,
  }),
  final_cta: z.object({
    heading: z.string(),
    body: z.string(),
    primary: linkSchema,
    secondary: linkSchema,
  }),
});

const aboutSchema = z.object({
  hero: z.object({ eyebrow: z.string().optional().default(''), heading: z.string(), body: z.string() }),
  journey: z.array(z.object({ year: z.string(), title: z.string(), description: z.string() })).default([]),
  experience_summary: z.string().default(''),
  tools: z.array(z.string()).default([]),
  philosophy: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  interests: z.array(z.string()).default([]),
});

const contactSchema = z.object({
  hero: z.object({ eyebrow: z.string().optional().default(''), heading: z.string(), body: z.string() }),
  project_types: z.array(z.string()).default([]),
  budget_ranges: z.array(z.string()).default([]),
  success_message: z.string().default('Message received.'),
  error_message: z.string().default('Something went wrong. Please email me directly.'),
});

// ---------- runner ----------------------------------------------------------

function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

let errorCount = 0;
function fail(file, err) {
  errorCount++;
  const rel = file.replace(ROOT + '/', '');
  if (err instanceof z.ZodError) {
    console.error(`\n❌  ${rel}`);
    for (const issue of err.issues) {
      const path = issue.path.length ? issue.path.join('.') : '<root>';
      console.error(`      • ${path}: ${issue.message}`);
    }
  } else {
    console.error(`\n❌  ${rel}: ${err.message}`);
  }
}

function check(schema, file) {
  const data = loadJSON(file);
  const result = schema.safeParse(data);
  if (!result.success) fail(file, result.error);
  return result.success ? result.data : null;
}

console.log('› Validating content…');

check(siteSchema, join(CONTENT, 'site.json'));
check(homeSchema, join(CONTENT, 'home.json'));
check(aboutSchema, join(CONTENT, 'about.json'));
check(contactSchema, join(CONTENT, 'contact.json'));

const projectsDir = join(CONTENT, 'projects');
const slugs = new Set();
if (existsSync(projectsDir)) {
  for (const filename of readdirSync(projectsDir)) {
    if (!filename.endsWith('.json')) continue;
    const file = join(projectsDir, filename);
    const parsed = check(projectSchema, file);
    if (parsed) {
      if (slugs.has(parsed.slug)) {
        errorCount++;
        console.error(`\n❌  content/projects/${filename}\n      • slug: "${parsed.slug}" is not unique — already used by another project`);
      }
      slugs.add(parsed.slug);
    }
  }
}

if (errorCount) {
  console.error(`\n${errorCount} content problem${errorCount === 1 ? '' : 's'} found. Fix them in Pages CMS (or the content/ JSON files) and try again.\n`);
  process.exit(1);
}

console.log('✔  All content is valid.');
