import React, { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, children, id, className = '', ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasError = Boolean(error);

    return (
      <div className={`ns-form-group ${hasError ? 'ns-form-group--error' : ''} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="ns-label">
            {label}
            {props.required && <span className="ns-label__required" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="ns-select-wrapper">
          <select
            id={selectId}
            ref={ref}
            className="ns-select"
            aria-invalid={hasError}
            aria-describedby={
              hasError && selectId
                ? `${selectId}-error`
                : helperText && selectId
                ? `${selectId}-helper`
                : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="ns-select-chevron" size={16} aria-hidden="true" />
        </div>
        {error && (
          <p id={selectId ? `${selectId}-error` : undefined} className="ns-form-error" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={selectId ? `${selectId}-helper` : undefined} className="ns-form-helper">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
