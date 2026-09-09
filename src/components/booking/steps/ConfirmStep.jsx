import { useTranslation } from 'react-i18next';
import styles from '../BookingForm.module.css';

/** Step 4: who we are cleaning for, and a last look at what was chosen. */
export const ConfirmStep = ({
  service,
  customer,
  errors,
  values,
  onCustomer,
  onChange,
  onEdit,
}) => {
  const { t } = useTranslation('booking');
  const { t: tServices } = useTranslation('services');

  const address = [customer.street, customer.postalCode, customer.city]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <fieldset className={styles.block}>
        <legend className={styles.legend}>{t('customer.legend')}</legend>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>{t('customer.name')}</span>
            <input
              value={customer.name}
              onChange={onCustomer('name')}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <strong className={styles.error}>{errors.name}</strong> : null}
          </label>

          <label className={styles.field}>
            <span>{t('customer.phone')}</span>
            <input
              type="tel"
              value={customer.phone}
              onChange={onCustomer('phone')}
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone ? <strong className={styles.error}>{errors.phone}</strong> : null}
          </label>
        </div>

        <label className={styles.field}>
          <span>{t('customer.email')}</span>
          <input
            type="email"
            value={customer.email}
            onChange={onCustomer('email')}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <strong className={styles.error}>{errors.email}</strong> : null}
        </label>

        <label className={styles.field}>
          <span>{t('customer.message')}</span>
          <textarea
            rows="3"
            value={values.message}
            onChange={(event) => onChange('message', event.target.value)}
          />
          <small>{t('customer.messageHelp')}</small>
        </label>

        {service.rutEligible ? (
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={values.applyRut}
              onChange={(event) => onChange('applyRut', event.target.checked)}
            />
            <span>
              {t('customer.rut')}
              <small>{t('customer.rutHelp')}</small>
            </span>
          </label>
        ) : null}
      </fieldset>

      <section className={styles.review}>
        <h2 className={styles.legend}>{t('review.title')}</h2>
        <p className={styles.hint}>{t('review.text')}</p>

        <dl className={styles.reviewList}>
          <div>
            <dt>{t('summary.service')}</dt>
            <dd>
              {tServices(`${service.i18nKey}.name`)}
              <button type="button" className={styles.edit} onClick={() => onEdit(0)}>
                {t('review.edit')}
              </button>
            </dd>
          </div>

          <div>
            <dt>{t('review.address')}</dt>
            <dd>
              {address || '—'}
              <button type="button" className={styles.edit} onClick={() => onEdit(2)}>
                {t('review.edit')}
              </button>
            </dd>
          </div>
        </dl>
        <label
          className={`${styles.confirm} ${errors.confirmed ? styles.confirmInvalid : ''}`}
        >
          <input
            type="checkbox"
            checked={values.confirmed}
            onChange={(event) => onChange('confirmed', event.target.checked)}
            aria-invalid={Boolean(errors.confirmed)}
          />
          <span>
            {t('confirmation.label')}
            <small>{t('confirmation.help')}</small>
          </span>
        </label>

        {errors.confirmed ? (
          <strong className={styles.error} role="alert">
            {errors.confirmed}
          </strong>
        ) : null}
      </section>
    </>
  );
};
