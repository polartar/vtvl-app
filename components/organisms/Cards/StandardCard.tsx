import { Typography } from '@components/atoms/Typography/Typography';
import React from 'react';
import { truncateComma } from 'utils';
import { formatNumber } from 'utils/token';

export interface StandardCardProps {
  isLoading?: boolean;
  icon?: React.ReactElement;
  title: string;
  content: string;
  contentType?: 'text' | 'number' | 'compact';
  contentIcon?: React.ReactElement;
  className?: string;
  isCaret?: boolean;
}

const renderContent = (content: string, contentType: 'text' | 'number' | 'compact') => {
  if (contentType === 'text') return content;
  if (contentType === 'number') return formatNumber(Number(truncateComma(content)));
  if (contentType === 'compact') return Intl.NumberFormat('en', { notation: 'compact' }).format(Number(content));
};

export default function StandardCard({
  isLoading = false,
  title,
  content,
  icon,
  contentType = 'text',
  contentIcon,
  className,
  isCaret
}: StandardCardProps) {
  return (
    <div className={`border border-primary-50 rounded-10 py-4 px-6 font-medium ${className}`}>
      <div className="flex items-center gap-1 mb-1 text-neutral-500">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="bg-neutral-100 h-[22px] w-100 rounded-10"></div>
          </div>
        ) : (
          <>
            {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
            <Typography variant="inter" size="body">
              {title}
            </Typography>
          </>
        )}
      </div>
      <div className="flex justify-start items-center gap-4">
        {isLoading ? (
          <div className="animate-pulse mt-2">
            <div className="bg-neutral-100 h-[33px] w-150 rounded-10"></div>
          </div>
        ) : (
          <>
            {contentIcon && <span className="flex items-center justify-center">{contentIcon}</span>}
            <Typography variant="inter" size="title" className="font-medium">
              {renderContent(content, contentType)}
            </Typography>
          </>
        )}
        {isCaret && <img src="/icons/caret-right-border.svg" alt="VTVL" aria-hidden="true" />}
      </div>
    </div>
  );
}
