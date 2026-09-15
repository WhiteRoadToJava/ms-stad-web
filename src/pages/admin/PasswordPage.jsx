import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/admin/AuthContext';
import styles from './admin.module.css';

/**
 * Shown instead of the dashboard while mustChangePassword is set. The seeded
 * password is public in the repository, so it cannot be left in place.
 */
export const PasswordPage = () => {
  const { t } = useTranslation('admin');
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState('idle');

  const submit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setFailed(false);

    try {
      await changePassword({ currentPassword, newPassword });
    } catch {
      setFailed(true);
      setStatus('idle');
    }
  };

  return (
    <div className={styles.centered}>
      <form className={styles.panel} onSubmit={submit}>
        <h1>{t('password.title')}</h1>
        <p className={styles.hint}>{t('password.text')}</p>

        <label className={styles.field}>
          <span>{t('password.current')}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>{t('password.new')}</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={12}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <small>{t('password.help')}</small>
        </label>

        {failed ? (
          <p className={styles.error} role="alert">
            {t('password.failed')}
          </p>
        ) : null}

        <button type="submit" className={styles.submit} disabled={status === 'sending'}>
          {t('password.submit')}
        </button>
      </form>
    </div>
  );
};
