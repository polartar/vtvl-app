import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  label?: string;
  className?: string;
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
}

/**
 * Form inputs should be structured inside a label
 * ```
 * <label className="required">
 *  <span>Organization name</span>
 *  <div>
 *   <input type="text" />
 *   <p>Optional message -- can also be used as error / success message.</p>
 *  </div>
 * </label>
 * ```
 * This component mimics the default input and already contains the a11y and label.
 * To use, simply use the `<Input />` component as a regular `<input />` one.
 */
const Input = ({
  label = '',
  required = false,
  className = '',
  message = '',
  error = false,
  success = false,
  ...props
}: InputProps) => {
  return (
    <label className={`${required ? 'required' : ''} ${className}`}>
      {label ? <span>{label}</span> : null}
      <div className={`${success && 'success'} ${error && 'error'}`}>
        <input type="text" {...props} />
        {message ? <p>{message}</p> : null}
      </div>
    </label>
  );
};

export default Input;
