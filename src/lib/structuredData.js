/**
 * Schema.org structured data.
 *
 * Google uses this to show opening hours, service area and the FAQ accordion
 * directly in the results. It has to match what the page actually says, so the
 * text is taken from the same translation files the page renders.
 */
import { site } from '../data/site';
import { areas } from '../data/areas';

/** The company itself. Belongs on every page. */
export const localBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': `${site.url}/#organization`,
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  telephone: site.phone,
  email: site.email,
  image: `${site.url}/logo.svg`,
  priceRange: '525–5000 kr',
  areaServed: areas.map((area) => ({
    '@type': 'City',
    name: area.name,
  })),
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Västra Götaland',
    addressCountry: 'SE',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:00',
    },
  ],
});

/** The catalogue, so services can appear as their own results. */
export const serviceListSchema = (services, translate) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: services.map((service, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Service',
      name: translate(`${service.i18nKey}.name`),
      description: translate(`${service.i18nKey}.short`),
      url: `${site.url}/tjanster/${service.slug}`,
      provider: { '@id': `${site.url}/#organization` },
    },
  })),
});

/** Questions and answers, taken straight from the FAQ section. */
export const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
});

/** Several schemas in one script tag. */
export const combineSchemas = (...schemas) => ({
  '@context': 'https://schema.org',
  '@graph': schemas.map(({ '@context': _context, ...rest }) => rest),
});

/** A single service, used on its own page. */
export const serviceSchema = ({ service, name, description, price }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  serviceType: name,
  url: `${site.url}/tjanster/${service.slug}`,
  provider: { '@id': `${site.url}/#organization` },
  areaServed: areas.map((area) => ({ '@type': 'City', name: area.name })),
  ...(price
    ? {
        offers: {
          '@type': 'Offer',
          price: Math.round(price / 100),
          priceCurrency: 'SEK',
          availability: 'https://schema.org/InStock',
        },
      }
    : {}),
});

/** The trail Google prints above a result instead of the raw URL. */
export const breadcrumbSchema = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: `${site.url}${crumb.path}`,
  })),
});
