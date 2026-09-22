import React, { HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
  ...props
}) => {
  return (
    <hr
      className={`ns-divider ns-divider--${orientation} ns-divider--spacing-${spacing} ${className}`.trim()}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
};
