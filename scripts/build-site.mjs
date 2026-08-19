#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const site = JSON.parse(readFileSync(join(ROOT, 'content', 'site.json'), 'utf8'));
const originals = new Map();

const asPublicFile = (value) => {
  if (!value || /^https?:\/\//i.test(value)) return null;
  return join(PUBLIC, value.replace(/^\/+/, ''));
};

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function optimizeInPlace(file, kind) {
  if (!file || !existsSync(file)) return;

  const original = readFileSync(file);
  const extension = extname(file).toLowerCase();
  let pipeline = sharp(original).rotate();

  pipeline = pipeline.resize({
    width: kind === 'avatar' ? 1200 : 1600,
    withoutEnlargement: true,
  });

  let optimized;
  if (extension === '.jpg' || extension === '.jpeg') {
    optimized = await pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();
  } else if (extension === '.png') {
    optimized = await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
  } else if (extension === '.webp') {
    optimized = await pipeline.webp({ quality: 82, effort: 4 }).toBuffer();
  } else {
    console.log(`› Skipping unsupported ${kind} format: ${extension || 'unknown'}`);
    return;
  }

  if (optimized.length >= original.length) {
    console.log(`› ${kind} already compact enough (${kb(original.length)}).`);
    return;
  }

  originals.set(file, original);
  writeFileSync(file, optimized);
  console.log(`✔ Optimized ${kind}: ${kb(original.length)} → ${kb(optimized.length)}`);
}

try {
  await optimizeInPlace(asPublicFile(site.avatar), 'avatar');
  await optimizeInPlace(asPublicFile(site.seo?.og_image), 'social preview');

  const astroBin = join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro');
  const result = spawnSync(astroBin, ['build'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  for (const [file, original] of originals) writeFileSync(file, original);
}

if (process.exitCode) process.exit(process.exitCode);
