import type { PropsWithChildren } from 'react';

export type TypographyVariant = 'inter' | 'sora';

export type TypographySize = 'title' | 'subtitle' | 'paragraph' | 'base' | 'body' | 'caption' | 'small';

export interface TypographyProps extends PropsWithChildren {
  variant?: TypographyVariant;
  size?: TypographySize;
  className?: string;
}

/**
 * Refer `styles/typography.css`
 *
 * returns typography font-size & line-height
 */
export const getFontSize = (size: TypographySize) => {
  switch (size) {
    case 'title':
      return 'text-title leading-title';
    case 'subtitle':
      return 'text-subtitle leading-subtitle';
    case 'paragraph':
      return 'text-paragraph leading-paragraph';
    case 'base':
      return 'text-base leading-base';
    case 'body':
      return 'text-body leading-body';
    case 'caption':
      return 'text-caption leading-caption';
    case 'small':
      return 'text-small leading-small';
    default:
      throw 'Wrong Typography Size ' + size;
  }
};
