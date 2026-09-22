import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchInput } from '../../components/ui/SearchInput';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SLAIndicator } from '../../components/civic/SLAIndicator';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { MapPin, ArrowRight, Clock, Filter } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';

export const OfficerComplaintsPage: React.FC = () => {
  const { complaints } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Ensure primary demo complaint is sorted to top
  const sortedComplaints = [...complaints].sort((a, b) => {
    if (a.id === 'NS-2026-01428') return -1;
    if (b.id === 'NS-2026-01428') return 1;
    return 0;
  });

  const filtered = sortedComplaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.departmentName.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'approaching') {
      return matchesSearch && c.sla.isApproaching;
    }
    if (activeTab === 'in_progress') {
      return matchesSearch && c.status === 'in_progress';
    }
    if (activeTab === 'resolved') {
      return matchesSearch && (c.status === 'resolved' || c.status === 'closed');
    }
    return matchesSearch;
  });

  return (
    <div className="page-container flex flex-col gap-6 max-w-6xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Officer Portal', to: '/officer' },
          { label: 'Assigned Complaints Queue' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-indigo-50">
            Work Order Management
          </span>
          <h1 className="text-2xl font-bold text mt-1">Assigned Complaints Queue</h1>
          <p className="text-sm text-muted">
            Field work orders assigned to Orange City Water and Nagpur Municipal Corporation
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Search by complaint ID (e.g. NS-2026-01428), keyword, or location..."
        />

        <Tabs
          tabs={[
            { id: 'all', label: 'All Complaints', badge: sortedComplaints.length },
            {
              id: 'in_progress',
              label: 'In Progress',
              badge: sortedComplaints.filter((c) => c.status === 'in_progress').length,
            },
            {
              id: 'approaching',
              label: 'SLA Approaching',
              badge: sortedComplaints.filter((c) => c.sla.isApproaching).length,
            },
            {
              id: 'resolved',
              label: 'Resolved / Closed',
              badge: sortedComplaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
            },
          ]}
          activeTabId={activeTab}
          onChange={setActiveTab}
        />

        {/* Complaints List */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((comp) => (
              <div
                key={comp.id}
                className={`p-4 rounded-lg border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  comp.id === 'NS-2026-01428'
                    ? 'border-l-4 border-l-primary border-slate-300 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-primary">{comp.id}</span>
                    <DepartmentBadge code={comp.departmentCode} name={comp.departmentName} />
                    <StatusBadge status={comp.status} />
                    {comp.duplicateCluster && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono">
                        {comp.duplicateCluster.clusterId} ({Math.round(comp.duplicateCluster.similarityScore * 100)}% match)
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text">{comp.title}</h3>

                  <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {comp.location.address}
                    </span>
                    <span>·</span>
                    <span>Citizen: {comp.citizen.name} ({comp.citizen.ward})</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                  <SLAIndicator sla={comp.sla} />
                  <Link to={`/officer/complaints/${comp.id}`}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                      Inspect Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Matching Complaints Found"
            description="No work orders matched your active search query or filter tab."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchTerm('');
              setActiveTab('all');
            }}
          />
        )}
      </div>
    </div>
  );
};
