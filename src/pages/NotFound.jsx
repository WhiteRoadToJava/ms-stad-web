import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Seo } from '../components/seo/Seo';
import { site } from '../data/site';

/** 404. Kept short: the useful thing here is a way back, not an apology. */
export const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Seo
        title={`${t('notFound.title')} — ${site.name}`}
        description={t('notFound.text')}
        siteUrl={site.url}
        path="/404"
      />
      <div style={{ paddingBlock: 'var(--space-9)' }}>
        <h1>{t('notFound.title')}</h1>
        <p style={{ marginBlock: 'var(--space-4)' }}>{t('notFound.text')}</p>
        <Button to="/">{t('notFound.back')}</Button>
      </div>
    </Container>
  );
};

export default NotFound;
