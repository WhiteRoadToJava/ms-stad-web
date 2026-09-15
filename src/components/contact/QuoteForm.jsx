import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { site } from '../../data/site';
import { services } from '../../data/services';
import styles from './QuoteForm.module.css';

const emptyCustomer = { name: '', email: '', phone: '', city: '' };

/**
 * Quote request.
 *
 * Deliberately shorter than the booking wizard. Someone asking for a price on
 * a stairwell contract does not know their exact square meters and should not
 * be stopped from asking, so only the fields we need to call them back are
 * required.
 */
export const QuoteForm = ({ initialSlug }) => {
  const { t } = useTranslation('contact');
  const { t: tServices } = useTranslation('services');

  const [slug, setSlug] = useState(initialSlug ?? '');
  const [customer, setCustomer] = useState(emptyCustomer);
  const [propertyType, setPropertyType] = useState('');
  const [squareMeters, setSquareMeters] = useState('');
  const [frequency, setFrequency] = useState('ONCE');
  const [description, setDescription] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [reference, setReference] = useState(null);

  const change = (field) => (event) =>
    setCustomer((current) => ({ ...current, [field]: event.target.value }));

  const validate = () => {
    const found = {};

    if (!customer.name.trim()) found.name = t('validation.name');
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) found.email = t('validation.email');
    if (!customer.phone.trim()) found.phone = t('validation.phone');
    if (description.trim().length < 10) found.description = t('validation.description');

    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setStatus('sending');

    try {
      const payload = await api.post('/quotes', {
        serviceSlug: slug || undefined,
        customer,
        propertyType: propertyType || undefined,
        squareMeters: squareMeters ? Number(squareMeters) : undefined,
        frequency,
        description,
        website: honeypot,
      });

      setReference(payload.data.reference);
      setStatus('done');
    } catch {
      setStatus('idle');
      setErrors({ form: t('callback.error', { phone: site.phoneDisplay }) });
    }
  };

  if (status === 'done') {
    return (
      <div className={styles.success}>
        <h2>{t('quote.successTitle')}</h2>
        <p className={styles.reference}>
          {t('quote.successReference', { reference })}
        </p>
        <p>{t('quote.successText')}</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <label className={styles.field}>
        <span>{t('quote.service')}</span>
        <select value={slug} onChange={(event) => setSlug(event.target.value)}>
          <option value="">{t('quote.anyService')}</option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {tServices(`${service.i18nKey}.name`)}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>{t('quote.propertyType')}</span>
          <input
            value={propertyType}
            placeholder={t('quote.propertyPlaceholder')}
            onChange={(event) => setPropertyType(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>{t('quote.squareMeters')}</span>
          <input
            type="number"
            min="1"
            value={squareMeters}
            onChange={(event) => setSquareMeters(event.target.value)}
          />
        </label>
      </div>

      <fieldset className={styles.choices}>
        <legend>{t('quote.frequency')}</legend>
        {[
          ['ONCE', t('quote.frequencyOnce')],
          ['MONTHLY', t('quote.frequencyRecurring')],
        ].map(([value, label]) => (
          <label
            key={value}
            className={`${styles.choice} ${frequency === value ? styles.choiceActive : ''}`}
          >
            <input
              type="radio"
              name="frequency"
              checked={frequency === value}
              onChange={() => setFrequency(value)}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <label className={styles.field}>
        <span>{t('quote.description')}</span>
        <textarea
          rows="5"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          aria-invalid={Boolean(errors.description)}
        />
        <small>{t('quote.descriptionHelp')}</small>
        {errors.description ? (
          <strong className={styles.error}>{errors.description}</strong>
        ) : null}
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>{t('callback.name')}</span>
          <input
            value={customer.name}
            onChange={change('name')}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <strong className={styles.error}>{errors.name}</strong> : null}
        </label>

        <label className={styles.field}>
          <span>{t('callback.phone')}</span>
          <input
            type="tel"
            value={customer.phone}
            onChange={change('phone')}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone ? <strong className={styles.error}>{errors.phone}</strong> : null}
        </label>
      </div>

      <label className={styles.field}>
        <span>{t('contact.email')}</span>
        <input
          type="email"
          value={customer.email}
          onChange={change('email')}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <strong className={styles.error}>{errors.email}</strong> : null}
      </label>

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

      {errors.form ? (
        <p className={styles.error} role="alert">
          {errors.form}
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? t('quote.submitting') : t('quote.submit')}
      </button>
    </form>
  );
};
