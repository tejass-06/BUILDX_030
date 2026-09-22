import React, { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  onChange,
  className = '',
}) => {
  return (
    <div className={`ns-tabs-container ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`ns-tab-btn ${isActive ? 'ns-tab-btn--active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span className="ns-tab-btn__icon">{tab.icon}</span>}
            <span className="ns-tab-btn__label">{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`ns-tab-btn__badge ${isActive ? 'ns-tab-btn__badge--active' : ''}`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
