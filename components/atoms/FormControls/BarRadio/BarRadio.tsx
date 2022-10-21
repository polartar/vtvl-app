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
}

const BarRadio = ({ label = '', options, required, className, ...props }: BarRadioProps) => {
  return (
    <div>
      {label ? (
        <label className={`${required ? 'required' : ''} ${className}`}>
          <span>{label}</span>
        </label>
      ) : null}

      <div className="flex flex-row item-center justify-stretch border border-neutral-300 rounded-full overflow-hidden h-12">
        {options.map((option, optionIndex) => (
          <label
            key={`bar-radio-option-${option.value}-${optionIndex}`}
            className={`flex-row items-center justify-center cursor-pointer text-center shrink-0 grow text-xs font-medium border-netural-300 transition-all hover:bg-primary-900 hover:text-neutral-50 ${
              option.value == props.value ? 'bg-primary-900 text-neutral-50' : 'bg-neutral-50 text-neutral-800'
            } ${optionIndex ? 'border-l' : ''}`}>
            {option.label}
            <input
              type="radio"
              className="absolute opacity-0 -z-10"
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
