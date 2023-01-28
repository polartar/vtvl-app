import PlusIconImage from 'assets/icons/plus-icon.png';
import Image from 'next/image';
import React from 'react';

export interface IconProps {
  className?: string;
  onClick?: () => void;
  width?: string | number;
  height?: string | number;
}

export const TrashIcon: React.FC<IconProps> = ({ className = '', ...props }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <path
        d="M6 8h12M16.666 8v9.334a1.333 1.333 0 0 1-1.333 1.333H8.666a1.334 1.334 0 0 1-1.333-1.333V8.001m2 0V6.667a1.333 1.333 0 0 1 1.333-1.333h2.667a1.333 1.333 0 0 1 1.333 1.333v1.334M10.667 11.334v4M13.333 11.334v4"
        stroke="#B91C1C"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ArrowLeftIcon: React.FC<IconProps> = ({ className = '', ...props }) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <path
        d="M4.00016 8C4.00341 8.35074 4.14473 8.68607 4.3935 8.93334L7.2535 11.8C7.3784 11.9242 7.54737 11.9939 7.7235 11.9939C7.89962 11.9939 8.06859 11.9242 8.1935 11.8C8.25598 11.738 8.30558 11.6643 8.33942 11.5831C8.37327 11.5018 8.39069 11.4147 8.39069 11.3267C8.39069 11.2387 8.37327 11.1515 8.33942 11.0703C8.30558 10.989 8.25598 10.9153 8.1935 10.8533L6.00016 8.66667L12.6668 8.66667C12.8436 8.66667 13.0132 8.59643 13.1382 8.47141C13.2633 8.34638 13.3335 8.17682 13.3335 8C13.3335 7.82319 13.2633 7.65362 13.1382 7.5286C13.0132 7.40358 12.8436 7.33334 12.6668 7.33334L6.00016 7.33334L8.1935 5.14C8.31903 5.01535 8.38991 4.84594 8.39053 4.66903C8.39116 4.49212 8.32148 4.32221 8.19683 4.19667C8.07218 4.07113 7.90276 4.00026 7.72585 3.99963C7.54894 3.99901 7.37903 4.06869 7.2535 4.19334L4.3935 7.06C4.1431 7.3089 4.00165 7.64695 4.00016 8Z"
        fill="#667085"
      />
    </svg>
  );
};

export const PlusIcon: React.FC<IconProps> = ({ className = '' }) => {
  return (
    <span className={className}>
      <Image src={PlusIconImage} alt="plus-icon" />
    </span>
  );
};
