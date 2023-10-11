import styled from '@emotion/styled';
import React from 'react';

const DropDownInputStyled = styled.select`
  background-image: url('/chevron-down.svg');
  background-position: 90% 51%;
  background-repeat: no-repeat;
  border-radius: 7px;
  width: 100px;
  font-size: 14px;
  font-weight: 500;
  background-color: #e5e5e5;
  padding: 6px 8px;
  cursor: pointer;
  appearance: none;
`;

interface Options {
  label: string | number;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
  options: Options[];
  variant?: 'default' | 'alt';
}

const DropDownInput = ({
  message = '',
  error = false,
  success = false,
  options,
  color = '',
  variant = 'default',
  ...props
}: SelectProps) => {
  return (
    <div className={`  ${success && 'success'} ${error && 'error'}`}>
      <DropDownInputStyled {...props} className={`appearance-none ${variant} ${color}`}>
        {options.map((option, idx) => (
          <option value={option.value} key={idx}>
            {option.label}
          </option>
        ))}
      </DropDownInputStyled>
      {message ? <p>{message}</p> : null}
    </div>
  );
};

export default DropDownInput;
