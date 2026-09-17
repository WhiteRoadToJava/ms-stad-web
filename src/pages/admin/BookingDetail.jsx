import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/adminApi';
import { formatPrice } from '../../data/pricing';
import styles from './admin.module.css';

/**
 * Everything about one booking.
 *
 * The table can only show what fits in a row, so the address, the email, the
 * extras and the customer's note had nowhere to live. Those are exactly what
 * staff need when a customer rings, so they belong one click away rather than
 * in the database.
 */
export const BookingDetail = ({ booking, onClose, onUpdated }) => {
  const { t, i18n } = useTranslation('admin');
  const closeRef = useRef(null);

  const [notes, setNotes] = useState(booking.internalNotes ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Escape closes, and focus starts on the close button so the dialog is
  // usable without a mouse.
  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const saveNotes = async () => {
    setSaving(true);

    try {
      const payload = await adminApi.patch(`/admin/bookings/${booking.id}`, {
        internalNotes: notes || null,
      });

      onUpdated?.(payload.data);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const { customer, service, timeSlot } = booking;

  const address = [customer.street, [customer.postalCode, customer.city].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');

  const formatDate = (value, withTime = false) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      ...(withTime ? { timeStyle: 'short' } : {}),
    }).format(new Date(value));

  const rows = (entries) => (
    <dl className={styles.detailList}>
      {entries
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
    </dl>
  );

  return (
    // The backdrop closes on click, but clicks inside must not bubble out to it.
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t('detail.title', { reference: booking.reference })}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <div>
            <h2 className={styles.modalTitle}>
              {t('detail.title', { reference: booking.reference })}
            </h2>
            <p className={styles.muted}>
              {t(`status.${booking.status}`)} · {t('detail.created')}{' '}
              {formatDate(booking.createdAt, true)}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t('detail.close')}
          >
            ×
          </button>
        </header>

        <div className={styles.modalBody}>
          <section>
            <h3 className={styles.detailHeading}>{t('detail.customer')}</h3>
            {rows([
              [t('detail.name'), customer.name],
              [
                t('detail.phone'),
                <a key="phone" href={`tel:${customer.phone}`}>
                  {customer.phone}
                </a>,
              ],
              [
                t('detail.email'),
                <a key="email" href={`mailto:${customer.email}`}>
                  {customer.email}
                </a>,
              ],
              [t('detail.address'), address || t('detail.noAddress')],
            ])}
          </section>

          <section>
            <h3 className={styles.detailHeading}>{t('detail.job')}</h3>
            {rows([
              [t('detail.service'), service.translations[0]?.name ?? service.slug],
              [t('detail.area'), booking.squareMeters ? `${booking.squareMeters} m²` : null],
              [t('detail.rooms'), booking.rooms],
              [t('detail.frequency'), t(`frequency.${booking.frequency}`)],
              [
                t('detail.time'),
                booking.scheduledDate
                  ? `${formatDate(booking.scheduledDate)}${
                      timeSlot ? `, ${timeSlot.startTime}–${timeSlot.endTime}` : ''
                    }`
                  : t('bookings.noDate'),
              ],
              [
                t('detail.extras'),
                booking.extras?.length
                  ? booking.extras
                      .map((extra) => `${extra.label} (${formatPrice(extra.price)})`)
                      .join(', ')
                  : t('detail.noExtras'),
              ],
              [t('detail.message'), booking.message || t('detail.noMessage')],
            ])}
          </section>

          <section>
            <h3 className={styles.detailHeading}>{t('detail.price')}</h3>
            {rows([
              [t('detail.basePrice'), formatPrice(booking.basePrice)],
              [
                t('detail.extrasPrice'),
                booking.extrasPrice ? formatPrice(booking.extrasPrice) : null,
              ],
              [t('detail.grossPrice'), formatPrice(booking.grossPrice)],
              [
                t('detail.rutDeduction'),
                booking.rutDeduction ? `−${formatPrice(booking.rutDeduction)}` : null,
              ],
              [
                t('detail.totalPrice'),
                <strong key="total">{formatPrice(booking.totalPrice)}</strong>,
              ],
            ])}
          </section>

          <section>
            <h3 className={styles.detailHeading}>{t('detail.notes')}</h3>
            <textarea
              className={styles.textarea}
              rows="3"
              value={notes}
              onChange={(event) => {
                setSaved(false);
                setNotes(event.target.value);
              }}
            />
            <p className={styles.muted}>{t('detail.notesHelp')}</p>

            <div className={styles.detailActions}>
              <button
                type="button"
                className={styles.button}
                onClick={saveNotes}
                disabled={saving}
              >
                {t('detail.save')}
              </button>
              {saved ? <span className={styles.saved}>{t('detail.saved')}</span> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
