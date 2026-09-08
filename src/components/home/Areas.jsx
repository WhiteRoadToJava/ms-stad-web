import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '../layout/Container';
import { areas } from '../../data/areas';
import styles from './Areas.module.css';

/**
 * Links to the local landing pages.
 *
 * This block is how a local cleaning company gets found: someone searching for
 * "hemstädning Borås" lands on a page written for Borås, not on a generic one.
 * The pages themselves arrive in a later phase; the links are already the
 * canonical URLs so nothing has to change then.
 */
export const Areas = () => {
  const { t } = useTranslation('home');

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.head}>
          <h2>{t('areas.title')}</h2>
          <p className={styles.lead}>{t('areas.text')}</p>
        </div>

        <ul className={styles.list}>
          {areas.map((area) => (
            <li key={area.slug}>
              <Link
                to={`/hemstadning-${area.slug}`}
                className={styles.chip}
                title={t('areas.linkLabel', { area: area.name })}
              >
                {area.name}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};
