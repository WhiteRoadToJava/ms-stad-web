import { useTranslation } from 'react-i18next';
import { Container } from '../layout/Container';
import { FaqList } from '../ui/FaqList';
import styles from './Faq.module.css';

/** The questions people ask before booking, answered on the page itself. */
export const Faq = () => {
  const { t } = useTranslation('home');
  const items = t('faq.items', { returnObjects: true });

  return (
    <section className={styles.section} id="fragor">
      <Container className={styles.inner}>
        <h2 className={styles.title}>{t('faq.title')}</h2>
        <FaqList items={items} />
      </Container>
    </section>
  );
};
