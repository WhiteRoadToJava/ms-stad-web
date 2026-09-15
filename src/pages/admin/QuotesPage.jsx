import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/adminApi';
import { formatPrice } from '../../data/pricing';
import styles from './admin.module.css';

const STATUSES = ['NEW', 'CONTACTED', 'SENT', 'WON', 'LOST'];

/** Quote requests, with the figure staff send back. */
export const QuotesPage = () => {
  const { t } = useTranslation('admin');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .get('/admin/quotes')
      .then((payload) => setItems(payload.data))
      .finally(() => setLoading(false));
  }, []);

  const update = async (quote, body) => {
    const payload = await adminApi.patch(`/admin/quotes/${quote.id}`, body);
    setItems((current) =>
      current.map((item) => (item.id === quote.id ? payload.data : item)),
    );
  };

  if (loading) return <p className={styles.muted}>{t('common.loading')}</p>;
  if (!items.length) return <p className={styles.muted}>{t('quotes.empty')}</p>;

  return (
    <>
      <h1 className={styles.title}>{t('quotes.title')}</h1>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('bookings.reference')}</th>
              <th>{t('bookings.customer')}</th>
              <th>{t('bookings.service')}</th>
              <th>{t('quotes.amount')}</th>
              <th>{t('bookings.status')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((quote) => (
              <tr key={quote.id}>
                <td className={styles.mono}>{quote.reference}</td>
                <td>
                  {quote.customer.name}
                  <br />
                  <span className={styles.muted}>{quote.customer.phone}</span>
                </td>
                <td>
                  {quote.service?.translations?.[0]?.name ?? '—'}
                  {quote.description ? (
                    <>
                      <br />
                      <span className={styles.muted}>
                        {quote.description.slice(0, 80)}
                        {quote.description.length > 80 ? '…' : ''}
                      </span>
                    </>
                  ) : null}
                </td>
                <td>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    // Staff work in kronor; the API stores ore and converts.
                    defaultValue={
                      quote.quotedAmount === null ? '' : Math.round(quote.quotedAmount / 100)
                    }
                    onBlur={(event) => {
                      const value = event.target.value;
                      update(quote, { quotedAmount: value === '' ? null : Number(value) });
                    }}
                  />
                  {quote.quotedAmount ? (
                    <div className={styles.muted}>{formatPrice(quote.quotedAmount)}</div>
                  ) : null}
                </td>
                <td>
                  <select
                    className={styles.select}
                    value={quote.status}
                    onChange={(event) => update(quote, { status: event.target.value })}
                  >
                    {STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {t(`status.${value}`)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
