import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Civic Data',
  message = 'An error occurred while connecting to the NagarSaathi network. Please verify your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`ns-error-state ${className}`} role="alert">
      <div className="ns-error-state__icon-box">
        <AlertCircle size={32} className="text-error" />
      </div>
      <h3 className="ns-error-state__title">{title}</h3>
      <p className="ns-error-state__message text-muted">{message}</p>
      {onRetry && (
        <div className="ns-error-state__action">
          <Button
            variant="outline"
            size="md"
            onClick={onRetry}
            leftIcon={<RefreshCw size={16} />}
          >
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
