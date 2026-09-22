import React from 'react';
import { Check } from 'lucide-react';

export interface StepProgressProps {
  currentStep: 1 | 2 | 3 | 4;
  className?: string;
}

const steps = [
  { step: 1, label: 'Report' },
  { step: 2, label: 'Understand' },
  { step: 3, label: 'Similar Reports' },
  { step: 4, label: 'Submit' },
];

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep, className = '' }) => {
  return (
    <nav aria-label="Progress" className={`ns-step-progress ${className}`}>
      <ol className="ns-step-progress__list">
        {steps.map((item, idx) => {
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;

          return (
            <li key={item.step} className="ns-step-progress__item">
              <div
                className={`ns-step-progress__indicator ${
                  isDone
                    ? 'ns-step-progress__indicator--done'
                    : isCurrent
                    ? 'ns-step-progress__indicator--current'
                    : ''
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? (
                  <Check size={12} strokeWidth={3} aria-hidden="true" />
                ) : (
                  <span>{item.step}</span>
                )}
              </div>
              <span
                className={`ns-step-progress__label ${
                  isCurrent ? 'ns-step-progress__label--current' : ''
                }`}
              >
                {item.label}
              </span>
              {idx < steps.length - 1 && (
                <div
                  className={`ns-step-progress__line ${
                    isDone ? 'ns-step-progress__line--done' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
