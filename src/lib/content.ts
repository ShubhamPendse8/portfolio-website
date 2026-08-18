import siteData from '../../content/site.json';
import homeData from '../../content/home.json';
import aboutData from '../../content/about.json';
import contactData from '../../content/contact.json';

// ---------- helpers ---------------------------------------------------------

/** Defensive: some CMS/user edits store multi-value fields as comma-separated strings. */
function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string' && x.trim());
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

// ---------- site ------------------------------------------------------------

export interface SiteConfig {
  name: string;
  title: string;
  email: string;
  linkedin?: string;
  fiverr?: string;
  instagram?: string;
  behance?: string;
  location: string;
  availability?: string;
  years_experience?: string;
  resume?: string;
  avatar?: string;
  footer_text?: string;
  seo: { title: string; description: string; og_image?: string };
  contact_form: { provider: string; formspree_endpoint?: string; web3forms_key?: string };
  expertise_ticker: string[];
  analytics?: { provider: string; domain?: string; site_id?: string; script_url?: string };
}

export const site: SiteConfig = siteData as SiteConfig;
export const home = homeData as any;
export const about = aboutData as any;
export const contact = contactData as any;

/** Only report a resume when a non-empty value is set. */
export function hasResume(): boolean {
  return !!(site.resume && site.resume.trim());
}

/** Social links that are actually set. */
export function activeSocials(): Array<{ label: string; href: string; kind: string }> {
  const list: Array<{ label: string; href: string; kind: string }> = [];
  if (site.email) list.push({ kind: 'email', label: 'Email', href: `mailto:${site.email}` });
  if (site.linkedin) list.push({ kind: 'linkedin', label: 'LinkedIn', href: site.linkedin });
  if (site.fiverr) list.push({ kind: 'fiverr', label: 'Fiverr', href: site.fiverr });
  if (site.instagram) list.push({ kind: 'instagram', label: 'Instagram', href: site.instagram });
  if (site.behance) list.push({ kind: 'behance', label: 'Behance', href: site.behance });
  return list;
}

// ---------- project sections ------------------------------------------------

export type ProjectSection =
  | { type: 'rich_text'; heading?: string; body: string; images?: Array<{ src: string; alt?: string }> }
  | { type: 'image_full'; heading?: string; image: string; alt?: string; caption?: string }
  | { type: 'text_image'; heading?: string; body: string; image: string; alt?: string; image_position?: 'left' | 'right' }
  | { type: 'image_pair'; heading?: string; images: Array<{ src: string; alt?: string }> }
  | { type: 'gallery'; heading?: string; images: Array<{ src: string; alt?: string }>; fit?: 'cover' | 'contain'; ratio?: 'square' | 'portrait' | 'landscape' }
  | { type: 'before_after'; heading?: string; before: { src: string; alt?: string }; after: { src: string; alt?: string }; caption?: string }
  | { type: 'video'; heading?: string; url?: string; file?: string; poster?: string }
  | { type: 'outcome'; heading?: string; body: string }
  | { type: 'project_snapshot'; heading?: string; client?: string; industry?: string; year?: string; duration?: string; role?: string; team?: string; services?: string[]; deliverables?: string[]; tools?: string[] }
  | { type: 'audience_constraints'; heading?: string; audience?: string; constraints?: string; brief?: string }
  | { type: 'process'; heading?: string; steps: Array<{ title: string; body?: string }> }
  | { type: 'concepts'; heading?: string; body?: string; images?: Array<{ src: string; alt?: string }> }
  | { type: 'design_rationale'; heading?: string; body?: string; items?: Array<{ title: string; body: string }> }
  | { type: 'reflection'; heading?: string; body: string }
  | { type: 'cta'; heading?: string; body?: string; primary?: { label: string; url: string }; secondary?: { label: string; url: string } };

export interface Project {
  title: string;
  slug: string;
  client: string;
  year: string;
  categories: string[];
  disciplines: string[];
  summary: string;
  thumbnail: string;
  thumbnail_alt: string;
  hero_image: string;
  hero_image_alt: string;
  featured: boolean;
  published: boolean;
  show_on_home: boolean;
  order: number;
  role: string;
  tools: string[];
  services: string[];
  outcome: string;
  seo: { title: string; description: string };
  industry?: string;
  duration?: string;
  team?: string;
  deliverables?: string[];
  sections: ProjectSection[];
}

// ---------- project loading -------------------------------------------------

const projectModules = import.meta.glob<{ default: any }>('../../content/projects/*.json', { eager: true });

const rawProjects: Project[] = Object.values(projectModules).map((m) => {
  const p = m.default as any;
  return {
    ...p,
    categories: toArray(p.categories),
    disciplines: toArray(p.disciplines),
    tools: toArray(p.tools),
    services: toArray(p.services),
    deliverables: toArray(p.deliverables),
    sections: Array.isArray(p.sections) ? p.sections : [],
    order: typeof p.order === 'number' ? p.order : 100,
  } as Project;
});

export function getAllProjects(): Project[] {
  return rawProjects.filter((p) => p.published !== false).sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((p) => p.featured && p.show_on_home !== false);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug);
}

export function getProjectNeighbors(slug: string): { prev: Project | null; next: Project | null } {
  const list = getAllProjects();
  const idx = list.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? list[idx - 1] : list[list.length - 1],
    next: idx < list.length - 1 ? list[idx + 1] : list[0],
  };
}

export const categoryLabels: Record<string, string> = {
  'social-media': 'Social Media',
  'ui-ux': 'UI/UX',
  branding: 'Branding',
  presentations: 'Presentations',
  print: 'Print & Editorial',
  motion: 'Motion',
};

export function getCategories(): { id: string; label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const p of getAllProjects()) {
    for (const c of p.categories || []) counts[c] = (counts[c] || 0) + 1;
  }
  return Object.keys(counts)
    .map((id) => ({ id, label: categoryLabels[id] ?? id, count: counts[id] }))
    .sort((a, b) => b.count - a.count);
}

// ---------- URL helpers -----------------------------------------------------

/** Build a URL using Astro's configured base path. Safe for empty inputs. */
export function withBase(basePath: string, path?: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const base = basePath.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
}
