import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCharCount, maxLength, value, id, className = '', ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasError = Boolean(error);
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className={`ns-form-group ${hasError ? 'ns-form-group--error' : ''} ${className}`}>
        <div className="ns-label-row">
          {label && (
            <label htmlFor={textareaId} className="ns-label">
              {label}
              {props.required && <span className="ns-label__required" aria-hidden="true">*</span>}
            </label>
          )}
          {showCharCount && maxLength && (
            <span className="ns-char-count" aria-live="polite">
              {charCount} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          className="ns-textarea"
          maxLength={maxLength}
          value={value}
          aria-invalid={hasError}
          aria-describedby={
            hasError && textareaId
              ? `${textareaId}-error`
              : helperText && textareaId
              ? `${textareaId}-helper`
              : undefined
          }
          {...props}
        />
        {error && (
          <p id={textareaId ? `${textareaId}-error` : undefined} className="ns-form-error" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={textareaId ? `${textareaId}-helper` : undefined} className="ns-form-helper">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
