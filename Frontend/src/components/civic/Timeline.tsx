import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { ComplaintStatus } from '../../types';

export interface TimelineStep {
  key: ComplaintStatus | 'closed';
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
  { key: 'submitted', label: 'Submitted', desc: 'Complaint received & registered' },
  { key: 'assigned', label: 'Assigned', desc: 'Assigned to Orange City Water' },
  { key: 'in_progress', label: 'In Progress', desc: 'Field team working on reported pipeline issue' },
  { key: 'resolved', label: 'Resolution', desc: 'Awaiting officer completion' },
  { key: 'closed', label: 'Citizen Verification', desc: 'Verified & closed' },
];

const statusOrder: ComplaintStatus[] = [
  'submitted',
  'ai_analyzed',
  'assigned',
  'in_progress',
  'resolved',
  'ai_verified',
  'citizen_confirmed',
  'closed',
];

export const Timeline: React.FC<TimelineProps> = ({
  currentStatus,
  customSteps,
  className = '',
}) => {
  const stepsToRender = customSteps || defaultWorkflowSteps;
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isReopened = currentStatus === 'reopened';

  return (
    <div className={`ns-timeline ${className}`} role="list" aria-label="Complaint progress timeline">
      {stepsToRender.map((step, idx) => {
        const stepTargetIndex = statusOrder.indexOf(step.key as ComplaintStatus);
        const isCompleted = !isReopened && (
          currentIndex > stepTargetIndex ||
          (step.key === 'resolved' && (currentStatus === 'closed' || currentStatus === 'citizen_confirmed')) ||
          (step.key === 'closed' && (currentStatus === 'closed' || currentStatus === 'citizen_confirmed'))
        );
        const isCurrent = !isReopened && (
          currentIndex === stepTargetIndex ||
          (step.key === 'resolved' && (currentStatus === 'resolved' || currentStatus === 'ai_verified')) ||
          (step.key === 'closed' && (currentStatus === 'closed' || currentStatus === 'citizen_confirmed'))
        );

        let descText = 'desc' in step ? (step as any).desc : step.description;
        if (step.key === 'resolved' && (currentStatus === 'resolved' || currentStatus === 'closed')) {
          descText = 'Field repair completed & verified';
        }
        if (step.key === 'closed' && currentStatus === 'resolved') {
          descText = 'Awaiting citizen verification';
        }

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
              <p className="ns-timeline__desc text-muted">{descText}</p>
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
