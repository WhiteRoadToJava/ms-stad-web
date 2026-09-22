import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '../layout/Container';
import { areas } from '../../data/areas';
import { citiesWithPage } from '../../data/localPages';
import styles from './Areas.module.css';

/**
 * Links to the local landing pages.
 *
 * This block is how a local cleaning company gets found: someone searching for
 * "hemstädning Borås" lands on a page written for Borås, not on a generic one.
 *
 * Only cities with a page are links. The rest are still listed, because we do
 * work there, but a link to a page that does not exist is a 404 for visitors
 * and a dead end for crawlers.
 */
export const Areas = () => {
  const { t } = useTranslation('home');
  const withPage = citiesWithPage('hemstadning');

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
              {withPage.has(area.slug) ? (
                <Link
                  to={`/hemstadning-${area.slug}`}
                  className={styles.chip}
                  title={t('areas.linkLabel', { area: area.name })}
                >
                  {area.name}
                </Link>
              ) : (
                <span className={styles.chipPlain}>{area.name}</span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};
