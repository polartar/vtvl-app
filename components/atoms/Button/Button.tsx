import React from 'react';

import './Button.css';

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
const Button = (props: ButtonProps) => {
  const { primary, secondary, outline, danger, success, warning, size, label } = props;
  const getClassNames = () => {
    let className = '';
    if (primary) className += ' primary ';
    if (secondary) className += ' secondary ';
    if (outline) className += ' outline ';
    if (danger) className += ' danger ';
    if (success) className += ' success ';
    if (warning) className += ' warning ';
    if (size) className += size;
    return className;
  };
  return (
    <button className={getClassNames()} {...props}>
      {label || props.children}
    </button>
  );
};

export default Button;
