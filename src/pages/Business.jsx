import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Seo } from '../components/seo/Seo';
import { site } from '../data/site';
import { businessServices } from '../data/services';
import { formatPrice, startingPrice } from '../data/pricing';
import {
  combineSchemas,
  localBusinessSchema,
  serviceListSchema,
} from '../lib/structuredData';
import styles from './Business.module.css';

/**
 * Landing page for companies.
 *
 * A business buys a different thing from a household: a schedule that runs
 * without supervision and one predictable invoice. The page leads with that
 * rather than with square meter prices.
 */
export const Business = () => {
  const { t } = useTranslation('about');
  const { t: tServices } = useTranslation('services');

  const why = t('business.why', { returnObjects: true });
  const process = t('business.process', { returnObjects: true });

  return (
    <>
      <Seo
        title={`${t('business.meta.title')} — ${site.name}`}
        description={t('business.meta.description')}
        path="/foretag"
        siteUrl={site.url}
        jsonLd={combineSchemas(
          localBusinessSchema(),
          serviceListSchema(businessServices, tServices),
        )}
      />

      <header className={styles.hero}>
        <Container className={styles.narrow}>
          <h1>{t('business.title')}</h1>
          <p className={styles.lead}>{t('business.lead')}</p>
          <div className={styles.actions}>
            <Button to="/offert" size="lg">
              {t('business.ctaButton')}
            </Button>
            <Button href={`tel:${site.phone}`} size="lg" variant="secondary">
              {site.phoneDisplay}
            </Button>
          </div>
        </Container>
      </header>

      <section className={styles.section}>
        <Container>
          <h2>{t('business.servicesTitle')}</h2>
          <ul className={styles.services}>
            {businessServices.map((service) => {
              const from = startingPrice(service);

              return (
                <li key={service.slug} className={styles.service}>
                  <h3 className={styles.serviceTitle}>
                    <Link to={`/tjanster/${service.slug}`}>
                      {tServices(`${service.i18nKey}.name`)}
                    </Link>
                  </h3>
                  <p className={styles.serviceText}>
                    {tServices(`${service.i18nKey}.short`)}
                  </p>
                  <p className={styles.servicePrice}>
                    {from === null
                      ? tServices(`${service.i18nKey}.priceLabel`)
                      : tServices(`${service.i18nKey}.priceLabel`, {
                          price: formatPrice(from),
                        })}
                  </p>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className={styles.why}>
        <Container>
          <h2>{t('business.whyTitle')}</h2>
          <ul className={styles.whyList}>
            {why.map((item) => (
              <li key={item.title} className={styles.whyItem}>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyText}>{item.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <h2>{t('business.processTitle')}</h2>
          <ol className={styles.steps}>
            {process.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className={styles.cta}>
        <Container className={styles.ctaInner}>
          <div>
            <h2 className={styles.ctaTitle}>{t('business.ctaTitle')}</h2>
            <p className={styles.ctaText}>{t('business.ctaText')}</p>
          </div>
          <div className={styles.actions}>
            <Button to="/offert" size="lg" variant="accent">
              {t('business.ctaButton')}
            </Button>
            <Button href={`tel:${site.phone}`} size="lg" variant="ghostLight">
              {t('business.ctaSecondary')}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Business;
