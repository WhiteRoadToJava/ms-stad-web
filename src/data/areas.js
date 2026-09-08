/**
 * Cities we serve. Each entry generates a local landing page per service,
 * which is how a local cleaning company competes in search.
 */

export const areas = [
  {
    slug: 'goteborg',
    name: 'Göteborg',
    region: 'vastra-gotaland',
    districts: ['Majorna', 'Linné', 'Hisingen', 'Örgryte', 'Angered', 'Västra Frölunda'],
    isPrimary: true,
  },
  { slug: 'molndal', name: 'Mölndal', region: 'vastra-gotaland', isPrimary: true },
  { slug: 'partille', name: 'Partille', region: 'vastra-gotaland', isPrimary: false },
  { slug: 'kungalv', name: 'Kungälv', region: 'vastra-gotaland', isPrimary: false },
  { slug: 'boras', name: 'Borås', region: 'vastra-gotaland', isPrimary: true },
  {
    slug: 'trollhattan',
    name: 'Trollhättan',
    region: 'vastra-gotaland',
    isPrimary: false,
  },
  { slug: 'uddevalla', name: 'Uddevalla', region: 'vastra-gotaland', isPrimary: false },
  { slug: 'skovde', name: 'Skövde', region: 'vastra-gotaland', isPrimary: false },
  { slug: 'jonkoping', name: 'Jönköping', region: 'jonkoping', isPrimary: true },
  { slug: 'varnamo', name: 'Värnamo', region: 'jonkoping', isPrimary: false },
  { slug: 'halmstad', name: 'Halmstad', region: 'halland', isPrimary: true },
  { slug: 'varberg', name: 'Varberg', region: 'halland', isPrimary: false },
  { slug: 'kungsbacka', name: 'Kungsbacka', region: 'halland', isPrimary: true },
];

export const primaryAreas = areas.filter((area) => area.isPrimary);
