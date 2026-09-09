import { useTranslation } from 'react-i18next';
import { Calendar } from '../Calendar';
import styles from '../BookingForm.module.css';

/** Step 3: where we are going and when. */
export const AddressStep = ({ customer, errors, timeSlotId, onCustomer, onSlot }) => {
  const { t } = useTranslation('booking');

  return (
    <>
      <fieldset className={styles.block}>
        <legend className={styles.legend}>{t('review.address')}</legend>

        <label className={styles.field}>
          <span>{t('customer.street')}</span>
          <input
            value={customer.street}
            onChange={onCustomer('street')}
            autoComplete="street-address"
            aria-invalid={Boolean(errors.street)}
          />
          {errors.street ? <strong className={styles.error}>{errors.street}</strong> : null}
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>{t('customer.postalCode')}</span>
            <input
              inputMode="numeric"
              value={customer.postalCode}
              onChange={onCustomer('postalCode')}
              autoComplete="postal-code"
              aria-invalid={Boolean(errors.postalCode)}
            />
            {errors.postalCode ? (
              <strong className={styles.error}>{errors.postalCode}</strong>
            ) : null}
          </label>

          <label className={styles.field}>
            <span>{t('customer.city')}</span>
            <input
              value={customer.city}
              onChange={onCustomer('city')}
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.city)}
            />
            {errors.city ? <strong className={styles.error}>{errors.city}</strong> : null}
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.block}>
        <legend className={styles.legend}>{t('calendar.legend')}</legend>
        <Calendar value={timeSlotId} onChange={onSlot} />
      </fieldset>
    </>
  );
};
