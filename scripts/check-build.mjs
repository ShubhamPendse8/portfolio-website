#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const base = '/portfolio-website';
const errors = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function report(file, message) {
  errors.push(`${relative(root, file)}: ${message}`);
}

function localTargetExists(value) {
  const clean = value.split('#')[0].split('?')[0];
  if (!clean || clean.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(clean)) return true;

  const withoutBase = clean.startsWith(base) ? clean.slice(base.length) : clean;
  const path = withoutBase.replace(/^\/+/, '');
  if (!path) return existsSync(join(root, 'index.html'));

  return [
    join(root, path),
    join(root, path, 'index.html'),
    join(root, `${path}.html`),
  ].some(existsSync);
}

if (!existsSync(root)) {
  console.error('Build output is missing. Run the production build first.');
  process.exit(1);
}

const htmlFiles = walk(root).filter((file) => file.endsWith('.html'));

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const isRedirect = /<meta\b[^>]*http-equiv=["']refresh["']/i.test(html);

  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) report(file, 'missing html lang attribute');
  if (!/<title>\s*[^<]+\s*<\/title>/i.test(html)) report(file, 'missing non-empty title');
  if (!isRedirect && !/<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html)) report(file, 'missing meta description');

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (!isRedirect && h1Count !== 1) report(file, `expected exactly one h1, found ${h1Count}`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[0])) report(file, 'image missing alt attribute');
  }

  for (const match of html.matchAll(/<(?:a|link)\b[^>]*\bhref=["']([^"']+)["'][^>]*>|<(?:img|script|source)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const target = match[1] || match[2];
    if (!localTargetExists(target)) report(file, `broken local reference: ${target}`);
  }

  for (const match of html.matchAll(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi)) {
    if (!/\brel=["'][^"']*noopener[^"']*["']/i.test(match[0])) report(file, 'target="_blank" link missing rel="noopener"');
  }
}

if (errors.length) {
  console.error(`Generated-site checks found ${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(`✔ Checked ${htmlFiles.length} generated pages: links and accessibility basics passed.`);
