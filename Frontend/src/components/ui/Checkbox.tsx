import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, id, className = '', checked, ...props }, ref) => {
    const checkboxId = id || `cb-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <label htmlFor={checkboxId} className={`ns-checkbox-label ${className}`}>
        <div className="ns-checkbox-box-wrapper">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            checked={checked}
            className="ns-checkbox-input sr-only"
            {...props}
          />
          <div className={`ns-checkbox-box ${checked ? 'ns-checkbox-box--checked' : ''}`}>
            {checked && <Check size={13} strokeWidth={3} className="ns-checkbox-icon" />}
          </div>
        </div>
        <div className="ns-checkbox-text">
          <span className="ns-checkbox-title">{label}</span>
          {description && <span className="ns-checkbox-desc text-muted">{description}</span>}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
