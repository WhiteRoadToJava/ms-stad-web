/**
 * Pulls the current price list from the API into the site.
 *
 * The site ships its own copy of the prices so the booking total can move as
 * the customer types, with no request in the loop. That copy has to come from
 * somewhere, and typing it twice is how the two drift apart.
 *
 * Run before a production build:
 *   npm run sync:prices
 *
 * The generated file is committed, so a build still works when the API is
 * unreachable — it just uses the prices from the last sync.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const API_URL = process.env.VITE_API_URL ?? 'http://localhost:4000/api';

const OUTPUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'data',
  'prices.generated.json',
);

const MONEY_FIELDS = ['pricePerSqm', 'minPrice', 'hourlyRate', 'packagePrice'];

const main = async () => {
  process.stdout.write(`Reading prices from ${API_URL}/services\n`);

  const response = await fetch(`${API_URL}/services`);

  if (!response.ok) {
    throw new Error(`The API answered ${response.status}`);
  }

  const { data } = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('The API returned no services; refusing to write an empty price list');
  }

  const prices = {};

  for (const service of data) {
    prices[service.slug] = {
      ...Object.fromEntries(
        MONEY_FIELDS.map((field) => [field, service[field] ?? null]),
      ),
      rutEligible: service.rutEligible,
      extras: Object.fromEntries(
        (service.extras ?? []).map((extra) => [extra.key, extra.price]),
      ),
    };
  }

  await writeFile(
    OUTPUT,
    `${JSON.stringify({ syncedAt: new Date().toISOString(), prices }, null, 2)}\n`,
  );

  process.stdout.write(`Wrote ${Object.keys(prices).length} services to ${OUTPUT}\n`);
};

main().catch((error) => {
  // A failed sync must not produce a site with no prices, so the build stops
  // here and the previous generated file stays untouched.
  process.stderr.write(`Price sync failed: ${error.message}\n`);
  process.exit(1);
});
