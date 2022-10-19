import ArrowIcon from 'public/icons/arrow-small-left.svg';
import React from 'react';

interface BackButtonProps {
  label: string;
  onClick?: () => void;
}

const BackButton = ({ label, onClick }: BackButtonProps) => {
  return (
    <div onClick={onClick}>
      <span className="inline-flex flex-row items-center gap-2 text-neutral-500 cursor-pointer group">
        <ArrowIcon alt={label} className="fill-current w-3 h-3 transition-all group-hover:-translate-x-1" />
        {label}
      </span>
    </div>
  );
};

export default BackButton;
