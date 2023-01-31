import React from 'react';
import { NumericFormat } from 'react-number-format';

interface QuantityInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  required?: boolean;
  label?: string | React.ReactNode;
  className?: string;
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
  max?: number;
  onPlus?: () => void;
  onMinus?: () => void;
}

const QuantityInput = ({
  label = '',
  required = false,
  className = '',
  message = '',
  error = false,
  success = false,
  max = 0,
  onPlus = () => {},
  onMinus = () => {},
  ...props
}: QuantityInputProps) => {
  return (
    <label className={`input-component w-36 ${required ? 'required' : ''} ${className}`}>
      {label ? <span>{label}</span> : null}
      <div className={`input-component__container ${success ? 'success' : ''} ${error ? 'error' : ''}`}>
        <div className="input-component__input justify-between gap-1 h-8 px-2 py-0">
          <button
            type="button"
            className="font-medium text-neutral-800 w-5 h-5 p-0 flex flex-row items-center justify-center flex-shrink-0 leading-3 rounded-none bg-transparent"
            onClick={onMinus}>
            &minus;
          </button>
          <NumericFormat
            {...props}
            defaultValue={props.defaultValue as string | number}
            value={props.value as string | number}
            type="text"
            thousandSeparator=","
            decimalScale={0}
            className="grow outline-0 border-0 bg-secondary-900 text-white rounded-md text-center h-6 w-8"
            isAllowed={(values) => {
              // Add max check if any
              const { formattedValue, floatValue } = values;
              if (max) {
                return formattedValue === '' || (floatValue ? floatValue >= 0 && floatValue <= max : false);
              }
              return true;
            }}
          />
          <button
            type="button"
            className="font-medium text-neutral-800 w-5 h-5 p-0 flex flex-row items-center justify-center flex-shrink-0 leading-3 rounded-none bg-transparent"
            onClick={onPlus}>
            &#43;
          </button>
        </div>
        {message ? <p className="input-component__message">{message}</p> : null}
      </div>
    </label>
  );
};

export default QuantityInput;
