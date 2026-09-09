/**
 * i18n setup.
 *
 * Swedish is the product language and the default; English exists so the site
 * can be shown to non-Swedish speakers and so we can develop against readable
 * keys. All user facing strings live in src/locales, never inline in JSX.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import svCommon from '../locales/sv/common.json';
import svServices from '../locales/sv/services.json';
import svHome from '../locales/sv/home.json';
import svPrices from '../locales/sv/prices.json';
import svBooking from '../locales/sv/booking.json';
import enCommon from '../locales/en/common.json';
import enServices from '../locales/en/services.json';
import enHome from '../locales/en/home.json';
import enPrices from '../locales/en/prices.json';
import enBooking from '../locales/en/booking.json';

export const locales = ['sv', 'en'];

export const defaultLocale = 'sv';

void i18n.use(initReactI18next).init({
  resources: {
    sv: { common: svCommon, services: svServices, home: svHome, prices: svPrices, booking: svBooking },
    en: { common: enCommon, services: enServices, home: enHome, prices: enPrices, booking: enBooking },
  },
  lng: defaultLocale,
  fallbackLng: defaultLocale,
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  // The site is statically generated per locale, so no async loading is needed.
  react: { useSuspense: false },
});

export default i18n;
