interface HintProps {
  tip: string;
}
const Hint = ({ tip }: HintProps) => {
  return (
    <span
      className="flex items-center justify-center rounded-full p-1 font-bold text-xs text-neutral-500 border border-gray-200 bg-gray-50 w-4 h-4"
      data-tip={tip}>
      ?
    </span>
  );
};

export default Hint;
