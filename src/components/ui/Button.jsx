import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * One button, three shapes: a real <button>, an internal <Link>, or an <a>.
 * Keeping them in one component means every call to action looks and focuses
 * the same way regardless of what it actually does.
 */
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...rest
}) => {
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest;
    return (
      <Link to={to} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};
