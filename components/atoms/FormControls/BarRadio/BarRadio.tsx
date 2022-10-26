import React from 'react';

interface Option {
  label: string | number;
  value: string | number;
}

interface BarRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  required?: boolean;
  options: Option[];
  // Props for enhancing validation visual cues
  message?: string | JSX.Element | JSX.Element[];
  error?: boolean;
  success?: boolean;
  variant?: 'tab' | 'input';
}

const BarRadio = ({ label = '', options, required, className, variant = 'input', ...props }: BarRadioProps) => {
  const variants = {
    tab: {
      container: 'rounded-lg w-max',
      item: 'text-sm text-neutral-800 hover:bg-neutral-100 w-32',
      active: 'bg-neutral-100',
      inactive: 'bg-white'
    },
    input: {
      container: 'rounded-full',
      item: 'shrink-0 grow text-xs hover:bg-primary-900 hover:text-neutral-50',
      active: 'bg-primary-900 text-neutral-50',
      inactive: 'bg-neutral-50 text-neutral-800'
    }
  };
  return (
    <div>
      {label ? (
        <label className={`${required ? 'required' : ''} ${className}`}>
          <span>{label}</span>
        </label>
      ) : null}

      <div
        className={`barRadio flex flex-row item-center justify-stretch border border-neutral-300 overflow-hidden h-12 ${variants[variant].container}`}>
        {options.map((option, optionIndex) => (
          <label
            key={`bar-radio-option-${option.value}-${optionIndex}`}
            className={`flex-row items-center justify-center cursor-pointer text-center font-medium border-netural-300 transition-all ${
              option.value == props.value ? variants[variant].active : variants[variant].inactive
            } ${optionIndex ? 'border-l' : ''} ${variants[variant].item}`}>
            {option.label}
            <input
              type="radio"
              className="absolute opacity-0 -z-10 bg-transparent"
              {...props}
              value={option.value}
              onChange={props.onChange}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default BarRadio;
