import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { ComplaintStatus } from '../../types';

export interface TimelineStep {
  key: ComplaintStatus | 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'verified';
  label: string;
  description?: string;
  timestamp?: string;
}

export interface TimelineProps {
  currentStatus: ComplaintStatus;
  customSteps?: TimelineStep[];
  className?: string;
}

const defaultWorkflowSteps: { key: ComplaintStatus; label: string; desc: string }[] = [
  { key: 'submitted', label: 'Report Submitted', desc: 'Received and registered' },
  { key: 'ai_analyzed', label: 'AI Intelligence', desc: 'Understood & duplicate checked' },
  { key: 'assigned', label: 'Officer Assigned', desc: 'Routed to competent authority' },
  { key: 'in_progress', label: 'Work In Progress', desc: 'Field inspection & repair underway' },
  { key: 'resolved', label: 'Resolution Uploaded', desc: 'Officer evidence submitted' },
  { key: 'citizen_confirmed', label: 'Citizen Confirmed', desc: 'Verified & closed' },
];

const statusOrder: ComplaintStatus[] = [
  'submitted',
  'ai_analyzed',
  'assigned',
  'in_progress',
  'resolved',
  'ai_verified',
  'citizen_confirmed',
];

export const Timeline: React.FC<TimelineProps> = ({
  currentStatus,
  className = '',
}) => {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isReopened = currentStatus === 'reopened';

  return (
    <div className={`ns-timeline ${className}`} role="list" aria-label="Complaint progress timeline">
      {defaultWorkflowSteps.map((step, idx) => {
        const stepTargetIndex = statusOrder.indexOf(step.key);
        const isCompleted = !isReopened && currentIndex > stepTargetIndex;
        const isCurrent = !isReopened && (currentIndex === stepTargetIndex || (step.key === 'resolved' && currentStatus === 'ai_verified'));

        let stepStateClass = 'ns-timeline__step--pending';
        if (isCompleted) stepStateClass = 'ns-timeline__step--completed';
        if (isCurrent) stepStateClass = 'ns-timeline__step--current';

        return (
          <div
            key={step.key}
            className={`ns-timeline__step ${stepStateClass}`}
            role="listitem"
            aria-current={isCurrent ? 'step' : undefined}
          >
            <div className="ns-timeline__marker-col">
              <div className="ns-timeline__node">
                {isCompleted ? (
                  <Check size={12} strokeWidth={3} className="ns-timeline__check-icon" />
                ) : isCurrent ? (
                  <div className="ns-timeline__pulse-dot" />
                ) : (
                  <span className="ns-timeline__step-num">{idx + 1}</span>
                )}
              </div>
              {idx < defaultWorkflowSteps.length - 1 && <div className="ns-timeline__connector" />}
            </div>

            <div className="ns-timeline__content">
              <p className="ns-timeline__title">{step.label}</p>
              <p className="ns-timeline__desc text-muted">{step.desc}</p>
            </div>
          </div>
        );
      })}

      {isReopened && (
        <div className="ns-timeline__step ns-timeline__step--reopened" role="listitem">
          <div className="ns-timeline__marker-col">
            <div className="ns-timeline__node ns-timeline__node--reopened">
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="ns-timeline__content">
            <p className="ns-timeline__title text-error font-semibold">Complaint Reopened</p>
            <p className="ns-timeline__desc text-muted">Citizen reported problem persists</p>
          </div>
        </div>
      )}
    </div>
  );
};
