import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi, toQuery } from '../../lib/adminApi';
import styles from './admin.module.css';

/** yyyy-mm-dd in local time: toISOString would shift the day during summer time. */
const toKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * The working calendar.
 *
 * The server keeps sixty days open by itself, so nothing here is required for
 * the site to keep taking bookings. This is for the decisions only the office
 * can make: closing a holiday week, opening a period early, and saying how
 * many cleanings actually fit in one slot.
 */
export const AvailabilityPage = () => {
  const { t, i18n } = useTranslation('admin');

  const [days, setDays] = useState(30);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [range, setRange] = useState({
    from: toKey(new Date()),
    to: toKey(addDays(14)),
    capacity: 1,
  });

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const payload = await adminApi.get(
        `/admin/availability${toQuery({ from: toKey(new Date()), to: toKey(addDays(days)) })}`,
      );
      setSlots(payload.data);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  /** One entry per date, so the table reads like a calendar rather than a log. */
  const byDate = useMemo(() => {
    const dates = new Map();

    for (const slot of slots) {
      const key = slot.date.slice(0, 10);
      if (!dates.has(key)) dates.set(key, []);
      dates.get(key).push(slot);
    }

    return [...dates.entries()];
  }, [slots]);

  const totals = useMemo(
    () => ({
      total: slots.length,
      free: slots.filter((slot) => !slot.isBlocked && slot.bookedCount < slot.capacity).length,
    }),
    [slots],
  );

  const run = async (action) => {
    setMessage(null);

    try {
      await action();
      await load();
    } catch {
      setMessage({ tone: 'error', text: t('availability.error') });
    }
  };

  const openRange = () =>
    run(async () => {
      const payload = await adminApi.post('/admin/availability', {
        from: range.from,
        to: range.to,
        capacity: Number(range.capacity),
      });

      setMessage({
        tone: 'ok',
        text: payload.data.created
          ? t('availability.opened', { count: payload.data.created })
          : t('availability.openedNone'),
      });
    });

  const changeRange = (body) =>
    run(async () => {
      const payload = await adminApi.patch('/admin/availability/range', {
        from: range.from,
        to: range.to,
        ...body,
      });

      const parts = [t('availability.updated', { count: payload.data.updated })];
      if (payload.data.skipped) {
        parts.push(t('availability.skipped', { count: payload.data.skipped }));
      }

      setMessage({ tone: 'ok', text: parts.join(' · ') });
    });

  const toggleSlot = (slot) =>
    run(() =>
      adminApi.patch(`/admin/availability/${slot.id}`, { isBlocked: !slot.isBlocked }),
    );

  const formatDay = (key) =>
    new Intl.DateTimeFormat(i18n.language, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${key}T00:00:00`));

  return (
    <>
      <h1 className={styles.title}>{t('availability.title')}</h1>
      <p className={styles.hint}>{t('availability.text')}</p>

      <section className={styles.card} style={{ marginTop: 'var(--space-5)' }}>
        <h2 className={styles.detailHeading}>{t('availability.rangeTitle')}</h2>

        <div className={styles.filters}>
          <label className={styles.inlineField}>
            <span>{t('availability.from')}</span>
            <input
              type="date"
              className={styles.input}
              value={range.from}
              onChange={(event) => setRange({ ...range, from: event.target.value })}
            />
          </label>

          <label className={styles.inlineField}>
            <span>{t('availability.to')}</span>
            <input
              type="date"
              className={styles.input}
              value={range.to}
              onChange={(event) => setRange({ ...range, to: event.target.value })}
            />
          </label>

          <label className={styles.inlineField}>
            <span>{t('availability.capacity')}</span>
            <input
              type="number"
              min="0"
              max="20"
              className={styles.input}
              value={range.capacity}
              onChange={(event) => setRange({ ...range, capacity: event.target.value })}
            />
          </label>
        </div>

        <div className={styles.detailActions}>
          <button type="button" className={styles.button} onClick={openRange}>
            {t('availability.open')}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost}`}
            onClick={() => changeRange({ capacity: Number(range.capacity) })}
          >
            {t('availability.setCapacity')}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost}`}
            onClick={() => changeRange({ isBlocked: true })}
          >
            {t('availability.block')}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost}`}
            onClick={() => changeRange({ isBlocked: false })}
          >
            {t('availability.unblock')}
          </button>
        </div>

        {message ? (
          <p className={message.tone === 'error' ? styles.error : styles.saved}>
            {message.text}
          </p>
        ) : null}
      </section>

      <div className={styles.filters} style={{ marginTop: 'var(--space-6)' }}>
        <h2 className={styles.detailHeading}>{t('availability.listTitle')}</h2>
        <select
          className={styles.select}
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
        >
          <option value={30}>{t('availability.days30')}</option>
          <option value={60}>{t('availability.days60')}</option>
          <option value={90}>{t('availability.days90')}</option>
        </select>
        <span className={styles.muted}>{t('availability.summary', totals)}</span>
      </div>

      {loading ? <p className={styles.muted}>{t('common.loading')}</p> : null}

      {!loading && byDate.length === 0 ? (
        <p className={styles.muted}>{t('availability.empty')}</p>
      ) : null}

      {byDate.length ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <tbody>
              {byDate.map(([date, daySlots]) => (
                <tr key={date}>
                  <th scope="row" className={styles.dayCell}>
                    {formatDay(date)}
                  </th>
                  <td>
                    <div className={styles.slotRow}>
                      {daySlots.map((slot) => {
                        const full = slot.bookedCount >= slot.capacity;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => toggleSlot(slot)}
                            // Clicking closes an open slot and reopens a closed
                            // one. Capacity changes go through the range form,
                            // where the effect on bookings is spelled out.
                            title={
                              slot.isBlocked
                                ? t('availability.openDay')
                                : t('availability.blockDay')
                            }
                            className={`${styles.slotChip} ${
                              slot.isBlocked
                                ? styles.slotBlocked
                                : full
                                  ? styles.slotFull
                                  : styles.slotFree
                            }`}
                          >
                            <span>
                              {slot.startTime}–{slot.endTime}
                            </span>
                            <small>
                              {slot.isBlocked
                                ? t('availability.blocked')
                                : `${slot.bookedCount}/${slot.capacity}`}
                            </small>
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
};
