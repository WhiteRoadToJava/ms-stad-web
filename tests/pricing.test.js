/**
 * Pricing calculator tests.
 *
 * The site carries its own copy of the calculation so the total moves while
 * the customer types, with no request in the loop. The server recalculates
 * before writing a booking, so if the two disagree the customer is shown one
 * figure and invoiced another.
 *
 * Every expected number here is identical to tests/pricing.test.js in the API
 * repository. The two files are the contract between the calculators: a change
 * to one engine fails a test on that side before it can reach a customer.
 *
 * Run with: npm test
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  afterRut,
  calculatePrice,
  formatPrice,
  startingPrice,
} from '../src/data/pricing.js';

/** Amounts are in ore throughout, as everywhere else in the codebase. */
const kr = (kronor) => kronor * 100;

const homeCleaning = {
  slug: 'hemstadning',
  pricingModel: 'per_sqm',
  pricePerSqm: kr(42),
  minPrice: kr(1050),
  hourlyRate: null,
  packagePrice: null,
  rutEligible: true,
  extras: [
    { key: 'oven', price: kr(400) },
    { key: 'windows', price: kr(600) },
  ],
};

const movingHelp = {
  slug: 'flytthjalp',
  pricingModel: 'package',
  pricePerSqm: null,
  minPrice: null,
  hourlyRate: null,
  packagePrice: kr(2995),
  rutEligible: true,
  extras: [],
};

const officeCleaning = {
  slug: 'kontorsstad',
  pricingModel: 'hourly',
  pricePerSqm: null,
  minPrice: null,
  hourlyRate: kr(399),
  packagePrice: null,
  rutEligible: false,
  extras: [],
};

const windowCleaning = {
  slug: 'fonsterputs',
  pricingModel: 'quote_only',
  pricePerSqm: null,
  minPrice: null,
  hourlyRate: null,
  packagePrice: null,
  rutEligible: true,
  extras: [],
};

describe('size and the minimum price', () => {
  it('charges per square meter above the minimum', () => {
    const price = calculatePrice({
      service: homeCleaning,
      squareMeters: 70,
      frequency: 'biweekly',
      applyRut: false,
    });

    assert.equal(price.totalPrice, kr(2940));
  });

  it('applies the minimum to a home too small to reach it', () => {
    const price = calculatePrice({
      service: homeCleaning,
      squareMeters: 15,
      frequency: 'biweekly',
      applyRut: false,
    });

    assert.equal(price.totalPrice, kr(1050));
  });
});

describe('how often the customer books', () => {
  const base = { service: homeCleaning, squareMeters: 70, applyRut: false };

  it('charges the base price every other week', () => {
    assert.equal(calculatePrice({ ...base, frequency: 'biweekly' }).totalPrice, kr(2940));
  });

  it('discounts weekly visits by five percent', () => {
    assert.equal(calculatePrice({ ...base, frequency: 'weekly' }).totalPrice, kr(2793));
  });

  it('adds ten percent for a monthly visit', () => {
    assert.equal(calculatePrice({ ...base, frequency: 'monthly' }).totalPrice, kr(3234));
  });

  it('adds thirty five percent for a single visit', () => {
    assert.equal(calculatePrice({ ...base, frequency: 'once' }).totalPrice, kr(3969));
  });

  it('never applies the surcharge to a fixed package price', () => {
    const once = calculatePrice({ service: movingHelp, frequency: 'once', applyRut: false });
    const monthly = calculatePrice({ service: movingHelp, frequency: 'monthly', applyRut: false });

    assert.equal(once.totalPrice, kr(2995));
    assert.equal(monthly.totalPrice, kr(2995));
  });
});

describe('hourly services', () => {
  it('charges the hours asked for', () => {
    const price = calculatePrice({
      service: officeCleaning,
      hours: 3,
      frequency: 'biweekly',
      applyRut: false,
    });

    assert.equal(price.totalPrice, kr(1197));
  });

  it('bills a minimum of two hours', () => {
    const price = calculatePrice({
      service: officeCleaning,
      hours: 1,
      frequency: 'biweekly',
      applyRut: false,
    });

    assert.equal(price.totalPrice, kr(798));
  });
});

