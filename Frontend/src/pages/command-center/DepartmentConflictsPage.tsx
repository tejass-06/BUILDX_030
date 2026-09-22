import React from 'react';
import { GitMerge, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LocationRow } from '../../components/civic/LocationRow';
import { useComplaints } from '../../context/ComplaintContext';

export const DepartmentConflictsPage: React.FC = () => {
  const { conflicts } = useComplaints();

  return (
    <PlaceholderPage
      title="Inter-Department Conflict Coordination"
      section="Command Center"
      workflowStage="10. Department Conflict"
      description="Predictive conflict engine preventing costly infrastructure clashes (e.g., pipeline trenching immediately after road blacktopping)."
      breadcrumbs={[
        { label: 'Command Center', to: '/command-center' },
        { label: 'Conflicts' },
      ]}
      icon={<GitMerge size={24} />}
    >
      <div className="flex flex-col gap-4">
        {conflicts.map((conflict) => (
          <Card key={conflict.id}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">
                    {conflict.primaryDeptCode} ↔ {conflict.conflictingDeptCode}
                  </span>
                  <StatusBadge status="active" customLabel="Collision Detected" />
                </div>
                <span className="text-xs text-muted">
                  Detected: {new Date(conflict.detectedAt).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm font-medium">{conflict.description}</p>

              <LocationRow location={conflict.location} />

              <div className="ns-alert ns-alert--warning mb-0">
                <AlertTriangle size={18} className="ns-alert__icon" />
                <div className="ns-alert__body">
                  <h4 className="ns-alert__title">Mitigation Directive</h4>
                  <p className="ns-alert__content">{conflict.actionRequired}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm">
                  View Timeline Clash
                </Button>
                <Button variant="primary" size="sm">
                  Schedule Joint Coordination
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PlaceholderPage>
  );
};
