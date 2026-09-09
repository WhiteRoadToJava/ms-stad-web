import { useTranslation } from 'react-i18next';
import styles from './Stepper.module.css';

/**
 * Progress indicator.
 *
 * Completed steps are clickable so someone can go back and change an answer
 * without losing the rest; steps ahead are not, because the form gates on
 * validation and jumping forward would skip it.
 */
export const Stepper = ({ steps, current, onSelect }) => {
  const { t } = useTranslation('booking');

  return (
    <nav
      className={styles.stepper}
      aria-label={t('steps.progress', { current: current + 1, total: steps.length })}
    >
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const isDone = index < current;
          const isCurrent = index === current;

          return (
            <li key={step} className={styles.step}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={`${styles.line} ${isDone || isCurrent ? styles.lineDone : ''}`}
                />
              ) : null}

              <button
                type="button"
                className={`${styles.marker} ${isDone ? styles.done : ''} ${
                  isCurrent ? styles.current : ''
                }`}
                onClick={() => (isDone ? onSelect(index) : undefined)}
                disabled={!isDone}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? <span aria-hidden="true" className={styles.tick} /> : index + 1}
              </button>

              <span className={`${styles.label} ${isCurrent ? styles.labelCurrent : ''}`}>
                {t(`steps.${step}`)}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
