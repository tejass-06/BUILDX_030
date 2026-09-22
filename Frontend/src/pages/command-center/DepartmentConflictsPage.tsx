import React, { useState } from 'react';
import {
  GitMerge,
  AlertTriangle,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Building,
  ArrowRight,
  Clock,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LocationRow } from '../../components/civic/LocationRow';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useComplaints } from '../../context/ComplaintContext';

export const DepartmentConflictsPage: React.FC = () => {
  const { conflicts, updateConflictStatus } = useComplaints();
  const [showDetailModal, setShowDetailModal] = useState(false);

  const primaryConflict = conflicts[0];
  const isMitigated = primaryConflict?.status === 'mitigated' || primaryConflict?.status === 'resolved';

  const handleMarkCoordination = () => {
    if (primaryConflict) {
      updateConflictStatus(primaryConflict.id, isMitigated ? 'active' : 'mitigated');
    }
  };

  return (
    <div className="page-container flex flex-col gap-6 max-w-6xl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Command Center', to: '/command-center' },
          { label: 'Department Conflict Detection' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 px-2 py-0.5 rounded bg-rose-50 flex items-center gap-1">
              <GitMerge size={12} />
              Cross-Agency Infrastructure Intelligence
            </span>
            <span className="text-xs text-muted">Predictive Spatial Clash Engine</span>
          </div>
          <h1 className="text-2xl font-bold text">Inter-Department Conflict Coordination</h1>
          <p className="text-sm text-muted">
            Prevents costly municipal clashes by detecting overlapping works before civil excavation commences.
          </p>
        </div>
      </div>

      {/* Primary Coordination Alert Box */}
      <div
        className="p-5 rounded-xl border flex flex-col gap-4 shadow-sm"
        style={{
          backgroundColor: isMitigated ? 'var(--color-success-50)' : 'var(--color-danger-50)',
          borderColor: isMitigated ? 'var(--color-success-200)' : 'var(--color-danger-200)',
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-3">
            <div
              className="p-2.5 rounded-lg shrink-0 mt-0.5"
              style={{
                backgroundColor: isMitigated ? 'var(--color-success-100)' : 'var(--color-danger-100)',
                color: isMitigated ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            >
              {isMitigated ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                  {primaryConflict?.id || 'CONF-01'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200 text-rose-900">
                  {isMitigated ? 'COORDINATED & MITIGATED' : 'ACTIVE CONFLICT DETECTED'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-950">
                Planned road work overlaps with active OCW pipeline excavation.
              </h2>
              <p className="text-xs text-slate-800 mt-0.5">
                Location: Central Avenue (Agrasen Chowk to Dosar Bhavan, Ward 14)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailModal(!showDetailModal)}
            >
              {showDetailModal ? 'Hide Details' : 'View Coordination Alert'}
            </Button>
            <Button
              variant={isMitigated ? 'outline' : 'primary'}
              size="sm"
              onClick={handleMarkCoordination}
              leftIcon={isMitigated ? <Check size={14} /> : <CheckCircle2 size={14} />}
              style={
                !isMitigated
                  ? { backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }
                  : {}
              }
            >
              {isMitigated ? 'Mark Active Again' : 'Mark for Coordination'}
            </Button>
          </div>
        </div>

        {/* Status narrative */}
        {isMitigated && (
          <div className="p-3 bg-white/90 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Coordination Directive Logged:</strong> OCW pipeline trenching scheduled for Sept 23-24 prior to NMC Road bituminous blacktopping on Sept 28. ₹45 Lakhs rework avoided.
            </span>
          </div>
        )}
      </div>

      {/* Detailed Works Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Work 1: NMC Roads */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                Agency 1 · Road Infrastructure
              </span>
              <span className="text-xs text-muted font-mono">NMC_ROAD</span>
            </div>
            <CardTitle className="text-base mt-2">
              Central Avenue Bituminous Re-carpeting Phase 2
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-xs">
            <p className="text-muted leading-relaxed">
              Heavy hot-mix asphalt surfacing from Agrasen Chowk to Telephone Exchange square carriageway.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted">Execution Window:</span>
                <strong className="text font-semibold">25 Sep 2026 – 05 Oct 2026</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Budget Allocated:</span>
                <strong className="text font-semibold">₹1.85 Cr</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Nodal In-charge:</span>
                <span className="text font-semibold">Pradeep Khobragade (EE)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Work 2: Orange City Water */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                Agency 2 · Water Utility
              </span>
              <span className="text-xs text-muted font-mono">OCW</span>
            </div>
            <CardTitle className="text-base mt-2">
              Feeder Main Line Augmentation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-xs">
            <p className="text-muted leading-relaxed">
              Trench excavation and laying of 600mm DI potable water transmission line along Central Avenue north lane.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted">Execution Window:</span>
                <strong className="text font-semibold">28 Sep 2026 – 12 Oct 2026</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Budget Allocated:</span>
                <strong className="text font-semibold">₹95 Lakhs</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Nodal In-charge:</span>
                <span className="text font-semibold">Ramesh Patil (JE) / Sanjay Deshmukh</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conflict Risk & Resolution Blueprint */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            Civic Collision Risk Analysis & Joint Directive
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-xs">
          <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="text-sm font-bold text-amber-950 mb-1">Identified Risk:</h4>
            <p className="text-amber-900 leading-relaxed">
              If NMC Road blacktopping proceeds on September 25, the newly surfaced asphalt road will be dug up just 3 days later (September 28) by Orange City Water for the water pipeline, causing extensive pavement destruction, traffic chaos, and estimated ₹45 Lakhs in public rework losses.
            </p>
          </div>

          <div className="p-3.5 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="text-sm font-bold text-indigo-950 mb-1">Recommended Solution:</h4>
            <p className="text-indigo-900 leading-relaxed">
              Hold a joint coordination meeting between NMC Chief Engineer (Roads) and OCW Technical Director. Reschedule OCW trenching to advance to September 23–24 so that road blacktopping can finish the surface cleanly on September 28 without further excavation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
