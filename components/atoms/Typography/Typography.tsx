import React from 'react';

import { TypographyProps, getFontSize } from './utils';

export const Typography: React.FC<TypographyProps> = ({
  variant = 'inter',
  size = 'base',
  className = '',
  children
}) => {
  const classNames = [variant, getFontSize(size), className].join(' ');

  // Add a11y for the typography
  switch (size) {
    case 'title':
      return <h1 className={classNames}>{children}</h1>;
    case 'subtitle':
      return <h2 className={classNames}>{children}</h2>;
    case 'paragraph':
      return <p className={classNames}>{children}</p>;
    default:
      return <span className={classNames}>{children}</span>;
  }
};
