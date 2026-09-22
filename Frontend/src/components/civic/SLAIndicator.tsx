import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { SLAData } from '../../types';

export interface SLAIndicatorProps {
  sla: SLAData;
  isResolved?: boolean;
  className?: string;
}

export const SLAIndicator: React.FC<SLAIndicatorProps> = ({
  sla,
  isResolved = false,
  className = '',
}) => {
  if (isResolved) {
    return (
      <span className={`ns-sla-badge ns-sla-badge--success ${className}`}>
        <CheckCircle2 size={13} aria-hidden="true" />
        <span>Resolved Within SLA</span>
      </span>
    );
  }

  if (sla.isBreached) {
    return (
      <span className={`ns-sla-badge ns-sla-badge--breached ${className}`} role="status">
        <AlertCircle size={13} aria-hidden="true" />
        <span className="font-semibold">SLA Breached</span>
        <span className="ns-sla-badge__sub">({sla.targetHours}h exceeded)</span>
      </span>
    );
  }

  if (sla.isApproaching) {
    return (
      <span className={`ns-sla-badge ns-sla-badge--approaching ${className}`} role="status">
        <Clock size={13} aria-hidden="true" />
        <span className="font-semibold">{sla.remainingHours}h remaining</span>
        <span className="ns-sla-badge__sub">(SLA Approaching)</span>
      </span>
    );
  }

  return (
    <span className={`ns-sla-badge ns-sla-badge--ontrack ${className}`} role="status">
      <Clock size={13} aria-hidden="true" />
      <span>{sla.remainingHours}h remaining</span>
      <span className="ns-sla-badge__sub">(On Track)</span>
    </span>
  );
};
