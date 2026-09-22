import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, User, Phone } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ComplaintStatus } from '../../components/civic/ComplaintStatus';
import { SLAIndicator } from '../../components/civic/SLAIndicator';
import { LocationRow } from '../../components/civic/LocationRow';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { Timeline } from '../../components/civic/Timeline';
import { useComplaints } from '../../context/ComplaintContext';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getComplaintById, complaints } = useComplaints();

  const complaint = (id ? getComplaintById(id) : undefined) || complaints[0];

  return (
    <div className="page-container">
      <PlaceholderPage
        title={`Complaint ${complaint.id}`}
        section="Citizen Experience"
        workflowStage="Complaint Tracking"
        description="Comprehensive lifecycle view showing live progress, assigned field team, and resolution status."
        breadcrumbs={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'My Complaints', to: '/citizen/complaints' },
          { label: complaint.id },
        ]}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link to="/citizen/complaints">
              <Button variant="outline" size="sm" leftIcon={<ChevronLeft size={16} />}>
                Back to Complaints
              </Button>
            </Link>

            {complaint.status === 'resolved' && (
              <Link to={`/citizen/resolution/${complaint.id}`}>
                <Button variant="primary" size="sm" leftIcon={<CheckCircle2 size={16} />}>
                  Provide Resolution Feedback
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {/* Left Col: Details & Evidence */}
            <div className="flex flex-col gap-4" style={{ gridColumn: 'span 2' }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <DepartmentBadge code={complaint.departmentCode} name={complaint.departmentName} />
                    <ComplaintStatus status={complaint.status} />
                  </div>
                  <h3 className="mt-2 text-lg font-bold">{complaint.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text">{complaint.description}</p>

                  <div className="ns-divider ns-divider--horizontal ns-divider--spacing-md" />

                  <LocationRow location={complaint.location} />

                  <div className="ns-divider ns-divider--horizontal ns-divider--spacing-md" />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-muted">SLA Compliance:</span>
                    <SLAIndicator sla={complaint.sla} />
                  </div>
                </CardContent>
              </Card>

              {complaint.assignedOfficer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Field Officer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="ns-avatar ns-avatar--md">
                          {complaint.assignedOfficer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{complaint.assignedOfficer.name}</p>
                          <p className="text-xs text-muted">{complaint.assignedOfficer.designation}</p>
                          <p className="text-xs text-muted">{complaint.assignedOfficer.zone}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted font-mono">{complaint.assignedOfficer.phone}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Col: Timeline */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Progress Lifecycle</CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline currentStatus={complaint.status} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PlaceholderPage>
    </div>
  );
};
