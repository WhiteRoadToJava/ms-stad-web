import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import styles from './Calendar.module.css';

/** ISO date string in local time; toISOString() would shift the day in Sweden. */
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
 * Date and time picker.
 *
 * Availability is fetched once and indexed by date, so moving between months
 * costs nothing. If the request fails the customer can still continue without
 * a time and the office calls to agree one: a booking with a missing slot is
 * worth far more than a form that refuses to go on.
 */
export const Calendar = ({ value, onChange }) => {
  const { t, i18n } = useTranslation('booking');

  const [slotsByDate, setSlotsByDate] = useState(null);
  const [failed, setFailed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    let cancelled = false;

    api
      .get('/availability')
      .then((payload) => {
        if (cancelled) return;

        const index = new Map();
        for (const slot of payload.data ?? []) {
          if (!index.has(slot.date)) index.set(slot.date, []);
          index.get(slot.date).push(slot);
        }

        setSlotsByDate(index);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cells = buildMonth(cursor.getFullYear(), cursor.getMonth());
  const daySlots = selectedDate ? (slotsByDate?.get(selectedDate) ?? []) : [];

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

  const moveMonth = (offset) => {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const pickDate = (date) => {
    const key = toKey(date);
    setSelectedDate(key === selectedDate ? null : key);
    onChange(null);
  };

  if (failed) return <p className={styles.status}>{t('slot.empty')}</p>;
  if (!slotsByDate) return <p className={styles.status}>{t('slot.loading')}</p>;

  return (
    <div className={styles.calendar}>
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
          const hasTimes = (slotsByDate.get(key)?.length ?? 0) > 0;

          return (
            <button
              key={key}
              type="button"
              disabled={!hasTimes}
              onClick={() => pickDate(date)}
              className={`${styles.day} ${selectedDate === key ? styles.dayActive : ''}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {selectedDate ? (
        <div className={styles.times}>
          <p className={styles.timesTitle}>
            {t('calendar.availableTimes', {
              date: new Intl.DateTimeFormat(i18n.language, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(new Date(`${selectedDate}T00:00:00`)),
            })}
          </p>

          {daySlots.length ? (
            <div className={styles.timeGrid}>
              {daySlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onChange(value === slot.id ? null : slot.id)}
                  className={`${styles.time} ${value === slot.id ? styles.timeActive : ''}`}
                >
                  <span>
                    {slot.startTime}–{slot.endTime}
                  </span>
                  <small>{t('slot.placesLeft', { count: slot.placesLeft })}</small>
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.status}>{t('calendar.noTimes')}</p>
          )}
        </div>
      ) : null}

      <label className={styles.skip}>
        <input
          type="checkbox"
          checked={value === null}
          onChange={() => {
            onChange(null);
            setSelectedDate(null);
          }}
        />
        {t('slot.skip')}
      </label>
    </div>
  );
};
