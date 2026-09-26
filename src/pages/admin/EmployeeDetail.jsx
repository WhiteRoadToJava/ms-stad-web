import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/adminApi';
import styles from './admin.module.css';

/**
 * Editing one colleague.
 *
 * Same shape as the booking dialog: a name to click in the table, everything
 * about that record in one place, Escape to leave. Keeping the two dialogs
 * alike means there is one thing to learn in the dashboard, not two.
 */
export const EmployeeDetail = ({ employee, onClose, onUpdated }) => {
  const { t, i18n } = useTranslation('admin');
  const closeRef = useRef(null);

  const [form, setForm] = useState({
    name: employee.name,
    phone: employee.phone ?? '',
    email: employee.email ?? '',
    colour: employee.colour,
    notes: employee.notes ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const change = (field) => (event) => {
    setSaved(false);
    setForm({ ...form, [field]: event.target.value });
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError(t('employees.nameRequired'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Empty strings are sent as they are: the API reads them as "no value",
      // which is how a phone number gets removed rather than kept forever.
      const payload = await adminApi.patch(`/admin/employees/${employee.id}`, form);

      onUpdated?.(payload.data);
      setSaved(true);
    } catch {
      setError(t('employees.error'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    try {
      const payload = await adminApi.patch(`/admin/employees/${employee.id}`, {
        isActive: !employee.isActive,
      });

      onUpdated?.(payload.data);
    } catch {
      setError(t('employees.error'));
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t('employees.editTitle', { name: employee.name })}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <div>
            <h2 className={styles.modalTitle}>
              {t('employees.editTitle', { name: employee.name })}
            </h2>
            <p className={styles.muted}>
              {employee.isActive ? t('employees.active') : t('employees.inactive')} ·{' '}
              {t('employees.added')}{' '}
              {new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
                new Date(employee.createdAt),
              )}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t('employees.close')}
          >
            ×
          </button>
        </header>

        <div className={styles.modalBody}>
          <section>
            <div className={styles.filters}>
              <label className={styles.inlineField}>
                <span>{t('employees.name')}</span>
                <input className={styles.input} value={form.name} onChange={change('name')} />
              </label>

              <label className={styles.inlineField}>
                <span>{t('employees.phone')}</span>
                <input className={styles.input} value={form.phone} onChange={change('phone')} />
              </label>

              <label className={styles.inlineField}>
                <span>{t('employees.email')}</span>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  onChange={change('email')}
                />
              </label>

              <label className={styles.inlineField}>
                <span>{t('employees.colour')}</span>
                <input
                  className={styles.colourInput}
                  type="color"
                  value={form.colour}
                  onChange={change('colour')}
                />
              </label>
            </div>

            <label className={styles.inlineField} style={{ marginTop: 'var(--space-4)' }}>
              <span>{t('employees.notes')}</span>
              <textarea
                className={styles.textarea}
                rows="3"
                value={form.notes}
                onChange={change('notes')}
              />
            </label>

            <div className={styles.detailActions}>
              <button
                type="button"
                className={styles.button}
                onClick={save}
                disabled={saving}
              >
                {saving ? t('employees.saving') : t('employees.save')}
              </button>

              <button
                type="button"
                className={`${styles.button} ${styles.buttonGhost}`}
                onClick={toggleActive}
              >
                {employee.isActive
                  ? t('employees.deactivate')
                  : t('employees.reactivate')}
              </button>

              {saved ? <span className={styles.saved}>{t('employees.saved')}</span> : null}
              {error ? <span className={styles.error}>{error}</span> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
