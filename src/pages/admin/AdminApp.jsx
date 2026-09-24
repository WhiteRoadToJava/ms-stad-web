import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Head } from 'vite-react-ssg';
import { AuthProvider, useAuth } from '../../features/admin/AuthContext';
import { LoginPage } from './LoginPage';
import { PasswordPage } from './PasswordPage';
import { DashboardPage } from './DashboardPage';
import { BookingsPage } from './BookingsPage';
import { QuotesPage } from './QuotesPage';
import { CallbacksPage } from './CallbacksPage';
import { ServicesPage } from './ServicesPage';
import { AvailabilityPage } from './AvailabilityPage';
import styles from './admin.module.css';

const LINKS = [
  ['', 'dashboard'],
  ['bokningar', 'bookings'],
  ['offerter', 'quotes'],
  ['uppringningar', 'callbacks'],
  ['tider', 'availability'],
  ['priser', 'services'],
];

const Shell = ({ children }) => {
  const { t } = useTranslation('admin');
  const { logout } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.sidebar}>
        <span className={styles.brand}>MA Städ</span>

        <nav>
          {LINKS.map(([path, key]) => (
            <NavLink
              key={key}
              to={`/admin/${path}`}
              end={path === ''}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navActive : ''}`
              }
            >
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>

        <button type="button" className={styles.logout} onClick={logout}>
          {t('nav.logout')}
        </button>
      </header>

      <div className={styles.content}>{children}</div>
    </div>
  );
};

const Dashboard = () => {
  const { admin, status } = useAuth();
  const { t } = useTranslation('admin');

  if (status === 'loading') return <p className={styles.centered}>{t('common.loading')}</p>;
  if (status !== 'authenticated') return <LoginPage />;

  // Nothing else is reachable until the seeded password has been replaced.
  if (admin?.mustChangePassword) return <PasswordPage />;

  return (
    <Shell>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="bokningar" element={<BookingsPage />} />
        <Route path="offerter" element={<QuotesPage />} />
        <Route path="uppringningar" element={<CallbacksPage />} />
        <Route path="tider" element={<AvailabilityPage />} />
        <Route path="priser" element={<ServicesPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Shell>
  );
};

/**
 * The dashboard is a client-side application inside the static site: it shows
 * live data behind a login, so there is nothing to pre-render and nothing a
 * search engine should index.
 */
export const AdminApp = () => (
  <>
    <Head>
      <title>MA Städ — Admin</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>

    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  </>
);

export default AdminApp;
