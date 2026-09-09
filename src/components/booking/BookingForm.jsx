import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SlotPicker } from './SlotPicker';
import { PriceSummary } from './PriceSummary';
import { api, ApiError } from '../../lib/api';
import { site } from '../../data/site';
import { services, getService } from '../../data/services';
import { calculatePrice } from '../../data/pricing';
import styles from './BookingForm.module.css';

/** Services with an online price. Quote-only ones send people to /offert. */
const bookable = services.filter((service) => service.pricingModel !== 'quote_only');

const frequencies = ['once', 'weekly', 'biweekly', 'monthly'];

const emptyCustomer = {
  name: '',
  email: '',
  phone: '',
  street: '',
  postalCode: '',
  city: '',
};

export const BookingForm = ({ initialSlug }) => {
  const { t } = useTranslation('booking');
  const { t: tCommon } = useTranslation();
  const { t: tServices } = useTranslation('services');

  const [slug, setSlug] = useState(initialSlug ?? bookable[0].slug);
  const [squareMeters, setSquareMeters] = useState(70);
  const [rooms, setRooms] = useState('');
  const [hours, setHours] = useState(3);
  const [frequency, setFrequency] = useState('biweekly');
  const [extraKeys, setExtraKeys] = useState([]);
  const [timeSlotId, setTimeSlotId] = useState(null);
  const [applyRut, setApplyRut] = useState(true);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const service = getService(slug);
  const isHourly = service.pricingModel === 'hourly';
  const isPackage = service.pricingModel === 'package';

  // Recomputed on every keystroke. It is arithmetic on numbers already in
  // memory, so there is nothing to debounce and no request to wait for.
  const breakdown = useMemo(
    () =>
      calculatePrice({
        service,
        squareMeters: Number(squareMeters) || 0,
        hours: Number(hours) || 0,
        frequency,
        extraKeys,
        applyRut,
      }),
    [service, squareMeters, hours, frequency, extraKeys, applyRut],
  );

  const updateCustomer = (field) => (event) =>
    setCustomer((current) => ({ ...current, [field]: event.target.value }));

  const toggleExtra = (key) =>
    setExtraKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );

  const changeService = (nextSlug) => {
    setSlug(nextSlug);
    // Extras belong to one service; carrying them over would price a fridge
    // clean into an office contract.
    setExtraKeys([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage(null);

    try {
      const payload = await api.post('/bookings', {
        serviceSlug: slug,
        customer,
        // The API speaks the Prisma enum, the UI speaks lower case.
        frequency: frequency.toUpperCase(),
        extraKeys,
        applyRut,
        timeSlotId: timeSlotId ?? undefined,
        squareMeters: isHourly || isPackage ? undefined : Number(squareMeters),
        hours: isHourly ? Number(hours) : undefined,
        rooms: rooms ? Number(rooms) : undefined,
        message: message || undefined,
        website: honeypot,
      });

      setConfirmation(payload.data);
      setStatus('done');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus('idle');
      setErrorMessage(
        error instanceof ApiError && error.status === 409
          ? error.message
          : t('errors.generic', { phone: site.phoneDisplay }),
      );
    }
  };

  if (status === 'done' && confirmation) {
    return (
      <div className={styles.success}>
        <h2>{t('success.title')}</h2>
        <p className={styles.reference}>
          {t('success.reference', { reference: confirmation.reference })}
        </p>
        <p>{t('success.text')}</p>
        <div className={styles.successActions}>
          <Link to="/" className={styles.successLink}>
            {t('success.home')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.layout} onSubmit={handleSubmit} noValidate>
      <div className={styles.fields}>
        <fieldset className={styles.block}>
          <legend className={styles.legend}>{t('service.legend')}</legend>
          <div className={styles.options}>
            {bookable.map((item) => (
              <label
                key={item.slug}
                className={`${styles.option} ${slug === item.slug ? styles.optionActive : ''}`}
              >
                <input
                  type="radio"
                  name="service"
                  value={item.slug}
                  checked={slug === item.slug}
                  onChange={() => changeService(item.slug)}
                />
                {tServices(`${item.i18nKey}.name`)}
              </label>
            ))}
          </div>
          <p className={styles.hint}>
            {t('service.quoteHint')}{' '}
            <Link to="/offert">{t('service.quoteLink')}</Link>
          </p>
        </fieldset>

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
                  value={hours}
                  onChange={(event) => setHours(event.target.value)}
                />
                <small>{t('size.hoursHelp')}</small>
              </label>
            ) : (
              <div className={styles.row}>
                <label className={styles.field}>
                  <span>{t('size.sqmLabel')}</span>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={squareMeters}
                    onChange={(event) => setSquareMeters(event.target.value)}
                  />
                  <small>{t('size.sqmHelp')}</small>
                </label>

                <label className={styles.field}>
                  <span>{t('size.roomsLabel')}</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={rooms}
                    onChange={(event) => setRooms(event.target.value)}
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
                  className={`${styles.option} ${frequency === key ? styles.optionActive : ''}`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={key}
                    checked={frequency === key}
                    onChange={() => setFrequency(key)}
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
                    extraKeys.includes(extra.key) ? styles.optionActive : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={extraKeys.includes(extra.key)}
                    onChange={() => toggleExtra(extra.key)}
                  />
                  {tCommon(`extras.${extra.key}`)}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset className={styles.block}>
          <legend className={styles.legend}>{t('slot.legend')}</legend>
          <SlotPicker value={timeSlotId} onChange={setTimeSlotId} />
        </fieldset>

        <fieldset className={styles.block}>
          <legend className={styles.legend}>{t('customer.legend')}</legend>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>{t('customer.name')}</span>
              <input required value={customer.name} onChange={updateCustomer('name')} />
            </label>
            <label className={styles.field}>
              <span>{t('customer.phone')}</span>
              <input
                required
                type="tel"
                value={customer.phone}
                onChange={updateCustomer('phone')}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>{t('customer.email')}</span>
            <input
              required
              type="email"
              value={customer.email}
              onChange={updateCustomer('email')}
            />
          </label>

          <label className={styles.field}>
            <span>{t('customer.street')}</span>
            <input value={customer.street} onChange={updateCustomer('street')} />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>{t('customer.postalCode')}</span>
              <input
                inputMode="numeric"
                value={customer.postalCode}
                onChange={updateCustomer('postalCode')}
              />
            </label>
            <label className={styles.field}>
              <span>{t('customer.city')}</span>
              <input value={customer.city} onChange={updateCustomer('city')} />
            </label>
          </div>

          <label className={styles.field}>
            <span>{t('customer.message')}</span>
            <textarea
              rows="3"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <small>{t('customer.messageHelp')}</small>
          </label>

          {service.rutEligible ? (
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={applyRut}
                onChange={(event) => setApplyRut(event.target.checked)}
              />
              <span>
                {t('customer.rut')}
                <small>{t('customer.rutHelp')}</small>
              </span>
            </label>
          ) : null}

          {/* Hidden from people, irresistible to bots. */}
          <input
            type="text"
            name="website"
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
            className={styles.honeypot}
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </fieldset>
      </div>

      <PriceSummary
        service={service}
        breakdown={breakdown}
        frequency={frequency}
        squareMeters={squareMeters}
        hours={hours}
        extraKeys={extraKeys}
        hasSlot={Boolean(timeSlotId)}
        status={status}
        errorMessage={errorMessage}
      />
    </form>
  );
};
