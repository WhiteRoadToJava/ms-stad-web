import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatPrice, startingPrice } from '../../../data/pricing';
import styles from '../BookingForm.module.css';

/** Step 1: which service. Quote-only services are sent to /offert instead. */
export const ServiceStep = ({ options, slug, onChange }) => {
  const { t } = useTranslation('booking');
  const { t: tServices } = useTranslation('services');

  return (
    <fieldset className={styles.block}>
      <legend className={styles.legend}>{t('service.legend')}</legend>

      <div className={styles.cards}>
        {options.map((service) => (
          <label
            key={service.slug}
            className={`${styles.card} ${slug === service.slug ? styles.cardActive : ''}`}
          >
            <input
              type="radio"
              name="service"
              value={service.slug}
              checked={slug === service.slug}
              onChange={() => onChange(service.slug)}
            />
            <span className={styles.cardName}>{tServices(`${service.i18nKey}.name`)}</span>
            <span className={styles.cardText}>{tServices(`${service.i18nKey}.short`)}</span>
            <span className={styles.cardPrice}>
              {formatPrice(startingPrice(service))}
            </span>
          </label>
        ))}
      </div>

      <p className={styles.hint}>
        {t('service.quoteHint')} <Link to="/offert">{t('service.quoteLink')}</Link>
      </p>
    </fieldset>
  );
};
