import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { ServiceGrid } from '../components/home/ServiceGrid';
import { CtaBanner } from '../components/home/CtaBanner';
import { site } from '../data/site';
import { services } from '../data/services';
import {
  combineSchemas,
  localBusinessSchema,
  serviceListSchema,
} from '../lib/structuredData';

/** The catalogue on its own page, for the "Tjänster" link in the header. */
export const Services = () => {
  const { t } = useTranslation('home');
  const { t: tServices } = useTranslation('services');

  return (
    <>
      <Seo
        title={`${t('services.title')} — ${site.name}`}
        description={t('services.text')}
        path="/tjanster"
        siteUrl={site.url}
        jsonLd={combineSchemas(
          localBusinessSchema(),
          serviceListSchema(services, tServices),
        )}
      />

      <ServiceGrid />
      <CtaBanner />
    </>
  );
};

export default Services;
