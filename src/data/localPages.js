/**
 * Local landing pages: one page per city and service, for the cities where the
 * company actually works week to week.
 *
 * Deliberately few. Thirteen cities times nine services would be 117 pages
 * that differ only by a place name, which Google treats as doorway pages and
 * can demote the whole site for. A page earns its place by saying something
 * true about that city that a customer there would want to know.
 *
 * reviewed: false keeps a city's pages out of search. They render and can be
 * visited, but carry noindex and stay out of the sitemap. Set it to true once
 * someone who knows the business has checked every claim in that city's text
 * in src/locales/sv/local.json.
 */

export const LOCAL_SERVICES = ['hemstadning', 'flyttstadning'];

export const localCities = [
  {
    slug: 'goteborg',
    name: 'Göteborg',
    reviewed: true,
    // Typical home size used for the price example on the page. Older flats
    // dominate the central districts.
    typicalSqm: 65,
    districts: [
      'Centrum',
      'Linné',
      'Majorna',
      'Johanneberg',
      'Örgryte',
      'Hisingen',
      'Västra Frölunda',
      'Angered',
    ],
  },
  {
    slug: 'molndal',
    name: 'Mölndal',
    reviewed: true,
    typicalSqm: 80,
    districts: ['Centrum', 'Krokslätt', 'Fässberg', 'Balltorp', 'Kållered', 'Lindome'],
  },
  {
    slug: 'kungsbacka',
    name: 'Kungsbacka',
    reviewed: true,
    // Mostly detached houses, so the example is a villa rather than a flat.
    typicalSqm: 130,
    districts: ['Centrum', 'Kullavik', 'Särö', 'Onsala', 'Åsa', 'Fjärås', 'Frillesås'],
  },
  {
    slug: 'boras',
    name: 'Borås',
    reviewed: true,
    typicalSqm: 75,
    districts: ['Centrum', 'Norrby', 'Hässleholmen', 'Göta', 'Sjöbo', 'Brämhult', 'Fristad'],
  },
  {
    slug: 'jonkoping',
    name: 'Jönköping',
    reviewed: true,
    typicalSqm: 75,
    districts: ['Centrum', 'Öster', 'Väster', 'Huskvarna', 'Ekhagen', 'Råslätt', 'Bankeryd'],
  },
  {
    slug: 'halmstad',
    name: 'Halmstad',
    reviewed: true,
    typicalSqm: 85,
    districts: ['Centrum', 'Andersberg', 'Söndrum', 'Tylösand', 'Frösakull', 'Oskarström'],
  },
];

/** Every local page as { service, city, path }, in a stable order. */
export const localPages = localCities.flatMap((city) =>
  LOCAL_SERVICES.map((service) => ({
    service,
    city,
    path: `/${service}-${city.slug}`,
  })),
);

export const getLocalPage = (pathname) =>
  localPages.find((page) => page.path === pathname.replace(/\/+$/, ''));

/** Cities that have a page for a given service, for linking from elsewhere. */
export const citiesWithPage = (service = 'hemstadning') =>
  new Set(localPages.filter((page) => page.service === service).map((page) => page.city.slug));
