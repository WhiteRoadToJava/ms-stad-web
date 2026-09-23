import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { FaqList } from '../components/ui/FaqList';
import { Seo } from '../components/seo/Seo';
import { NotFound } from './NotFound';
import { site } from '../data/site';
import { getService } from '../data/services';
import { calculatePrice, formatPrice } from '../data/pricing';
import { getLocalPage, localCities } from '../data/localPages';
import {
  breadcrumbSchema,
  combineSchemas,
  faqSchema,
  localBusinessSchema,
} from '../lib/structuredData';
import styles from './LocalService.module.css';

/** The frequency each price example assumes: what most people in that case book. */
const EXAMPLE_FREQUENCY = { hemstadning: 'biweekly', flyttstadning: 'once' };

const TITLE_KEY = {
  hemstadning: 'labels.titleHemstadning',
  flyttstadning: 'labels.titleFlyttstadning',
};
const META_KEY = {
  hemstadning: 'labels.metaHemstadning',
  flyttstadning: 'labels.metaFlyttstadning',
};
const EXAMPLE_KEY = {
  hemstadning: 'labels.priceExampleHemstadning',
  flyttstadning: 'labels.priceExampleFlyttstadning',
};
const OTHER_KEY = {
  hemstadning: 'otherServiceHemstadning',
  flyttstadning: 'otherServiceFlyttstadning',
};

/**
 * A service in one city.
 *
 * Everything that differs between cities comes from the city's own entry: the
 * intro, the housing note, the districts, the questions, and a price example
 * worked out for the typical home there. A villa town and a city of older
 * flats get different numbers, which is information a visitor can use and the
 * reason the page is worth indexing at all.
 */
export const LocalService = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('local');
  const { t: tServices } = useTranslation('services');

  const page = getLocalPage(pathname);
  if (!page) return <NotFound />;

  const { city } = page;
  const service = getService(page.service);
  const serviceName = tServices(`${service.i18nKey}.name`);
  const values = { city: city.name };

  const example = calculatePrice({
    service,
    squareMeters: city.typicalSqm,
    frequency: EXAMPLE_FREQUENCY[page.service],
    extraKeys: [],
    applyRut: true,
  });

  const intro = t(`cities.${city.slug}.${page.service}.intro`);
  const housing = t(`cities.${city.slug}.housing`);
  const faq = t(`cities.${city.slug}.faq`, { returnObjects: true });
  const includes = tServices(`${service.i18nKey}.includes`, { returnObjects: true });

  const otherService = page.service === 'hemstadning' ? 'flyttstadning' : 'hemstadning';
  const otherCities = localCities.filter((other) => other.slug !== city.slug);

  const title = t(TITLE_KEY[page.service], values);

  const jsonLd = combineSchemas(
    localBusinessSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      serviceType: serviceName,
      provider: { '@id': `${site.url}/#organization` },
      // The one city this page is about, not the whole service area: a page
      // claiming to cover everywhere is the pattern that gets pages ignored.
      areaServed: { '@type': 'City', name: city.name },
      offers: {
        '@type': 'Offer',
        price: Math.round(example.totalPrice / 100),
        priceCurrency: 'SEK',
      },
    },
    breadcrumbSchema([
      { name: t('labels.breadcrumbHome'), path: '/' },
      { name: serviceName, path: `/tjanster/${service.slug}` },
      { name: title, path: page.path },
    ]),
    faqSchema(faq),
  );

  return (
    <>
      <Seo
        title={`${title} — ${site.name}`}
        description={t(META_KEY[page.service], values)}
        path={page.path}
        siteUrl={site.url}
        jsonLd={jsonLd}
        noindex={!city.reviewed}
      />

      <header className={styles.hero}>
        <Container className={styles.narrow}>
          <nav className={styles.crumbs} aria-label="Brödsmulor">
            <Link to="/">{t('labels.breadcrumbHome')}</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/tjanster/${service.slug}`}>{serviceName}</Link>
          </nav>

          <h1>{title}</h1>
          <p className={styles.lead}>{intro}</p>

          <div className={styles.actions}>
            <Button to={`/boka?tjanst=${service.slug}`} size="lg">
              {t('labels.book', values)}
            </Button>
            <Button href={`tel:${site.phone}`} size="lg" variant="secondary">
              {site.phoneDisplay}
            </Button>
          </div>
        </Container>
      </header>

      <section className={styles.section}>
        <Container className={styles.split}>
          <div>
            <h2>{t('labels.priceTitle', values)}</h2>
            <p className={styles.body}>
              {t(EXAMPLE_KEY[page.service], {
                ...values,
                sqm: city.typicalSqm,
                price: formatPrice(example.totalPrice),
              })}
            </p>
            <Link to={`/boka?tjanst=${service.slug}`} className={styles.textLink}>
              {t('labels.priceLink')}
            </Link>
          </div>

          <div className={styles.priceCard}>
            <p className={styles.priceValue}>{formatPrice(example.totalPrice)}</p>
            <p className={styles.priceNote}>
              {city.typicalSqm} m² · {site.name}
            </p>
          </div>
        </Container>
      </section>

      <section className={styles.band}>
        <Container className={styles.split}>
          <div>
            <h2>{t('labels.districtsTitle', values)}</h2>
            <p className={styles.body}>{housing}</p>
            <p className={styles.muted}>{t('labels.districtsText', values)}</p>
          </div>

          <ul className={styles.districts}>
            {city.districts.map((district) => (
              <li key={district}>{district}</li>
            ))}
          </ul>
        </Container>
      </section>

      <section className={styles.section}>
        <Container className={styles.narrow}>
          <h2>{t('labels.includesTitle')}</h2>
          <ul className={styles.includes}>
            {includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link to={`/tjanster/${service.slug}`} className={styles.textLink}>
            {t('labels.allAbout', { service: serviceName.toLowerCase() })}
          </Link>
        </Container>
      </section>

      <section className={styles.band}>
        <Container className={styles.narrow}>
          <h2 className={styles.faqTitle}>{t('labels.faqTitle', values)}</h2>
          <FaqList items={faq} />
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <h2 className={styles.smallTitle}>{t('labels.otherCitiesTitle')}</h2>
          <ul className={styles.chips}>
            <li>
              <Link to={`/${otherService}-${city.slug}`} className={styles.chipStrong}>
                {t(`labels.${OTHER_KEY[otherService]}`, values)}
              </Link>
            </li>
            {otherCities.map((other) => (
              <li key={other.slug}>
                <Link to={`/${page.service}-${other.slug}`} className={styles.chip}>
                  {other.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
};

export default LocalService;
