import { Head } from 'vite-react-ssg';

/**
 * Page metadata and structured data.
 *
 * Rendered into the static HTML at build time, which is the whole point of
 * generating the site: crawlers and link previews see the real tags, not an
 * empty shell that fills in later.
 */
/**
 * False on staging and any other copy of the site that is not mastad.se.
 * Anything other than the literal "false" counts as indexable, so production
 * cannot be hidden from search by a missing variable.
 */
const INDEXABLE = import.meta.env.VITE_INDEXABLE !== 'false';

/**
 * noindex hides a single page, for content that exists but is not ready to be
 * found, such as a city page whose local details have not been checked yet.
 */
export const Seo = ({ title, description, path = '/', siteUrl, jsonLd, noindex = false }) => {
  const canonical = `${siteUrl}${path}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {INDEXABLE && !noindex ? null : <meta name="robots" content="noindex, nofollow" />}
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
