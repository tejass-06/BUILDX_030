import React, { useState } from 'react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { SearchInput } from '../../components/ui/SearchInput';
import { Tabs } from '../../components/ui/Tabs';
import { ComplaintCard } from '../../components/civic/ComplaintCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useComplaints } from '../../context/ComplaintContext';

export const OfficerComplaintsPage: React.FC = () => {
  const { complaints } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'approaching') {
      return matchesSearch && c.sla.isApproaching;
    }
    if (activeTab === 'breached') {
      return matchesSearch && c.sla.isBreached;
    }
    return matchesSearch;
  });

  return (
    <PlaceholderPage
      title="Department Complaint Management"
      section="Officer Experience"
      workflowStage="Field Assignment & Resolution"
      description="Inspect, filter, and prioritize active work orders across Ashi Nagar and Nagpur zones."
      breadcrumbs={[
        { label: 'Officer Portal', to: '/officer' },
        { label: 'Complaints' },
      ]}
    >
      <div className="flex flex-col gap-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Filter complaints by ID, keyword, or ward..."
        />

        <Tabs
          tabs={[
            { id: 'all', label: 'All Work Orders', badge: complaints.length },
            {
              id: 'approaching',
              label: 'SLA Approaching',
              badge: complaints.filter((c) => c.sla.isApproaching).length,
            },
            {
              id: 'breached',
              label: 'SLA Breached',
              badge: complaints.filter((c) => c.sla.isBreached).length,
            },
          ]}
          activeTabId={activeTab}
          onChange={setActiveTab}
        />

        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((comp) => (
              <ComplaintCard
                key={comp.id}
                complaint={comp}
                to={`/officer/complaints/${comp.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Matching Complaints"
            description="No complaints matched your active filter."
            actionLabel="Reset Filter"
            onAction={() => {
              setSearchTerm('');
              setActiveTab('all');
            }}
          />
        )}
      </div>
    </PlaceholderPage>
  );
};
