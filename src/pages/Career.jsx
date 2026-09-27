import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Seo } from '../components/seo/Seo';
import { api, ApiError } from '../lib/api';
import { site } from '../data/site';
import { combineSchemas, localBusinessSchema } from '../lib/structuredData';
import styles from './Career.module.css';

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/plain',
];

/**
 * Careers.
 *
 * The form asks for as little as possible. A CV is optional, because the
 * people most likely to be good at this work are not always the people with a
 * polished CV to hand, and an upload is where an application gets abandoned.
 */
export const Career = () => {
  const { t } = useTranslation('career');
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
    hasDriversLicense: false,
    consent: false,
    website: '',
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const change = (field) => (event) =>
    setForm({
      ...form,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    });

  const chooseFile = (event) => {
    const chosen = event.target.files?.[0] ?? null;

    if (!chosen) {
      setFile(null);
      return;
    }

    // Checked here as well as on the server, so the answer is instant rather
    // than after uploading five megabytes over a phone connection.
    if (chosen.size > MAX_BYTES) {
      setErrors((current) => ({ ...current, cv: t('errors.fileSize') }));
      event.target.value = '';
      return;
    }

    if (!ALLOWED_TYPES.includes(chosen.type)) {
      setErrors((current) => ({ ...current, cv: t('errors.fileType') }));
      event.target.value = '';
      return;
    }

    setErrors((current) => ({ ...current, cv: undefined }));
    setFile(chosen);
  };

  const validate = () => {
    const found = {};

    if (!form.name.trim()) found.name = t('errors.name');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = t('errors.email');
    if (!form.phone.trim()) found.phone = t('errors.phone');
    if (!form.consent) found.consent = t('errors.consent');

    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setStatus('sending');

    try {
      // Multipart rather than JSON: the CV travels with the fields.
      const data = new FormData();

      for (const [key, value] of Object.entries(form)) {
        if (value === '' || value === false) continue;
        data.append(key, String(value));
      }

      if (file) data.append('cv', file);

      await api.post('/applications', data);
      setStatus('done');
    } catch (error) {
      setStatus('idle');
      setErrors({
        form:
          error instanceof ApiError && error.status === 400
            ? error.message
            : t('errors.generic', { email: site.email }),
      });
    }
  };

  const offer = t('offer', { returnObjects: true });
  const wanted = t('wanted', { returnObjects: true });

  return (
    <>
      <Seo
        title={`${t('meta.title')} — ${site.name}`}
        description={t('meta.description')}
        path="/karriar"
        siteUrl={site.url}
        jsonLd={combineSchemas(localBusinessSchema())}
      />

      <header className={styles.hero}>
        <Container className={styles.narrow}>
          <h1>{t('title')}</h1>
          <p className={styles.lead}>{t('lead')}</p>
        </Container>
      </header>

      <section className={styles.section}>
        <Container className={styles.split}>
          <div>
            <h2>{t('offerTitle')}</h2>
            <ul className={styles.list}>
              {offer.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2>{t('wantedTitle')}</h2>
            <ul className={styles.list}>
              {wanted.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className={styles.formSection}>
        <Container className={styles.narrow}>
          <h2>{t('formTitle')}</h2>
          <p className={styles.text}>{t('formText')}</p>

          {status === 'done' ? (
            <div className={styles.success}>
              <h3>{t('successTitle')}</h3>
              <p>{t('successText')}</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={submit} noValidate>
              <div className={styles.row}>
                <label className={styles.field}>
                  <span>{t('name')}</span>
                  <input value={form.name} onChange={change('name')} autoComplete="name" />
                  {errors.name ? <strong className={styles.error}>{errors.name}</strong> : null}
                </label>

                <label className={styles.field}>
                  <span>{t('phone')}</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={change('phone')}
                    autoComplete="tel"
                  />
                  {errors.phone ? (
                    <strong className={styles.error}>{errors.phone}</strong>
                  ) : null}
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.field}>
                  <span>{t('email')}</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={change('email')}
                    autoComplete="email"
                  />
                  {errors.email ? (
                    <strong className={styles.error}>{errors.email}</strong>
                  ) : null}
                </label>

                <label className={styles.field}>
                  <span>{t('city')}</span>
                  <input
                    value={form.city}
                    onChange={change('city')}
                    autoComplete="address-level2"
                  />
                  <small>{t('cityHelp')}</small>
                </label>
              </div>

              <label className={styles.field}>
                <span>{t('message')}</span>
                <textarea rows="4" value={form.message} onChange={change('message')} />
                <small>{t('messageHelp')}</small>
              </label>

              <label className={styles.field}>
                <span>{t('cv')}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.rtf,.txt"
                  onChange={chooseFile}
                />
                <small>{t('cvHelp')}</small>
                {errors.cv ? <strong className={styles.error}>{errors.cv}</strong> : null}
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.hasDriversLicense}
                  onChange={change('hasDriversLicense')}
                />
                <span>{t('licence')}</span>
              </label>

              <label className={styles.checkbox}>
                <input type="checkbox" checked={form.consent} onChange={change('consent')} />
                <span>
                  {t('consent')}
                  <small>{t('consentHelp')}</small>
                </span>
              </label>
              {errors.consent ? (
                <strong className={styles.error}>{errors.consent}</strong>
              ) : null}

              {/* Hidden from people, irresistible to bots. */}
              <input
                type="text"
                name="website"
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
                className={styles.honeypot}
                value={form.website}
                onChange={change('website')}
              />

              {errors.form ? (
                <p className={styles.error} role="alert">
                  {errors.form}
                </p>
              ) : null}

              <button
                type="submit"
                className={styles.submit}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? t('submitting') : t('submit')}
              </button>
            </form>
          )}
        </Container>
      </section>
    </>
  );
};

export default Career;
