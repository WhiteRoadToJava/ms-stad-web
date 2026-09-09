import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Stepper } from './Stepper';
import { PriceSummary } from './PriceSummary';
import { ServiceStep } from './steps/ServiceStep';
import { PropertyStep } from './steps/PropertyStep';
import { AddressStep } from './steps/AddressStep';
import { ConfirmStep } from './steps/ConfirmStep';
import { api, ApiError } from '../../lib/api';
import { site } from '../../data/site';
import { services, getService } from '../../data/services';
import { calculatePrice } from '../../data/pricing';
import styles from './BookingForm.module.css';

/** Services with an online price. Quote-only ones send people to /offert. */
const bookable = services.filter((service) => service.pricingModel !== 'quote_only');

const STEPS = ['service', 'property', 'address', 'confirm'];

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

  const [step, setStep] = useState(0);
  const [slug, setSlug] = useState(initialSlug ?? bookable[0].slug);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    squareMeters: 70,
    rooms: '',
    hours: 3,
    frequency: 'biweekly',
    extraKeys: [],
    timeSlotId: null,
    applyRut: true,
    message: '',
    honeypot: '',
  });

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
        squareMeters: Number(values.squareMeters) || 0,
        hours: Number(values.hours) || 0,
        frequency: values.frequency,
        extraKeys: values.extraKeys,
        applyRut: values.applyRut,
      }),
    [service, values],
  );

  const change = (field, value) => setValues((current) => ({ ...current, [field]: value }));

  const changeCustomer = (field) => (event) =>
    setCustomer((current) => ({ ...current, [field]: event.target.value }));

  const toggleExtra = (key) =>
    setValues((current) => ({
      ...current,
      extraKeys: current.extraKeys.includes(key)
        ? current.extraKeys.filter((item) => item !== key)
        : [...current.extraKeys, key],
    }));

  const changeService = (nextSlug) => {
    setSlug(nextSlug);
    // Extras belong to one service; carrying them over would price a fridge
    // clean into an office contract.
    setValues((current) => ({ ...current, extraKeys: [] }));
  };

  /**
   * Each step checks only its own fields. Validating everything at the end
   * would send someone back three screens to fix a postal code.
   */
  const validateStep = (index) => {
    const found = {};

    if (index === 1) {
      if (isHourly) {
        if (!(Number(values.hours) >= 2)) found.hours = t('validation.hours');
      } else if (!isPackage) {
        const sqm = Number(values.squareMeters);
        if (!(sqm >= 10 && sqm <= 1000)) found.squareMeters = t('validation.squareMeters');
      }
    }

    if (index === 2) {
      if (!customer.street.trim()) found.street = t('validation.street');
      if (!/^\d{3}\s?\d{2}$/.test(customer.postalCode.trim())) {
        found.postalCode = t('validation.postalCode');
      }
      if (!customer.city.trim()) found.city = t('validation.city');
    }

    if (index === 3) {
      if (!customer.name.trim()) found.name = t('validation.name');
      if (!/^\S+@\S+\.\S+$/.test(customer.email)) found.email = t('validation.email');
      if (!customer.phone.trim()) found.phone = t('validation.phone');
    }

    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const goTo = (index) => {
    setErrors({});
    setStep(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    if (validateStep(step)) goTo(step + 1);
  };

  const submit = async (event) => {
    event.preventDefault();

    // Enter inside a text field submits a form. On any step but the last that
    // should advance instead of sending a half-filled booking.
    if (step < STEPS.length - 1) {
      next();
      return;
    }

    if (!validateStep(step)) return;

    setStatus('sending');
    setErrorMessage(null);

    try {
      const payload = await api.post('/bookings', {
        serviceSlug: slug,
        customer,
        // The API speaks the Prisma enum, the UI speaks lower case.
        frequency: values.frequency.toUpperCase(),
        extraKeys: values.extraKeys,
        applyRut: values.applyRut,
        timeSlotId: values.timeSlotId ?? undefined,
        squareMeters: isHourly || isPackage ? undefined : Number(values.squareMeters),
        hours: isHourly ? Number(values.hours) : undefined,
        rooms: values.rooms ? Number(values.rooms) : undefined,
        message: values.message || undefined,
        website: values.honeypot,
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
    <>
      <Stepper steps={STEPS} current={step} onSelect={goTo} />

      <form className={styles.layout} onSubmit={submit} noValidate>
        <div className={styles.fields}>
          {step === 0 ? (
            <ServiceStep options={bookable} slug={slug} onChange={changeService} />
          ) : null}

          {step === 1 ? (
            <PropertyStep
              service={service}
              values={values}
              errors={errors}
              onChange={change}
              onToggleExtra={toggleExtra}
            />
          ) : null}

          {step === 2 ? (
            <AddressStep
              customer={customer}
              errors={errors}
              timeSlotId={values.timeSlotId}
              onCustomer={changeCustomer}
              onSlot={(id) => change('timeSlotId', id)}
            />
          ) : null}

          {step === 3 ? (
            <ConfirmStep
              service={service}
              customer={customer}
              errors={errors}
              values={values}
              onCustomer={changeCustomer}
              onChange={change}
              onEdit={goTo}
            />
          ) : null}

          {/* Hidden from people, irresistible to bots. */}
          <input
            type="text"
            name="website"
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
            className={styles.honeypot}
            value={values.honeypot}
            onChange={(event) => change('honeypot', event.target.value)}
          />

          <div className={styles.nav}>
            {step > 0 ? (
              <button type="button" className={styles.back} onClick={() => goTo(step - 1)}>
                {t('nav.back')}
              </button>
            ) : null}

            {step < STEPS.length - 1 ? (
              <button type="button" className={styles.next} onClick={next}>
                {t('nav.next')}
              </button>
            ) : null}
          </div>
        </div>

        <PriceSummary
          service={service}
          breakdown={breakdown}
          frequency={values.frequency}
          squareMeters={values.squareMeters}
          hours={values.hours}
          extraKeys={values.extraKeys}
          hasSlot={Boolean(values.timeSlotId)}
          status={status}
          errorMessage={errorMessage}
          canSubmit={step === STEPS.length - 1}
        />
      </form>
    </>
  );
};
