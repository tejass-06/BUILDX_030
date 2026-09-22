import React, { ReactNode } from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig: Record<AlertVariant, { icon: ReactNode; defaultTitle: string }> = {
  info: {
    icon: <Info size={18} className="ns-alert__icon" aria-hidden="true" />,
    defaultTitle: 'Notice',
  },
  success: {
    icon: <CheckCircle2 size={18} className="ns-alert__icon" aria-hidden="true" />,
    defaultTitle: 'Success',
  },
  warning: {
    icon: <AlertTriangle size={18} className="ns-alert__icon" aria-hidden="true" />,
    defaultTitle: 'Warning',
  },
  error: {
    icon: <AlertCircle size={18} className="ns-alert__icon" aria-hidden="true" />,
    defaultTitle: 'Attention Required',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const { icon, defaultTitle } = variantConfig[variant];

  return (
    <div
      className={`ns-alert ns-alert--${variant} ${className}`.trim()}
      role="alert"
    >
      <div className="ns-alert__icon-container">{icon}</div>
      <div className="ns-alert__body">
        <h4 className="ns-alert__title">{title || defaultTitle}</h4>
        <div className="ns-alert__content">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ns-alert__close-btn"
          aria-label="Dismiss alert"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
