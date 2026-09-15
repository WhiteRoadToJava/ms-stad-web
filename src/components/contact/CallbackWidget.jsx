import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { site } from '../../data/site';
import styles from './CallbackWidget.module.css';

/**
 * "Leave your number" form.
 *
 * Two fields only. Every extra field on a form like this costs replies, and a
 * phone number is all we need to start the conversation.
 *
 * Used inline on the contact page and inside the floating button elsewhere.
 */
export const CallbackForm = ({ onDone }) => {
  const { t } = useTranslation('contact');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();

    if (!phone.trim()) {
      setError(t('validation.phone'));
      return;
    }

    setStatus('sending');
    setError(null);

    try {
      await api.post('/callbacks', {
        name: name || undefined,
        phone,
        website: honeypot,
      });

      setStatus('done');
      onDone?.();
    } catch {
      setStatus('idle');
      setError(t('callback.error', { phone: site.phoneDisplay }));
    }
  };

  if (status === 'done') {
    return <p className={styles.success}>{t('callback.success')}</p>;
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <label className={styles.field}>
        <span>{t('callback.name')}</span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className={styles.field}>
        <span>{t('callback.phone')}</span>
        <input
          type="tel"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          aria-invalid={Boolean(error)}
        />
      </label>

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

      {error ? (
        <strong className={styles.error} role="alert">
          {error}
        </strong>
      ) : null}

      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? t('callback.submitting') : t('callback.submit')}
      </button>
    </form>
  );
};

/**
 * Floating button in the corner.
 *
 * A button that opens on demand rather than a panel that opens itself: an
 * uninvited overlay covers the content on a phone, which is where most of this
 * traffic is.
 */
export const CallbackWidget = () => {
  const { t } = useTranslation('contact');
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.widget}>
      {open ? (
        <div className={styles.panel} role="dialog" aria-label={t('callback.title')}>
          <div className={styles.panelHead}>
            <p className={styles.panelTitle}>{t('callback.title')}</p>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label={t('callback.close')}
            >
              ×
            </button>
          </div>
          <p className={styles.panelText}>{t('callback.text')}</p>
          <CallbackForm />
        </div>
      ) : null}

      <button type="button" className={styles.trigger} onClick={() => setOpen(!open)}>
        {open ? t('callback.close') : t('callback.open')}
      </button>
    </div>
  );
};
