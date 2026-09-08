import { useTranslation } from 'react-i18next';
import { Container } from '../layout/Container';
import styles from './Promises.module.css';

/**
 * The four reasons to pick us. Each claim here is a commitment the company has
 * to keep, so verify insurance, guarantee window and eco labels before launch.
 */
export const Promises = () => {
  const { t } = useTranslation('home');
  const items = t('promises.items', { returnObjects: true });

  return (
    <section className={styles.section}>
      <Container>
        <h2 className={styles.title}>{t('promises.title')}</h2>

        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.title} className={styles.item}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemText}>{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};
