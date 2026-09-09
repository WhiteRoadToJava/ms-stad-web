import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../data/pricing';
import styles from './PriceSummary.module.css';

/**
 * The running total.
 *
 * Sticky beside the form on a desktop and pinned to the bottom of the screen on
 * a phone, so the price never scrolls out of sight while someone is deciding.
 */
export const PriceSummary = ({
  service,
  breakdown,
  frequency,
  squareMeters,
  hours,
  extraKeys,
  hasSlot,
  status,
  errorMessage,
}) => {
  const { t } = useTranslation('booking');
  const { t: tCommon } = useTranslation();
  const { t: tServices } = useTranslation('services');

  const isHourly = service.pricingModel === 'hourly';
  const sending = status === 'sending';

  return (
    <aside className={styles.summary}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t('summary.title')}</h2>

        <dl className={styles.lines}>
          <div>
            <dt>{t('summary.service')}</dt>
            <dd>{tServices(`${service.i18nKey}.name`)}</dd>
          </div>

          {service.pricingModel !== 'package' ? (
            <div>
              <dt>{isHourly ? t('size.hoursLabel') : t('summary.size')}</dt>
              <dd>{isHourly ? `${hours} h` : `${squareMeters} m²`}</dd>
            </div>
          ) : null}

          {service.pricingModel !== 'package' ? (
            <div>
              <dt>{t('summary.frequency')}</dt>
              <dd>{t(`frequency.${frequency}`)}</dd>
            </div>
          ) : null}

          <div>
            <dt>{t('summary.time')}</dt>
            <dd>{hasSlot ? t('summary.time') : t('summary.timeMissing')}</dd>
          </div>

          {extraKeys.length ? (
            <div>
              <dt>{t('summary.extras')}</dt>
              <dd>{extraKeys.map((key) => tCommon(`extras.${key}`)).join(', ')}</dd>
            </div>
          ) : null}
        </dl>

        <hr className={styles.rule} />

        <dl className={styles.totals}>
          <div>
            <dt>{t('summary.gross')}</dt>
            <dd>{formatPrice(breakdown.grossPrice)}</dd>
          </div>

          {breakdown.rutDeduction > 0 ? (
            <div className={styles.deduction}>
              <dt>{t('summary.rut')}</dt>
              <dd>−{formatPrice(breakdown.rutDeduction)}</dd>
            </div>
          ) : null}
        </dl>

        <p className={styles.total}>
          {formatPrice(breakdown.totalPrice)}
          <span className={styles.perVisit}>{t('summary.perVisit')}</span>
        </p>

        <button type="submit" className={styles.submit} disabled={sending}>
          {sending ? t('summary.submitting') : t('summary.submit')}
        </button>

        {errorMessage ? (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        ) : (
          <p className={styles.note}>{t('summary.note')}</p>
        )}
      </div>
    </aside>
  );
};
