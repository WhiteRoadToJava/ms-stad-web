import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi, toQuery } from '../../lib/adminApi';
import { BookingDetail } from './BookingDetail';
import { NewBookingDialog } from './NewBookingDialog';
import { BookingsCalendar } from './BookingsCalendar';
import { useAuth } from '../../features/admin/AuthContext';
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
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const [view, setView] = useState('calendar');
  // Bumped after a change so the calendar refetches the month it is showing.
  const [refreshKey, setRefreshKey] = useState(0);

  const { admin } = useAuth();
  const canDelete = admin?.role === 'ADMIN';

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
    setRefreshKey((current) => current + 1);
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelected(updated);
  };

  /**
   * One group per month, undated bookings first.
   *
   * A flat list of dates reads as a log, while the office thinks in months and
   * asks how October looks. Grouping happens within the page: paging stays the
   * server's business, so a heading describes what is on screen rather than
   * promising the whole month.
   */
  const groups = useMemo(() => {
    const months = new Map();

    for (const booking of items) {
      const key = booking.scheduledDate ? booking.scheduledDate.slice(0, 7) : 'none';
      if (!months.has(key)) months.set(key, []);
      months.get(key).push(booking);
    }

    return [...months.entries()].sort(([a], [b]) => {
      if (a === 'none') return -1;
      if (b === 'none') return 1;
      return a.localeCompare(b);
    });
  }, [items]);

  const monthLabel = (key) =>
    key === 'none'
      ? t('bookings.noDateGroup')
      : new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(
          new Date(`${key}-01T00:00:00`),
        );

  const remove = async (booking) => {
    setDeleteError(null);

    try {
      await adminApi.delete(`/admin/bookings/${booking.id}`);
      setItems((current) => current.filter((item) => item.id !== booking.id));
      setConfirmDelete(null);
    } catch (error) {
      setDeleteError(
        error?.status === 409 ? t('bookings.deleteCompleted') : t('bookings.deleteFailed'),
      );
    }
  };

  const pages = Math.max(1, Math.ceil(meta.total / meta.perPage));

  return (
    <>
      <h1 className={styles.title}>{t('bookings.title')}</h1>

      <div className={styles.filters}>
        <div className={styles.viewSwitch}>
          {['calendar', 'list'].map((value) => (
            <button
              key={value}
              type="button"
              className={`${styles.viewButton} ${view === value ? styles.viewActive : ''}`}
              onClick={() => setView(value)}
            >
              {value === 'calendar' ? t('bookings.viewCalendar') : t('bookings.viewList')}
            </button>
          ))}
        </div>

        <button type="button" className={styles.button} onClick={() => setCreating(true)}>
          {t('newBooking.open')}
        </button>

        {/* Searching and filtering belong to the list: the calendar answers a
            question about a month, not about one customer. */}
        {view === 'list' ? (
          <>
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
          </>
        ) : null}
      </div>

      {view === 'calendar' ? (
        <BookingsCalendar onSelect={setSelected} refreshKey={refreshKey} />
      ) : null}

      {view === 'list' && loading ? (
        <p className={styles.muted}>{t('common.loading')}</p>
      ) : null}

      {view === 'list' && !loading && items.length === 0 ? (
        <p className={styles.muted}>{t('bookings.empty')}</p>
      ) : null}

      {view === 'list' &&
        groups.map(([key, monthItems]) => (
          <section key={key} className={styles.monthGroup}>
            <header className={styles.monthHead}>
              <h2 className={styles.monthTitle}>{monthLabel(key)}</h2>
              <span className={styles.muted}>
                {t('bookings.monthCount', { count: monthItems.length })}
              </span>
            </header>

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
                    {canDelete ? <th /> : null}
                  </tr>
                </thead>
                <tbody>
              {monthItems.map((booking) => (
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

                  {canDelete ? (
                    <td>
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonGhost}`}
                        onClick={() => setConfirmDelete(booking)}
                      >
                        {t('bookings.delete')}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

      {confirmDelete ? (
        <div
          className={styles.backdrop}
          onClick={() => setConfirmDelete(null)}
          role="presentation"
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            style={{ width: 'min(28rem, 100%)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalBody}>
              <h2 className={styles.modalTitle}>
                {t('bookings.deleteTitle', { reference: confirmDelete.reference })}
              </h2>
              <p className={styles.muted}>{t('bookings.deleteText')}</p>

              <div className={styles.detailActions}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => remove(confirmDelete)}
                >
                  {t('bookings.deleteConfirm')}
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonGhost}`}
                  onClick={() => setConfirmDelete(null)}
                >
                  {t('bookings.deleteCancel')}
                </button>
              </div>

              {deleteError ? <p className={styles.error}>{deleteError}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {creating ? (
        <NewBookingDialog
          onClose={() => setCreating(false)}
          onCreated={(booking) => {
            // Straight to the top of the list, where the newest belong.
            setItems((current) => [booking, ...current]);
            setSelected(booking);
          }}
        />
      ) : null}

      {selected ? (
        <BookingDetail
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdated={applyUpdate}
        />
      ) : null}

      {view === 'list' ? (
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
      ) : null}
    </>
  );
};
