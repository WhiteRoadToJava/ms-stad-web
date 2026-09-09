import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Seo } from '../components/seo/Seo';
import { BookingForm } from '../components/booking/BookingForm';
import { site } from '../data/site';
import { getService } from '../data/services';
import { combineSchemas, localBusinessSchema } from '../lib/structuredData';
import styles from './Booking.module.css';

/**
 * The booking page.
 *
 * ?tjanst=hemstadning preselects a service, which is what the buttons on the
 * service pages link to.
 */
export const Booking = () => {
  const { t } = useTranslation('booking');
  const [searchParams] = useSearchParams();

  const requested = searchParams.get('tjanst');
  const initialSlug = getService(requested)?.slug;

  return (
    <>
      <Seo
        title={`${t('meta.title')} — ${site.name}`}
        description={t('meta.description')}
        path="/boka"
        siteUrl={site.url}
        jsonLd={combineSchemas(localBusinessSchema())}
      />

      <header className={styles.hero}>
        <Container>
          <h1>{t('hero.title')}</h1>
          <p className={styles.lead}>{t('hero.text')}</p>
        </Container>
      </header>

      <section className={styles.section}>
        <Container>
          <BookingForm initialSlug={initialSlug} />
        </Container>
      </section>
    </>
  );
};

export default Booking;
