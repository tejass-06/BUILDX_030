import React from 'react';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`ns-avatar ns-avatar--${size} ${className}`.trim()}
      aria-label={name}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="ns-avatar__img" />
      ) : (
        <span className="ns-avatar__initials">{getInitials(name)}</span>
      )}
    </div>
  );
};
