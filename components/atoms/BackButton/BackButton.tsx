import Link from 'next/link';
import React from 'react';

interface BackButtonProps {
  label: string;
  href: string;
}

const BackButton = ({ label, href }: BackButtonProps) => {
  return (
    <Link href={href}>
      <span className="inline-flex flex-row items-center gap-2 text-neutral-500 cursor-pointer group">
        <img
          src="/icons/arrow-small-left.svg"
          alt={label}
          className="fill-current w-6 h-6 transition-all group-hover:-translate-x-1"
        />
        {label}
      </span>
    </Link>
  );
};

export default BackButton;
