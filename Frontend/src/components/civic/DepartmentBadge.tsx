import React from 'react';
import { Building2 } from 'lucide-react';

export interface DepartmentBadgeProps {
  code: string;
  name?: string;
  showIcon?: boolean;
  className?: string;
}

export const DepartmentBadge: React.FC<DepartmentBadgeProps> = ({
  code,
  name,
  showIcon = true,
  className = '',
}) => {
  return (
    <span className={`ns-dept-badge ${className}`}>
      {showIcon && <Building2 size={13} className="ns-dept-badge__icon" aria-hidden="true" />}
      <span className="ns-dept-badge__code">{code}</span>
      {name && <span className="ns-dept-badge__name">· {name}</span>}
    </span>
  );
};
