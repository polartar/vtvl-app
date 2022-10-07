import React from 'react';

interface EmptyStateProps extends React.BaseHTMLAttributes<HTMLDivElement> {
  image?: string;
  title?: string;
  description?: any;
}

const EmptyState = ({ image = '', title = '', description = '', ...props }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 max-w-sm">
      {image ? <img src={image} alt={title} className="w-72" /> : null}
      {title ? <h2 className="h5 font-medium text-neutral-900">{title}</h2> : null}
      {description ? <p className="text-neutral-500 text-center">{description}</p> : null}
      <div className="flex flex-row items-center justify-center gap-2 flex-wrap">{props.children}</div>
    </div>
  );
};

export default EmptyState;
