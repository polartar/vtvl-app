import React from 'react';
import { NumericFormat } from 'react-number-format';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  label?: string | React.ReactNode;
  className?: string;
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
  icon?: string;
  max?: number;
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
  max = 0,
  ...props
}: InputProps) => {
  return (
    <label className={`input-component ${required ? 'required' : ''} ${className}`}>
      {label ? <span>{label}</span> : null}
      <div className={`input-component__container ${success ? 'success' : ''} ${error ? 'error' : ''}`}>
        <div className="input-component__input">
          {icon && iconPosition === 'left' ? (
            <img src={icon} alt={label?.toString() || 'Input icon'} className="w-6 h-6 fill-current" />
          ) : null}
          {props.type === 'number' ? (
            <NumericFormat
              {...props}
              defaultValue={props.defaultValue as string | number}
              value={props.value as string | number}
              type="text"
              thousandSeparator=","
              decimalScale={6}
              className="grow w-full outline-0 border-0 bg-transparent"
              isAllowed={(values) => {
                // Add max check if any
                const { formattedValue, floatValue } = values;
                if (max) {
                  return formattedValue === '' || (floatValue ? floatValue >= 0 && floatValue <= max : false);
                }
                return true;
              }}
            />
          ) : // <InputNumberCommas {...props} type="text" className="grow w-full outline-0 border-0 bg-transparent" />
          props.type === 'percent' ? (
            <NumericFormat
              {...props}
              defaultValue={props.defaultValue as string | number}
              value={props.value as string | number}
              type="text"
              decimalScale={2}
              thousandSeparator=","
              suffix="%"
              className="grow w-full outline-0 border-0 bg-transparent"
              isAllowed={(values) => {
                const { formattedValue, floatValue } = values;
                console.log('IS ALLOWED', formattedValue, floatValue);
                return (
                  formattedValue === '' || (floatValue !== undefined ? floatValue >= 0 && floatValue <= 99 : false)
                );
              }}
            />
          ) : (
            <input type="text" {...props} className="grow w-full outline-0 border-0 bg-transparent" />
          )}
          {icon && iconPosition === 'right' ? (
            <img src={icon} alt={label?.toString() || 'Input icon'} className="w-6 h-6 fill-current" />
          ) : null}
        </div>
        {message ? <p className="input-component__message">{message}</p> : null}
      </div>
    </label>
  );
};

export default Input;
