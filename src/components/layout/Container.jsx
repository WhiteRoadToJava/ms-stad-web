import styles from './Container.module.css';

export const Container = ({ children, width = 'default', className }) => (
  <div className={[styles.container, styles[width], className].filter(Boolean).join(' ')}>
    {children}
  </div>
);
