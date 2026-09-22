import React from 'react';
import { Building, TrendingUp } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { useComplaints } from '../../context/ComplaintContext';

export const DepartmentPerformancePage: React.FC = () => {
  const { departments } = useComplaints();

  return (
    <PlaceholderPage
      title="Department Civic Performance"
      section="Command Center"
      workflowStage="Governance & Accountability"
      description="Comparative telemetry measuring SLA fulfillment, backlog volume, and citizen satisfaction ratings by agency."
      breadcrumbs={[
        { label: 'Command Center', to: '/command-center' },
        { label: 'Department Performance' },
      ]}
      icon={<Building size={24} />}
    >
      <div className="flex flex-col gap-4">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardContent className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <DepartmentBadge code={dept.code} name={dept.name} />
                </div>
                <p className="text-xs text-muted">
                  Nodal Officer: {dept.headName} · Standard SLA: {dept.slaStandardHours}h · {dept.contactEmail}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-sm font-bold block">{dept.activeWorkload}</span>
                  <span className="text-xs text-muted">Active Work orders</span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-success block">
                    {dept.performanceScore}%
                  </span>
                  <span className="text-xs text-muted">SLA Compliance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PlaceholderPage>
  );
};
