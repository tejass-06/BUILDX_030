import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Copy,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { SLAIndicator } from '../../components/civic/SLAIndicator';
import { StepProgress } from '../../components/civic/StepProgress';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Modal } from '../../components/ui/Modal';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../components/ui/Toast';
import { translations } from '../../utils/translations';

export const DuplicateDetectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { reportDraft, joinExistingIssue, reportSeparately, activeLanguage } = useComplaints();
  const { showToast } = useToast();

  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);
  const [createdComplaintId, setCreatedComplaintId] = useState<string>('NS-2026-01428');
  const [submissionType, setSubmissionType] = useState<'joined' | 'separate'>('joined');

  const t = translations[activeLanguage] || translations.en;

  // Handle Join Existing
  const handleJoinExisting = () => {
    const targetId = joinExistingIssue();
    setCreatedComplaintId(targetId);
    setSubmissionType('joined');
    setSubmittedModalOpen(true);
    showToast('Linked to existing Ashi Nagar water pipeline issue', 'success');
  };

  // Handle Report Separately
  const handleReportSeparately = () => {
    const newId = reportSeparately();
    setCreatedComplaintId(newId);
    setSubmissionType('separate');
    setSubmittedModalOpen(true);
    showToast(`New complaint ${newId} created successfully`, 'success');
  };

  return (
    <div className="page-container flex flex-col gap-4 max-w-3xl">
      <Breadcrumb
        items={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'Report', to: '/citizen/report' },
          { label: 'AI Understanding', to: '/citizen/ai-understanding' },
          { label: 'Duplicate Check' },
        ]}
      />

      {/* Progress Stepper (Step 3) */}
      <StepProgress currentStep={3} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{t.similarReportsHeading}</h1>
        <p className="text-sm text-muted">{t.similarReportsSubheading}</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Active Duplicate Cluster Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Copy size={18} className="text-warning" />
                <span className="text-xs font-mono font-bold text-primary bg-primary-subtle px-2 py-0.5 rounded">
                  {reportDraft.duplicateClusterId}
                </span>
                <StatusBadge status="sla_approaching" customLabel={`${(reportDraft.duplicateSimilarity * 100).toFixed(0)}% Similarity`} />
              </div>
              <span className="ns-status-badge ns-status-badge--neutral">
                <Users size={12} />
                {reportDraft.duplicateMemberCount} citizens linked
              </span>
            </div>
            <h3 className="text-lg font-bold mt-2">
              Major Drinking Water Pipeline Leakage
            </h3>
            <p className="text-xs text-muted">
              Plot 42, Near Kapil Nagar Community Hall, Ashi Nagar, Nagpur
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-surface-muted rounded-md border" style={{ borderColor: 'var(--border)' }}>
              <div>
                <span className="text-xs text-muted block mb-1">Responsible Authority:</span>
                <DepartmentBadge code="OCW" name="Orange City Water" />
              </div>

              <div>
                <span className="text-xs text-muted block mb-1">Current Status:</span>
                <StatusBadge status="in_progress" />
              </div>

              <div>
                <span className="text-xs text-muted block mb-1">Field Resolution SLA:</span>
                <span className="ns-status-badge ns-status-badge--warning">
                  <Clock size={12} />
                  19h remaining (On Track)
                </span>
              </div>
            </div>

            {/* Why this is considered related */}
            <div className="flex flex-col gap-2 pt-2 border-t">
              <h4 className="text-xs font-bold uppercase text-muted tracking-wider">
                {t.whyDuplicateHeading}
              </h4>
              <div className="flex flex-col gap-1.5 text-xs text">
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                  <span>{t.reason1}</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                  <span>{t.reason2}</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                  <span>{t.reason3}</span>
                </p>
              </div>
            </div>

            {/* Two Clear Choices */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t mt-2">
              {/* PRIMARY: Join Existing Issue */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleJoinExisting}
                className="w-full sm:flex-1 justify-center"
                leftIcon={<Users size={18} />}
              >
                {t.joinExistingBtn}
              </Button>

              {/* SECONDARY: Report Separately */}
              <Button
                variant="outline"
                size="lg"
                onClick={handleReportSeparately}
                className="w-full sm:w-auto"
              >
                {t.reportSeparatelyBtn}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submission Success Modal */}
      <Modal
        isOpen={submittedModalOpen}
        onClose={() => navigate(`/citizen/complaints/${createdComplaintId}`)}
        title={t.complaintSubmittedTitle}
        description="Your report has been securely registered in the Nagpur civic network."
        footer={
          <Button
            variant="primary"
            onClick={() => navigate(`/citizen/complaints/${createdComplaintId}`)}
            rightIcon={<ArrowRight size={16} />}
          >
            {t.viewComplaintBtn}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="p-3 border rounded-md bg-success-subtle flex items-start gap-3" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
            <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--success-text)' }}>
                {submissionType === 'joined'
                  ? 'Linked to Active Issue Cluster'
                  : 'New Complaint Created'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--success-text)' }}>
                {submissionType === 'joined'
                  ? `You will receive live SMS progress alerts for ${createdComplaintId}. You avoided duplicating field work.`
                  : `Your independent work order ${createdComplaintId} has been dispatched to Orange City Water.`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 border rounded-md" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Complaint Reference:</span>
              <span className="text-xs font-mono font-bold text-primary">{createdComplaintId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Status:</span>
              <StatusBadge status="submitted" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Responsible Dept:</span>
              <span className="text-xs font-semibold">{reportDraft.departmentName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Location:</span>
              <span className="text-xs font-medium">Ashi Nagar, Nagpur</span>
            </div>
            {submissionType === 'joined' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">Linked Cluster:</span>
                <span className="text-xs font-mono font-semibold">{reportDraft.duplicateClusterId}</span>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
