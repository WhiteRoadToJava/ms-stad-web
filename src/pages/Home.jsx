import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { Hero } from '../components/home/Hero';
import { HowItWorks } from '../components/home/HowItWorks';
import { ServiceGrid } from '../components/home/ServiceGrid';
import { Promises } from '../components/home/Promises';
import { Areas } from '../components/home/Areas';
import { Faq } from '../components/home/Faq';
import { CtaBanner } from '../components/home/CtaBanner';
import { site } from '../data/site';
import { services } from '../data/services';
import {
  combineSchemas,
  faqSchema,
  localBusinessSchema,
  serviceListSchema,
} from '../lib/structuredData';

/**
 * Home page.
 *
 * Order follows the questions a visitor asks, in the order they ask them:
 * what do you do and what does it cost, how does it work, what exactly can I
 * buy, why you, do you come to me, and the small print.
 */
export const Home = () => {
  const { t } = useTranslation('home');
  const { t: tServices } = useTranslation('services');

  const faqItems = t('faq.items', { returnObjects: true });

  const jsonLd = combineSchemas(
    localBusinessSchema(),
    serviceListSchema(services, tServices),
    faqSchema(faqItems),
  );

  return (
    <>
      <Seo
        title={`${site.name} — Städfirma i Västra Götaland, Jönköping och Halland`}
        description={t('hero.text')}
        path="/"
        siteUrl={site.url}
        jsonLd={jsonLd}
      />

      <Hero />
      <HowItWorks />
      <ServiceGrid />
      <Promises />
      <Areas />
      <Faq />
      <CtaBanner />
    </>
  );
};

export default Home;
