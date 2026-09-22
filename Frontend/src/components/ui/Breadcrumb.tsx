import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`ns-breadcrumb ${className}`}>
      <ol className="ns-breadcrumb__list">
        <li className="ns-breadcrumb__item">
          <Link to="/" className="ns-breadcrumb__link" aria-label="NagarSaathi Home">
            <Home size={14} aria-hidden="true" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="ns-breadcrumb__item">
              <ChevronRight size={14} className="ns-breadcrumb__separator" aria-hidden="true" />
              {isLast || !item.to ? (
                <span className="ns-breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="ns-breadcrumb__link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
