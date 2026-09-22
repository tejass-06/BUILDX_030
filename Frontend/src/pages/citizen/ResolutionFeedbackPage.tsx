import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Radio } from '../../components/ui/Radio';
import { useComplaints } from '../../context/ComplaintContext';

export const ResolutionFeedbackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getComplaintById, complaints } = useComplaints();
  const complaint = (id ? getComplaintById(id) : undefined) || complaints[2]; // resolved complaint

  return (
    <div className="page-container">
      <PlaceholderPage
        title="Citizen Resolution Verification"
        section="Citizen Experience"
        workflowStage="7. Citizen Confirms"
        description="Verify whether the field team has satisfactorily resolved the civic defect at your location."
        breadcrumbs={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'My Complaints', to: '/citizen/complaints' },
          { label: complaint.id, to: `/citizen/complaints/${complaint.id}` },
          { label: 'Feedback' },
        ]}
      >
        <Card>
          <CardHeader>
            <CardTitle>Verify Resolution for {complaint.id}</CardTitle>
            <p className="text-xs text-muted">{complaint.title}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
              <div>
                <label className="ns-label block mb-2">Has the issue been completely fixed?</label>
                <div className="flex flex-col gap-2">
                  <Radio
                    name="satisfied"
                    value="yes"
                    label="Yes, problem is fully resolved"
                    description="Field work completed satisfactorily."
                    defaultChecked
                  />
                  <Radio
                    name="satisfied"
                    value="no"
                    label="No, problem still persists"
                    description="The defect remains unaddressed or partially fixed."
                  />
                </div>
              </div>

              <Textarea
                label="Citizen Remarks (Optional)"
                placeholder="Share your feedback regarding the quality of work done by Orange City Water..."
                rows={3}
              />

              <div className="flex items-center justify-end gap-3 mt-4">
                <Link to={`/citizen/complaints/${complaint.id}`}>
                  <Button variant="outline" type="button">
                    Back
                  </Button>
                </Link>
                <Button variant="primary" type="submit" leftIcon={<CheckCircle2 size={16} />}>
                  Submit Confirmation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </PlaceholderPage>
    </div>
  );
};
