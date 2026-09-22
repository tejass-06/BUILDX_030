import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, id, className = '', ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasError = Boolean(error);

    return (
      <div className={`ns-form-group ${hasError ? 'ns-form-group--error' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="ns-label">
            {label}
            {props.required && <span className="ns-label__required" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="ns-input-wrapper">
          {leftIcon && <span className="ns-input-icon ns-input-icon--left">{leftIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            className={`ns-input ${leftIcon ? 'ns-input--has-left-icon' : ''} ${rightIcon ? 'ns-input--has-right-icon' : ''}`}
            aria-invalid={hasError}
            aria-describedby={
              hasError && inputId
                ? `${inputId}-error`
                : helperText && inputId
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
          {rightIcon && <span className="ns-input-icon ns-input-icon--right">{rightIcon}</span>}
        </div>
        {error && (
          <p id={inputId ? `${inputId}-error` : undefined} className="ns-form-error" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={inputId ? `${inputId}-helper` : undefined} className="ns-form-helper">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
