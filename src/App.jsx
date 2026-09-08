import { Outlet } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import './styles/global.css';
import './app/i18n';

/** Shared shell around every page. */
export const App = () => (
  <>
    <a href="#main" className="visually-hidden">
      Till innehållet
    </a>
    <Header />
    <main id="main">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default App;
