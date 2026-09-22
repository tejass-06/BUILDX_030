import React, { ReactNode } from 'react';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  semanticType?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trendText,
  trendDirection,
  semanticType = 'default',
  className = '',
}) => {
  return (
    <Card className={`ns-stat-card ns-stat-card--${semanticType} ${className}`}>
      <div className="ns-stat-card__body">
        <div className="ns-stat-card__meta">
          <p className="ns-stat-card__label text-muted">{label}</p>
          <p className="ns-stat-card__value">{value}</p>
          {trendText && (
            <p className={`ns-stat-card__trend ns-stat-card__trend--${trendDirection || 'neutral'}`}>
              {trendText}
            </p>
          )}
        </div>
        {icon && <div className="ns-stat-card__icon-wrapper">{icon}</div>}
      </div>
    </Card>
  );
};
