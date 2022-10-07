import React from 'react';

interface SafeListItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonLabel?: string;
  label: string;
}

const SafesListItem = ({ buttonLabel = 'Import', label, ...props }: SafeListItemProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-3.5 py-3 border-b border-neutral-200">
      <div className="flex flex-row items-center gap-3.5">
        <div className="bg-neutral-200 rounded-full p-2">
          <img src="/icons/safe.png" className="w-8 h-8" />
        </div>
        <p className="text-sm font-bold text-neutral-600">{label}</p>
      </div>
      <button className="small primary" onClick={props.onClick}>
        {buttonLabel}
      </button>
    </div>
  );
};

export default SafesListItem;
