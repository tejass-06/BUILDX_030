import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Flame, Building, GitMerge, AlertCircle, TrendingUp } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useComplaints } from '../../context/ComplaintContext';

export const CommandCenterOverviewPage: React.FC = () => {
  const { complaints, hotspots, departments, conflicts } = useComplaints();

  return (
    <PlaceholderPage
      title="Nagpur Municipal Governance Overview"
      section="Command Center"
      workflowStage="Citywide Command & Coordination"
      description="Real-time civic intelligence aggregating 10 administrative zones, departmental performance, and infrastructure conflicts."
      breadcrumbs={[{ label: 'Command Center', to: '/command-center' }]}
    >
      <div className="flex flex-col gap-6">
        {/* City Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <StatCard
            label="Total Active Complaints"
            value={complaints.length}
            icon={<Compass size={22} />}
            trendText="Live synced across 10 zones"
            trendDirection="neutral"
          />

          <StatCard
            label="Active Civic Hotspots"
            value={hotspots.length}
            icon={<Flame size={22} />}
            semanticType="warning"
            trendText="Ashi Nagar & Gandhibagh"
            trendDirection="up"
          />

          <StatCard
            label="Inter-Dept Conflicts"
            value={conflicts.length}
            icon={<GitMerge size={22} />}
            semanticType="error"
            trendText="Action required: NMC Road vs OCW"
            trendDirection="down"
          />

          <StatCard
            label="Avg City SLA Compliance"
            value="89.4%"
            icon={<TrendingUp size={22} />}
            semanticType="success"
            trendText="+3.2% this quarter"
            trendDirection="up"
          />
        </div>

        {/* 2-Column Overview Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {/* Active Hotspots Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Identified Recurring Hotspots</CardTitle>
                <Link to="/command-center/hotspots" className="text-xs font-semibold text-primary">
                  View Hotspot Map
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {hotspots.map((hs) => (
                  <div
                    key={hs.id}
                    className="p-3 border rounded-md flex items-center justify-between"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div>
                      <p className="text-sm font-semibold">{hs.category}</p>
                      <p className="text-xs text-muted">{hs.zone} · {hs.ward}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold">{hs.complaintCount} incidents</span>
                      <StatusBadge status="sla_approaching" customLabel={hs.riskLevel.toUpperCase()} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Conflict Alert Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Infrastructure Conflict Detection</CardTitle>
                <Link to="/command-center/conflicts" className="text-xs font-semibold text-primary">
                  View Coordination Hub
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {conflicts.map((conf) => (
                <div key={conf.id} className="ns-alert ns-alert--error mb-0">
                  <div className="ns-alert__body">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="ns-alert__title">{conf.primaryDeptCode} vs {conf.conflictingDeptCode} Collision</h4>
                      <StatusBadge status="active" />
                    </div>
                    <p className="ns-alert__content">{conf.description}</p>
                    <p className="text-xs font-semibold text-error mt-2">
                      Recommendation: {conf.actionRequired}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PlaceholderPage>
  );
};
