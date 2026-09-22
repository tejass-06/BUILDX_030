import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`ns-empty-state ${className}`}>
      <div className="ns-empty-state__icon-box">
        {icon || <Inbox size={32} className="text-muted" />}
      </div>
      <h3 className="ns-empty-state__title">{title}</h3>
      <p className="ns-empty-state__desc text-muted">{description}</p>
      {actionLabel && onAction && (
        <div className="ns-empty-state__action">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
