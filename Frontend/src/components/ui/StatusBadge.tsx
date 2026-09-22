import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ArrowRightCircle,
  Copy,
  UserCheck,
} from 'lucide-react';
import { ComplaintStatus } from '../../types';

export type StatusType =
  | ComplaintStatus
  | 'sla_breached'
  | 'sla_approaching'
  | 'sla_on_track'
  | 'active'
  | 'mitigated';

export interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  className?: string;
}

interface StatusConfig {
  label: string;
  themeClass: 'success' | 'warning' | 'error' | 'primary' | 'neutral';
  icon: React.ReactNode;
}

const statusConfigMap: Record<StatusType, StatusConfig> = {
  submitted: {
    label: 'Submitted',
    themeClass: 'neutral',
    icon: <Clock size={12} aria-hidden="true" />,
  },
  ai_analyzed: {
    label: 'AI Understood',
    themeClass: 'primary',
    icon: <Sparkles size={12} aria-hidden="true" />,
  },
  duplicate_flagged: {
    label: 'Duplicate Linked',
    themeClass: 'neutral',
    icon: <Copy size={12} aria-hidden="true" />,
  },
  assigned: {
    label: 'Officer Assigned',
    themeClass: 'primary',
    icon: <ArrowRightCircle size={12} aria-hidden="true" />,
  },
  in_progress: {
    label: 'In Progress',
    themeClass: 'primary',
    icon: <Clock size={12} aria-hidden="true" />,
  },
  resolved: {
    label: 'Resolved',
    themeClass: 'success',
    icon: <CheckCircle2 size={12} aria-hidden="true" />,
  },
  ai_verified: {
    label: 'AI Verified',
    themeClass: 'success',
    icon: <CheckCircle2 size={12} aria-hidden="true" />,
  },
  citizen_confirmed: {
    label: 'Citizen Confirmed',
    themeClass: 'success',
    icon: <UserCheck size={12} aria-hidden="true" />,
  },
  closed: {
    label: 'Closed',
    themeClass: 'success',
    icon: <CheckCircle2 size={12} aria-hidden="true" />,
  },
  reopened: {
    label: 'Reopened',
    themeClass: 'error',
    icon: <AlertCircle size={12} aria-hidden="true" />,
  },
  sla_breached: {
    label: 'SLA Breached',
    themeClass: 'error',
    icon: <AlertCircle size={12} aria-hidden="true" />,
  },
  sla_approaching: {
    label: 'SLA Approaching',
    themeClass: 'warning',
    icon: <AlertTriangle size={12} aria-hidden="true" />,
  },
  sla_on_track: {
    label: 'SLA On Track',
    themeClass: 'success',
    icon: <CheckCircle2 size={12} aria-hidden="true" />,
  },
  active: {
    label: 'Active Conflict',
    themeClass: 'error',
    icon: <AlertTriangle size={12} aria-hidden="true" />,
  },
  mitigated: {
    label: 'Mitigated',
    themeClass: 'success',
    icon: <CheckCircle2 size={12} aria-hidden="true" />,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  className = '',
}) => {
  const config = statusConfigMap[status] || {
    label: status,
    themeClass: 'neutral',
    icon: <Clock size={12} aria-hidden="true" />,
  };

  return (
    <span
      className={`ns-status-badge ns-status-badge--${config.themeClass} ${className}`.trim()}
      role="status"
    >
      <span className="ns-status-badge__icon">{config.icon}</span>
      <span className="ns-status-badge__label">{customLabel || config.label}</span>
    </span>
  );
};
