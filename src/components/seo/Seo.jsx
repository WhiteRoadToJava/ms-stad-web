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
/** The picture shown when a link is shared. Absolute, as the spec requires. */
const DEFAULT_IMAGE = '/og-image.png';

export const Seo = ({
  title,
  description,
  path = '/',
  siteUrl,
  jsonLd,
  noindex = false,
  image = DEFAULT_IMAGE,
}) => {
  const canonical = `${siteUrl}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

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
      <meta property="og:site_name" content="MA Städ" />
      <meta property="og:image" content={imageUrl} />
      {/* Facebook and LinkedIn reserve the space before the file arrives, so
          the card does not jump once it loads. */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={imageUrl} />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Head>
  );
};
