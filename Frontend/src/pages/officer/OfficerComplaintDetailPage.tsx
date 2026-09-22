import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, UploadCloud, AlertTriangle } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { FileUpload } from '../../components/ui/FileUpload';
import { ComplaintStatus } from '../../components/civic/ComplaintStatus';
import { SLAIndicator } from '../../components/civic/SLAIndicator';
import { LocationRow } from '../../components/civic/LocationRow';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { useComplaints } from '../../context/ComplaintContext';

export const OfficerComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getComplaintById, complaints } = useComplaints();
  const complaint = (id ? getComplaintById(id) : undefined) || complaints[0];

  return (
    <PlaceholderPage
      title={`Work Order ${complaint.id}`}
      section="Officer Experience"
      workflowStage="Resolution & Verification"
      description="Field action console for executing repairs, documenting resolution evidence, and invoking AI vision verification."
      breadcrumbs={[
        { label: 'Officer Portal', to: '/officer' },
        { label: 'Complaints', to: '/officer/complaints' },
        { label: complaint.id },
      ]}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link to="/officer/complaints">
            <Button variant="outline" size="sm" leftIcon={<ChevronLeft size={16} />}>
              Back to Queue
            </Button>
          </Link>
          <ComplaintStatus status={complaint.status} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {/* Left Column: Complaint & SLA info */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <DepartmentBadge code={complaint.departmentCode} name={complaint.departmentName} />
                  <SLAIndicator sla={complaint.sla} />
                </div>
                <h3 className="text-lg font-bold mt-2">{complaint.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{complaint.description}</p>
                <div className="ns-divider ns-divider--horizontal ns-divider--spacing-md" />
                <LocationRow location={complaint.location} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Citizen Contact Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{complaint.citizen.name}</p>
                    <p className="text-xs text-muted">{complaint.citizen.ward} · Preferred: {complaint.citizen.preferredLanguage.toUpperCase()}</p>
                  </div>
                  <span className="text-xs font-mono">{complaint.citizen.phone}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Resolution Evidence Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resolution Evidence Submission</CardTitle>
                <p className="text-xs text-muted">
                  Upload post-repair photo for AI vision verification before marking resolved.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
                  <FileUpload
                    label="After-Repair Photo Evidence"
                    helperText="Take clear photo of repaired pipeline/road in Ashi Nagar"
                  />

                  <Textarea
                    label="Officer Work Log & Notes"
                    placeholder="Describe specific repair steps taken, parts replaced, and crew details..."
                    defaultValue="Underground collar clamp installed on 300mm pipe. Flow normalized and trench backfilled."
                    rows={3}
                  />

                  <div className="flex items-center justify-end gap-3 mt-2">
                    <Button variant="outline" type="button">
                      Save Draft
                    </Button>
                    <Button variant="primary" type="submit" leftIcon={<CheckCircle2 size={16} />}>
                      Mark Resolved
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PlaceholderPage>
  );
};
