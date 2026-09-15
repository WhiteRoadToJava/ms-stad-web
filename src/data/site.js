/**
 * Company facts used across the site. Kept in one place so a phone number or
 * address is never hard coded into a component.
 */
export const site = {
  name: 'MA Städ',
  legalName: 'MA Städ AB',
  email: import.meta.env.VITE_EMAIL ?? 'info@mastad.se',
  phone: import.meta.env.VITE_PHONE ?? '+46762638940',
  phoneDisplay: import.meta.env.VITE_PHONE_DISPLAY ?? '076-263 89 40',
  url: import.meta.env.VITE_SITE_URL ?? 'https://mastad.se',
  /**
   * When the privacy policy and terms were last edited. Bump this by hand when
   * the wording changes; rendering today's date would make the documents claim
   * an update every time someone opens them.
   */
  legalUpdatedAt: '2026-09-15',
  /** Counties we operate in. Drives the local landing pages. */
  regions: ['Västra Götaland', 'Jönköpings län', 'Halland'],
  social: {
    facebook: '',
    instagram: '',
  },
};
