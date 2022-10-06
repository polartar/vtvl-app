import React from 'react';
import LoadingBar from 'react-top-loading-bar';

interface LoaderProps {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  progress: number;
  onComplete?: () => void;
}

/**
 * Refer to https://klendi.github.io/react-top-loading-bar/ for the LoadingBar component usage
 */
export const Loader = ({
  progress = 0,
  color = 'primary',
  onComplete = () => {
    console.log('onComolete');
  },
  ...props
}: LoaderProps) => {
  const colors = {
    primary: 'var(--primary-900)',
    secondary: 'var(--secondary-900)',
    danger: 'var(--danger-500)',
    success: 'var(--success-500)',
    warning: 'var(--warning-500)'
  };
  return (
    <LoadingBar {...props} progress={progress} color={colors[color] || colors.primary} onLoaderFinished={onComplete} />
  );
};
