import ArrowSmallSvg from '@assets/icons/arrow-small-left.svg';
import Link from 'next/link';
import React from 'react';

interface BackButtonProps {
  label: string;
  href: string;
}

export const BackButton = ({ label, href }: BackButtonProps) => {
  return (
    <Link href={href}>
      <span className="inline-flex flex-row items-center gap-2 text-neutral-500 cursor-pointer group">
        <img
          src={ArrowSmallSvg}
          alt={label}
          className="fill-current w-4 h-4 transition-all group-hover:-translate-x-1"
        />
        {label}
      </span>
    </Link>
  );
};
