import { useTranslation } from 'react-i18next';
import { Container } from '../layout/Container';
import styles from './HowItWorks.module.css';

/** The four steps between landing on the site and having a cleaned home. */
export const HowItWorks = () => {
  const { t } = useTranslation('home');
  const steps = t('how.steps', { returnObjects: true });

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.head}>
          <h2>{t('how.title')}</h2>
          <p className={styles.lead}>{t('how.text')}</p>
        </div>

        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
};
