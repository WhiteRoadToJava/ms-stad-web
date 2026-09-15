import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/admin/AuthContext';
import styles from './admin.module.css';

/** Staff sign in. Deliberately says nothing about which field was wrong. */
export const LoginPage = () => {
  const { t } = useTranslation('admin');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [failed, setFailed] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setFailed(false);

    try {
      await login({ email, password });
    } catch {
      setFailed(true);
      setStatus('idle');
    }
  };

  return (
    <div className={styles.centered}>
      <form className={styles.panel} onSubmit={submit}>
        <h1>{t('login.title')}</h1>
        <p className={styles.hint}>{t('login.text')}</p>

        <label className={styles.field}>
          <span>{t('login.email')}</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>{t('login.password')}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {failed ? (
          <p className={styles.error} role="alert">
            {t('login.failed')}
          </p>
        ) : null}

        <button type="submit" className={styles.submit} disabled={status === 'sending'}>
          {status === 'sending' ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
    </div>
  );
};
