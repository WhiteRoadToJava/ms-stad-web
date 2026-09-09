import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { FaqList } from '../components/ui/FaqList';
import { Seo } from '../components/seo/Seo';
import { CtaBanner } from '../components/home/CtaBanner';
import { NotFound } from './NotFound';
import { site } from '../data/site';
import { services, getService } from '../data/services';
import { afterRut, formatPrice, startingPrice } from '../data/pricing';
import {
  breadcrumbSchema,
  combineSchemas,
  localBusinessSchema,
  serviceSchema,
} from '../lib/structuredData';
import styles from './Service.module.css';

/**
 * One page per service, all nine generated from this file at build time.
 *
 * A separate component per service would mean nine copies of the same layout
 * drifting apart. The differences between services are content, not structure,
 * so they live in the translation files.
 */
export const Service = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { t: tServices } = useTranslation('services');

  const service = getService(slug);

  // Someone typed a service that does not exist, or a slug was renamed.
  if (!service) return <NotFound />;

  const key = service.i18nKey;
  const name = tServices(`${key}.name`);
  const intro = tServices(`${key}.intro`);
  const includes = tServices(`${key}.includes`, { returnObjects: true });
  const faqItems = tServices(`${key}.faq`, { returnObjects: true });

  const from = startingPrice(service);
  const isQuoteOnly = service.pricingModel === 'quote';

  const related = services
    .filter((item) => item.category === service.category && item.slug !== service.slug)
    .slice(0, 4);

  const jsonLd = combineSchemas(
    localBusinessSchema(),
    serviceSchema({
      service,
      name,
      description: tServices(`${key}.short`),
      price: from,
    }),
    breadcrumbSchema([
      { name: t('breadcrumb.home'), path: '/' },
      { name: t('breadcrumb.services'), path: '/tjanster' },
      { name, path: `/tjanster/${service.slug}` },
    ]),
  );

  return (
    <>
      <Seo
        title={`${name} — ${site.name}`}
        description={tServices(`${key}.short`)}
        path={`/tjanster/${service.slug}`}
        siteUrl={site.url}
        jsonLd={jsonLd}
      />

      <article>
        <header className={styles.hero}>
          <Container className={styles.heroInner}>
            <nav className={styles.crumbs} aria-label={t('breadcrumb.services')}>
              <Link to="/">{t('breadcrumb.home')}</Link>
              <span aria-hidden="true">/</span>
              <Link to="/tjanster">{t('breadcrumb.services')}</Link>
            </nav>

            <div className={styles.heroGrid}>
              <div>
                <h1>{name}</h1>
                <p className={styles.intro}>{intro}</p>

                <div className={styles.actions}>
                  <Button
                    to={
                      isQuoteOnly
                        ? `/offert?tjanst=${service.slug}`
                        : `/boka?tjanst=${service.slug}`
                    }
                    size="lg"
                  >
                    {isQuoteOnly
                      ? t('service.quoteCta')
                      : t('service.bookCta', { service: name.toLowerCase() })}
                  </Button>
                  <Button href={`tel:${site.phone}`} size="lg" variant="secondary">
                    {site.phoneDisplay}
                  </Button>
                </div>
              </div>

              <aside className={styles.priceBox}>
                {from === null ? (
                  <p className={styles.quoteNote}>{t('service.quoteNote')}</p>
                ) : (
                  <>
                    <p className={styles.priceLabel}>{t('service.priceFrom')}</p>
                    <p className={styles.price}>{formatPrice(from)}</p>
                    <p className={styles.priceNote}>
                      {service.rutEligible ? t('price.afterRut') : t('price.exclVat')}
                    </p>

                    {service.pricePerSqm ? (
                      <dl className={styles.priceMeta}>
                        <div>
                          <dt>{t('service.perSqm')}</dt>
                          <dd>{formatPrice(afterRut(service.pricePerSqm, service))}</dd>
                        </div>
                        <div>
                          <dt>{t('service.minPrice')}</dt>
                          <dd>{formatPrice(from)}</dd>
                        </div>
                      </dl>
                    ) : null}
                  </>
                )}
              </aside>
            </div>
          </Container>
        </header>

        <section className={styles.section}>
          <Container className={styles.split}>
            <div>
              <h2>{t('service.includesTitle')}</h2>
              <ul className={styles.includes}>
                {includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {service.extras?.length ? (
              <div>
                <h2>{t('service.extrasTitle')}</h2>
                <ul className={styles.extras}>
                  {service.extras.map((extra) => (
                    <li key={extra.key}>
                      <span>{t(`extras.${extra.key}`)}</span>
                      <span className={styles.extraPrice}>
                        + {formatPrice(afterRut(extra.price, service))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Container>
        </section>

        <section className={styles.faqSection}>
          <Container className={styles.faqInner}>
            <h2>{t('service.faqTitle', { service: name.toLowerCase() })}</h2>
            <FaqList items={faqItems} />
          </Container>
        </section>

        <section className={styles.section}>
          <Container>
            <h2 className={styles.relatedTitle}>{t('service.otherServices')}</h2>
            <ul className={styles.related}>
              {related.map((item) => (
                <li key={item.slug}>
                  <Link to={`/tjanster/${item.slug}`} className={styles.relatedLink}>
                    {tServices(`${item.i18nKey}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <CtaBanner />
      </article>
    </>
  );
};

/** Tells the generator which nine pages to write out. */
export const getStaticPaths = () =>
  services.map((service) => `tjanster/${service.slug}`);

export default Service;
