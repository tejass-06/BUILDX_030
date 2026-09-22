import React from 'react';
import { Copy, AlertTriangle, ArrowRight } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ComplaintCard } from '../../components/civic/ComplaintCard';
import { useComplaints } from '../../context/ComplaintContext';

export const DuplicateDetectionPage: React.FC = () => {
  const { complaints } = useComplaints();
  const primaryComplaint = complaints[0];

  return (
    <div className="page-container">
      <PlaceholderPage
        title="Duplicate Problem Detection"
        section="Citizen Experience"
        workflowStage="3. Duplicate Check"
        description="Spatial and semantic clustering detecting overlapping citizen reports in Ashi Nagar to avoid duplicate work orders."
        breadcrumbs={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'Duplicate Detection' },
        ]}
        icon={<Copy size={24} />}
      >
        <div className="flex flex-col gap-4">
          <div className="ns-alert ns-alert--warning">
            <AlertTriangle size={18} className="ns-alert__icon" />
            <div className="ns-alert__body">
              <h4 className="ns-alert__title">Similar Issue Already Registered Nearby</h4>
              <p className="ns-alert__content">
                NagarSaathi AI found an active cluster at this location with 89% similarity.
                You can link your report to receive real-time SMS updates without creating duplicate field work.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Existing Registered Complaint:</h4>
            {primaryComplaint && (
              <ComplaintCard
                complaint={primaryComplaint}
                to={`/citizen/complaints/${primaryComplaint.id}`}
              />
            )}
          </div>
        </div>
      </PlaceholderPage>
    </div>
  );
};
