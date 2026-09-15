import { App } from './App';
import { services } from './data/services';

/**
 * Route table.
 *
 * Written as data rather than JSX so the static site generator can walk it at
 * build time and emit one HTML file per path. Pages are lazily imported so
 * each route ships only its own JavaScript.
 */
export const routes = [
  {
    // The dashboard sits outside the public layout: no header, no footer, and
    // no pre-rendering, since everything it shows is live data behind a login.
    path: '/admin/*',
    entry: 'src/pages/admin/AdminApp.jsx',
    lazy: () => import('./pages/admin/AdminApp').then((m) => ({ Component: m.AdminApp })),
  },
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        entry: 'src/pages/Home.jsx',
        lazy: () => import('./pages/Home').then((m) => ({ Component: m.Home })),
      },
      {
        path: 'tjanster',
        entry: 'src/pages/Services.jsx',
        lazy: () => import('./pages/Services').then((m) => ({ Component: m.Services })),
      },
      {
        path: 'tjanster/:slug',
        entry: 'src/pages/Service.jsx',
        lazy: () => import('./pages/Service').then((m) => ({ Component: m.Service })),
        // One HTML file per service, listed here so the generator knows them.
        getStaticPaths: () => services.map((service) => `tjanster/${service.slug}`),
      },
      {
        path: 'boka',
        entry: 'src/pages/Booking.jsx',
        lazy: () => import('./pages/Booking').then((m) => ({ Component: m.Booking })),
      },
      {
        path: 'offert',
        entry: 'src/pages/Quote.jsx',
        lazy: () => import('./pages/Quote').then((m) => ({ Component: m.Quote })),
      },
      {
        path: 'kontakt',
        entry: 'src/pages/Contact.jsx',
        lazy: () => import('./pages/Contact').then((m) => ({ Component: m.Contact })),
      },
      {
        path: 'priser',
        entry: 'src/pages/Prices.jsx',
        lazy: () => import('./pages/Prices').then((m) => ({ Component: m.Prices })),
      },
      {
        path: 'integritetspolicy',
        entry: 'src/pages/LegalPage.jsx',
        lazy: () =>
          import('./pages/LegalPage').then((m) => ({ Component: m.PrivacyPage })),
      },
      {
        path: 'villkor',
        entry: 'src/pages/LegalPage.jsx',
        lazy: () => import('./pages/LegalPage').then((m) => ({ Component: m.TermsPage })),
      },
      {
        path: '*',
        entry: 'src/pages/NotFound.jsx',
        lazy: () => import('./pages/NotFound').then((m) => ({ Component: m.NotFound })),
      },
    ],
  },
];
