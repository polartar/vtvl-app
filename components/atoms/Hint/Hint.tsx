interface HintProps {
  tip: string | JSX.Element | JSX.Element[];
}
const Hint = ({ tip }: HintProps) => {
  return (
    <span className="hint relative flex items-center justify-center rounded-full p-1 font-bold text-xs text-neutral-500 border border-gray-200 bg-gray-50 w-4 h-4 cursor-pointer">
      ?
      <div className="hint-content absolute w-64 max-w-sm bg-primary-900 font-normal text-white text-xxs p-2 z-40 isolate top-7 -right-3 shadow-lg">
        {tip}
        <div className="absolute w-4 h-4 bg-primary-900 transform rotate-45 -top-1 right-3"></div>
      </div>
    </span>
  );
};

export default Hint;
