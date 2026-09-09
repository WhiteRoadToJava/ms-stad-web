import { useTranslation } from 'react-i18next';
import styles from '../BookingForm.module.css';

const frequencies = ['once', 'weekly', 'biweekly', 'monthly'];

/** Step 2: size, how often, and any add-ons — everything that moves the price. */
export const PropertyStep = ({ service, values, errors, onChange, onToggleExtra }) => {
  const { t } = useTranslation('booking');
  const { t: tCommon } = useTranslation();

  const isHourly = service.pricingModel === 'hourly';
  const isPackage = service.pricingModel === 'package';

  return (
    <>
      {!isPackage ? (
        <fieldset className={styles.block}>
          <legend className={styles.legend}>{t('size.legend')}</legend>

          {isHourly ? (
            <label className={styles.field}>
              <span>{t('size.hoursLabel')}</span>
              <input
                type="number"
                min="2"
                max="40"
                step="0.5"
                value={values.hours}
                onChange={(event) => onChange('hours', event.target.value)}
                aria-invalid={Boolean(errors.hours)}
              />
              <small>{t('size.hoursHelp')}</small>
              {errors.hours ? <strong className={styles.error}>{errors.hours}</strong> : null}
            </label>
          ) : (
            <div className={styles.row}>
              <label className={styles.field}>
                <span>{t('size.sqmLabel')}</span>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={values.squareMeters}
                  onChange={(event) => onChange('squareMeters', event.target.value)}
                  aria-invalid={Boolean(errors.squareMeters)}
                />
                <small>{t('size.sqmHelp')}</small>
                {errors.squareMeters ? (
                  <strong className={styles.error}>{errors.squareMeters}</strong>
                ) : null}
              </label>

              <label className={styles.field}>
                <span>{t('size.roomsLabel')}</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={values.rooms}
                  onChange={(event) => onChange('rooms', event.target.value)}
                />
              </label>
            </div>
          )}
        </fieldset>
      ) : null}

      {!isPackage ? (
        <fieldset className={styles.block}>
          <legend className={styles.legend}>{t('frequency.legend')}</legend>
          <div className={styles.options}>
            {frequencies.map((key) => (
              <label
                key={key}
                className={`${styles.option} ${
                  values.frequency === key ? styles.optionActive : ''
                }`}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={key}
                  checked={values.frequency === key}
                  onChange={() => onChange('frequency', key)}
                />
                {t(`frequency.${key}`)}
                {key === 'weekly' ? (
                  <small className={styles.badge}>{t('frequency.cheapest')}</small>
                ) : null}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {service.extras?.length ? (
        <fieldset className={styles.block}>
          <legend className={styles.legend}>{t('extras.legend')}</legend>
          <div className={styles.options}>
            {service.extras.map((extra) => (
              <label
                key={extra.key}
                className={`${styles.option} ${
                  values.extraKeys.includes(extra.key) ? styles.optionActive : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={values.extraKeys.includes(extra.key)}
                  onChange={() => onToggleExtra(extra.key)}
                />
                {tCommon(`extras.${extra.key}`)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
    </>
  );
};
