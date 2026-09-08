import { useTranslation } from 'react-i18next';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import { site } from '../../data/site';
import { getService } from '../../data/services';
import { formatPrice, startingPrice } from '../../data/pricing';
import styles from './Hero.module.css';

/**
 * Opening section.
 *
 * The price card sits beside the headline on purpose: the first question a
 * visitor has is what this costs, and competitors make them click twice to
 * find out.
 */
export const Hero = () => {
  const { t } = useTranslation('home');
  const { t: tCommon } = useTranslation();
  const { t: tServices } = useTranslation('services');

  const homeCleaning = getService('hemstadning');
  const trust = t('hero.trust', { returnObjects: true });
  const highlights = tServices('homeCleaning.highlights', { returnObjects: true });

  return (
    <section className={styles.hero}>
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t('hero.eyebrow')}</p>
          <h1 className={styles.title}>{t('hero.title')}</h1>
          <p className={styles.text}>{t('hero.text')}</p>

          <div className={styles.actions}>
            <Button to="/boka" size="lg">
              {t('hero.primaryCta')}
            </Button>
            <Button href={`tel:${site.phone}`} size="lg" variant="secondary">
              {site.phoneDisplay}
            </Button>
          </div>

          <ul className={styles.trust}>
            {trust.map((item) => (
              <li key={item} className={styles.trustItem}>
                <span aria-hidden="true" className={styles.tick} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <aside className={styles.priceCard}>
          <p className={styles.priceLabel}>{tServices('homeCleaning.name')}</p>
          <p className={styles.price}>
            {formatPrice(startingPrice(homeCleaning))}
            <span className={styles.priceUnit}> / {tCommon('units.visit')}</span>
          </p>
          <p className={styles.priceNote}>{tCommon('price.afterRut')}</p>
          <hr className={styles.rule} />
          <ul className={styles.priceList}>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </Container>
    </section>
  );
};
