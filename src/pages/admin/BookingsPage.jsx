import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi, toQuery } from '../../lib/adminApi';
import { BookingDetail } from './BookingDetail';
import { formatPrice } from '../../data/pricing';
import styles from './admin.module.css';

const STATUSES = ['NEW', 'CONFIRMED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

/** The working list: filter, find a customer, move a booking along. */
export const BookingsPage = () => {
  const { t, i18n } = useTranslation('admin');

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 25 });
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const payload = await adminApi.get(
        `/admin/bookings${toQuery({ status, search, page })}`,
      );
      setItems(payload.data);
      setMeta(payload.meta);
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  // Typing in the search box hits the API on every keystroke otherwise, which
  // is a query per letter for a list staff scroll anyway.
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const updateStatus = async (booking, nextStatus) => {
    const payload = await adminApi.patch(`/admin/bookings/${booking.id}`, {
      status: nextStatus,
    });

    setItems((current) =>
      current.map((item) => (item.id === booking.id ? payload.data : item)),
    );
  };

  /** Keeps the open dialog and the row behind it showing the same booking. */
  const applyUpdate = (updated) => {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelected(updated);
  };

  const pages = Math.max(1, Math.ceil(meta.total / meta.perPage));

  return (
    <>
      <h1 className={styles.title}>{t('bookings.title')}</h1>

      <div className={styles.filters}>
        <input
          className={styles.input}
          placeholder={t('bookings.search')}
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />

        <select
          className={styles.select}
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
        >
          <option value="">{t('bookings.allStatuses')}</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {t(`status.${value}`)}
            </option>
          ))}
        </select>
      </div>

      {loading ? <p className={styles.muted}>{t('common.loading')}</p> : null}

      {!loading && items.length === 0 ? (
        <p className={styles.muted}>{t('bookings.empty')}</p>
      ) : null}

      {items.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('bookings.reference')}</th>
                <th>{t('bookings.customer')}</th>
                <th>{t('bookings.service')}</th>
                <th>{t('bookings.date')}</th>
                <th>{t('bookings.assigned')}</th>
                <th>{t('bookings.price')}</th>
                <th>{t('bookings.status')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((booking) => (
                <tr key={booking.id}>
                  <td className={styles.mono}>
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => setSelected(booking)}
                      title={t('detail.open')}
                    >
                      {booking.reference}
                    </button>
                  </td>
                  <td>
                    {booking.customer.name}
                    <br />
                    <span className={styles.muted}>{booking.customer.phone}</span>
                    {booking.customer.city ? (
                      <>
                        <br />
                        <span className={styles.muted}>{booking.customer.city}</span>
                      </>
                    ) : null}
                  </td>
                  <td>
                    {booking.service.translations[0]?.name ?? booking.service.slug}
                    {booking.squareMeters ? (
                      <span className={styles.muted}> · {booking.squareMeters} m²</span>
                    ) : null}
                  </td>
                  <td>
                    {booking.scheduledDate ? (
                      <>
                        {new Intl.DateTimeFormat(i18n.language, {
                          dateStyle: 'medium',
                        }).format(new Date(booking.scheduledDate))}
                        {booking.timeSlot ? (
                          <>
                            <br />
                            <span className={styles.muted}>
                              {booking.timeSlot.startTime}–{booking.timeSlot.endTime}
                            </span>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <span className={styles.muted}>{t('bookings.noDate')}</span>
                    )}
                  </td>
                  <td>
                    {booking.assignments?.length ? (
                      booking.assignments.map((item) => (
                        <span key={item.id} className={styles.assignee}>
                          <span
                            className={styles.colourDot}
                            style={{ backgroundColor: item.employee.colour }}
                            aria-hidden="true"
                          />
                          {item.employee.name}
                        </span>
                      ))
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td className={styles.amount}>{formatPrice(booking.totalPrice)}</td>
                  <td>
                    <select
                      className={styles.select}
                      value={booking.status}
                      onChange={(event) => updateStatus(booking, event.target.value)}
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
      ) : null}

      {selected ? (
        <BookingDetail
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdated={applyUpdate}
        />
      ) : null}

      <div className={styles.pager}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonGhost}`}
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          {t('common.previous')}
        </button>
        <span className={styles.muted}>{t('common.page', { page, pages })}</span>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonGhost}`}
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          {t('common.next')}
        </button>
      </div>
    </>
  );
};
