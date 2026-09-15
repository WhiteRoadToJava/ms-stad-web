import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Seo } from '../components/seo/Seo';
import { site } from '../data/site';
import { areas } from '../data/areas';
import { combineSchemas, localBusinessSchema } from '../lib/structuredData';
import styles from './About.module.css';

/**
 * About page.
 *
 * Says what the company does differently rather than how passionate it is.
 * Nothing here is a claim that cannot be checked by a customer after one
 * visit, which is the only kind of promise worth printing.
 */
export const About = () => {
  const { t } = useTranslation('about');
  const values = t('about.values', { returnObjects: true });

  return (
    <>
      <Seo
        title={`${t('about.meta.title')} — ${site.name}`}
        description={t('about.meta.description')}
        path="/om-oss"
        siteUrl={site.url}
        jsonLd={combineSchemas(localBusinessSchema())}
      />

      <header className={styles.hero}>
        <Container className={styles.narrow}>
          <h1>{t('about.title')}</h1>
          <p className={styles.lead}>{t('about.lead')}</p>
        </Container>
      </header>

      <section className={styles.section}>
        <Container className={styles.split}>
          <h2>{t('about.storyTitle')}</h2>
          <p className={styles.body}>{t('about.story')}</p>
        </Container>
      </section>

      <section className={styles.values}>
        <Container>
          <h2>{t('about.valuesTitle')}</h2>
          <ul className={styles.valueList}>
            {values.map((value) => (
              <li key={value.title} className={styles.value}>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueText}>{value.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className={styles.section}>
        <Container className={styles.split}>
          <h2>{t('about.areaTitle')}</h2>
          <div>
            <p className={styles.body}>{t('about.areaText')}</p>
            <ul className={styles.areas}>
              {areas.map((area) => (
                <li key={area.slug}>{area.name}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className={styles.cta}>
        <Container className={styles.ctaInner}>
          <div>
            <h2 className={styles.ctaTitle}>{t('about.ctaTitle')}</h2>
            <p className={styles.ctaText}>{t('about.ctaText')}</p>
          </div>
          <Button to="/boka" size="lg" variant="accent">
            {t('about.ctaButton')}
          </Button>
        </Container>
      </section>
    </>
  );
};

export default About;
