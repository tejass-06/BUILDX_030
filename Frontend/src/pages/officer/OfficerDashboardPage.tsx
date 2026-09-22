import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  ShieldCheck,
  Building2,
  MapPin,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SLAIndicator } from '../../components/civic/SLAIndicator';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useComplaints } from '../../context/ComplaintContext';

export const OfficerDashboardPage: React.FC = () => {
  const { complaints, officers } = useComplaints();
  const officer = officers[0]; // Ramesh Patil, Junior Engineer, OCW, Ashi Nagar

  // Priority queue: primary demo complaint first
  const primaryComplaint = complaints.find((c) => c.id === 'NS-2026-01428') || complaints[0];
  const otherComplaints = complaints.filter((c) => c.id !== primaryComplaint?.id).slice(0, 3);

  return (
    <div className="page-container flex flex-col gap-6 max-w-6xl">
      {/* Navigation Breadcrumb */}
      <Breadcrumb items={[{ label: 'Officer Portal', to: '/officer' }, { label: 'Dashboard' }]} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-indigo-50">
              Field Operations Console
            </span>
            <span className="text-xs text-muted">Orange City Water (OCW) · Zone 9</span>
          </div>
          <h1 className="text-2xl font-bold text">Officer Field Operations Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">
            Logged in as <span className="font-semibold text">{officer.name}</span> ({officer.designation})
          </p>
        </div>

        <Link to="/officer/complaints">
          <Button variant="primary" size="md" rightIcon={<ArrowRight size={16} />}>
            Open Work Queue
          </Button>
        </Link>
      </div>

      {/* 4 Summary Stat Cards (Exact hackathon demo metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Complaints"
          value={12}
          icon={<ClipboardList size={22} />}
          trendText="Assigned in Ashi Nagar"
          trendDirection="neutral"
        />

        <StatCard
          label="Approaching SLA"
          value={4}
          icon={<Clock size={22} />}
          semanticType="warning"
          trendText="Action needed <24h"
          trendDirection="down"
        />

        <StatCard
          label="Escalated"
          value={2}
          icon={<AlertTriangle size={22} />}
          semanticType="error"
          trendText="Ward 2 priority leaks"
          trendDirection="down"
        />

        <StatCard
          label="Resolved Today"
          value={8}
          icon={<CheckCircle2 size={22} />}
          semanticType="success"
          trendText="+2 from yesterday"
          trendDirection="up"
        />
      </div>

      {/* Primary Demo Focus: High Priority Complaint Banner */}
      {primaryComplaint && (
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  PRIMARY DEMO WORK ORDER
                </span>
                <span className="text-xs font-mono font-bold text-primary">{primaryComplaint.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <SLAIndicator sla={primaryComplaint.sla} />
                <StatusBadge status={primaryComplaint.status} />
              </div>
            </div>
            <h3 className="text-lg font-bold text mt-2">{primaryComplaint.title}</h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text text-muted">{primaryComplaint.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
              <div>
                <span className="text-muted block">Location:</span>
                <span className="font-semibold text">{primaryComplaint.location.address}</span>
              </div>
              <div>
                <span className="text-muted block">Department:</span>
                <span className="font-semibold text">{primaryComplaint.departmentName} (OCW)</span>
              </div>
              <div>
                <span className="text-muted block">AI Confidence & Severity:</span>
                <span className="font-semibold text text-emerald-700">96% · High Severity</span>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <span className="text-xs text-muted">
                Duplicate Cluster: <strong className="font-mono text">DUP-CLUST-041</strong> (89% similarity)
              </span>
              <Link to={`/officer/complaints/${primaryComplaint.id}`}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                  Inspect & Resolve Work Order
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Queue Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assigned Complaints Queue</CardTitle>
              <p className="text-xs text-muted mt-0.5">
                Active municipal work orders assigned to Orange City Water (Zone 9)
              </p>
            </div>
            <Link to="/officer/complaints" className="text-xs font-semibold text-primary hover:underline">
              View All ({complaints.length})
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {[primaryComplaint, ...otherComplaints].filter(Boolean).map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-primary">{comp.id}</span>
                    <DepartmentBadge code={comp.departmentCode} name={comp.departmentName} />
                    <StatusBadge status={comp.status} />
                  </div>
                  <h4 className="text-sm font-semibold text">{comp.title}</h4>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <MapPin size={12} />
                    {comp.location.address}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <SLAIndicator sla={comp.sla} />
                  <Link to={`/officer/complaints/${comp.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
