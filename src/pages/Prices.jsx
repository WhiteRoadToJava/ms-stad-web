import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Seo } from '../components/seo/Seo';
import { site } from '../data/site';
import { services } from '../data/services';
import { afterRut, formatPrice, startingPrice } from '../data/pricing';
import { combineSchemas, localBusinessSchema } from '../lib/structuredData';
import styles from './Prices.module.css';

/** Formats the pricing model column: per square meter, hourly, package or quote. */
const useModelLabel = () => {
  const { t } = useTranslation('prices');

  return (service) => {
    switch (service.pricingModel) {
      case 'per_sqm':
        return t('table.perSqm', {
          price: formatPrice(afterRut(service.pricePerSqm, service)),
        });
      case 'hourly':
        return t('table.hourly', { price: formatPrice(service.hourlyRate) });
      case 'package':
        return t('table.package');
      default:
        return t('table.quote');
    }
  };
};

export const Prices = () => {
  const { t } = useTranslation('prices');
  const { t: tCommon } = useTranslation();
  const { t: tServices } = useTranslation('services');

  const modelLabel = useModelLabel();
  const rutPoints = t('rut.points', { returnObjects: true });
  const frequencyRows = t('frequency.rows', { returnObjects: true });

  return (
    <>
      <Seo
        title={`${t('meta.title')} — ${site.name}`}
        description={t('meta.description')}
        path="/priser"
        siteUrl={site.url}
        jsonLd={combineSchemas(localBusinessSchema())}
      />

      <header className={styles.hero}>
        <Container>
          <h1>{t('hero.title')}</h1>
          <p className={styles.lead}>{t('hero.text')}</p>
        </Container>
      </header>

      <section className={styles.section}>
        <Container>
          {/* Scrolls sideways on a phone instead of shrinking the text. */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={styles.caption}>{t('table.caption')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('table.service')}</th>
                  <th scope="col">{t('table.model')}</th>
                  <th scope="col">{t('table.from')}</th>
                  <th scope="col">{t('table.rut')}</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => {
                  const from = startingPrice(service);

                  return (
                    <tr key={service.slug}>
                      <th scope="row">
                        <a href={`/tjanster/${service.slug}`}>
                          {tServices(`${service.i18nKey}.name`)}
                        </a>
                      </th>
                      <td>{modelLabel(service)}</td>
                      <td className={styles.amount}>
                        {from === null ? t('table.quote') : formatPrice(from)}
                      </td>
                      <td>{service.rutEligible ? t('table.rutYes') : t('table.rutNo')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className={styles.note}>{t('table.note')}</p>
        </Container>
      </section>

      <section className={styles.explainer}>
        <Container className={styles.explainerGrid}>
          <div>
            <h2>{t('rut.title')}</h2>
            <p className={styles.text}>{t('rut.text')}</p>
            <ul className={styles.points}>
              {rutPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2>{t('frequency.title')}</h2>
            <p className={styles.text}>{t('frequency.text')}</p>
            <dl className={styles.frequency}>
              {frequencyRows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container className={styles.cta}>
          <div>
            <h2>{t('cta.title')}</h2>
            <p className={styles.text}>{t('cta.text')}</p>
          </div>
          <Button to="/boka" size="lg">
            {t('cta.button')}
          </Button>
        </Container>
      </section>

      <p className={styles.legal}>
        <Container>{tCommon('price.afterRut')}</Container>
      </p>
    </>
  );
};

export default Prices;
