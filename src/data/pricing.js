/**
 * Price calculation, mirrored from the API.
 *
 * Keep this file in sync with `src/services/pricing.service.js` on the server.
 * The client copy exists purely so the calculator can update while the user
 * drags a slider; the server value is the one that gets stored.
 */

/**
 * A single visit costs more than a recurring one: travel, setup and admin are
 * paid for once instead of being spread over the year.
 */
export const frequencyModifier = {
  once: 1.35,
  monthly: 1.1,
  biweekly: 1,
  weekly: 0.95,
};

export const RUT_PERCENTAGE = 50;

/**
 * Share of the price that counts as labour, and is therefore RUT eligible.
 * Moving help includes a van and fuel, which do not qualify.
 */
export const labourShare = {
  default: 1,
  flytthjalp: 0.6,
};

/** Keeps every displayed amount a whole krona, never 1 483,50 kr. */
const roundToKronor = (ore) => Math.round(ore / 100) * 100;

const emptyBreakdown = {
  quoteOnly: true,
  basePrice: 0,
  extrasPrice: 0,
  grossPrice: 0,
  rutDeduction: 0,
  totalPrice: 0,
};

export const calculatePrice = (input) => {
  const {
    service,
    squareMeters = 0,
    hours = 0,
    frequency,
    extraKeys = [],
    applyRut,
  } = input;

  if (service.pricingModel === 'quote_only') return emptyBreakdown;

  let basePrice = 0;

  switch (service.pricingModel) {
    case 'per_sqm':
      basePrice = Math.max(
        squareMeters * (service.pricePerSqm ?? 0),
        service.minPrice ?? 0,
      );
      break;
    case 'hourly':
      basePrice = hours * (service.hourlyRate ?? 0);
      break;
    case 'package':
      basePrice = service.packagePrice ?? 0;
      break;
  }

  // Only recurring models move with how often we come. A package price is
  // already priced as one visit, so the one-off surcharge would double count.
  const isRecurring =
    service.pricingModel === 'per_sqm' || service.pricingModel === 'hourly';

  basePrice = roundToKronor(
    basePrice * (isRecurring ? frequencyModifier[frequency] : 1),
  );

  const extrasPrice = (service.extras ?? [])
    .filter((extra) => extraKeys.includes(extra.key))
    .reduce((sum, extra) => sum + extra.price, 0);

  const grossPrice = basePrice + extrasPrice;

  const share = labourShare[service.slug] ?? labourShare.default;

  const rutDeduction =
    service.rutEligible && applyRut
      ? roundToKronor((grossPrice * share * RUT_PERCENTAGE) / 100)
      : 0;

  return {
    quoteOnly: false,
    basePrice,
    extrasPrice,
    grossPrice,
    rutDeduction,
    totalPrice: grossPrice - rutDeduction,
  };
};

/** 52500 -> "525 kr" */
export const formatPrice = (ore, locale = 'sv-SE') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  }).format(ore / 100);

/**
 * Applies the RUT deduction to any amount belonging to a service, so pages can
 * show what the customer actually pays. Non-eligible services pass through.
 */
export const afterRut = (amount, service) => {
  if (!service.rutEligible) return amount;

  const share = labourShare[service.slug] ?? labourShare.default;
  return amount - roundToKronor((amount * share * RUT_PERCENTAGE) / 100);
};

/**
 * The "from" price shown on cards and in the price list: the cheapest a service
 * can start at, with RUT already applied for private customers. Returns null
 * for services that always need a manual quote.
 */
export const startingPrice = (service) => {
  const base =
    service.minPrice ?? service.packagePrice ?? service.hourlyRate ?? null;

  if (base === null) return null;

  return afterRut(base, service);
};
