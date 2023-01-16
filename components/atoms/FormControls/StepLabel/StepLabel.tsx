import Hint from '@components/atoms/Hint/Hint';
import React from 'react';

interface StepLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  required?: boolean;
  active?: boolean;
  label?: string | JSX.Element | JSX.Element[];
  description?: string | JSX.Element | JSX.Element[];
  note?: string | JSX.Element | JSX.Element[];
  hint?: string | JSX.Element | JSX.Element[];
  step?: number;
  className?: string;
  isExpanded?: boolean;
  isActive?: boolean;
}

const StepLabel = React.forwardRef<HTMLDivElement, StepLabelProps>(
  (
    {
      label = '',
      active = false,
      hint = '',
      description = '',
      note = '',
      step = 0,
      required = false,
      className = '',
      isExpanded = true,
      isActive = false,
      ...props
    }: StepLabelProps,
    ref
  ) => {
    return (
      <div
        ref={ref}
        tabIndex={0}
        className={`flex flex-row gap-3 p-6 group hover:bg-neutral-100 focus:bg-neutral-100 transition-all ${className} ${
          isExpanded && isActive ? 'bg-neutral-100' : 'bg-transparent'
        }`}>
        {step ? (
          <div
            className={`flex flex-row items-center justify-center flex-shrink-0 h-6 w-6 border-2 rounded-full text-xs font-bold transition-all group-hover:bg-primary-900 group-hover:text-white group-hover:border-transparent group-focus:bg-primary-900 group-focus:text-white group-focus:border-transparent ${
              isExpanded && isActive
                ? 'bg-primary-900 text-white border-transparent'
                : 'bg-transparent text-neutral-800 border-neutral-800'
            }`}>
            {step}
          </div>
        ) : null}
        <div className="flex-grow">
          {label || hint ? (
            <div className="flex flex-row items-center justify-between">
              <span
                className={`font-medium text-base transition-all group-hover:text-primary-900 group-focus:text-primary-900 ${
                  isExpanded && isActive ? 'text-primary-900' : 'text-neutral-900'
                }`}>
                {label} {required ? '*' : ''}
              </span>
              {hint ? <Hint tip={hint} /> : null}
            </div>
          ) : null}
          {description ? (
            <p className={`text-sm text-neutral-700 overflow-hidden transition-all ${!isExpanded ? 'h-0' : ''}`}>
              {description}
            </p>
          ) : null}
          <div className="mt-4">{props.children}</div>
          {note ? (
            <p className={`text-xs text-neutral-700 overflow-hidden transition-all ${!isExpanded ? 'h-0' : 'mt-4'}`}>
              {note}
            </p>
          ) : null}
        </div>
      </div>
    );
  }
);

export default StepLabel;
