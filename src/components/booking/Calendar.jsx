import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import styles from './Calendar.module.css';

/** ISO date in local time; toISOString would shift the day in Sweden. */
const toKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

/**
 * Builds the grid for one month, padded so the first row starts on Monday and
 * every row holds seven cells. Empty leading cells are null.
 */
const buildMonth = (year, month) => {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // getDay() is Sunday-first; Swedish calendars start on Monday.
  const leading = (first.getDay() + 6) % 7;

  const cells = Array.from({ length: leading }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  return cells;
};

/**
 * Date picker.
 *
 * The customer chooses a day, not an hour. The hour is agreed when the office
 * calls to confirm, and offering fixed windows on the website promised
 * something nobody had committed to.
 *
 * Availability is fetched once and indexed by date, so moving between months
 * costs nothing. If the request fails the customer can still continue without
 * a date: a booking with no date is worth far more than a form that stops.
 */
export const Calendar = ({ value, onChange }) => {
  const { t, i18n } = useTranslation('booking');

  const [availableDays, setAvailableDays] = useState(null);
  const [failed, setFailed] = useState(false);

  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  useEffect(() => {
    let cancelled = false;

    api
      .get('/availability')
      .then((payload) => {
        if (cancelled) return;

        const index = new Map();
        for (const day of payload.data ?? []) index.set(day.date, day.placesLeft);

        setAvailableDays(index);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cells = buildMonth(cursor.getFullYear(), cursor.getMonth());

  const monthLabel = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    year: 'numeric',
  }).format(cursor);

  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' });
    // 2024-01-01 was a Monday, which gives the week in the order we render it.
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(2024, 0, 1 + index)),
    );
  }, [i18n.language]);

  const moveMonth = (offset) =>
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  if (failed) return <p className={styles.status}>{t('slot.empty')}</p>;
  if (!availableDays) return <p className={styles.status}>{t('slot.loading')}</p>;

  return (
    <div className={styles.calendar}>
      <p className={styles.help}>{t('calendar.help')}</p>

      <div className={styles.header}>
        <p className={styles.month}>{monthLabel}</p>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => moveMonth(-1)}
            aria-label={t('calendar.previous')}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => moveMonth(1)}
            aria-label={t('calendar.next')}
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((date, index) => {
          if (!date) return <span key={`pad-${index}`} />;

          const key = toKey(date);
          const placesLeft = availableDays.get(key) ?? 0;

          return (
            <button
              key={key}
              type="button"
              disabled={placesLeft === 0}
              onClick={() => onChange(value === key ? null : key)}
              title={placesLeft === 0 ? t('calendar.unavailable') : undefined}
              className={`${styles.day} ${value === key ? styles.dayActive : ''}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {value ? (
        <p className={styles.chosen}>
          {t('calendar.chosen', {
            date: new Intl.DateTimeFormat(i18n.language, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(new Date(`${value}T00:00:00`)),
          })}
        </p>
      ) : null}

      <label className={styles.skip}>
        <input type="checkbox" checked={value === null} onChange={() => onChange(null)} />
        {t('slot.skip')}
      </label>
    </div>
  );
};
