import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ComplaintCard } from '../../components/civic/ComplaintCard';
import { useComplaints } from '../../context/ComplaintContext';

export const OfficerDashboardPage: React.FC = () => {
  const { complaints, officers } = useComplaints();
  const officer = officers[0]; // Ramesh Patil, OCW

  const officerComplaints = complaints.filter(
    (c) => c.departmentCode === officer.departmentCode
  );

  return (
    <PlaceholderPage
      title="Officer Field Operations Dashboard"
      section="Officer Experience"
      workflowStage="6. Officer Resolution"
      description="Field triage console for inspecting assigned civic complaints, tracking SLA countdowns, and submitting photo resolution evidence."
      breadcrumbs={[{ label: 'Officer Portal', to: '/officer' }]}
    >
      <div className="flex flex-col gap-6">
        {/* Metric Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <StatCard
            label="Assigned Work Orders"
            value={officerComplaints.length}
            icon={<ClipboardList size={22} />}
            trendText="Active in Zone 9"
            trendDirection="neutral"
          />

          <StatCard
            label="SLA Approaching (<24h)"
            value={officerComplaints.filter((c) => c.sla.isApproaching).length}
            icon={<Clock size={22} />}
            semanticType="warning"
            trendText="High priority triage"
            trendDirection="down"
          />

          <StatCard
            label="SLA Breached"
            value={officerComplaints.filter((c) => c.sla.isBreached).length}
            icon={<AlertTriangle size={22} />}
            semanticType="error"
            trendText="Immediate attention"
            trendDirection="down"
          />

          <StatCard
            label="Resolved This Month"
            value={officer.resolvedComplaintsCount}
            icon={<CheckCircle2 size={22} />}
            semanticType="success"
            trendText="+12% vs last month"
            trendDirection="up"
          />
        </div>

        {/* Assigned Complaints Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assigned Complaints Queue</CardTitle>
              <Link to="/officer/complaints" className="text-xs font-semibold text-primary">
                View Full Queue ({officerComplaints.length})
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {officerComplaints.slice(0, 2).map((comp) => (
                <ComplaintCard
                  key={comp.id}
                  complaint={comp}
                  to={`/officer/complaints/${comp.id}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PlaceholderPage>
  );
};
