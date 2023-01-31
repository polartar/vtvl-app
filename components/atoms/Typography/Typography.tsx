import React from 'react';

import { TypographyProps, getFontSize } from './utils';

export const Typography: React.FC<TypographyProps> = ({
  variant = 'inter',
  size = 'base',
  className = '',
  children
}) => {
  const classNames = [variant === 'inter' ? '.inter' : '.sora', getFontSize(size), className].join(' ');

  return <span className={classNames}>{children}</span>;
};
