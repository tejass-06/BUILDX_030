import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`ns-spinner-wrapper ${className}`} role="status">
      <div className={`ns-spinner ns-spinner--${size}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '1rem',
  width = '100%',
  borderRadius = 'var(--radius-sm)',
  className = '',
}) => {
  return (
    <div
      className={`ns-skeleton ${className}`}
      style={{ height, width, borderRadius }}
      aria-hidden="true"
    />
  );
};

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading NagarSaathi intelligence...',
}) => {
  return (
    <div className="ns-loading-state" role="status">
      <Spinner size="lg" />
      <p className="ns-loading-state__text text-muted font-medium">{message}</p>
    </div>
  );
};
