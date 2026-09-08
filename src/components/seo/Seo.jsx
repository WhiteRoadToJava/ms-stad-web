import { Head } from 'vite-react-ssg';

/**
 * Page metadata and structured data.
 *
 * Rendered into the static HTML at build time, which is the whole point of
 * generating the site: crawlers and link previews see the real tags, not an
 * empty shell that fills in later.
 */
export const Seo = ({ title, description, path = '/', siteUrl, jsonLd }) => {
  const canonical = `${siteUrl}${path}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="sv_SE" />

      <meta name="twitter:card" content="summary_large_image" />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Head>
  );
};
