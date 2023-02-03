import React from 'react';

import DotLoader from '../DotLoader/DotLoader';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Main call to action style for the button. This is also the default styling for all the buttons.
   */
  primary?: boolean;
  /**
   * Display button as secondary in style
   */
  secondary?: boolean;
  /**
   * Display button as success in style
   */
  success?: boolean;
  /**
   * Display button as danger / error in style
   */
  danger?: boolean;
  /**
   * Display button as warning in style
   */
  warning?: boolean;
  /**
   * Display as an outlined button
   */
  outline?: boolean;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button contents
   */
  label?: string;
  /**
   * loading state
   */
  loading?: boolean;
}

/**
 * You can use the default HTML `button` tag and just use classNames for styling.
 *
 * This is just so we have a button component.
 * Button component that extends the default button and adds in new properties for quick use
 * Developer can use both props or just add them directly as a className
 * e.g., `<button className="primary large">` is the same as `<Button primary large>`.
 * `<Button label="My Button" />` is the same as `<Button>My Button</Button>`
 */
const Button = ({
  loading = false,
  primary,
  secondary,
  outline,
  danger,
  success,
  warning,
  size,
  label,
  ...props
}: ButtonProps) => {
  const getClassNames = () => {
    let className = '';
    if (primary) className += ' primary ';
    if (secondary) className += ' secondary ';
    if (outline) className += ' line ';
    if (danger) className += ' danger ';
    if (success) className += ' success ';
    if (warning) className += ' warning ';
    if (size) className += size;
    return className;
  };
  return (
    <button
      {...props}
      className={`relative ${getClassNames()} ${props.className} ${loading ? 'loading' : ''}`}
      disabled={loading || props.disabled}>
      {/* Used opacity to preserve the current width of the button when it is doing the loading state */}
      <span className={`transition-all block transform-gpu ${loading ? 'opacity-0 translate-x-1.5' : ''}`}>
        {label || props.children}
      </span>
      <span
        className={`absolute flex items-center justify-center inset-0 transition-all transform-gpu ${
          loading ? '' : 'opacity-0 -translate-x-5'
        }`}
        aria-hidden="true">
        <DotLoader className={`${getClassNames()}`} />
      </span>
    </button>
  );
};

export default Button;
