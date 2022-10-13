import styled from '@emotion/styled';
import React from 'react';

const SelectInput = styled.select`
  background-image: url('/chevron-down.svg');
  background-position: 96% 50%;
  background-repeat: no-repeat;
`;

interface Options {
  label: string | number;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  required?: boolean;
  label?: string;
  className?: string;
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
  options: Options[];
}

/**
 * Form select dropdow  should be structured inside a label
 * ```
 * <label className="required">
 *  <span>Organization name</span>
 *  <div>
 *   <select>
 *      <option></option>
 *   </select>
 *   <p>Optional message -- can also be used as error / success message.</p>
 *  </div>
 * </label>
 * ```
 * This component mimics the default select input and already contains the a11y and label.
 * To use, simply use the `<Select />` component as a regular `<select>` one. Add in an options prop that contains the { label: '', value: ''} for each option
 */
const Select = ({
  label = '',
  required = false,
  className = '',
  message = '',
  error = false,
  success = false,
  options,
  ...props
}: SelectProps) => {
  return (
    <label className={`${required ? 'required' : ''} ${className}`}>
      {label ? <span>{label}</span> : null}
      <div className={`${success && 'success'} ${error && 'error'}`}>
        <SelectInput {...props} className="appearance-none">
          {options.map((option, idx) => (
            <option value={option.value} key={idx}>
              {option.label}
            </option>
          ))}
        </SelectInput>
        {message ? <p>{message}</p> : null}
      </div>
    </label>
  );
};

export default Select;
