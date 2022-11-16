import { useState } from 'react';

interface CollapsibleProps {
  title: string | JSX.Element | JSX.Element[];
  description: string | JSX.Element | JSX.Element[];
}
const CollapsibleContent = (props: CollapsibleProps) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex flex-row justify-between gap-6 my-4">
      <div>
        <h3 className="text-base font-medium text-gray-900 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          {props.title}
        </h3>
        {expanded ? <p className="text-sm text-gray-500 mt-2">{props.description}</p> : null}
      </div>
      <img
        src={`/icons/${!expanded ? 'plus' : 'minus'}-circle.svg`}
        alt={!expanded ? 'Expand' : 'Collapse'}
        className="cursor-pointer h-6 w-6"
        onClick={() => setExpanded(!expanded)}
      />
    </div>
  );
};

export default CollapsibleContent;