describe('the RUT deduction', () => {
  it('takes half of a fully labour based service', () => {
    const price = calculatePrice({
      service: homeCleaning,
      squareMeters: 70,
      frequency: 'biweekly',
      applyRut: true,
    });

    assert.equal(price.grossPrice, kr(2940));
    assert.equal(price.rutDeduction, kr(1470));
    assert.equal(price.totalPrice, kr(1470));
  });

  it('only covers the labour part of moving help', () => {
    const price = calculatePrice({ service: movingHelp, frequency: 'once', applyRut: true });

    assert.equal(price.rutDeduction, kr(899));
    assert.equal(price.totalPrice, kr(2096));
  });

  it('gives no deduction on a business service, even when asked', () => {
    const price = calculatePrice({
      service: officeCleaning,
      hours: 3,
      frequency: 'biweekly',
      applyRut: true,
    });

    assert.equal(price.rutDeduction, 0);
    assert.equal(price.totalPrice, kr(1197));
  });
});

describe('extras', () => {
  it('adds the ones that were chosen', () => {
    const price = calculatePrice({
      service: homeCleaning,
      squareMeters: 70,
      frequency: 'biweekly',
      extraKeys: ['oven'],
      applyRut: false,
    });

    assert.equal(price.extrasPrice, kr(400));
    assert.equal(price.totalPrice, kr(3340));
  });

  it('ignores a key that does not belong to the service', () => {
    const price = calculatePrice({
      service: homeCleaning,
      squareMeters: 70,
      frequency: 'biweekly',
      extraKeys: ['oven', 'private-jet'],
      applyRut: false,
    });

    assert.equal(price.extrasPrice, kr(400));
  });

  it('includes extras in the RUT deduction', () => {
    const price = calculatePrice({
      service: homeCleaning,
      squareMeters: 70,
      frequency: 'biweekly',
      extraKeys: ['oven', 'windows'],
      applyRut: true,
    });

    assert.equal(price.grossPrice, kr(3940));
    assert.equal(price.totalPrice, kr(1970));
  });
});

describe('services priced individually', () => {
  it('returns zero rather than inventing a price', () => {
    const price = calculatePrice({
      service: windowCleaning,
      frequency: 'once',
      applyRut: true,
    });

    assert.equal(price.totalPrice, 0);
    assert.equal(price.rutDeduction, 0);
  });

  it('has no starting price to advertise', () => {
    assert.equal(startingPrice(windowCleaning), null);
  });
});

describe('the "from" prices shown on cards and in the price list', () => {
  it('shows the minimum after RUT for a home clean', () => {
    assert.equal(startingPrice(homeCleaning), kr(525));
  });

  it('applies only the labour share for moving help', () => {
    assert.equal(startingPrice(movingHelp), kr(2096));
  });

  it('leaves a business rate untouched', () => {
    assert.equal(startingPrice(officeCleaning), kr(399));
  });
});

describe('afterRut', () => {
  it('halves an amount for an eligible service', () => {
    assert.equal(afterRut(kr(1000), homeCleaning), kr(500));
  });

  it('passes a business amount through unchanged', () => {
    assert.equal(afterRut(kr(1000), officeCleaning), kr(1000));
  });
});

describe('rounding', () => {
  it('never produces ore, only whole kronor', () => {
    const price = calculatePrice({
      service: homeCleaning,
      squareMeters: 63,
      frequency: 'once',
      applyRut: true,
    });

    for (const amount of [price.basePrice, price.grossPrice, price.rutDeduction, price.totalPrice]) {
      assert.equal(amount % 100, 0, `${amount} is not a whole number of kronor`);
    }
  });
});

describe('formatting', () => {
  it('writes kronor the Swedish way, with no decimals', () => {
    // Non-breaking spaces: a price must never wrap across two lines.
    assert.equal(formatPrice(kr(1470)).replace(/\u00a0/g, ' '), '1 470 kr');
    assert.equal(formatPrice(kr(525)).replace(/\u00a0/g, ' '), '525 kr');
  });
});

describe('the price examples published on the city pages', () => {
  const cases = [
    { sqm: 65, expected: kr(1365) },
    { sqm: 80, expected: kr(1680) },
    { sqm: 130, expected: kr(2730) },
  ];

  for (const { sqm, expected } of cases) {
    it(`${sqm} m² every other week costs ${expected / 100} kr after RUT`, () => {
      const price = calculatePrice({
        service: homeCleaning,
        squareMeters: sqm,
        frequency: 'biweekly',
        applyRut: true,
      });

      assert.equal(price.totalPrice, expected);
    });
  }
});
