import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import styles from './SlotPicker.module.css';

/** Groups the flat slot list from the API into one entry per date. */
const groupByDate = (slots) => {
  const days = new Map();

  for (const slot of slots) {
    if (!days.has(slot.date)) days.set(slot.date, []);
    days.get(slot.date).push(slot);
  }

  return [...days.entries()].map(([date, times]) => ({ date, times }));
};

/**
 * Date and time picker backed by real availability.
 *
 * If the API cannot be reached the form stays usable: the customer books
 * without a slot and the office calls to agree a time. A booking taken with a
 * missing time is worth far more than a form that refuses to submit.
 */
export const SlotPicker = ({ value, onChange }) => {
  const { t, i18n } = useTranslation('booking');
  const [days, setDays] = useState([]);
  const [status, setStatus] = useState('loading');
  const [openDate, setOpenDate] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/availability')
      .then((payload) => {
        if (cancelled) return;
        const grouped = groupByDate(payload.data ?? []).slice(0, 21);
        setDays(grouped);
        setOpenDate(grouped[0]?.date ?? null);
        setStatus(grouped.length ? 'ready' : 'empty');
      })
      .catch(() => {
        if (!cancelled) setStatus('empty');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDay = (isoDate) =>
    new Intl.DateTimeFormat(i18n.language, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(isoDate));

  if (status === 'loading') return <p className={styles.status}>{t('slot.loading')}</p>;

  if (status === 'empty') {
    return <p className={styles.status}>{t('slot.empty')}</p>;
  }

  return (
    <div className={styles.picker}>
      <div className={styles.days} role="tablist">
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            role="tab"
            aria-selected={openDate === day.date}
            className={`${styles.day} ${openDate === day.date ? styles.dayActive : ''}`}
            onClick={() => setOpenDate(day.date)}
          >
            {formatDay(day.date)}
          </button>
        ))}
      </div>

      <div className={styles.times}>
        {days
          .find((day) => day.date === openDate)
          ?.times.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className={`${styles.time} ${value === slot.id ? styles.timeActive : ''}`}
              onClick={() => onChange(value === slot.id ? null : slot.id)}
            >
              <span>
                {slot.startTime}–{slot.endTime}
              </span>
              <small>{t('slot.placesLeft', { count: slot.placesLeft })}</small>
            </button>
          ))}
      </div>

      <label className={styles.skip}>
        <input
          type="checkbox"
          checked={value === null}
          onChange={() => onChange(null)}
        />
        {t('slot.skip')}
      </label>
    </div>
  );
};
