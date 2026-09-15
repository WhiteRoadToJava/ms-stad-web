import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Seo } from '../components/seo/Seo';
import { site } from '../data/site';
import { combineSchemas, localBusinessSchema } from '../lib/structuredData';
import styles from './LegalPage.module.css';

/**
 * Renders a policy document from the translation files.
 *
 * Privacy and terms have the same shape — a title, an intro and a list of
 * headed sections — so one component covers both and the actual wording lives
 * where a lawyer can read and edit it without touching code.
 */
export const LegalPage = ({ namespace, path }) => {
  const { t, i18n } = useTranslation('legal');

  const sections = t(`${namespace}.sections`, { returnObjects: true });

  const values = {
    company: site.legalName,
    email: site.email,
    phone: site.phoneDisplay,
  };

  // The date the document was last edited, not today's date: a policy that
  // claims to be updated every time someone opens it is worthless.
  const updated = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(
    new Date(site.legalUpdatedAt),
  );

  return (
    <>
      <Seo
        title={`${t(`${namespace}.meta.title`)} — ${site.name}`}
        description={t(`${namespace}.meta.description`)}
        path={path}
        siteUrl={site.url}
        jsonLd={combineSchemas(localBusinessSchema())}
      />

      <header className={styles.hero}>
        <Container className={styles.narrow}>
          <h1>{t(`${namespace}.title`)}</h1>
          <p className={styles.updated}>{t(`${namespace}.updated`, { date: updated })}</p>
        </Container>
      </header>

      <article className={styles.section}>
        <Container className={styles.narrow}>
          <p className={styles.intro}>{t(`${namespace}.intro`, values)}</p>

          {sections.map((section, index) => (
            <section key={section.title} className={styles.block}>
              <h2 className={styles.blockTitle}>
                <span className={styles.number}>{index + 1}</span>
                {section.title}
              </h2>
              <p>{t(`${namespace}.sections.${index}.body`, values)}</p>
            </section>
          ))}
        </Container>
      </article>
    </>
  );
};

export const PrivacyPage = () => <LegalPage namespace="privacy" path="/integritetspolicy" />;
export const TermsPage = () => <LegalPage namespace="terms" path="/villkor" />;
