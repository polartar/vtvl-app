import React from 'react';

interface ICheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string | JSX.Element | JSX.Element[];
  name: string;
}

const Checkbox = ({ label = '', name = 'Checkbox', ...props }: ICheckboxProps) => {
  return (
    <label
      className={`relative flex flex-row items-center gap-2 text-sm transition-all ${
        props.checked ? 'text-primary-900' : 'text-neutral-900'
      }`}>
      {/* Custom check UI */}
      <div
        className={`border-2 h-5 w-5 rounded-full flex flex-row items-center justify-center transition-all ${
          props.checked ? 'bg-primary-900 border-primary-900' : 'bg-neutral-50 border-primary-100'
        }`}>
        {props.checked ? <img src="/icons/check.svg" alt="checked" className="w-3 h-3 flex-shrink-0" /> : null}
      </div>
      {label || null}
      <input
        type="checkbox"
        {...props}
        name={name}
        className="opacity-0 absolute top-0 left-0 isolate -z-40"
        onChange={props.onChange}
      />
    </label>
  );
};

export default Checkbox;
