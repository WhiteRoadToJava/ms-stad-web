import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CallbackWidget } from './components/contact/CallbackWidget';
import './styles/global.css';
import './app/i18n';

/** Pages that already show a form of their own. */
const HIDE_CALLBACK_ON = ['/boka', '/kontakt'];

/** Shared shell around every page. */
export const App = () => {
  const { pathname } = useLocation();

  return (
    <>
      <a href="#main" className="visually-hidden">
        Till innehållet
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      {HIDE_CALLBACK_ON.includes(pathname) ? null : <CallbackWidget />}
    </>
  );
};

export default App;
