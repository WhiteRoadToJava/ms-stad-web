import { useTranslation } from 'react-i18next';
import { Container } from '../layout/Container';
import { Button } from '../ui/Button';
import styles from './CtaBanner.module.css';

/** Closing call to action, for visitors who read all the way down. */
export const CtaBanner = () => {
  const { t } = useTranslation('home');

  return (
    <section className={styles.section}>
      <Container className={styles.inner}>
        <div>
          <h2 className={styles.title}>{t('cta.title')}</h2>
          <p className={styles.text}>{t('cta.text')}</p>
        </div>

        <div className={styles.actions}>
          <Button to="/boka" size="lg" variant="accent">
            {t('cta.primary')}
          </Button>
          <Button to="/offert" size="lg" variant="ghostLight">
            {t('cta.secondary')}
          </Button>
        </div>
      </Container>
    </section>
  );
};
