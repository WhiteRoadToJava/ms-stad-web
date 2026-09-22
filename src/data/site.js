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
  /**
   * The figures in the band on the home page.
   *
   * Every one of these has to be true. Swedish marketing law treats an
   * unsupported number in an advert as misleading, and a competitor or a
   * customer can report it. The defaults below are promises the company makes
   * and can keep from day one, not history it does not have yet.
   *
   * Once the business has the record to back them, swap in the ones that
   * actually persuade people: '10 000+' utförda städningar, '8+' år i
   * branschen, '98%' återkommande kunder. Until then, do not.
   */
  stats: [
    { id: 'responseTime', value: '24h' },
    { id: 'guarantee', value: '7' },
    { id: 'counties', value: '3' },
    { id: 'services', value: '9' },
  ],
  /** Counties we operate in. Drives the local landing pages. */
  regions: ['Västra Götaland', 'Jönköpings län', 'Halland'],
  social: {
    facebook: '',
    instagram: '',
  },
};
