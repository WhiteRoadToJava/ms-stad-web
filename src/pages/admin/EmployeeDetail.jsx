import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi, toQuery } from '../../lib/adminApi';
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

  const [jobs, setJobs] = useState([]);
  const [jobMeta, setJobMeta] = useState(null);
  const [jobPage, setJobPage] = useState(1);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [extra, setExtra] = useState([]);
  const [extraMonths, setExtraMonths] = useState([]);
  const [extraForm, setExtraForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: '',
    endTime: '',
    reason: 'REDO',
    bookingId: '',
    description: '',
  });
  const [savingExtra, setSavingExtra] = useState(false);
  const [extraError, setExtraError] = useState(null);

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

  // Loaded per page and appended, so opening the dialog is one small request
  // even for someone with hundreds of jobs behind them.
  useEffect(() => {
    let cancelled = false;
    setLoadingJobs(true);

    adminApi
      .get(`/admin/employees/${employee.id}/bookings${toQuery({ page: jobPage, perPage: 10 })}`)
      .then((payload) => {
        if (cancelled) return;
        setJobs((current) => (jobPage === 1 ? payload.data : [...current, ...payload.data]));
        setJobMeta(payload.meta);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingJobs(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employee.id, jobPage]);

  const loadExtra = useCallback(async () => {
    const payload = await adminApi.get(`/admin/employees/${employee.id}/extra-work`);
    setExtra(payload.data);
    setExtraMonths(payload.meta.months);
  }, [employee.id]);

  useEffect(() => {
    loadExtra().catch(() => setExtra([]));
  }, [loadExtra]);

  /** "1 tim 30 min" reads better than 90 anywhere a person looks at it. */
  const formatMinutes = (minutes) =>
    minutes >= 60
      ? t('employees.extraHours', {
          hours: Math.floor(minutes / 60),
          minutes: minutes % 60,
        })
      : t('employees.extraMinutes', { minutes });

  const saveExtra = async (event) => {
    event.preventDefault();
    setSavingExtra(true);
    setExtraError(null);

    try {
      await adminApi.post(`/admin/employees/${employee.id}/extra-work`, {
        ...extraForm,
        employeeId: employee.id,
        bookingId: extraForm.bookingId ? Number(extraForm.bookingId) : undefined,
        description: extraForm.description || undefined,
      });

      await loadExtra();
      setExtraForm({ ...extraForm, startTime: '', endTime: '', description: '' });
    } catch {
      setExtraError(t('employees.extraError'));
    } finally {
      setSavingExtra(false);
    }
  };

  const removeExtra = async (entry) => {
    await adminApi.delete(`/admin/employees/${employee.id}/extra-work/${entry.id}`);
    await loadExtra();
  };

  const changeExtra = (field) => (event) =>
    setExtraForm({ ...extraForm, [field]: event.target.value });

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

          <section>
            <h3 className={styles.detailHeading}>{t('employees.extraTitle')}</h3>
            <p className={styles.muted}>{t('employees.extraHint')}</p>

            {extraMonths.length ? (
              <ul className={styles.monthList}>
                {extraMonths.map((month) => (
                  <li key={month.month}>
                    <strong className={styles.monthName}>
                      {new Intl.DateTimeFormat(i18n.language, {
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(`${month.month}-01T00:00:00`))}
                    </strong>
                    <span className={styles.muted}>
                      {t('employees.extraMonthTotal', {
                        count: month.entries,
                        time: formatMinutes(month.minutes),
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <form className={styles.filters} onSubmit={saveExtra}>
              <label className={styles.inlineField}>
                <span>{t('employees.extraDate')}</span>
                <input
                  className={styles.input}
                  type="date"
                  required
                  value={extraForm.date}
                  onChange={changeExtra('date')}
                />
              </label>

              <label className={styles.inlineField}>
                <span>{t('employees.extraStart')}</span>
                <input
                  className={styles.input}
                  type="time"
                  required
                  value={extraForm.startTime}
                  onChange={changeExtra('startTime')}
                />
              </label>

              <label className={styles.inlineField}>
                <span>{t('employees.extraEnd')}</span>
                <input
                  className={styles.input}
                  type="time"
                  required
                  value={extraForm.endTime}
                  onChange={changeExtra('endTime')}
                />
              </label>

              <label className={styles.inlineField}>
                <span>{t('employees.extraReason')}</span>
                <select
                  className={styles.select}
                  value={extraForm.reason}
                  onChange={changeExtra('reason')}
                >
                  {['REDO', 'SUPERVISOR', 'EXTRA'].map((value) => (
                    <option key={value} value={value}>
                      {t(`employees.reason.${value}`)}
                    </option>
                  ))}
                </select>
              </label>

              {/* The jobs already loaded above, so the booking can be picked
                  rather than typed. */}
              <label className={styles.inlineField}>
                <span>{t('employees.extraBooking')}</span>
                <select
                  className={styles.select}
                  value={extraForm.bookingId}
                  onChange={changeExtra('bookingId')}
                >
                  <option value="">{t('employees.extraBookingNone')}</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.reference} · {job.customer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.inlineField} style={{ gridColumn: '1 / -1' }}>
                <span>{t('employees.extraDescription')}</span>
                <input
                  className={styles.input}
                  value={extraForm.description}
                  onChange={changeExtra('description')}
                />
              </label>

              <div className={styles.detailActions} style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className={styles.button} disabled={savingExtra}>
                  {savingExtra ? t('employees.extraSaving') : t('employees.addExtra')}
                </button>
                {extraError ? <span className={styles.error}>{extraError}</span> : null}
              </div>
            </form>

            {extra.length === 0 ? (
              <p className={styles.muted}>{t('employees.extraEmpty')}</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <tbody>
                    {extra.map((entry) => (
                      <tr key={entry.id}>
                        <td className={styles.mono}>
                          {entry.date.slice(0, 10)}
                          <br />
                          <span className={styles.muted}>
                            {entry.startTime}–{entry.endTime}
                          </span>
                        </td>
                        <td>
                          {t(`employees.reason.${entry.reason}`)}
                          {entry.booking ? (
                            <>
                              <br />
                              <span className={styles.muted}>{entry.booking.reference}</span>
                            </>
                          ) : null}
                        </td>
                        <td>{entry.description || '—'}</td>
                        <td className={styles.amount}>{formatMinutes(entry.minutes)}</td>
                        <td>
                          <button
                            type="button"
                            className={`${styles.button} ${styles.buttonGhost}`}
                            onClick={() => removeExtra(entry)}
                          >
                            {t('employees.extraDelete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h3 className={styles.detailHeading}>{t('employees.jobsTitle')}</h3>

            {jobMeta ? (
              <div className={styles.cards} style={{ marginBottom: 'var(--space-4)' }}>
                <div className={styles.card}>
                  <p className={styles.cardLabel}>{t('employees.upcoming')}</p>
                  <p className={styles.cardValue}>{jobMeta.upcoming}</p>
                </div>
                <div className={styles.card}>
                  <p className={styles.cardLabel}>{t('employees.thisMonth')}</p>
                  <p className={styles.cardValue}>{jobMeta.thisMonth}</p>
                </div>
                <div className={styles.card}>
                  <p className={styles.cardLabel}>{t('employees.total')}</p>
                  <p className={styles.cardValue}>{jobMeta.total}</p>
                </div>
              </div>
            ) : null}

            {jobMeta?.months?.length ? (
              <ul className={styles.monthList}>
                {jobMeta.months.map((month) => (
                  <li key={month.month}>
                    <strong className={styles.monthName}>
                      {new Intl.DateTimeFormat(i18n.language, {
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(`${month.month}-01T00:00:00`))}
                    </strong>
                    <span className={styles.muted}>
                      {t('employees.jobsInMonth', { count: month.jobs })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {loadingJobs && jobs.length === 0 ? (
              <p className={styles.muted}>{t('employees.loadingJobs')}</p>
            ) : null}

            {!loadingJobs && jobs.length === 0 ? (
              <p className={styles.muted}>{t('employees.noJobs')}</p>
            ) : null}

            {jobs.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t('employees.jobDate')}</th>
                      <th>{t('employees.jobCustomer')}</th>
                      <th>{t('employees.jobService')}</th>
                      <th>{t('employees.jobStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td className={styles.mono}>
                          {job.scheduledDate ? (
                            new Intl.DateTimeFormat(i18n.language, {
                              dateStyle: 'medium',
                            }).format(new Date(job.scheduledDate))
                          ) : (
                            <span className={styles.muted}>{t('employees.noDate')}</span>
                          )}
                        </td>
                        <td>
                          {job.customer.name}
                          {job.customer.city ? (
                            <>
                              <br />
                              <span className={styles.muted}>{job.customer.city}</span>
                            </>
                          ) : null}
                        </td>
                        <td>{job.service.translations[0]?.name ?? job.service.slug}</td>
                        <td>{t(`status.${job.status}`)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {jobMeta && jobs.length < jobMeta.total ? (
              <div className={styles.detailActions}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonGhost}`}
                  onClick={() => setJobPage((current) => current + 1)}
                  disabled={loadingJobs}
                >
                  {t('employees.more')}
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};
