import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  MapPin,
  ChevronRight,
  Droplets,
  AlertCircle,
  Trash2,
  Lightbulb,
  Map,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ComplaintCard } from '../../components/civic/ComplaintCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { useComplaints } from '../../context/ComplaintContext';
import { translations } from '../../utils/translations';

export const CitizenHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, departments, activeLanguage } = useComplaints();
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Scalable multilingual strings
  const t = translations[activeLanguage] || translations.en;

  // Derive citizen-specific active and resolved counts
  // Primary citizen in our mock dataset is cit-9021 (Pooja Raut)
  const citizenComplaints = complaints.filter(
    (c) => c.citizen.id === 'cit-9021' || c.id === 'NS-2026-01428'
  );
  const activeCount = citizenComplaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'citizen_confirmed'
  ).length;
  const inProgressCount = citizenComplaints.filter(
    (c) => c.status === 'in_progress' || c.status === 'assigned'
  ).length;
  const resolvedCount = citizenComplaints.filter(
    (c) => c.status === 'resolved' || c.status === 'citizen_confirmed'
  ).length;

  const primaryComplaint = citizenComplaints[0] || complaints[0];

  // Dynamic department counts from mock dataset
  const getDeptCount = (code: string, fallback: number) => {
    const dept = departments.find((d) => d.code === code);
    return dept ? dept.activeWorkload : fallback;
  };

  return (
    <div className="page-container ns-citizen-home">
      {/* 1. Hero / Primary Action Section */}
      <section className="ns-citizen-hero" aria-labelledby="citizen-hero-title">
        <span className="ns-citizen-hero__tag">
          <ShieldCheck size={14} aria-hidden="true" />
          {t.tagline}
        </span>

        <h1 id="citizen-hero-title" className="ns-citizen-hero__title">
          {t.heroTitle}
        </h1>

        <p className="ns-citizen-hero__desc">
          {t.heroSubtitle}
        </p>

        <div className="ns-citizen-hero__actions">
          <Link to="/citizen/report">
            <Button
              variant="primary"
              size="lg"
              className="ns-citizen-hero__primary-btn"
              leftIcon={<PlusCircle size={20} />}
            >
              {t.reportProblemBtn}
            </Button>
          </Link>

          <Link to="/citizen/complaints">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<FileText size={18} />}
            >
              {t.myComplaintsBtn}
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Quick Actions Section */}
      <section aria-label="Quick Actions">
        <div className="ns-quick-actions-grid">
          {/* Action 1: Report Problem */}
          <Link to="/citizen/report" className="ns-quick-action-card">
            <div className="ns-quick-action-card__left">
              <div className="ns-quick-action-card__icon">
                <PlusCircle size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="ns-quick-action-card__title">{t.quickReport}</p>
                <p className="ns-quick-action-card__desc">AI-assisted issue intake</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" aria-hidden="true" />
          </Link>

          {/* Action 2: My Complaints */}
          <Link to="/citizen/complaints" className="ns-quick-action-card">
            <div className="ns-quick-action-card__left">
              <div className="ns-quick-action-card__icon">
                <FileText size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="ns-quick-action-card__title">{t.quickComplaints}</p>
                <p className="ns-quick-action-card__desc">Live SLA & field tracking</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" aria-hidden="true" />
          </Link>

          {/* Action 3: Nagpur City Map */}
          <button
            type="button"
            onClick={() => setMapModalOpen(true)}
            className="ns-quick-action-card text-left"
          >
            <div className="ns-quick-action-card__left">
              <div className="ns-quick-action-card__icon">
                <MapPin size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="ns-quick-action-card__title">{t.quickCityMap}</p>
                <p className="ns-quick-action-card__desc">Explore active repairs</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* 3. Citizen Civic Summary Section */}
      <section aria-labelledby="citizen-summary-heading">
        <h2 id="citizen-summary-heading" className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          {t.civicSummaryTitle}
        </h2>
        <div className="ns-citizen-summary-grid">
          {/* Active */}
          <div className="ns-citizen-stat-pill">
            <span className="ns-citizen-stat-pill__num text-primary">{activeCount}</span>
            <span className="ns-citizen-stat-pill__label">{t.activeComplaintsLabel}</span>
          </div>

          {/* In Progress */}
          <div className="ns-citizen-stat-pill">
            <span className="ns-citizen-stat-pill__num" style={{ color: 'var(--warning)' }}>
              {inProgressCount}
            </span>
            <span className="ns-citizen-stat-pill__label">{t.inProgressLabel}</span>
          </div>

          {/* Resolved */}
          <div className="ns-citizen-stat-pill">
            <span className="ns-citizen-stat-pill__num text-success">{resolvedCount}</span>
            <span className="ns-citizen-stat-pill__label">{t.resolvedLabel}</span>
          </div>
        </div>
      </section>

      {/* 4. Recent / My Complaints Section */}
      <section aria-labelledby="recent-complaints-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="recent-complaints-heading" className="text-base font-bold text">
            {t.recentComplaintsTitle}
          </h2>
          {citizenComplaints.length > 0 && (
            <Link to="/citizen/complaints" className="text-xs font-semibold text-primary hover:underline">
              {t.viewAllComplaints} ({citizenComplaints.length})
            </Link>
          )}
        </div>

        {primaryComplaint ? (
          <div className="flex flex-col gap-3">
            <ComplaintCard
              complaint={primaryComplaint}
              to={`/citizen/complaints/${primaryComplaint.id}`}
            />
          </div>
        ) : (
          <EmptyState
            title={t.noComplaintsTitle}
            description={t.noComplaintsDesc}
            actionLabel={t.reportProblemBtn}
            onAction={() => navigate('/citizen/report')}
          />
        )}
      </section>

      {/* 5. Nagpur City Awareness Section */}
      <section id="city-awareness" className="ns-city-awareness-card" aria-labelledby="city-awareness-heading">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h2 id="city-awareness-heading" className="text-lg font-bold text">
              {t.cityAwarenessTitle}
            </h2>
            <p className="text-xs text-muted mt-1">
              {t.cityAwarenessSubtitle}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Map size={15} />}
            onClick={() => setMapModalOpen(true)}
          >
            {t.exploreMapBtn}
          </Button>
        </div>

        {/* 4 Civic Category Indicators */}
        <div className="ns-city-awareness-grid">
          {/* Water */}
          <div className="ns-city-category-card">
            <div className="flex items-center justify-between">
              <span className="ns-city-category-card__name">{t.waterIssues}</span>
              <Droplets size={14} className="text-primary" />
            </div>
            <span className="ns-city-category-card__count">
              {getDeptCount('OCW', 142)}
            </span>
            <span className="ns-city-category-card__meta">Orange City Water</span>
          </div>

          {/* Roads */}
          <div className="ns-city-category-card">
            <div className="flex items-center justify-between">
              <span className="ns-city-category-card__name">{t.roadIssues}</span>
              <AlertCircle size={14} className="text-warning" />
            </div>
            <span className="ns-city-category-card__count">
              {getDeptCount('NMC_ROAD', 218)}
            </span>
            <span className="ns-city-category-card__meta">NMC Road Cell</span>
          </div>

          {/* Waste */}
          <div className="ns-city-category-card">
            <div className="flex items-center justify-between">
              <span className="ns-city-category-card__name">{t.garbageIssues}</span>
              <Trash2 size={14} className="text-muted" />
            </div>
            <span className="ns-city-category-card__count">
              {getDeptCount('NMC_HEALTH', 165)}
            </span>
            <span className="ns-city-category-card__meta">Health & Sanitation</span>
          </div>

          {/* Lighting */}
          <div className="ns-city-category-card">
            <div className="flex items-center justify-between">
              <span className="ns-city-category-card__name">{t.lightingIssues}</span>
              <Lightbulb size={14} className="text-warning" />
            </div>
            <span className="ns-city-category-card__count">
              {getDeptCount('NMC_ELEC', 86)}
            </span>
            <span className="ns-city-category-card__meta">Electrical Division</span>
          </div>
        </div>
      </section>

      {/* Nagpur City Map Preview Modal */}
      <Modal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        title={t.mapModalTitle}
        description={t.mapModalDesc}
        footer={
          <Button variant="primary" size="sm" onClick={() => setMapModalOpen(false)}>
            {t.closeBtn}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <div
            style={{
              height: '240px',
              backgroundColor: 'var(--surface-muted)',
              border: '1.5px dashed var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              textAlign: 'center',
              padding: 'var(--space-4)',
            }}
          >
            <MapPin size={32} className="text-primary" />
            <p className="text-sm font-semibold">Nagpur Ward & Hotspot Intelligence Map</p>
            <p className="text-xs text-muted max-w-sm">
              Live GIS layers tracking water pipeline ruptures in Ashi Nagar, pothole repairs on Central Avenue, and Dharampeth streetlight repairs.
            </p>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-md" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-xs font-semibold">Nearest Active Repair to You</p>
              <p className="text-xs text-muted">Ashi Nagar Ward 2 · Orange City Water</p>
            </div>
            <span className="ns-status-badge ns-status-badge--primary">
              19h SLA Remaining
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
