import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Clock,
  ShieldCheck,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { SLAIndicator } from '../../components/civic/SLAIndicator';
import { StepProgress } from '../../components/civic/StepProgress';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Spinner } from '../../components/ui/LoadingState';
import { useComplaints } from '../../context/ComplaintContext';
import { translations } from '../../utils/translations';

export const AIUnderstandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { reportDraft, activeLanguage } = useComplaints();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const t = translations[activeLanguage] || translations.en;

  // Simulate short 600ms AI multimodal analysis on arrival
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page-container flex flex-col gap-4 max-w-3xl">
      <Breadcrumb
        items={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'Report', to: '/citizen/report' },
          { label: 'AI Understanding' },
        ]}
      />

      {/* Progress Stepper (Step 2) */}
      <StepProgress currentStep={2} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{t.aiUnderstandingHeading}</h1>
        <p className="text-sm text-muted">{t.aiUnderstandingSubheading}</p>
      </div>

      {isAnalyzing ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <Spinner size="lg" />
            <p className="text-base font-semibold text">Understanding your report...</p>
            <p className="text-xs text-muted max-w-sm">
              Analyzing text description, visual evidence, and Ashi Nagar GIS municipal boundaries.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Section 1: AI Diagnostic Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  <CardTitle>{t.aiDiagnosticTitle}</CardTitle>
                </div>
                <StatusBadge status="ai_analyzed" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Diagnostic Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                {/* Identified Problem */}
                <div className="p-3 border rounded-md bg-surface-hover" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs text-muted font-medium block">{t.problemLabel}</span>
                  <span className="text-sm font-bold text mt-1 block">Major Drinking Water Leakage</span>
                </div>

                {/* Category */}
                <div className="p-3 border rounded-md bg-surface-hover" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs text-muted font-medium block">{t.categoryLabel}</span>
                  <span className="text-sm font-bold text mt-1 block">{reportDraft.category}</span>
                </div>

                {/* Severity */}
                <div className="p-3 border rounded-md bg-surface-hover" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs text-muted font-medium block">{t.severityLabel}</span>
                  <span className="text-sm font-bold text-error mt-1 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {reportDraft.severity.toUpperCase()} Priority
                  </span>
                </div>

                {/* Confidence */}
                <div className="p-3 border rounded-md bg-surface-hover" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs text-muted font-medium block">{t.confidenceLabel}</span>
                  <span className="text-sm font-bold text-success mt-1 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    {(reportDraft.aiConfidence * 100).toFixed(0)}% Match
                  </span>
                </div>
              </div>

              {/* Citizen Original Input Excerpt */}
              <div className="p-3 border rounded-md bg-white" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs font-semibold text-muted uppercase block mb-1">
                  {t.originalReportLabel}
                </span>
                <p className="text-xs text italic leading-relaxed">
                  "{reportDraft.description}"
                </p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t text-xs text-muted">
                  <MapPin size={12} className="text-primary" />
                  <span>{reportDraft.location.address}, {reportDraft.location.city}</span>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                ℹ️ {t.aiDisclaimer}
              </p>
            </CardContent>
          </Card>

          {/* Section 2: Responsible Authority (Main Differentiator) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-primary" />
                  <CardTitle>{t.responsibleAuthorityHeading}</CardTitle>
                </div>
                <Badge variant="primary" size="sm">
                  94% Routing Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                <div>
                  <span className="text-xs text-muted font-medium block mb-1">{t.departmentLabel}</span>
                  <DepartmentBadge code={reportDraft.departmentCode} name={reportDraft.departmentName} />
                </div>

                <div>
                  <span className="text-xs text-muted font-medium block mb-1">{t.zoneLabel}</span>
                  <span className="text-sm font-semibold">{reportDraft.location.zone} · {reportDraft.location.ward}</span>
                </div>

                <div>
                  <span className="text-xs text-muted font-medium block mb-1">{t.slaLabel}</span>
                  <span className="ns-status-badge ns-status-badge--primary">
                    <Clock size={12} />
                    {reportDraft.slaHours} Hours Standard SLA
                  </span>
                </div>
              </div>

              <div className="p-3 bg-primary-subtle border rounded-md" style={{ borderColor: 'var(--primary-border)' }}>
                <p className="text-xs text-primary font-medium leading-relaxed">
                  {t.responsibleSubtext}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <Link to="/citizen/report">
                  <Button variant="outline" size="md" leftIcon={<ArrowLeft size={16} />}>
                    {t.editReportBtn}
                  </Button>
                </Link>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/citizen/duplicate')}
                  rightIcon={<ArrowRight size={16} />}
                >
                  {t.checkSimilarBtn}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
