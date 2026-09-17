/**
 * Service catalogue.
 *
 * This is the client side mirror of the `services` table: it lets the booking
 * calculator show a price instantly, without a round trip. The server always
 * recalculates before saving, so a tampered client price is never trusted.
 *
 * The structure below — slugs, categories, pricing models, which extras exist —
 * is code and changes with a deploy. The amounts are data and come from
 * prices.generated.json, written by `npm run sync:prices` from the live price
 * list. Nobody types a price in two places.
 *
 * All amounts are in ore (1 kr = 100 ore) and are stored BEFORE the RUT
 * deduction, exactly like the `services` table. Competitors publish after-RUT
 * figures, so 21 kr/kvm advertised elsewhere is 42 kr/kvm here. Use
 * `startingPrice()` from ./pricing.js when showing a price to a customer.
 */
import generated from './prices.generated.json';

const catalogue = [
  {
    slug: 'hemstadning',
    i18nKey: 'homeCleaning',
    category: 'private',
    pricingModel: 'per_sqm',
    pricePerSqm: 4200,
    minPrice: 105000,
    rutEligible: true,
    isPopular: true,
    extras: [
      { key: 'oven', price: 40000 },
      { key: 'fridge', price: 40000 },
      { key: 'windows', price: 60000 },
      { key: 'balcony', price: 30000 },
    ],
  },
  {
    slug: 'flyttstadning',
    i18nKey: 'movingCleaning',
    category: 'private',
    pricingModel: 'per_sqm',
    pricePerSqm: 5600,
    minPrice: 336000,
    rutEligible: true,
    extras: [
      { key: 'balcony', price: 30000 },
      { key: 'garage', price: 80000 },
    ],
  },
  {
    slug: 'storstadning',
    i18nKey: 'deepCleaning',
    category: 'private',
    pricingModel: 'per_sqm',
    pricePerSqm: 5200,
    minPrice: 312000,
    rutEligible: true,
    extras: [
      { key: 'oven', price: 40000 },
      { key: 'windows', price: 60000 },
    ],
  },
  {
    slug: 'fonsterputs',
    i18nKey: 'windowCleaning',
    category: 'private',
    pricingModel: 'quote_only',
    rutEligible: true,
  },
  {
    slug: 'flytthjalp',
    i18nKey: 'movingHelp',
    category: 'private',
    pricingModel: 'package',
    packagePrice: 299500,
    rutEligible: true,
  },
  {
    slug: 'kontorsstad',
    i18nKey: 'officeCleaning',
    category: 'business',
    pricingModel: 'hourly',
    hourlyRate: 39900,
    rutEligible: false,
  },
  {
    slug: 'trappstadning',
    i18nKey: 'stairwellCleaning',
    category: 'business',
    pricingModel: 'quote_only',
    rutEligible: false,
  },
  {
    slug: 'byggstadning',
    i18nKey: 'constructionCleaning',
    category: 'business',
    pricingModel: 'quote_only',
    rutEligible: false,
  },
  {
    slug: 'butiksstadning',
    i18nKey: 'retailCleaning',
    category: 'business',
    pricingModel: 'quote_only',
    rutEligible: false,
  },
];

/**
 * Lays the synced amounts over the catalogue. A service or an extra that is
 * missing from the sync keeps the value written here, so a partial sync can
 * never leave the site with no price at all.
 */
const withSyncedPrices = (service) => {
  const synced = generated.prices?.[service.slug];

  if (!synced) return service;

  return {
    ...service,
    pricePerSqm: synced.pricePerSqm ?? service.pricePerSqm,
    minPrice: synced.minPrice ?? service.minPrice,
    hourlyRate: synced.hourlyRate ?? service.hourlyRate,
    packagePrice: synced.packagePrice ?? service.packagePrice,
    rutEligible: synced.rutEligible ?? service.rutEligible,
    extras: service.extras?.map((extra) => ({
      ...extra,
      price: synced.extras?.[extra.key] ?? extra.price,
    })),
  };
};

export const services = catalogue.map(withSyncedPrices);

/** When the amounts above were last pulled from the API, or null if never. */
export const pricesSyncedAt = generated.syncedAt ?? null;

export const getService = (slug) => services.find((service) => service.slug === slug);

export const privateServices = services.filter(
  (service) => service.category === 'private',
);
export const businessServices = services.filter(
  (service) => service.category === 'business',
);
