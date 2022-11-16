import React from 'react';
import { InputNumberCommas } from 'react-number-format-with-commas';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  label?: string | React.ReactNode;
  className?: string;
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
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
  icon = '',
  iconPosition = 'left',
  ...props
}: InputProps) => {
  return (
    <label className={`input-component ${required ? 'required' : ''} ${className}`}>
      {label ? <span>{label}</span> : null}
      <div className={`input-component__container ${success ? 'success' : ''} ${error ? 'error' : ''}`}>
        <div className="input-component__input">
          {icon ? <img src={icon} alt={label?.toString() || 'Input icon'} className="w-6 h-6 fill-current" /> : null}
          {props.type === 'number' ? (
            <InputNumberCommas {...props} type="text" className="grow w-full outline-0 border-0 bg-transparent" />
          ) : (
            <input type="text" {...props} className="grow w-full outline-0 border-0 bg-transparent" />
          )}
        </div>
        {message ? <p className="input-component__message">{message}</p> : null}
      </div>
    </label>
  );
};

export default Input;
