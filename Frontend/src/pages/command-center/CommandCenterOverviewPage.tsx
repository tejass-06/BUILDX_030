import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Flame,
  Building,
  GitMerge,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Radio,
  FileText,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SLAIndicator } from '../../components/civic/SLAIndicator';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useComplaints } from '../../context/ComplaintContext';

export const CommandCenterOverviewPage: React.FC = () => {
  const { complaints, hotspots, departments, conflicts } = useComplaints();

  // Find primary demo complaint NS-2026-01428 to make city telemetry reactively reflect its lifecycle
  const primaryComplaint = complaints.find((c) => c.id === 'NS-2026-01428');
  const isPrimaryResolvedOrClosed =
    primaryComplaint?.status === 'resolved' ||
    primaryComplaint?.status === 'citizen_confirmed' ||
    primaryComplaint?.status === 'closed';
  const isPrimaryReopened = primaryComplaint?.status === 'reopened';

  // Derived demo metrics reacting directly to shared state
  const activeCount = isPrimaryResolvedOrClosed ? 23 : 24;
  const resolvedCount = isPrimaryResolvedOrClosed ? 19 : 18;
  const slaAtRiskCount = isPrimaryResolvedOrClosed ? 5 : 6;
  const reopenedCount = isPrimaryReopened ? 4 : 3;

  return (
    <div className="page-container flex flex-col gap-6 max-w-7xl">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Command Center', to: '/command-center' }, { label: 'City Overview' }]} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-indigo-50 flex items-center gap-1.5">
              <Radio size={12} className="text-emerald-600 animate-pulse" />
              Nagpur Integrated Operations Center
            </span>
            <span className="text-xs text-muted">Zone 1 – Zone 10 Real-Time Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold text">What is happening across Nagpur right now?</h1>
          <p className="text-sm text-muted mt-0.5">
            Real-time civic intelligence aggregating 10 administrative zones, departmental performance, and infrastructure conflicts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/command-center/hotspots">
            <Button variant="outline" size="sm" leftIcon={<Flame size={15} />}>
              Hotspot Map
            </Button>
          </Link>
          <Link to="/command-center/conflicts">
            <Button variant="primary" size="sm" leftIcon={<GitMerge size={15} />}>
              Conflict Center
            </Button>
          </Link>
        </div>
      </div>

      {/* SECTION A: CITY OVERVIEW STAT CARDS (Reflecting Shared State) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Complaints"
          value={activeCount}
          icon={<Compass size={22} />}
          trendText="10 zones reporting live"
          trendDirection="neutral"
        />

        <StatCard
          label="Resolved Today"
          value={resolvedCount}
          icon={<CheckCircle2 size={22} />}
          semanticType="success"
          trendText={isPrimaryResolvedOrClosed ? "+1 via NS-2026-01428" : "+3 vs yesterday"}
          trendDirection="up"
        />

        <StatCard
          label="SLA At Risk"
          value={slaAtRiskCount}
          icon={<Clock size={22} />}
          semanticType="warning"
          trendText="Action needed <24h"
          trendDirection="down"
        />

        <StatCard
          label="Reopened"
          value={reopenedCount}
          icon={<AlertTriangle size={22} />}
          semanticType={reopenedCount > 3 ? 'error' : 'default'}
          trendText={isPrimaryReopened ? "Flagged for re-inspection" : "Low recurring dispute"}
          trendDirection="down"
        />
      </div>

      {/* SECTION E: DEPARTMENT CONFLICT ALERT BANNER */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
              <GitMerge size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-200 px-2 py-0.5 rounded">
                  Inter-Department Conflict Detected
                </span>
                <span className="text-xs font-semibold text-rose-900">
                  NMC Roads (Asphalt Blacktopping) ↔ OCW (Pipeline Excavation)
                </span>
              </div>
              <p className="text-sm font-semibold text-rose-950 mt-1">
                Planned road work overlaps with active OCW pipeline excavation on Central Avenue.
              </p>
              <p className="text-xs text-rose-800 mt-0.5">
                Location: Central Avenue (Opposite Agrasen Chowk) · Risk: Newly laid asphalt vulnerable to immediate trenching.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <Link to="/command-center/conflicts">
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-700 hover:bg-rose-800 border-rose-700"
                rightIcon={<ArrowRight size={14} />}
              >
                View Coordination Alert
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* MAIN 2-COLUMN GRID: HOTSPOTS & SLA AT RISK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hotspot Intelligence & Department Matrix (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* SECTION B: Civic Problem Hotspots */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Flame size={18} className="text-amber-600" />
                    Civic Problem Hotspots (Spatial Density)
                  </CardTitle>
                  <p className="text-xs text-muted mt-0.5">
                    Recurrent incident clusters identified by spatial pattern analysis
                  </p>
                </div>
                <Link to="/command-center/hotspots" className="text-xs font-semibold text-primary hover:underline">
                  View Hotspot Map ({hotspots.length})
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {hotspots.map((hs) => (
                  <div
                    key={hs.id}
                    className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      hs.id === 'hs-01'
                        ? 'border-indigo-200 bg-indigo-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text">{hs.category}</span>
                        <StatusBadge
                          status={hs.riskLevel === 'high' ? 'sla_breached' : 'sla_approaching'}
                          customLabel={`${hs.riskLevel.toUpperCase()} RISK`}
                        />
                        {hs.id === 'hs-01' && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold font-mono">
                            NS-2026-01428 Linked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <MapPin size={12} />
                        {hs.zone} · {hs.ward} · Trend: <strong className="text-slate-700">{hs.trend.toUpperCase()}</strong>
                      </p>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-bold text-rose-600">{hs.complaintCount}</span>
                        <span className="text-xs text-muted block">Incidents</span>
                      </div>
                      <Link to="/command-center/hotspots" className="text-xs text-primary font-semibold hover:underline">
                        Inspect Zone →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SECTION C: Department Performance Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building size={18} className="text-primary" />
                    Department Performance Summary
                  </CardTitle>
                  <p className="text-xs text-muted mt-0.5">
                    Civic workload distribution & SLA fulfillment rate across agencies
                  </p>
                </div>
                <Link to="/command-center/departments" className="text-xs font-semibold text-primary hover:underline">
                  Full Department Matrix →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-muted font-semibold">
                      <th className="pb-2">Department</th>
                      <th className="pb-2 text-center">Active</th>
                      <th className="pb-2 text-center">Resolved</th>
                      <th className="pb-2 text-center">At Risk</th>
                      <th className="pb-2 text-right">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 font-semibold text">Orange City Water (OCW)</td>
                      <td className="py-2.5 text-center font-mono">8</td>
                      <td className="py-2.5 text-center font-mono">{isPrimaryResolvedOrClosed ? 13 : 12}</td>
                      <td className="py-2.5 text-center font-mono text-amber-600 font-bold">{isPrimaryResolvedOrClosed ? 1 : 2}</td>
                      <td className="py-2.5 text-right font-bold text-success">91%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text">NMC Road Infrastructure</td>
                      <td className="py-2.5 text-center font-mono">7</td>
                      <td className="py-2.5 text-center font-mono">9</td>
                      <td className="py-2.5 text-center font-mono text-amber-600 font-bold">3</td>
                      <td className="py-2.5 text-right font-bold text-success">84%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text">NMC Solid Waste & Health</td>
                      <td className="py-2.5 text-center font-mono">5</td>
                      <td className="py-2.5 text-center font-mono">14</td>
                      <td className="py-2.5 text-center font-mono text-amber-600 font-bold">1</td>
                      <td className="py-2.5 text-right font-bold text-success">88%</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-semibold text">NMC Streetlight & Electrical</td>
                      <td className="py-2.5 text-center font-mono">4</td>
                      <td className="py-2.5 text-center font-mono">11</td>
                      <td className="py-2.5 text-center font-mono text-muted">0</td>
                      <td className="py-2.5 text-right font-bold text-success">95%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: SLA Intelligence & Recent Critical Complaints (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* SECTION D: SLA / Complaint Intelligence (SLA At Risk) */}
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-900">
                  <Clock size={16} className="text-amber-600" />
                  SLA At Risk Spotlight
                </CardTitle>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                  {slaAtRiskCount} Approaching SLA
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {primaryComplaint && (
                <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-bold text-primary">
                      {primaryComplaint.id}
                    </span>
                    <StatusBadge status={primaryComplaint.status} />
                  </div>
                  <h4 className="text-sm font-bold text">{primaryComplaint.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Orange City Water · Ashi Nagar</span>
                    <SLAIndicator sla={primaryComplaint.sla} />
                  </div>
                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                    <span className="text-xs text-muted">Assigned: Ramesh Patil (JE)</span>
                    <Link to={`/officer/complaints/${primaryComplaint.id}`}>
                      <Button variant="outline" size="sm" rightIcon={<ArrowRight size={12} />}>
                        Triage Work Order
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION F: Recent Critical Complaints */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Recent Critical Complaints
                </CardTitle>
                <Link to="/officer/complaints" className="text-xs font-semibold text-primary hover:underline">
                  View Queue
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {complaints.slice(0, 3).map((comp) => (
                <div
                  key={comp.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">{comp.id}</span>
                      <DepartmentBadge code={comp.departmentCode} name={comp.departmentName} />
                    </div>
                    <StatusBadge status={comp.status} />
                  </div>
                  <Link
                    to={`/officer/complaints/${comp.id}`}
                    className="text-xs font-bold text hover:text-primary transition-colors line-clamp-1"
                  >
                    {comp.title}
                  </Link>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {comp.location.ward}
                    </span>
                    <SLAIndicator sla={comp.sla} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
