import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '../layout/Container';
import { site } from '../../data/site';
import styles from './Stats.module.css';

/**
 * Counts a number up when the band first comes into view.
 *
 * Only the digits animate: a value like "24h" keeps its unit, and anything
 * without a number is shown as written. The final value is rendered on the
 * server and set immediately when motion is reduced, so the figure is never
 * missing for someone who cannot see the animation.
 */
const useCountUp = (value, shouldRun) => {
  const digits = value.match(/\d[\d\s]*/);
  const target = digits ? Number(digits[0].replace(/\s/g, '')) : null;

  const [current, setCurrent] = useState(target);

  useEffect(() => {
    if (!shouldRun || target === null) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCurrent(target);
      return undefined;
    }

    const duration = 900;
    const start = performance.now();
    let frame;

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out: fast at first, settling on the number rather than stopping
      // dead on it.
      setCurrent(Math.round(target * (1 - (1 - progress) ** 3)));

      if (progress < 1) frame = requestAnimationFrame(step);
    };

    setCurrent(0);
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [shouldRun, target]);

  if (target === null) return value;

  return value.replace(digits[0], String(current).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
};

const Stat = ({ id, value, visible }) => {
  const { t } = useTranslation('home');
  const shown = useCountUp(value, visible);

  return (
    <li className={styles.stat}>
      <span className={styles.value}>{shown}</span>
      <span className={styles.label}>{t(`stats.${id}`)}</span>
    </li>
  );
};

/** A band of figures, each one a promise the company can keep from day one. */
export const Stats = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        // One run only: numbers that restart every time the band scrolls past
        // read as decoration rather than fact.
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} ref={ref}>
      <Container>
        <ul className={styles.list}>
          {site.stats.map((stat) => (
            <Stat key={stat.id} id={stat.id} value={stat.value} visible={visible} />
          ))}
        </ul>
      </Container>
    </section>
  );
};
