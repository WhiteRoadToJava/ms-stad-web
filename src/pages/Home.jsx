import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { site } from '../data/site';
import { services } from '../data/services';
import { formatPrice } from '../data/pricing';
import styles from './Home.module.css';

/**
 * Home page.
 * Phase 1 covers the hero and the service list; the remaining sections
 * (process, guarantees, reviews, local areas) arrive with phase 2.
 */
export const Home = () => {
  const { t } = useTranslation();
  const { t: tServices } = useTranslation('services');

  return (
    <>
      <section className={styles.hero}>
        <Container className={styles.heroInner}>
          <h1>{t('home.heroTitle')}</h1>
          <p className={styles.heroText}>{t('home.heroText')}</p>
          <div className={styles.heroActions}>
            <Button to="/boka" size="lg">
              {t('cta.book')}
            </Button>
            <Button to="/offert" size="lg" variant="secondary">
              {t('cta.quote')}
            </Button>
            <Button href={`tel:${site.phone}`} variant="ghost" size="lg">
              {site.phoneDisplay}
            </Button>
          </div>
        </Container>
      </section>

      <section className={styles.services}>
        <Container>
          <h2>{t('home.servicesTitle')}</h2>
          <ul className={styles.grid}>
            {services.map((service) => {
              const priceValue =
                service.minPrice ?? service.packagePrice ?? service.hourlyRate ?? 0;

              return (
                <li key={service.slug} className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    {tServices(`${service.i18nKey}.name`)}
                  </h3>
                  <p className={styles.cardText}>
                    {tServices(`${service.i18nKey}.short`)}
                  </p>
                  <p className={styles.cardPrice}>
                    {tServices(`${service.i18nKey}.priceLabel`, {
                      price: formatPrice(priceValue),
                    })}
                  </p>
                  <Button to={`/tjanster/${service.slug}`} variant="ghost">
                    {t('cta.readMore')}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>
    </>
  );
};

export default Home;
