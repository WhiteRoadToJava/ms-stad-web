import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Button';
import { Container } from './Container';
import { site } from '../../data/site';
import styles from './Header.module.css';

/**
 * Site header. The phone number stays reachable at every width, because on a
 * cleaning site calling is the second most common action after booking.
 */
export const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          <Logo size={34} />
        </Link>

        <nav
          className={[styles.nav, isMenuOpen ? styles.navOpen : ''].join(' ')}
          aria-label={t('nav.private')}
        >
          <NavLink to="/tjanster" className={styles.link} onClick={closeMenu}>
            {t('nav.private')}
          </NavLink>
          <NavLink to="/foretag" className={styles.link} onClick={closeMenu}>
            {t('nav.business')}
          </NavLink>
          <NavLink to="/priser" className={styles.link} onClick={closeMenu}>
            {t('nav.prices')}
          </NavLink>
          <NavLink to="/om-oss" className={styles.link} onClick={closeMenu}>
            {t('nav.about')}
          </NavLink>
          <NavLink to="/kontakt" className={styles.link} onClick={closeMenu}>
            {t('nav.contact')}
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <a className={styles.phone} href={`tel:${site.phone}`}>
            {site.phoneDisplay}
          </a>
          <Button to="/boka">{t('cta.book')}</Button>
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={isMenuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          </button>
        </div>
      </Container>
    </header>
  );
};
