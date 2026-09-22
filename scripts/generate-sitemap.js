/**
 * Writes dist/sitemap.xml and dist/robots.txt after the static build.
 *
 * The sitemap is built from the HTML files the generator actually produced,
 * not from a hand kept list of routes. When the city landing pages arrive they
 * appear here on their own, and a page that is removed disappears from it,
 * so the sitemap can never promise Google a page that returns 404.
 *
 * A page is left out if its own markup asks not to be indexed, which is how
 * the admin shell excludes itself without being named here.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://mastad.se').replace(/\/+$/, '');

/** Files that are never pages a visitor should land on from search. */
const EXCLUDED = new Set(['404.html']);

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return files.flat();
};

/** dist/index.html → /, dist/priser.html → /priser, dist/tjanster/x.html → /tjanster/x */
const toUrlPath = (file) => {
  const relative = path.relative(DIST, file).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  return `/${relative.replace(/(?:\/index)?\.html$/, '')}`;
};

const isNoIndex = (html) =>
  /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);

/** Pages that must exist and be reachable, but that nobody searches for. */
const LOW_PRIORITY = new Set(['/integritetspolicy', '/villkor']);

/** Shallow pages first: the home page, then sections, then individual services. */
const priorityFor = (urlPath) => {
  if (urlPath === '/') return '1.0';
  if (LOW_PRIORITY.has(urlPath)) return '0.3';
  const depth = urlPath.split('/').filter(Boolean).length;
  return depth === 1 ? '0.8' : '0.6';
};

const escapeXml = (value) =>
  value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]);

const main = async () => {
  const htmlFiles = (await walk(DIST)).filter((file) => file.endsWith('.html'));

  const pages = [];

  for (const file of htmlFiles) {
    if (EXCLUDED.has(path.basename(file))) continue;

    const html = await readFile(file, 'utf8');
    if (isNoIndex(html)) continue;

    pages.push(toUrlPath(file));
  }

  pages.sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map(
      (urlPath) =>
        `  <url><loc>${escapeXml(SITE_URL + urlPath)}</loc><priority>${priorityFor(urlPath)}</priority></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');

  // /admin is also noindex in its own markup; listing it here keeps crawlers
  // from spending their visit on a login screen at all.
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
  await writeFile(path.join(DIST, 'robots.txt'), robots);

  process.stdout.write(`Sitemap: ${pages.length} pages for ${SITE_URL}\n`);
};

main().catch((error) => {
  process.stderr.write(`Sitemap generation failed: ${error.message}\n`);
  process.exit(1);
});
