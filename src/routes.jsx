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
        path: 'priser',
        entry: 'src/pages/Prices.jsx',
        lazy: () => import('./pages/Prices').then((m) => ({ Component: m.Prices })),
      },
      {
        path: '*',
        entry: 'src/pages/NotFound.jsx',
        lazy: () => import('./pages/NotFound').then((m) => ({ Component: m.NotFound })),
      },
    ],
  },
];
