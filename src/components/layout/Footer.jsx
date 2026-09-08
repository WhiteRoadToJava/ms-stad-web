import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../brand/Logo';
import { Container } from './Container';
import { site } from '../../data/site';
import { privateServices, businessServices } from '../../data/services';
import styles from './Footer.module.css';

export const Footer = () => {
  const { t } = useTranslation();
  const { t: tServices } = useTranslation('services');

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.brand}>
          <Logo size={32} />
          <p className={styles.tagline}>{t('footer.tagline')}</p>
        </div>

        <nav className={styles.column} aria-label={t('nav.private')}>
          <h2 className={styles.heading}>{t('nav.private')}</h2>
          {privateServices.map((service) => (
            <Link
              key={service.slug}
              to={`/tjanster/${service.slug}`}
              className={styles.link}
            >
              {tServices(`${service.i18nKey}.name`)}
            </Link>
          ))}
        </nav>

        <nav className={styles.column} aria-label={t('nav.business')}>
          <h2 className={styles.heading}>{t('nav.business')}</h2>
          {businessServices.map((service) => (
            <Link
              key={service.slug}
              to={`/tjanster/${service.slug}`}
              className={styles.link}
            >
              {tServices(`${service.i18nKey}.name`)}
            </Link>
          ))}
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>{t('footer.contact')}</h2>
          <a className={styles.link} href={`tel:${site.phone}`}>
            {site.phoneDisplay}
          </a>
          <a className={styles.link} href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <Link className={styles.link} to="/karriar">
            {t('nav.career')}
          </Link>
        </div>
      </Container>

      <Container className={styles.legal}>
        <span>
          © {new Date().getFullYear()} {site.legalName}. {t('footer.rights')}
        </span>
        <span>{site.regions.join(' · ')}</span>
      </Container>
    </footer>
  );
};
