import React, { ReactNode } from 'react';
import { Breadcrumb, BreadcrumbItem } from '../ui/Breadcrumb';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface PlaceholderPageProps {
  title: string;
  section: 'Citizen Experience' | 'Officer Experience' | 'Command Center' | 'System';
  description: string;
  workflowStage?: string;
  breadcrumbs: BreadcrumbItem[];
  children?: ReactNode;
  icon?: ReactNode;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  section,
  description,
  workflowStage,
  breadcrumbs,
  children,
  icon,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                {section}
              </span>
              {workflowStage && (
                <Badge variant="neutral" size="sm">
                  Workflow: {workflowStage}
                </Badge>
              )}
            </div>
            <h1>{title}</h1>
            <p className="text-muted text-sm mt-1">{description}</p>
          </div>
        </div>

        <span className="ns-status-badge ns-status-badge--neutral">
          Phase 1 Foundation Ready
        </span>
      </div>

      {children ? (
        <div className="mt-2">{children}</div>
      ) : (
        <Card className="mt-2">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm font-medium text">
              This screen is provisioned with scalable layout, routing, and mock data foundation.
            </p>
            <p className="text-xs text-muted mt-1 max-width-md">
              Full feature implementation belongs to Phase 2 per specification constraints.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
