import siteData from '../../content/site.json';
import homeData from '../../content/home.json';
import aboutData from '../../content/about.json';
import contactData from '../../content/contact.json';

export interface SocialLinks {
  email: string;
  linkedin: string;
  fiverr: string;
  instagram: string;
  behance: string;
}

export interface SiteConfig {
  name: string;
  title: string;
  email: string;
  linkedin: string;
  fiverr: string;
  instagram: string;
  behance: string;
  location: string;
  availability: string;
  resume: string;
  avatar: string;
  footer_text: string;
  seo: {
    title: string;
    description: string;
    og_image: string;
  };
  contact_form: {
    provider: string;
    formspree_endpoint: string;
    web3forms_key: string;
  };
  expertise_ticker: string[];
}

export interface ProjectSection {
  type: string;
  heading?: string;
  body?: string;
  image?: string;
  alt?: string;
  images?: Array<{ src: string; alt?: string }>;
  before?: { src: string; alt?: string };
  after?: { src: string; alt?: string };
  caption?: string;
  image_position?: 'left' | 'right';
  url?: string;
  file?: string;
  poster?: string;
}

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
  sections: ProjectSection[];
}

// Eager-load all project JSON files at build/dev time.
const projectModules = import.meta.glob<{ default: Project }>('../../content/projects/*.json', {
  eager: true,
});

const rawProjects: Project[] = Object.values(projectModules).map((m) => m.default as Project);

export const site: SiteConfig = siteData as SiteConfig;
export const home = homeData as any;
export const about = aboutData as any;
export const contact = contactData as any;

export function getAllProjects(): Project[] {
  return rawProjects
    .filter((p) => p.published !== false)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((p) => p.featured && p.show_on_home !== false);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug);
}

export function getProjectNeighbors(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
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
  print: 'Print',
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
