import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Sparkles,
  Camera,
  Check,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Clock,
  User,
  RotateCcw,
  Copy,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SLAIndicator } from '../../components/civic/SLAIndicator';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { LocationRow } from '../../components/civic/LocationRow';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Spinner } from '../../components/ui/LoadingState';
import { useComplaints } from '../../context/ComplaintContext';

export const OfficerComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getComplaintById, complaints, updateResolutionEvidence } = useComplaints();

  const complaint = (id ? getComplaintById(id) : undefined) || complaints[0];

  // Resolution evidence form state
  const [hasAfterPhoto, setHasAfterPhoto] = useState(
    Boolean(complaint.resolutionEvidence?.afterPhotoUrl)
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    complaint.resolutionEvidence?.afterPhotoUrl ||
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'
  );
  const [resolutionNote, setResolutionNote] = useState(
    complaint.resolutionEvidence?.officerNotes ||
      'Pipeline joint repaired and affected road section cleared.'
  );

  // AI Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiVerified, setAiVerified] = useState(
    Boolean(complaint.resolutionEvidence?.aiVerificationScore)
  );

  // Submission state
  const [resolvedSuccess, setResolvedSuccess] = useState(complaint.status === 'resolved');

  const handleSimulateAfterPhoto = () => {
    setHasAfterPhoto(true);
    setAfterPhotoUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80');
    // Auto-trigger verification
    triggerAiVerification();
  };

  const triggerAiVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAiVerified(true);
    }, 600);
  };

  const handleMarkResolved = () => {
    updateResolutionEvidence(complaint.id, {
      afterPhotoUrl: hasAfterPhoto ? afterPhotoUrl : undefined,
      officerNotes: resolutionNote,
      aiVerificationScore: 0.94,
      aiVerificationStatus: 'verified',
      resolvedAt: new Date().toISOString(),
    });
    setResolvedSuccess(true);
  };

  return (
    <div className="page-container flex flex-col gap-6 max-w-6xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Officer Portal', to: '/officer' },
          { label: 'Complaints', to: '/officer/complaints' },
          { label: complaint.id },
        ]}
      />

      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/officer/complaints">
            <Button variant="outline" size="sm" leftIcon={<ChevronLeft size={16} />}>
              Back to Queue
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary">{complaint.id}</span>
              <DepartmentBadge code={complaint.departmentCode} name={complaint.departmentName} />
              <StatusBadge status={complaint.status} />
            </div>
            <h1 className="text-xl font-bold text mt-1">{complaint.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SLAIndicator sla={complaint.sla} />
          {/* Quick link to Citizen perspective for testing the shared workflow */}
          <Link to={`/citizen/complaints/${complaint.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" rightIcon={<ExternalLink size={14} />}>
              View Citizen Screen
            </Button>
          </Link>
        </div>
      </div>

      {/* SUCCESS / STATUS BANNERS */}
      {complaint.status === 'resolved' && (
        <div
          className="p-4 rounded-lg flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200"
          role="alert"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-success shrink-0" size={22} />
            <div>
              <h4 className="text-sm font-bold text-success">
                Marked as Resolved · Awaiting Citizen Verification
              </h4>
              <p className="text-xs text-muted mt-0.5">
                Resolution evidence is live in shared state. Citizen Pooja Raut will be prompted to confirm the fix.
              </p>
            </div>
          </div>
          <Link to={`/citizen/complaints/${complaint.id}`}>
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
              Open Citizen Verification
            </Button>
          </Link>
        </div>
      )}

      {complaint.status === 'closed' && (
        <div
          className="p-4 rounded-lg flex items-center gap-3 bg-indigo-50 border border-indigo-200"
          role="status"
        >
          <CheckCircle2 className="text-primary shrink-0" size={22} />
          <div>
            <h4 className="text-sm font-bold text-primary">Work Order Closed & Confirmed</h4>
            <p className="text-xs text-muted mt-0.5">
              Citizen confirmed the pipeline repair with a {complaint.citizenRating || 5}-star satisfaction rating.
            </p>
          </div>
        </div>
      )}

      {complaint.status === 'reopened' && (
        <div
          className="p-4 rounded-lg flex items-start gap-3 bg-rose-50 border border-rose-200"
          role="alert"
        >
          <RotateCcw className="text-danger mt-0.5 shrink-0" size={20} />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-danger">Work Order Reopened by Citizen</h4>
            <p className="text-xs text-danger mt-0.5">
              Citizen indicated the problem was not satisfactorily resolved.
              {complaint.reopenReason && (
                <span className="font-semibold block mt-1">Reported Reason: {complaint.reopenReason}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Details + Resolution Evidence & AI Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint Details, AI Intelligence & Duplicate Cluster (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Card 1: Citizen Report Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Citizen Incident Report</span>
                <span className="text-xs text-muted font-normal">Reported by Pooja Raut</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text leading-relaxed">{complaint.description}</p>

              {complaint.photoUrls && complaint.photoUrls.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-muted block mb-1.5">
                    Citizen Photo Evidence:
                  </span>
                  <div className="rounded-lg overflow-hidden border border-slate-200 max-h-52 bg-slate-100">
                    <img
                      src={complaint.photoUrls[0]}
                      alt="Citizen before report evidence"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="ns-divider ns-divider--horizontal ns-divider--spacing-xs" />

              <LocationRow location={complaint.location} />
            </CardContent>
          </Card>

          {/* Card 2: AI Civic Problem Intelligence (Structured Data from Phase 3) */}
          <Card className="border-indigo-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2 text-primary">
                  <Sparkles size={16} />
                  AI Intelligence & Routing Diagnostics
                </CardTitle>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  96% Confidence
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-muted block">Detected Problem:</span>
                  <strong className="text-sm font-semibold text">Water Pipeline Leakage</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-muted block">AI Category:</span>
                  <strong className="text-sm font-semibold text">Water Leakage & Distribution</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-muted block">Severity Rating:</span>
                  <strong className="text-sm font-semibold text-rose-700">High Severity</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-muted block">Responsible Authority:</span>
                  <strong className="text-sm font-semibold text-primary">Orange City Water (OCW)</strong>
                </div>
              </div>

              {/* Duplicate Cluster Intelligence */}
              {complaint.duplicateCluster && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 flex items-start gap-3">
                  <Copy size={18} className="text-purple-700 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <div className="flex items-center gap-2">
                      <strong className="text-purple-900 font-bold">
                        Duplicate Cluster: {complaint.duplicateCluster.clusterId}
                      </strong>
                      <span className="px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 font-bold">
                        89% Similarity
                      </span>
                    </div>
                    <p className="text-purple-800 mt-1">
                      Merged with 3 identical citizen reports near Kapil Nagar Square to prevent duplicate field dispatches.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Assigned Officer Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User size={16} className="text-primary" />
                Assigned Field Personnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    RP
                  </div>
                  <div>
                    <p className="text-sm font-bold text">Ramesh Patil</p>
                    <p className="text-xs text-muted">Junior Engineer · Ashi Nagar Zone</p>
                    <p className="text-xs text-muted font-medium">Department: Orange City Water (Zone 9)</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="text-muted block">Contact:</span>
                  <span className="font-mono font-semibold">+91 98231 44550</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Resolution Evidence & AI Verification (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="border-2 border-indigo-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text flex items-center gap-2">
                  <Camera size={18} className="text-primary" />
                  Resolution Evidence
                </CardTitle>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-medium">
                  Field Action
                </span>
              </div>
              <p className="text-xs text-muted">
                Document post-repair evidence and run AI resolution verification.
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* After Photo Section */}
              <div>
                <label className="text-xs font-bold text block mb-1">
                  Add After Photo Evidence:
                </label>

                {hasAfterPhoto ? (
                  <div className="flex flex-col gap-2">
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 h-44 bg-slate-100">
                      <img
                        src={afterPhotoUrl}
                        alt="Repaired pipeline after photo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded shadow font-semibold flex items-center gap-1">
                        <Check size={12} />
                        After Photo Attached
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Simulated field camera capture</span>
                      <button
                        type="button"
                        onClick={() => {
                          setHasAfterPhoto(false);
                          setAiVerified(false);
                        }}
                        className="text-rose-600 hover:underline"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-center gap-2 bg-slate-50">
                    <Camera size={28} className="text-muted" />
                    <p className="text-xs text-muted">
                      No after-repair photo attached yet.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={handleSimulateAfterPhoto}
                      leftIcon={<UploadCloud size={14} />}
                    >
                      Add After Photo
                    </Button>
                  </div>
                )}
              </div>

              {/* Resolution Note Section */}
              <div>
                <label className="text-xs font-bold text block mb-1">
                  Resolution Note:
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Describe repair action taken..."
                  className="w-full text-xs p-2.5 border rounded-lg border-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* AI RESOLUTION VERIFICATION SECTION */}
              <div
                className="p-3.5 rounded-lg border"
                style={{
                  backgroundColor: aiVerified ? 'var(--color-success-50)' : 'var(--color-bg-subtle)',
                  borderColor: aiVerified ? 'var(--color-success-200)' : 'var(--color-border)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text">
                    <Sparkles size={15} className="text-primary" />
                    <span>AI Resolution Verification</span>
                  </div>
                  {isVerifying ? (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <Spinner size="sm" />
                      <span>Verifying...</span>
                    </div>
                  ) : aiVerified ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Likely Resolved (94%)
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Pending Run</span>
                  )}
                </div>

                {isVerifying && (
                  <p className="text-xs text-muted italic animate-pulse">
                    Verifying resolution evidence with Ashi Nagar spatial registry...
                  </p>
                )}

                {aiVerified && (
                  <div className="flex flex-col gap-1.5 text-xs text mt-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-medium">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span>After photo available & visual rupture resolved</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800 font-medium">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span>GPS location matches Ashi Nagar pipeline grid</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800 font-medium">
                      <Check size={14} className="text-emerald-600 shrink-0" />
                      <span>Resolution note provided & validated</span>
                    </div>
                  </div>
                )}

                {!aiVerified && !isVerifying && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={triggerAiVerification}
                      className="w-full"
                      leftIcon={<Sparkles size={14} />}
                    >
                      Run AI Verification
                    </Button>
                  </div>
                )}
              </div>

              {/* MARK AS RESOLVED ACTION BUTTON */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  type="button"
                  onClick={handleMarkResolved}
                  className="w-full"
                  leftIcon={<CheckCircle2 size={18} />}
                  style={{
                    backgroundColor: 'var(--color-success)',
                    borderColor: 'var(--color-success)',
                  }}
                >
                  {complaint.status === 'resolved' ? 'Update Resolution' : 'Mark as Resolved'}
                </Button>
                <p className="text-center text-xs text-muted mt-2">
                  Updates shared complaint state and requests citizen verification.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
