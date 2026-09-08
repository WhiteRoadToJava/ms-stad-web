# MA Städ — Web

Marketing site and booking flow for MA Städ, covering Västra Götaland,
Jönköping and Halland.

**Stack:** React 18 · JavaScript · Vite · CSS Modules · react-i18next ·
vite-react-ssg

---

## Getting started

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

The API must be running separately (see the `ma-stad-api` repo) for the booking
and quote forms to work. Static pages work without it.

```bash
npm run build          # bundle and pre-render every route to HTML
npm run preview        # serve the production build locally
```

---

## Why static generation

A local cleaning company lives or dies by search results. A plain single-page
app ships an empty `<div id="root">` to crawlers, so `vite-react-ssg` renders
each route to real HTML at build time. You still write ordinary React; only two
rules differ:

1. Routes live in `src/routes.jsx` as data, not JSX, so the generator can walk them.
2. Anything that touches `window` must run inside `useEffect`, because the same
   components execute in Node during the build.

---

## Conventions

- **No hard-coded user-facing text.** Every string goes through `t()` and lives
  in `src/locales/{sv,en}/*.json`. Swedish is the product language; English is
  there for development and for non-Swedish visitors.
- **No hard-coded colours or sizes.** Use the custom properties in
  `src/styles/tokens.css`. Changing the brand should mean editing one file.
- **One CSS Module per component**, named after it (`Header.jsx` /
  `Header.module.css`).
- **The client price is a preview.** `src/data/pricing.js` mirrors the server so
  the calculator can react instantly, but the server value is what gets stored.
  Keep the two files in sync.
- **Comments explain why, not what.**

---

## Project layout

```
src/app/i18n.js        Language setup
src/components/brand/  Logo
src/components/layout/ Header, Footer, Container
src/components/ui/     Reusable primitives (Button, ...)
src/features/          Larger flows: booking, quote, admin
src/pages/             One file per route
src/data/              Site facts, service catalogue, areas, pricing rules
src/lib/api.js         Fetch wrapper for the API
src/locales/           Translation files
src/styles/            tokens.css, global.css
```

---

## Design system

| Token | Value | Role |
| --- | --- | --- |
| `--color-brand` | `#124559` | Petrol blue, primary actions and links |
| `--color-brand-strong` | `#0B3242` | Hover states and the footer |
| `--color-accent` | `#D9A441` | Brass, used only on trust signals and prices |
| `--color-ink` | `#0E2430` | Body text |
| `--color-canvas` | `#F2F5F6` | Page background |

Type: **Fraunces** for headings, **Karla** for everything else. Both cover the
Swedish å ä ö.

---

## Deploying to Hostinger

The site builds to plain static files, so it is served directly by the web
server, with the API on the `api.` subdomain.

1. hPanel → Websites → Add Website → Node.js → Import Git Repository.
2. Build command `npm run build`, output directory `dist`.
3. Set `VITE_API_URL` to `https://api.mastad.se/api` in the environment settings.
4. Add that origin to `CORS_ORIGINS` in the API before going live.
