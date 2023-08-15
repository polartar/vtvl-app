import React from 'react';

interface SafeListItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonLabel?: string;
  label: string | JSX.Element;
  selected?: boolean;
  selectedLabel?: string;
}

const SafesListItem = ({
  buttonLabel = 'Import',
  label,
  selected = false,
  selectedLabel = '',
  ...props
}: SafeListItemProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-3 py-3 border-b border-neutral-200">
      <div className="flex flex-row items-center gap-3">
        <div className="bg-neutral-200 rounded-full p-2 flex-shrink-0">
          <img src="/icons/safe.png" className="w-5 h-5" />
        </div>
        <div className="text-sm font-bold text-neutral-600 break-all">{label}</div>
      </div>
      <button
        type="button"
        disabled={selected || props.disabled}
        className="small primary flex-shrink-0"
        onClick={props.onClick}>
        {selected ? selectedLabel : buttonLabel}
      </button>
    </div>
  );
};

export default SafesListItem;
