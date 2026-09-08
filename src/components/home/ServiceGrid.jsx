import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '../layout/Container';
import { privateServices, businessServices } from '../../data/services';
import { formatPrice, startingPrice } from '../../data/pricing';
import styles from './ServiceGrid.module.css';

const ServiceCard = ({ service }) => {
  const { t } = useTranslation('services');
  const { t: tHome } = useTranslation('home');

  const from = startingPrice(service);
  const priceText =
    from === null
      ? t(`${service.i18nKey}.priceLabel`)
      : t(`${service.i18nKey}.priceLabel`, { price: formatPrice(from) });

  const name = t(`${service.i18nKey}.name`);

  return (
    <li className={styles.card}>
      <h3 className={styles.cardTitle}>
        {/* The whole card is clickable, but only the title is a real link so
            screen readers announce one target instead of three. */}
        <Link to={`/tjanster/${service.slug}`} className={styles.cardLink}>
          <span className={styles.cardOverlay} aria-hidden="true" />
          {name}
        </Link>
      </h3>
      <p className={styles.cardText}>{t(`${service.i18nKey}.short`)}</p>
      <p className={styles.cardPrice}>{priceText}</p>
      <span className={styles.cardMore} aria-hidden="true">
        {tHome('services.readMore', { service: name })}
      </span>
    </li>
  );
};

/** The full catalogue, split into what a household buys and what a company buys. */
export const ServiceGrid = () => {
  const { t } = useTranslation('home');

  return (
    <section className={styles.section} id="tjanster">
      <Container>
        <div className={styles.head}>
          <h2>{t('services.title')}</h2>
          <p className={styles.lead}>{t('services.text')}</p>
        </div>

        <h3 className={styles.groupTitle}>{t('services.privateTitle')}</h3>
        <ul className={styles.grid}>
          {privateServices.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </ul>

        <h3 className={styles.groupTitle}>{t('services.businessTitle')}</h3>
        <ul className={styles.grid}>
          {businessServices.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </ul>
      </Container>
    </section>
  );
};
