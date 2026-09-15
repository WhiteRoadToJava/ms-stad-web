import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Seo } from '../components/seo/Seo';
import { CallbackForm } from '../components/contact/CallbackWidget';
import { site } from '../data/site';
import { areas } from '../data/areas';
import { combineSchemas, localBusinessSchema } from '../lib/structuredData';
import styles from './Contact.module.css';

/** Contact details, opening hours and the callback form. */
export const Contact = () => {
  const { t } = useTranslation('contact');

  return (
    <>
      <Seo
        title={`${t('contact.meta.title')} — ${site.name}`}
        description={t('contact.meta.description')}
        path="/kontakt"
        siteUrl={site.url}
        jsonLd={combineSchemas(localBusinessSchema())}
      />

      <header className={styles.hero}>
        <Container>
          <h1>{t('contact.title')}</h1>
          <p className={styles.lead}>{t('contact.text')}</p>
        </Container>
      </header>

      <section className={styles.section}>
        <Container className={styles.grid}>
          <div className={styles.details}>
            <dl className={styles.list}>
              <div>
                <dt>{t('contact.phone')}</dt>
                <dd>
                  <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
                </dd>
              </div>
              <div>
                <dt>{t('contact.email')}</dt>
                <dd>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </dd>
              </div>
              <div>
                <dt>{t('contact.hours')}</dt>
                <dd>
                  {t('contact.hoursWeekdays')}
                  <br />
                  <span className={styles.muted}>{t('contact.hoursWeekend')}</span>
                </dd>
              </div>
              <div>
                <dt>{t('contact.orgTitle')}</dt>
                <dd>{site.legalName}</dd>
              </div>
            </dl>

            <h2 className={styles.areasTitle}>{t('contact.areas')}</h2>
            <ul className={styles.areas}>
              {areas.map((area) => (
                <li key={area.slug}>{area.name}</li>
              ))}
            </ul>
          </div>

          <div className={styles.callback}>
            <h2 className={styles.callbackTitle}>{t('callback.title')}</h2>
            <p className={styles.callbackText}>{t('callback.text')}</p>
            <CallbackForm />
          </div>
        </Container>
      </section>
    </>
  );
};

export default Contact;
