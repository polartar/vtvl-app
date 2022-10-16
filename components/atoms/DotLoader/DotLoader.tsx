import React from 'react';

interface IDotLoaderProps {
  className?: string;
}

const DotLoader: React.FC<IDotLoaderProps> = ({ className }) => {
  return (
    <div className="inline-flex items-center">
      <div className={`loader-dot1 ${className}`} />
      <div className={`loader-dot2 ${className}`} />
      <div className={`loader-dot3 ${className}`} />
    </div>
  );
};

export default DotLoader;
