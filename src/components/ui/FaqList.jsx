import styles from './FaqList.module.css';

/**
 * Question and answer list.
 *
 * Native <details> rather than a React accordion: it works before the
 * JavaScript loads, it is keyboard accessible for free, and the answers sit in
 * the static HTML where search engines can read them.
 */
export const FaqList = ({ items }) => (
  <div className={styles.list}>
    {items.map((item) => (
      <details key={item.question} className={styles.item}>
        <summary className={styles.question}>{item.question}</summary>
        <p className={styles.answer}>{item.answer}</p>
      </details>
    ))}
  </div>
);
