import React from 'react';
import { Building, TrendingUp, Clock, AlertTriangle, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { StatCard } from '../../components/ui/StatCard';
import { useComplaints } from '../../context/ComplaintContext';

export const DepartmentPerformancePage: React.FC = () => {
  const { departments, complaints } = useComplaints();

  // Check if primary demo complaint NS-2026-01428 is resolved to reactively adjust OCW metrics
  const primaryComplaint = complaints.find((c) => c.id === 'NS-2026-01428');
  const isPrimaryResolvedOrClosed =
    primaryComplaint?.status === 'resolved' ||
    primaryComplaint?.status === 'citizen_confirmed' ||
    primaryComplaint?.status === 'closed';

  // Department data array with clear hackathon demo metrics
  const departmentMetrics = [
    {
      code: 'OCW',
      name: 'Orange City Water',
      headName: 'Sanjay Deshmukh',
      role: 'Chief Engineer & Nodal Director',
      contactEmail: 'helpline@ocwnagpur.gov.in',
      slaHours: 48,
      active: 8,
      resolved: isPrimaryResolvedOrClosed ? 13 : 12,
      atRisk: isPrimaryResolvedOrClosed ? 1 : 2,
      compliance: '91%',
      trend: '+4% this month',
    },
    {
      code: 'NMC_ROAD',
      name: 'NMC Road Infrastructure & Pothole Cell',
      headName: 'Pradeep Khobragade',
      role: 'Executive Engineer (Roads)',
      contactEmail: 'roads@nmcnagpur.gov.in',
      slaHours: 72,
      active: 7,
      resolved: 9,
      atRisk: 3,
      compliance: '84%',
      trend: '+1% this month',
    },
    {
      code: 'NMC_HEALTH',
      name: 'NMC Solid Waste & Health Services',
      headName: 'Dr. Gajendra Mahalle',
      role: 'Director of Solid Waste Management',
      contactEmail: 'health@nmcnagpur.gov.in',
      slaHours: 24,
      active: 5,
      resolved: 14,
      atRisk: 1,
      compliance: '88%',
      trend: '+2% this month',
    },
    {
      code: 'NMC_ELEC',
      name: 'NMC Streetlight & Electrical Division',
      headName: 'Anil Bansod',
      role: 'Superintending Engineer (Electrical)',
      contactEmail: 'electric@nmcnagpur.gov.in',
      slaHours: 24,
      active: 4,
      resolved: 11,
      atRisk: 0,
      compliance: '95%',
      trend: '+6% this month',
    },
    {
      code: 'PWD',
      name: 'Public Works Department (State Highway Wing)',
      headName: 'Vandana Meshram',
      role: 'Executive Engineer (PWD Nagpur)',
      contactEmail: 'nagpur-ee@mahapwd.gov.in',
      slaHours: 96,
      active: 3,
      resolved: 6,
      atRisk: 1,
      compliance: '78%',
      trend: '-1% this month',
    },
  ];

  return (
    <div className="page-container flex flex-col gap-6 max-w-7xl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Command Center', to: '/command-center' },
          { label: 'Department Performance' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-indigo-50 flex items-center gap-1">
              <Building size={12} />
              Inter-Agency Governance Matrix
            </span>
            <span className="text-xs text-muted">Nagpur Municipal Corporation</span>
          </div>
          <h1 className="text-2xl font-bold text">Department Performance Telemetry</h1>
          <p className="text-sm text-muted">
            Comparative operational performance, SLA fulfillment rates, and resolution velocity across civic agencies.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Active Workload"
          value={27}
          icon={<Building size={22} />}
          trendText="Distributed across 5 departments"
          trendDirection="neutral"
        />
        <StatCard
          label="Total Resolved (MTD)"
          value={isPrimaryResolvedOrClosed ? 53 : 52}
          icon={<CheckCircle2 size={22} />}
          semanticType="success"
          trendText="+18% vs last month"
          trendDirection="up"
        />
        <StatCard
          label="SLA At Risk Total"
          value={isPrimaryResolvedOrClosed ? 6 : 7}
          icon={<Clock size={22} />}
          semanticType="warning"
          trendText="Actionable triage queue"
          trendDirection="down"
        />
        <StatCard
          label="Avg SLA Compliance"
          value="87.2%"
          icon={<TrendingUp size={22} />}
          semanticType="success"
          trendText="City target: 85%"
          trendDirection="up"
        />
      </div>

      {/* Department Performance Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Agency Performance & Accountability Matrix</CardTitle>
              <p className="text-xs text-muted mt-0.5">
                Real-time compliance data mapped to municipal service standards (SLA)
              </p>
            </div>
            <span className="text-xs text-muted bg-slate-100 px-2 py-1 rounded font-mono">
              Live Sync: 22 Sep 2026
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="p-3">Department</th>
                  <th className="p-3">Nodal Leadership</th>
                  <th className="p-3 text-center">Standard SLA</th>
                  <th className="p-3 text-center">Active</th>
                  <th className="p-3 text-center">Resolved</th>
                  <th className="p-3 text-center">At Risk</th>
                  <th className="p-3 text-right">SLA Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentMetrics.map((d) => (
                  <tr key={d.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <DepartmentBadge code={d.code} name={d.name} />
                        <span className="text-xs text-slate-700 font-medium">{d.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <strong className="text text-slate-900 block">{d.headName}</strong>
                        <span className="text-muted block text-xs">{d.role}</span>
                        <span className="text-muted font-mono text-xs">{d.contactEmail}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-semibold text-slate-700">
                      {d.slaHours} hours
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800">
                        {d.active}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-emerald-50 text-emerald-700">
                        {d.resolved}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono font-bold ${
                          d.atRisk > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {d.atRisk}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-success">{d.compliance}</span>
                        <span className="text-muted text-xs">{d.trend}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
