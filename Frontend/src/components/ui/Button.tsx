import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'ns-btn';
  const variantClass = `ns-btn--${variant}`;
  const sizeClass = `ns-btn--${size}`;
  const loadingClass = isLoading ? 'ns-btn--loading' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="ns-btn__spinner" aria-hidden="true" />}
      {!isLoading && leftIcon && <span className="ns-btn__icon-left">{leftIcon}</span>}
      <span className="ns-btn__text">{children}</span>
      {!isLoading && rightIcon && <span className="ns-btn__icon-right">{rightIcon}</span>}
    </button>
  );
};
