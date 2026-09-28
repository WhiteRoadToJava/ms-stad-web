import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi, toQuery } from '../../lib/adminApi';
import { formatPrice } from '../../data/pricing';
import styles from './admin.module.css';

/** Statuses in the order they happen, which is also the order of the legend. */
export const STATUS_ORDER = ['NEW', 'CONFIRMED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

/** ISO date in local time; toISOString would shift the day in Sweden. */
const toKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

/**
 * Builds the grid for one month: whole weeks, Monday to Sunday, padded with the
 * neighbouring months' days so every row has seven cells and the shape of the
 * month is readable.
 */
const buildWeeks = (year, month) => {
  const first = new Date(year, month, 1);
  // getDay() is Sunday-first; Swedish calendars start on Monday.
  const start = new Date(year, month, 1 - ((first.getDay() + 6) % 7));

  const weeks = [];

  for (let week = 0; week < 6; week += 1) {
    const days = [];

    for (let day = 0; day < 7; day += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + day);
      days.push(date);
    }

    weeks.push(days);

    // Five weeks cover most months; a sixth row is only drawn when the month
    // actually reaches into it.
    const last = days[6];
    if (last.getMonth() !== month && last.getDate() >= 7) break;
  }

  return weeks;
};

/** Three visible per day keeps every cell the same height. */
const VISIBLE_PER_DAY = 3;

/**
 * The month at a glance.
 *
 * A table answers "what did this customer book"; a calendar answers "what does
 * October look like", which is the question asked while someone is on the
 * phone wanting a date. Status is carried by colour so a month can be read
 * without reading a single word.
 */
export const BookingsCalendar = ({ onSelect, refreshKey }) => {
  const { t, i18n } = useTranslation('admin');

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthStart = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    [cursor],
  );
  const monthEnd = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0),
    [cursor],
  );

  const load = useCallback(async () => {
    setLoading(true);

    try {
      // One request per month rather than per page: a month of a small
      // company's bookings is far below the hundred row ceiling.
      const payload = await adminApi.get(
        `/admin/bookings${toQuery({
          from: toKey(monthStart),
          to: toKey(monthEnd),
          perPage: 100,
        })}`,
      );

      setBookings(payload.data);
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  /** Bookings indexed by date, so a cell is a lookup rather than a scan. */
  const byDate = useMemo(() => {
    const days = new Map();

    for (const booking of bookings) {
      if (!booking.scheduledDate) continue;

      const key = booking.scheduledDate.slice(0, 10);
      if (!days.has(key)) days.set(key, []);
      days.get(key).push(booking);
    }

    return days;
  }, [bookings]);

  const weeks = buildWeeks(cursor.getFullYear(), cursor.getMonth());
  const todayKey = toKey(new Date());

  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' });
    // 2024-01-01 was a Monday, which gives the week in the order rendered.
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(2024, 0, 1 + index)),
    );
  }, [i18n.language]);

  const moveMonth = (offset) =>
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  return (
    <section>
      <header className={styles.calendarHead}>
        <div className={styles.calendarNav}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => moveMonth(-1)}
            aria-label={t('bookings.previousMonth')}
          >
            ‹
          </button>

          <h2 className={styles.monthTitle}>
            {new Intl.DateTimeFormat(i18n.language, {
              month: 'long',
              year: 'numeric',
            }).format(cursor)}
          </h2>

          <button
            type="button"
            className={styles.arrow}
            onClick={() => moveMonth(1)}
            aria-label={t('bookings.nextMonth')}
          >
            ›
          </button>

          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost}`}
            onClick={() => {
              const now = new Date();
              setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
          >
            {t('bookings.today')}
          </button>
        </div>

        <ul className={styles.legend} aria-label={t('bookings.legend')}>
          {STATUS_ORDER.map((status) => (
            <li key={status}>
              <span
                aria-hidden="true"
                className={`${styles.legendDot} ${styles[`status${status}`]}`}
              />
              {t(`status.${status}`)}
            </li>
          ))}
        </ul>
      </header>

      {loading ? <p className={styles.muted}>{t('common.loading')}</p> : null}

      {!loading && bookings.length === 0 ? (
        <p className={styles.muted}>{t('bookings.noBookingsMonth')}</p>
      ) : null}

      <div className={styles.weekdayRow} aria-hidden="true">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {weeks.flat().map((date) => {
          const key = toKey(date);
          const dayBookings = byDate.get(key) ?? [];
          const outside = date.getMonth() !== cursor.getMonth();

          return (
            <div
              key={key}
              className={`${styles.dayCell} ${outside ? styles.dayOutside : ''} ${
                key === todayKey ? styles.dayToday : ''
              }`}
            >
              <span className={styles.dayNumber}>{date.getDate()}</span>

              {dayBookings.slice(0, VISIBLE_PER_DAY).map((booking) => (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => onSelect(booking)}
                  className={`${styles.dayBooking} ${styles[`status${booking.status}`]}`}
                  title={`${booking.customer.name} · ${formatPrice(booking.totalPrice)}`}
                >
                  {booking.customer.name}
                </button>
              ))}

              {dayBookings.length > VISIBLE_PER_DAY ? (
                <button
                  type="button"
                  className={styles.dayMore}
                  onClick={() => onSelect(dayBookings[VISIBLE_PER_DAY])}
                >
                  {t('bookings.more', { count: dayBookings.length - VISIBLE_PER_DAY })}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};
