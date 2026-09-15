import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/adminApi';
import { formatPrice } from '../../data/pricing';
import styles from './admin.module.css';

/** Opening screen: what needs attention today, in six numbers. */
export const DashboardPage = () => {
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    adminApi
      .get('/admin/stats')
      .then((payload) => setStats(payload.data))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <p className={styles.error}>{t('common.error')}</p>;
  if (!stats) return <p className={styles.muted}>{t('common.loading')}</p>;

  const cards = [
    ['newBookings', stats.newBookings, true],
    ['todayBookings', stats.todayBookings],
    ['weekBookings', stats.weekBookings],
    ['openQuotes', stats.openQuotes],
    ['pendingCallbacks', stats.pendingCallbacks, true],
    ['monthBookings', stats.monthBookings],
  ];

  return (
    <>
      <h1 className={styles.title}>{t('dashboard.title')}</h1>

      <div className={styles.cards}>
        {cards.map(([key, value, alert]) => (
          <div
            key={key}
            // Anything unhandled is shown in red: these two lists exist to be
            // emptied, the rest are just counts.
            className={`${styles.card} ${alert && value > 0 ? styles.cardAlert : ''}`}
          >
            <p className={styles.cardLabel}>{t(`dashboard.${key}`)}</p>
            <p className={styles.cardValue}>{value}</p>
          </div>
        ))}

        <div className={styles.card}>
          <p className={styles.cardLabel}>{t('dashboard.monthRevenue')}</p>
          <p className={styles.cardValue}>{formatPrice(stats.monthRevenue)}</p>
        </div>
      </div>
    </>
  );
};
