import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import type { ComplaintStatus as ComplaintStatusType } from '../../types';

export interface ComplaintStatusProps {
  status: ComplaintStatusType;
  showIcon?: boolean;
  className?: string;
}

export const ComplaintStatus: React.FC<ComplaintStatusProps> = ({
  status,
  className = '',
}) => {
  return <StatusBadge status={status} className={className} />;
};
