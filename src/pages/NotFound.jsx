import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Container width="narrow">
      <div style={{ paddingBlock: 'var(--space-9)' }}>
        <h1>{t('notFound.title')}</h1>
        <p style={{ margin: 'var(--space-4) 0' }}>{t('notFound.text')}</p>
        <Button to="/">{t('notFound.back')}</Button>
      </div>
    </Container>
  );
};

export default NotFound;
