import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { site } from '../../data/site';
import styles from './AnnouncementBar.module.css';

const DISMISSED_KEY = 'ma-announcement-dismissed';

/**
 * The bar across the top of every page.
 *
 * Rendered into the static HTML rather than added by script, so it is there
 * before the JavaScript loads and does not push the page down a moment after
 * someone starts reading.
 *
 * Closing it is remembered per browser: the message is worth showing once, not
 * on every page of a visit.
 */
export const AnnouncementBar = () => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  // Read after mount, never during render: the generator has no localStorage,
  // and reading it while rendering would make the markup differ from the HTML
  // that was generated.
  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISSED_KEY) === 'true');
    } catch {
      // Private mode, or storage disabled. Showing the bar is the safe default.
    }
  }, []);

  if (!site.announcement.enabled || dismissed) return null;

  const close = () => {
    setDismissed(true);

    try {
      window.localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // Nothing to do: it simply appears again next time.
    }
  };

  return (
    <aside className={styles.bar}>
      <p className={styles.text}>
        {t('announcement.text', { month: site.announcement.month })}{' '}
        <Link to={site.announcement.ctaPath} className={styles.link}>
          {t('announcement.cta')}
        </Link>
      </p>

      <button
        type="button"
        className={styles.close}
        onClick={close}
        aria-label={t('announcement.dismiss')}
      >
        ×
      </button>
    </aside>
  );
};
