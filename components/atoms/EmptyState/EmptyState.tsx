import React from 'react';

interface IEmptyStateProps extends React.BaseHTMLAttributes<HTMLDivElement> {
  image?: string | JSX.Element;
  imageSize?: 'small' | 'default' | 'large';
  imageBlend?: boolean;
  title?: string;
  description?: string | string[] | JSX.Element | JSX.Element[];
}

interface IImageRendererProps extends React.BaseHTMLAttributes<HTMLDivElement> {
  blend: boolean;
}

const ImageRenderer = ({ blend = true, ...props }: IImageRendererProps) => {
  return blend ? (
    <div className="relative bg-white">
      <div className="absolute inset-0 bg-primary-900 mix-blend-color"></div>
      {props.children}
    </div>
  ) : (
    <>{props.children}</>
  );
};

const EmptyState = ({
  image = '',
  imageSize = 'default',
  imageBlend = true,
  title = '',
  description = '',
  ...props
}: IEmptyStateProps) => {
  const sizes = {
    small: 'h-28',
    default: 'h-72',
    large: 'h-96'
  };
  return (
    <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
      {image && typeof image === 'string' ? (
        <ImageRenderer blend={imageBlend}>
          <img src={image} alt={title} className={`mb-3.5 ${sizes[imageSize]}`} />
        </ImageRenderer>
      ) : image ? (
        <div className="mb-3.5">{image}</div>
      ) : null}
      {title ? <h2 className="h5 font-medium text-neutral-900 text-center mb-2">{title}</h2> : null}
      {description ? <p className="text-neutral-500 text-center mb-8">{description}</p> : null}
      <div className="flex flex-row items-center justify-center gap-2 flex-wrap">{props.children}</div>
    </div>
  );
};

export default EmptyState;
