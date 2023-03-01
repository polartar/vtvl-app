import React from 'react';

interface HintProps extends React.AllHTMLAttributes<HTMLAllCollection> {
  tip: string | JSX.Element | JSX.Element[];
}
const Hint = ({ tip, ...props }: HintProps) => {
  return (
    <span
      className={`hint relative flex items-center justify-center font-bold text-xs text-neutral-500 cursor-pointer ${
        props.children ? '' : 'p-1 rounded-full border border-gray-200 bg-gray-50 w-4 h-4'
      }`}>
      {props.children ?? '?'}
      <div className="hint-content absolute w-64 max-w-sm bg-primary-900 font-normal text-white text-xxs p-2 z-40 isolate top-7 -right-3 shadow-lg rounded-md">
        {tip}
        <div className="absolute w-4 h-4 bg-primary-900 transform rotate-45 -top-1 right-3"></div>
      </div>
    </span>
  );
};

export default Hint;
