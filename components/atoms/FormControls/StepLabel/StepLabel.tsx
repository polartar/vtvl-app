import Hint from '@components/atoms/Hint/Hint';
import React from 'react';

interface StepLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  active?: boolean;
  label?: string | JSX.Element | JSX.Element[];
  description?: string | JSX.Element | JSX.Element[];
  note?: string | JSX.Element | JSX.Element[];
  hint?: string | JSX.Element | JSX.Element[];
  step?: number;
  className?: string;
}

const StepLabel = ({
  label = '',
  active = false,
  hint = '',
  description = '',
  note = '',
  step = 0,
  required = false,
  className = '',
  ...props
}: StepLabelProps) => {
  return (
    <div className={`flex flex-row gap-3 p-6 group hover:bg-neutral-100 transition-all ${className}`}>
      {step ? (
        <div className="flex flex-row items-center justify-center flex-shrink-0 h-6 w-6 border-2 border-neutral-800 rounded-full text-xs font-bold text-neutral-800 transition-all group-hover:bg-primary-900 group-hover:text-white group-hover:border-transparent">
          {step}
        </div>
      ) : null}
      <div className="flex-grow">
        {label || hint ? (
          <div className="flex flex-row items-center justify-between">
            <span className="font-medium text-base text-neutral-900 transition-all group-hover:text-primary-900">
              {label} {required ? '*' : ''}
            </span>
            {hint ? <Hint tip={hint} /> : null}
          </div>
        ) : null}
        {description ? <p className="text-sm text-neutral-700">{description}</p> : null}
        <div className="mt-4">{props.children}</div>
        {note ? <p className="text-xs text-neutral-700 mt-4">{note}</p> : null}
      </div>
    </div>
  );
};

export default StepLabel;
