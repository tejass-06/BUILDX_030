import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, id, className = '', checked, ...props }, ref) => {
    const radioId = id || `radio-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <label htmlFor={radioId} className={`ns-radio-label ${className}`}>
        <div className="ns-radio-circle-wrapper">
          <input
            type="radio"
            id={radioId}
            ref={ref}
            checked={checked}
            className="ns-radio-input sr-only"
            {...props}
          />
          <div className={`ns-radio-circle ${checked ? 'ns-radio-circle--checked' : ''}`}>
            {checked && <div className="ns-radio-inner-dot" />}
          </div>
        </div>
        <div className="ns-radio-text">
          <span className="ns-radio-title">{label}</span>
          {description && <span className="ns-radio-desc text-muted">{description}</span>}
        </div>
      </label>
    );
  }
);

Radio.displayName = 'Radio';
