import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Search complaints, officers, or locations...', className = '', ...props }, ref) => {
    const hasValue = Boolean(value);

    return (
      <div className={`ns-search-input-wrapper ${className}`}>
        <Search className="ns-search-icon" size={18} aria-hidden="true" />
        <input
          type="search"
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="ns-search-input"
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="ns-search-clear-btn"
            aria-label="Clear search text"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
