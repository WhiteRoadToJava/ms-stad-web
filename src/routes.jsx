import { App } from './App';

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
        path: '*',
        entry: 'src/pages/NotFound.jsx',
        lazy: () => import('./pages/NotFound').then((m) => ({ Component: m.NotFound })),
      },
    ],
  },
];
