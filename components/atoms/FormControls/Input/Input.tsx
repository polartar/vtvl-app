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
 *  <input type="text" />
 * </label>
 * ```
 * This component mimics the default input and already contains the a11y and label.
 * To use, simply use the `<Input />` component as a regular `<input />` one.
 */
export const Input = ({
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
