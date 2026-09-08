import { useTranslation } from 'react-i18next';
import { Container } from '../layout/Container';
import styles from './Faq.module.css';

/**
 * Uses native <details> rather than a React accordion: it works before the
 * JavaScript loads, it is keyboard accessible for free, and the answers are in
 * the static HTML where search engines can read them.
 */
export const Faq = () => {
  const { t } = useTranslation('home');
  const items = t('faq.items', { returnObjects: true });

  return (
    <section className={styles.section} id="fragor">
      <Container className={styles.inner}>
        <h2 className={styles.title}>{t('faq.title')}</h2>

        <div className={styles.list}>
          {items.map((item) => (
            <details key={item.question} className={styles.item}>
              <summary className={styles.question}>{item.question}</summary>
              <p className={styles.answer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
};
