import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../lib/adminApi';
import { useAuth } from '../../features/admin/AuthContext';
import { EmployeeDetail } from './EmployeeDetail';
import styles from './admin.module.css';

const emptyForm = { name: '', email: '', phone: '', colour: '#124559', notes: '' };

/**
 * The people who do the cleaning.
 *
 * Separate from admin accounts: most cleaners never sign in. Nobody is ever
 * deleted, because a booking from last spring has to keep showing who was
 * actually there.
 */
export const EmployeesPage = () => {
  const { t } = useTranslation('admin');
  const { admin } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const canEdit = admin?.role === 'ADMIN';

  useEffect(() => {
    adminApi
      .get('/admin/employees')
      .then((payload) => setEmployees(payload.data))
      .finally(() => setLoading(false));
  }, []);

  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const add = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = await adminApi.post('/admin/employees', form);
      setEmployees((current) => [payload.data, ...current]);
      setForm(emptyForm);
    } catch {
      setError(t('employees.error'));
    } finally {
      setSaving(false);
    }
  };

  /** Keeps the open dialog and the row behind it showing the same person. */
  const applyUpdate = (updated) => {
    setEmployees((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelected(updated);
  };

  const toggleActive = async (employee) => {
    try {
      const payload = await adminApi.patch(`/admin/employees/${employee.id}`, {
        isActive: !employee.isActive,
      });

      setEmployees((current) =>
        current.map((item) => (item.id === employee.id ? payload.data : item)),
      );
    } catch {
      setError(t('employees.error'));
    }
  };

  return (
    <>
      <h1 className={styles.title}>{t('employees.title')}</h1>
      <p className={styles.hint}>{t('employees.text')}</p>

      {canEdit ? (
        <form className={styles.card} style={{ marginTop: 'var(--space-5)' }} onSubmit={add}>
          <h2 className={styles.detailHeading}>{t('employees.addTitle')}</h2>

          <div className={styles.filters}>
            <label className={styles.inlineField}>
              <span>{t('employees.name')}</span>
              <input
                className={styles.input}
                required
                value={form.name}
                onChange={change('name')}
              />
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

          <div className={styles.detailActions}>
            <button type="submit" className={styles.button} disabled={saving}>
              {saving ? t('employees.saving') : t('employees.add')}
            </button>
            {error ? <span className={styles.error}>{error}</span> : null}
          </div>
        </form>
      ) : (
        <p className={styles.muted} style={{ marginTop: 'var(--space-4)' }}>
          {t('employees.adminOnly')}
        </p>
      )}

      {loading ? <p className={styles.muted}>{t('common.loading')}</p> : null}

      {!loading && employees.length === 0 ? (
        <p className={styles.muted}>{t('employees.empty')}</p>
      ) : null}

      {employees.length ? (
        <div className={styles.tableWrap} style={{ marginTop: 'var(--space-5)' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('employees.name')}</th>
                <th>{t('employees.phone')}</th>
                <th>{t('employees.email')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className={employee.isActive ? undefined : styles.muted}>
                  <td>
                    <span
                      className={styles.colourDot}
                      style={{ backgroundColor: employee.colour }}
                      aria-hidden="true"
                    />
                    {canEdit ? (
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => setSelected(employee)}
                        title={t('employees.edit')}
                      >
                        {employee.name}
                      </button>
                    ) : (
                      employee.name
                    )}
                    {employee.isActive ? null : (
                      <span className={styles.muted}> · {t('employees.inactive')}</span>
                    )}
                  </td>
                  <td className={styles.mono}>{employee.phone || '—'}</td>
                  <td>{employee.email || '—'}</td>
                  <td>
                    {canEdit ? (
                      <>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonGhost}`}
                          onClick={() => setSelected(employee)}
                        >
                          {t('employees.edit')}
                        </button>{' '}
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonGhost}`}
                          onClick={() => toggleActive(employee)}
                        >
                          {employee.isActive
                            ? t('employees.deactivate')
                            : t('employees.reactivate')}
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {selected ? (
        <EmployeeDetail
          employee={selected}
          onClose={() => setSelected(null)}
          onUpdated={applyUpdate}
        />
      ) : null}
    </>
  );
};
