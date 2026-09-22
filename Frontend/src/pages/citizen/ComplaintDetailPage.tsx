import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  User,
  Star,
  Camera,
  FileCheck2,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SLAIndicator } from '../../components/civic/SLAIndicator';
import { LocationRow } from '../../components/civic/LocationRow';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { Timeline } from '../../components/civic/Timeline';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useComplaints } from '../../context/ComplaintContext';
import { translations } from '../../utils/translations';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    getComplaintById,
    complaints,
    activeLanguage,
    closeComplaint,
    reopenComplaint,
  } = useComplaints();

  const t = translations[activeLanguage] || translations.en;

  // Find targeted complaint or fallback to primary demo complaint NS-2026-01428
  const complaint = (id ? getComplaintById(id) : undefined) || complaints[0];

  // Citizen verification interaction state
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [reopenReason, setReopenReason] = useState('Problem still exists');
  const [customReopenNote, setCustomReopenNote] = useState('');
  const [selectedRating, setSelectedRating] = useState<number>(complaint.citizenRating || 5);

  const handleConfirmResolved = () => {
    closeComplaint(complaint.id, selectedRating);
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReopenNote ? `${reopenReason}: ${customReopenNote}` : reopenReason;
    reopenComplaint(complaint.id, finalReason);
    setShowReopenDialog(false);
  };

  return (
    <div className="page-container flex flex-col gap-6 max-w-4xl">
      {/* Navigation Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'My Complaints', to: '/citizen/complaints' },
          { label: complaint.id },
        ]}
      />

      {/* Top Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/citizen/complaints">
          <Button variant="outline" size="sm" leftIcon={<ChevronLeft size={16} />}>
            Back to Complaints
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium">Status:</span>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* STATUS BANNER: Reopened Alert */}
      {complaint.status === 'reopened' && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: 'var(--color-danger-50)',
            border: '1px solid var(--color-danger-200)',
          }}
          role="alert"
        >
          <RotateCcw className="text-danger mt-0.5 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-bold text-danger">Complaint Reopened by Citizen</h4>
            <p className="text-xs text-danger mt-1">
              Sent back to Orange City Water Ashi Nagar field team for priority re-inspection.
              {complaint.reopenReason && (
                <span className="font-semibold block mt-0.5">Reason: {complaint.reopenReason}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* STATUS BANNER: Closed Confirmation */}
      {complaint.status === 'closed' && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: 'var(--color-success-50)',
            border: '1px solid var(--color-success-200)',
          }}
          role="status"
        >
          <CheckCircle2 className="text-success mt-0.5 shrink-0" size={20} />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-success">
              {t.thanksForConfirming}
            </h4>
            <p className="text-xs text-muted mt-1">
              Your feedback helps Orange City Water maintain Nagpur’s civic infrastructure quality.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setSelectedRating(star);
                      closeComplaint(complaint.id, star);
                    }}
                    className="focus:outline-none"
                    aria-label={`${star} Stars`}
                  >
                    <Star
                      size={16}
                      fill={star <= (complaint.citizenRating || selectedRating) ? '#F59E0B' : 'transparent'}
                      color={star <= (complaint.citizenRating || selectedRating) ? '#F59E0B' : '#94A3B8'}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CITIZEN VERIFICATION PROMPT (When status is 'resolved') */}
      {complaint.status === 'resolved' && (
        <Card
          className="border-2"
          style={{
            borderColor: 'var(--color-primary-400)',
            backgroundColor: 'var(--color-primary-50)',
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <Sparkles size={16} />
              <span>Officer Submitted Work · Action Required</span>
            </div>
            <CardTitle className="text-xl mt-1 text-primary">
              {t.wasProblemFixedHeading}
            </CardTitle>
            <p className="text-xs text-muted">
              Junior Engineer Ramesh Patil (Orange City Water) reported this drinking water pipeline issue as resolved. Please confirm whether the water leakage is fixed.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Evidence summary preview */}
            <div
              className="p-3 bg-white rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-start gap-3">
                {complaint.resolutionEvidence?.afterPhotoUrl ? (
                  <img
                    src={complaint.resolutionEvidence.afterPhotoUrl}
                    alt="Officer after-repair evidence"
                    className="w-16 h-16 rounded object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-slate-100 flex items-center justify-center text-muted border">
                    <Camera size={20} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text">Officer Resolution Note:</span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      <ShieldCheck size={12} />
                      AI Verified (94%)
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 italic">
                    "{complaint.resolutionEvidence?.officerNotes || 'Pipeline joint repaired and affected road section cleared.'}"
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!showReopenDialog ? (
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmResolved}
                  leftIcon={<CheckCircle2 size={18} />}
                  className="flex-1"
                  style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                >
                  {t.issueResolvedBtn}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowReopenDialog(true)}
                  leftIcon={<RotateCcw size={18} />}
                  className="flex-1 text-danger border-danger-300 hover:bg-danger-50"
                >
                  {t.notFixedBtn}
                </Button>
              </div>
            ) : (
              /* Inline Reopen Form */
              <form
                onSubmit={handleReopenSubmit}
                className="flex flex-col gap-3 p-4 bg-white rounded-lg border border-danger-200 mt-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-danger flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {t.reopenReasonPrompt}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowReopenDialog(false)}
                    className="text-xs text-muted hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    'Problem still exists',
                    'Only partially fixed',
                    'New issue appeared',
                  ].map((reason) => (
                    <label
                      key={reason}
                      className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded hover:bg-slate-50 border"
                      style={{
                        borderColor:
                          reopenReason === reason
                            ? 'var(--color-danger)'
                            : 'var(--color-border)',
                      }}
                    >
                      <input
                        type="radio"
                        name="reopenReason"
                        value={reason}
                        checked={reopenReason === reason}
                        onChange={(e) => setReopenReason(e.target.value)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Additional note (optional)..."
                  value={customReopenNote}
                  onChange={(e) => setCustomReopenNote(e.target.value)}
                  className="w-full text-xs p-2 border rounded border-slate-200"
                />

                <div className="flex justify-end gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setShowReopenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    type="submit"
                    leftIcon={<RotateCcw size={14} />}
                  >
                    {t.reopenComplaintBtn}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Details + Officer + Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Officer Info */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <DepartmentBadge
                  code={complaint.departmentCode}
                  name={complaint.departmentName}
                />
                <SLAIndicator sla={complaint.sla} />
              </div>
              <div className="mt-2">
                <span className="text-xs font-mono text-muted">{complaint.id}</span>
                <h2 className="text-lg font-bold text mt-0.5">{complaint.title}</h2>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text leading-relaxed">{complaint.description}</p>

              {complaint.photoUrls && complaint.photoUrls.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-muted block mb-1.5">
                    Citizen Photo Evidence:
                  </span>
                  <div className="rounded-lg overflow-hidden border border-slate-200 max-h-56 bg-slate-100">
                    <img
                      src={complaint.photoUrls[0]}
                      alt="Citizen reported evidence"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="ns-divider ns-divider--horizontal ns-divider--spacing-xs" />

              <LocationRow location={complaint.location} />
            </CardContent>
          </Card>

          {/* Assigned Officer Card */}
          {complaint.assignedOfficer && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    {t.officerAssignedLabel}
                  </CardTitle>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                    Orange City Water
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {complaint.assignedOfficer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text">{complaint.assignedOfficer.name}</p>
                      <p className="text-xs text-muted">{complaint.assignedOfficer.designation}</p>
                      <p className="text-xs text-muted font-medium">Area: Ashi Nagar / Zone 9</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted bg-slate-50 px-2.5 py-1.5 rounded border">
                    <Phone size={14} />
                    <span className="font-mono">{complaint.assignedOfficer.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Dynamic Timeline */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                Accountability Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline currentStatus={complaint.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
