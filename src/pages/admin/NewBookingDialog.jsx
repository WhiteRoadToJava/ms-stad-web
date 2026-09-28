import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/adminApi';
import { services, getService } from '../../data/services';
import { calculatePrice, formatPrice } from '../../data/pricing';
import styles from './admin.module.css';

const bookable = services.filter((service) => service.pricingModel !== 'quote_only');

const FREQUENCIES = ['ONCE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'];

/** kronor in the input, ore everywhere else. */
const toOre = (kronor) => Math.round(Number(kronor) * 100);

/**
 * A booking taken over the phone.
 *
 * The same questions the website asks, in the order they come up on a call,
 * plus the two things only the office can decide: a price agreed verbally and
 * whether the customer wants a confirmation at all.
 */
export const NewBookingDialog = ({ onClose, onCreated }) => {
  const { t, i18n } = useTranslation('admin');
  const { t: tServices } = useTranslation('services');
  const closeRef = useRef(null);

  const [slug, setSlug] = useState(bookable[0].slug);
  const [values, setValues] = useState({
    squareMeters: 70,
    hours: 3,
    rooms: '',
    frequency: 'ONCE',
    extraKeys: [],
    scheduledDate: '',
    applyRut: true,
    agreedPrice: '',
    internalNotes: '',
    sendConfirmation: true,
  });

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    city: '',
  });

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const service = getService(slug);
  const isHourly = service.pricingModel === 'hourly';
  const isPackage = service.pricingModel === 'package';

  const calculated = useMemo(
    () =>
      calculatePrice({
        service,
        squareMeters: Number(values.squareMeters) || 0,
        hours: Number(values.hours) || 0,
        // The dashboard speaks the Prisma enum; the calculator speaks lower case.
        frequency: values.frequency.toLowerCase(),
        extraKeys: values.extraKeys,
        applyRut: values.applyRut,
      }),
    [service, values],
  );

  /**
   * What the customer ends up paying, shown while the agreed price is typed.
   *
   * The office enters the price before RUT, because that is the figure they
   * quote on the phone, and because deriving it back from a final amount would
   * make the deduction claimed from Skatteverket describe a price that was
   * never charged.
   */
  const preview = useMemo(() => {
    if (values.agreedPrice === '') return calculated;

    const gross = toOre(values.agreedPrice);
    const share = service.slug === 'flytthjalp' ? 0.6 : 1;
    const rut =
      service.rutEligible && values.applyRut
        ? Math.round((gross * share * 0.5) / 100) * 100
        : 0;

    return { ...calculated, grossPrice: gross, rutDeduction: rut, totalPrice: gross - rut };
  }, [values.agreedPrice, values.applyRut, calculated, service]);

  const change = (field) => (event) =>
    setValues({
      ...values,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    });

  const changeCustomer = (field) => (event) =>
    setCustomer({ ...customer, [field]: event.target.value });

  const toggleExtra = (key) =>
    setValues((current) => ({
      ...current,
      extraKeys: current.extraKeys.includes(key)
        ? current.extraKeys.filter((item) => item !== key)
        : [...current.extraKeys, key],
    }));

  const create = async () => {
    setStatus('sending');
    setError(null);

    try {
      const payload = await adminApi.post('/admin/bookings', {
        serviceSlug: slug,
        customer: Object.fromEntries(
          Object.entries(customer).filter(([, value]) => value.trim() !== ''),
        ),
        squareMeters: isHourly || isPackage ? undefined : Number(values.squareMeters),
        hours: isHourly ? Number(values.hours) : undefined,
        rooms: values.rooms ? Number(values.rooms) : undefined,
        frequency: values.frequency,
        extraKeys: values.extraKeys,
        applyRut: values.applyRut,
        scheduledDate: values.scheduledDate || undefined,
        internalNotes: values.internalNotes || undefined,
        priceOverride: values.agreedPrice === '' ? undefined : toOre(values.agreedPrice),
        sendConfirmation: values.sendConfirmation,
      });

      onCreated?.(payload.data);
      onClose();
    } catch (caught) {
      setStatus('idle');
      setError(caught?.message ?? t('newBooking.error'));
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t('newBooking.title')}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <div>
            <h2 className={styles.modalTitle}>{t('newBooking.title')}</h2>
            <p className={styles.muted}>{t('newBooking.subtitle')}</p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t('newBooking.cancel')}
          >
            ×
          </button>
        </header>

        <div className={styles.modalBody}>
          <section>
            <h3 className={styles.detailHeading}>{t('newBooking.service')}</h3>

            <div className={styles.filters}>
              <label className={styles.inlineField}>
                <span>{t('newBooking.service')}</span>
                <select
                  className={styles.select}
                  value={slug}
                  onChange={(event) => {
                    // Extras belong to one service; carrying them across would
                    // price a fridge clean into an office contract.
                    setValues((current) => ({ ...current, extraKeys: [] }));
                    setSlug(event.target.value);
                  }}
                >
                  {bookable.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {tServices(`${item.i18nKey}.name`)}
                    </option>
                  ))}
                </select>
              </label>

              {isHourly ? (
                <label className={styles.inlineField}>
                  <span>{t('newBooking.hours')}</span>
                  <input
                    className={styles.input}
                    type="number"
                    min="2"
                    step="0.5"
                    value={values.hours}
                    onChange={change('hours')}
                  />
                </label>
              ) : null}

              {!isHourly && !isPackage ? (
                <>
                  <label className={styles.inlineField}>
                    <span>{t('newBooking.squareMeters')}</span>
                    <input
                      className={styles.input}
                      type="number"
                      min="10"
                      value={values.squareMeters}
                      onChange={change('squareMeters')}
                    />
                  </label>

                  <label className={styles.inlineField}>
                    <span>{t('newBooking.rooms')}</span>
                    <input
                      className={styles.input}
                      type="number"
                      min="1"
                      value={values.rooms}
                      onChange={change('rooms')}
                    />
                  </label>
                </>
              ) : null}

              {!isPackage ? (
                <label className={styles.inlineField}>
                  <span>{t('newBooking.frequency')}</span>
                  <select
                    className={styles.select}
                    value={values.frequency}
                    onChange={change('frequency')}
                  >
                    {FREQUENCIES.map((value) => (
                      <option key={value} value={value}>
                        {t(`frequency.${value}`)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className={styles.inlineField}>
                <span>{t('newBooking.date')}</span>
                <input
                  className={styles.input}
                  type="date"
                  value={values.scheduledDate}
                  onChange={change('scheduledDate')}
                />
              </label>
            </div>

            {service.extras?.length ? (
              <div className={styles.slotRow}>
                {service.extras.map((extra) => (
                  <label
                    key={extra.key}
                    className={`${styles.employeeChip} ${
                      values.extraKeys.includes(extra.key) ? styles.employeeChipActive : ''
                    }`}
                    style={
                      values.extraKeys.includes(extra.key)
                        ? { backgroundColor: 'var(--color-brand)', borderColor: 'var(--color-brand)' }
                        : undefined
                    }
                  >
                    <input
                      type="checkbox"
                      checked={values.extraKeys.includes(extra.key)}
                      onChange={() => toggleExtra(extra.key)}
                    />
                    {t(`extras.${extra.key}`)}
                  </label>
                ))}
              </div>
            ) : null}
          </section>

          <section>
            <h3 className={styles.detailHeading}>{t('newBooking.customerTitle')}</h3>

            <div className={styles.filters}>
              {['name', 'phone', 'email'].map((field) => (
                <label key={field} className={styles.inlineField}>
                  <span>{t(`newBooking.${field}`)}</span>
                  <input
                    className={styles.input}
                    value={customer[field]}
                    onChange={changeCustomer(field)}
                  />
                </label>
              ))}
            </div>

            <div className={styles.filters}>
              {['street', 'postalCode', 'city'].map((field) => (
                <label key={field} className={styles.inlineField}>
                  <span>{t(`newBooking.${field}`)}</span>
                  <input
                    className={styles.input}
                    value={customer[field]}
                    onChange={changeCustomer(field)}
                  />
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className={styles.detailHeading}>{t('newBooking.priceTitle')}</h3>

            <dl className={styles.detailList}>
              <div>
                <dt>{t('newBooking.calculated')}</dt>
                <dd>{formatPrice(calculated.grossPrice)}</dd>
              </div>
            </dl>

            <label className={styles.inlineField} style={{ marginTop: 'var(--space-3)' }}>
              <span>{t('newBooking.agreed')}</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="1"
                placeholder={String(Math.round(calculated.grossPrice / 100))}
                value={values.agreedPrice}
                onChange={change('agreedPrice')}
              />
            </label>
            <p className={styles.muted}>{t('newBooking.agreedHint')}</p>

            {/* The figure the customer is told, updated as the price is typed,
                so nobody has to work the deduction out in their head. */}
            <p className={styles.cardValue}>
              {t('newBooking.afterRut')}: {formatPrice(preview.totalPrice)}
            </p>

            <label className={styles.inlineField}>
              <span>{t('newBooking.internalNotes')}</span>
              <textarea
                className={styles.textarea}
                rows="2"
                value={values.internalNotes}
                onChange={change('internalNotes')}
              />
            </label>
            <p className={styles.muted}>{t('newBooking.notesHint')}</p>

            <label className={styles.scopeOption} style={{ marginTop: 'var(--space-3)' }}>
              <input
                type="checkbox"
                checked={values.sendConfirmation}
                onChange={change('sendConfirmation')}
              />
              {t('newBooking.sendConfirmation')}
            </label>

            <div className={styles.detailActions}>
              <button
                type="button"
                className={styles.button}
                onClick={create}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? t('newBooking.creating') : t('newBooking.create')}
              </button>

              <button
                type="button"
                className={`${styles.button} ${styles.buttonGhost}`}
                onClick={onClose}
              >
                {t('newBooking.cancel')}
              </button>

              {error ? <span className={styles.error}>{error}</span> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
