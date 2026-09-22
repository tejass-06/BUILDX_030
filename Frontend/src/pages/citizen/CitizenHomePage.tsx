import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Shield, CheckCircle2 } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ComplaintCard } from '../../components/civic/ComplaintCard';
import { useComplaints } from '../../context/ComplaintContext';

export const CitizenHomePage: React.FC = () => {
  const { complaints } = useComplaints();
  const sampleComplaint = complaints[0]; // NS-2026-01428

  return (
    <div className="page-container">
      <PlaceholderPage
        title="Citizen Civic Portal"
        section="Citizen Experience"
        workflowStage="Home"
        description="Report civic grievances, track active complaints, and confirm AI-verified problem resolutions across Nagpur."
        breadcrumbs={[{ label: 'Citizen Portal', to: '/citizen' }]}
      >
        <div className="flex flex-col gap-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome to NagarSaathi</CardTitle>
              <p className="text-sm text-muted">
                Empowering Nagpur residents with instant AI-routed civic governance.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link to="/citizen/report">
                  <Button variant="primary" leftIcon={<PlusCircle size={18} />}>
                    Report a Civic Problem
                  </Button>
                </Link>
                <Link to="/citizen/complaints">
                  <Button variant="outline" leftIcon={<Search size={18} />}>
                    Track Existing Complaint
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Sample Active Complaint Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Active Complaint Preview</h3>
              <Link to="/citizen/complaints" className="text-xs font-semibold text-primary">
                View All ({complaints.length})
              </Link>
            </div>
            {sampleComplaint && (
              <ComplaintCard
                complaint={sampleComplaint}
                to={`/citizen/complaints/${sampleComplaint.id}`}
              />
            )}
          </div>
        </div>
      </PlaceholderPage>
    </div>
  );
};
