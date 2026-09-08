/**
 * Price calculation, mirrored from the API.
 *
 * Keep this file in sync with `src/services/pricing.service.ts` on the server.
 * The client copy exists purely so the calculator can update while the user
 * drags a slider; the server value is the one that gets stored.
 */

/** Recurring cleaning is cheaper per visit; a single visit costs more. */
export const frequencyModifier = {
  once: 1.15,
  weekly: 0.9,
  biweekly: 1,
  monthly: 1.05,
};

export const RUT_PERCENTAGE = 50;

/** Share of the price that counts as labour, and is therefore RUT eligible. */
export const LABOUR_SHARE = 1;

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

  basePrice = Math.round(basePrice * frequencyModifier[frequency]);

  const extrasPrice = (service.extras ?? [])
    .filter((extra) => extraKeys.includes(extra.key))
    .reduce((sum, extra) => sum + extra.price, 0);

  const grossPrice = basePrice + extrasPrice;

  const rutDeduction =
    service.rutEligible && applyRut
      ? Math.round((grossPrice * LABOUR_SHARE * RUT_PERCENTAGE) / 100)
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
