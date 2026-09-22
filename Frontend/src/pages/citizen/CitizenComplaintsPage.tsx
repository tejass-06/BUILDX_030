import React, { useState } from 'react';
import { SearchInput } from '../../components/ui/SearchInput';
import { Tabs } from '../../components/ui/Tabs';
import { ComplaintCard } from '../../components/civic/ComplaintCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useComplaints } from '../../context/ComplaintContext';

export const CitizenComplaintsPage: React.FC = () => {
  const { complaints } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    const isResolvedOrClosed =
      c.status === 'resolved' || c.status === 'citizen_confirmed' || c.status === 'closed';

    if (activeTab === 'active') {
      return matchesSearch && !isResolvedOrClosed;
    }
    if (activeTab === 'resolved') {
      return matchesSearch && isResolvedOrClosed;
    }
    return matchesSearch;
  });

  return (
    <div className="page-container flex flex-col gap-6 max-w-4xl">
      <Breadcrumb
        items={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'My Complaints' },
        ]}
      />

      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text">My Civic Complaints</h1>
        <p className="text-sm text-muted mt-1">
          Monitor status, assigned department, SLA countdown, and resolution evidence for your reported civic grievances.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Search by ID (e.g. NS-2026-01428), keyword, or location..."
        />

        <Tabs
          tabs={[
            { id: 'all', label: 'All Complaints', badge: complaints.length },
            {
              id: 'active',
              label: 'Active & In-Progress',
              badge: complaints.filter(
                (c) => c.status !== 'resolved' && c.status !== 'citizen_confirmed' && c.status !== 'closed'
              ).length,
            },
            {
              id: 'resolved',
              label: 'Resolved / Closed',
              badge: complaints.filter(
                (c) => c.status === 'resolved' || c.status === 'citizen_confirmed' || c.status === 'closed'
              ).length,
            },
          ]}
          activeTabId={activeTab}
          onChange={setActiveTab}
        />

        {filteredComplaints.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredComplaints.map((comp) => (
              <ComplaintCard
                key={comp.id}
                complaint={comp}
                to={`/citizen/complaints/${comp.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Complaints Found"
            description="No complaints matched your active filter or search criteria."
            actionLabel="Clear Filter"
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
