import React from 'react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { FileUpload } from '../../components/ui/FileUpload';
import { Button } from '../../components/ui/Button';
import { useComplaints } from '../../context/ComplaintContext';

export const ReportProblemPage: React.FC = () => {
  const { departments } = useComplaints();

  return (
    <div className="page-container">
      <PlaceholderPage
        title="Report a Civic Problem"
        section="Citizen Experience"
        workflowStage="1. Report"
        description="Submit photos and description of public issues such as water leakage, road damage, or streetlight failure."
        breadcrumbs={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'Report Problem' },
        ]}
      >
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details Form (Foundation Preview)</CardTitle>
            <p className="text-xs text-muted">
              Ready for Phase 2 integration with geolocation capture and voice input.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-1">
              <Input
                label="Problem Headline"
                placeholder="e.g. Major Drinking Water Pipeline Leakage Near Community Hall"
                defaultValue="Water Leakage in Ashi Nagar"
                required
              />

              <Select
                label="Suspected Category"
                placeholder="Select category"
                defaultValue="water"
              >
                <option value="water">Water Leakage & Distribution</option>
                <option value="roads">Road Damage & Potholes</option>
                <option value="elec">Street Lighting & Electrical</option>
                <option value="waste">Garbage & Sanitation</option>
              </Select>

              <Input
                label="Location / Landmark"
                placeholder="Street name, landmark, Ward or Zone"
                defaultValue="Plot 42, Near Kapil Nagar Community Hall, Ashi Nagar, Nagpur"
                required
              />

              <Textarea
                label="Detailed Description"
                placeholder="Describe the issue, hazards, or impact..."
                defaultValue="Clean drinking water is spilling continuously into the street, creating waterlogging and low pressure."
                rows={3}
              />

              <FileUpload
                label="Photo Evidence"
                helperText="Upload clear images showing the defect and surroundings (Max 5MB)"
              />

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Proceed to AI Analysis
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </PlaceholderPage>
    </div>
  );
};
