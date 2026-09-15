import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Seo } from '../components/seo/Seo';
import { QuoteForm } from '../components/contact/QuoteForm';
import { site } from '../data/site';
import { getService } from '../data/services';
import { combineSchemas, localBusinessSchema } from '../lib/structuredData';
import styles from './Quote.module.css';

/** Quote requests. ?tjanst=<slug> preselects the service, as on /boka. */
export const Quote = () => {
  const { t } = useTranslation('contact');
  const [searchParams] = useSearchParams();

  const initialSlug = getService(searchParams.get('tjanst'))?.slug;

  return (
    <>
      <Seo
        title={`${t('quote.meta.title')} — ${site.name}`}
        description={t('quote.meta.description')}
        path="/offert"
        siteUrl={site.url}
        jsonLd={combineSchemas(localBusinessSchema())}
      />

      <header className={styles.hero}>
        <Container>
          <h1>{t('quote.title')}</h1>
          <p className={styles.lead}>{t('quote.text')}</p>
        </Container>
      </header>

      <section className={styles.section}>
        <Container className={styles.narrow}>
          <QuoteForm initialSlug={initialSlug} />
        </Container>
      </section>
    </>
  );
};

export default Quote;
