import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/adminApi';
import styles from './admin.module.css';

const FIELDS = ['pricePerSqm', 'minPrice', 'hourlyRate', 'packagePrice'];

/**
 * The price list.
 *
 * Staff type kronor, the API stores ore. Existing bookings keep the price they
 * were made with, so editing here only affects what is booked from now on.
 */
export const ServicesPage = () => {
  const { t } = useTranslation('admin');
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savedId, setSavedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .get('/admin/services')
      .then((payload) => setItems(payload.data))
      .finally(() => setLoading(false));
  }, []);

  const draftFor = (service) =>
    drafts[service.id] ??
    Object.fromEntries(
      FIELDS.map((field) => [
        field,
        service[field] === null ? '' : String(Math.round(service[field] / 100)),
      ]),
    );

  const edit = (service, field, value) =>
    setDrafts((current) => ({
      ...current,
      [service.id]: { ...draftFor(service), [field]: value },
    }));

  const save = async (service) => {
    const draft = draftFor(service);

    const body = Object.fromEntries(
      FIELDS.filter((field) => service[field] !== null || draft[field] !== '').map(
        (field) => [field, draft[field] === '' ? null : Number(draft[field]) * 100],
      ),
    );

    const payload = await adminApi.patch(`/admin/services/${service.id}`, body);

    setItems((current) =>
      current.map((item) => (item.id === service.id ? { ...item, ...payload.data } : item)),
    );
    setSavedId(service.id);
  };

  if (loading) return <p className={styles.muted}>{t('common.loading')}</p>;

  return (
    <>
      <h1 className={styles.title}>{t('services.title')}</h1>
      <p className={styles.hint}>{t('services.text')}</p>
      <p className={styles.hint}>{t('services.inKronor')}</p>

      <div className={styles.tableWrap} style={{ marginTop: 'var(--space-5)' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('bookings.service')}</th>
              {FIELDS.map((field) => (
                <th key={field}>{t(`services.${field}`)}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((service) => {
              const draft = draftFor(service);

              return (
                <tr key={service.id}>
                  <td>{service.translations[0]?.name ?? service.slug}</td>

                  {FIELDS.map((field) => (
                    <td key={field}>
                      {/* A service that has no rate of this kind never gains one
                          here: the pricing model decides which apply. */}
                      {service[field] === null ? (
                        <span className={styles.muted}>—</span>
                      ) : (
                        <input
                          className={styles.input}
                          type="number"
                          min="0"
                          value={draft[field]}
                          onChange={(event) => edit(service, field, event.target.value)}
                        />
                      )}
                    </td>
                  ))}

                  <td>
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => save(service)}
                    >
                      {t('services.save')}
                    </button>
                    {savedId === service.id ? (
                      <div className={styles.saved}>{t('services.saved')}</div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
