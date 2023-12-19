import React from 'react';

interface HintProps extends React.AllHTMLAttributes<HTMLAllCollection> {
  tip: string | JSX.Element | JSX.Element[];
}
const Hint = ({ tip, ...props }: HintProps) => {
  return (
    <span
      className={`hint relative flex items-center justify-center font-bold text-xxs text-neutral-500 cursor-pointer ${
        props.children ? '' : 'p-1 rounded-full border border-neutral-500 w-3.5 h-3.5'
      }`}>
      {props.children ?? '?'}
      <div className="hint-content absolute w-64 max-w-sm font-normal text-white text-xxs p-3 z-40 isolate top-7 -right-3">
        <p className="relative z-20 isolate">{tip}</p>
        <div className="absolute top-0 left-0 w-full h-full bg-neutral-900 opacity-75 rounded-md isolate z-10"></div>
        <div className="absolute w-0 h-0 border-l-8 border-l-transparent border-b-8 border-b-neutral-900 border-r-8 border-r-transparent opacity-75 -top-2 right-3"></div>
      </div>
    </span>
  );
};

export default Hint;
