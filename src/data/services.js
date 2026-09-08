/**
 * Service catalogue.
 *
 * This is the client side mirror of the `services` table: it lets the booking
 * calculator show a price instantly, without a round trip. The server always
 * recalculates before saving, so a tampered client price is never trusted.
 *
 * All amounts are in ore (1 kr = 100 ore).
 */

export const services = [
  {
    slug: 'hemstadning',
    i18nKey: 'homeCleaning',
    category: 'private',
    pricingModel: 'per_sqm',
    pricePerSqm: 2100,
    minPrice: 52500,
    rutEligible: true,
    isPopular: true,
    extras: [
      { key: 'oven', price: 25000 },
      { key: 'fridge', price: 25000 },
      { key: 'windows', price: 45000 },
      { key: 'balcony', price: 20000 },
    ],
  },
  {
    slug: 'flyttstadning',
    i18nKey: 'movingCleaning',
    category: 'private',
    pricingModel: 'per_sqm',
    pricePerSqm: 2800,
    minPrice: 168000,
    rutEligible: true,
    extras: [
      { key: 'balcony', price: 30000 },
      { key: 'garage', price: 45000 },
      { key: 'attic', price: 45000 },
    ],
  },
  {
    slug: 'storstadning',
    i18nKey: 'deepCleaning',
    category: 'private',
    pricingModel: 'per_sqm',
    pricePerSqm: 2600,
    minPrice: 156000,
    rutEligible: true,
    extras: [
      { key: 'oven', price: 25000 },
      { key: 'windows', price: 45000 },
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

export const getService = (slug) => services.find((service) => service.slug === slug);

export const privateServices = services.filter(
  (service) => service.category === 'private',
);
export const businessServices = services.filter(
  (service) => service.category === 'business',
);
