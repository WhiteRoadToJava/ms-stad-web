import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/adminApi';
import styles from './admin.module.css';

/** People who left a number. Unhandled first, because the list exists to empty. */
export const CallbacksPage = () => {
  const { t, i18n } = useTranslation('admin');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .get('/admin/callbacks')
      .then((payload) => setItems(payload.data))
      .finally(() => setLoading(false));
  }, []);

  const markHandled = async (callback) => {
    const payload = await adminApi.patch(`/admin/callbacks/${callback.id}`, {
      handled: true,
    });

    setItems((current) =>
      current.map((item) => (item.id === callback.id ? payload.data : item)),
    );
  };

  if (loading) return <p className={styles.muted}>{t('common.loading')}</p>;
  if (!items.length) return <p className={styles.muted}>{t('callbacks.empty')}</p>;

  return (
    <>
      <h1 className={styles.title}>{t('callbacks.title')}</h1>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('bookings.customer')}</th>
              <th>{t('callbacks.phone')}</th>
              <th>{t('callbacks.received')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((callback) => (
              <tr key={callback.id}>
                <td>{callback.name || '—'}</td>
                <td className={styles.mono}>
                  <a href={`tel:${callback.phone}`}>{callback.phone}</a>
                </td>
                <td className={styles.muted}>
                  {new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(new Date(callback.createdAt))}
                </td>
                <td>
                  {callback.handled ? (
                    <span className={styles.muted}>{t('callbacks.handled')}</span>
                  ) : (
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => markHandled(callback)}
                    >
                      {t('callbacks.markHandled')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
