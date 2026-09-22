import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Users,
  Briefcase,
  Compass,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Send,
  Eye,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { SearchInput } from '../components/ui/SearchInput';
import { Checkbox } from '../components/ui/Checkbox';
import { Radio } from '../components/ui/Radio';
import { FileUpload } from '../components/ui/FileUpload';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Avatar } from '../components/ui/Avatar';
import { Divider } from '../components/ui/Divider';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Spinner, Skeleton } from '../components/ui/LoadingState';
import { Tabs } from '../components/ui/Tabs';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ComplaintCard } from '../components/civic/ComplaintCard';
import { SLAIndicator } from '../components/civic/SLAIndicator';
import { LocationRow } from '../components/civic/LocationRow';
import { DepartmentBadge } from '../components/civic/DepartmentBadge';
import { Timeline } from '../components/civic/Timeline';
import { useComplaints } from '../context/ComplaintContext';

export const FoundationShowcasePage: React.FC = () => {
  const { complaints } = useComplaints();
  const { showToast } = useToast();
  const sampleComplaint = complaints[0]; // NS-2026-01428

  const [activeTab, setActiveTab] = useState('experiences');
  const [modalOpen, setModalOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [radioVal, setRadioVal] = useState('yes');

  return (
    <div className="ns-citizen-shell">
      {/* Top Banner */}
      <header className="ns-citizen-header">
        <div className="ns-citizen-header__inner">
          <div className="ns-brand">
            <div className="ns-brand__emblem">NS</div>
            <div className="ns-brand__text">
              <span className="ns-brand__name">NagarSaathi</span>
              <span className="ns-brand__tag">Phase 1 · Frontend Foundation & Design System</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="ns-status-badge ns-status-badge--success">
              <CheckCircle2 size={12} />
              LOCKED THEME ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page-container flex flex-col gap-8 pb-12">
        {/* Hero Section */}
        <section className="flex flex-col gap-3 pt-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="md">
              Nagpur Civic Intelligence Platform
            </Badge>
            <span className="text-xs text-muted">Phase 1 Foundation Only</span>
          </div>
          <h1 className="text-3xl font-bold">
            NagarSaathi Visual Design System & Architecture
          </h1>
          <p className="text-muted text-base max-w-3xl">
            Clean, civic, modern, and trustworthy foundation. Built strictly with centralized design tokens,
            accessible UI components, and layout architecture for Citizen, Officer, and Command Center experiences.
          </p>
        </section>

        {/* Locked Color Palette Swatches */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">1. Locked Design Tokens & Color System</h2>
          <p className="text-xs text-muted">
            Strict single-theme rule enforced: #4F46E5 primary action, semantic status indicators, no dark mode or excessive decoration.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {/* Primary */}
            <div className="p-3 border rounded-md bg-white flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <div style={{ height: '44px', backgroundColor: '#4F46E5', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <span className="text-xs font-bold block">PRIMARY</span>
                <span className="text-xs font-mono text-muted">#4F46E5</span>
                <span className="text-xs text-muted block mt-1">Brand & Key Action</span>
              </div>
            </div>

            {/* Background */}
            <div className="p-3 border rounded-md bg-white flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <div style={{ height: '44px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <span className="text-xs font-bold block">BACKGROUND</span>
                <span className="text-xs font-mono text-muted">#F8FAFC</span>
                <span className="text-xs text-muted block mt-1">Light Gray Page Canvas</span>
              </div>
            </div>

            {/* Surface/Cards */}
            <div className="p-3 border rounded-md bg-white flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <div style={{ height: '44px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <span className="text-xs font-bold block">SURFACE</span>
                <span className="text-xs font-mono text-muted">#FFFFFF</span>
                <span className="text-xs text-muted block mt-1">White Card Surface</span>
              </div>
            </div>

            {/* Text */}
            <div className="p-3 border rounded-md bg-white flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <div style={{ height: '44px', backgroundColor: '#1E293B', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <span className="text-xs font-bold block">TEXT</span>
                <span className="text-xs font-mono text-muted">#1E293B</span>
                <span className="text-xs text-muted block mt-1">High-Contrast Slate</span>
              </div>
            </div>

            {/* Success */}
            <div className="p-3 border rounded-md bg-white flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <div style={{ height: '44px', backgroundColor: '#16A34A', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <span className="text-xs font-bold block">SUCCESS</span>
                <span className="text-xs font-mono text-muted">#16A34A</span>
                <span className="text-xs text-muted block mt-1">Resolved & Verified</span>
              </div>
            </div>

            {/* Warning */}
            <div className="p-3 border rounded-md bg-white flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <div style={{ height: '44px', backgroundColor: '#F59E0B', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <span className="text-xs font-bold block">WARNING</span>
                <span className="text-xs font-mono text-muted">#F59E0B</span>
                <span className="text-xs text-muted block mt-1">SLA Approaching</span>
              </div>
            </div>

            {/* Error */}
            <div className="p-3 border rounded-md bg-white flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
              <div style={{ height: '44px', backgroundColor: '#DC2626', borderRadius: 'var(--radius-sm)' }} />
              <div>
                <span className="text-xs font-bold block">ERROR</span>
                <span className="text-xs font-mono text-muted">#DC2626</span>
                <span className="text-xs text-muted block mt-1">SLA Breached / Urgent</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section Navigation Tabs */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-bold">2. Architecture & Interactive Component Showcase</h2>
          </div>

          <Tabs
            tabs={[
              { id: 'experiences', label: '3 Experience Portals', icon: <Compass size={16} /> },
              { id: 'civic', label: 'Civic Data & Models', icon: <Layers size={16} /> },
              { id: 'ui', label: 'UI Component Library', icon: <Briefcase size={16} /> },
              { id: 'feedback', label: 'Feedback & Accessibility', icon: <Shield size={16} /> },
            ]}
            activeTabId={activeTab}
            onChange={setActiveTab}
          />

          {/* TAB 1: 3 Experience Portals */}
          {activeTab === 'experiences' && (
            <div className="flex flex-col gap-6 pt-2">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 'var(--space-6)',
                }}
              >
                {/* Citizen Experience */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        <CardTitle>1. Citizen Experience</CardTitle>
                      </div>
                      <Badge variant="primary">Mobile-First</Badge>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Citizen problem reporting, AI analysis preview, duplicate clustering, and resolution feedback.
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Link to="/citizen">
                      <Button variant="primary" className="w-full justify-between">
                        <span>Launch Citizen Home</span>
                        <ArrowRight size={16} />
                      </Button>
                    </Link>

                    <div className="flex flex-col gap-1 pt-2 border-t mt-2">
                      <span className="text-xs font-semibold text-muted">Citizen Sub-Routes:</span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Link to="/citizen/report" className="text-primary hover:underline">/report</Link> ·
                        <Link to="/citizen/ai-understanding" className="text-primary hover:underline">/ai-understanding</Link> ·
                        <Link to="/citizen/duplicate" className="text-primary hover:underline">/duplicate</Link> ·
                        <Link to="/citizen/complaints" className="text-primary hover:underline">/complaints</Link> ·
                        <Link to="/citizen/complaints/NS-2026-01428" className="text-primary hover:underline">/complaints/:id</Link> ·
                        <Link to="/citizen/resolution/NS-2026-01428" className="text-primary hover:underline">/resolution/:id</Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Officer Experience */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase size={20} className="text-primary" />
                        <CardTitle>2. Officer Experience</CardTitle>
                      </div>
                      <Badge variant="neutral">Desktop Console</Badge>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Field triage console with desktop sidebar, work order list, SLA monitoring, and resolution upload.
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Link to="/officer">
                      <Button variant="primary" className="w-full justify-between">
                        <span>Launch Officer Dashboard</span>
                        <ArrowRight size={16} />
                      </Button>
                    </Link>

                    <div className="flex flex-col gap-1 pt-2 border-t mt-2">
                      <span className="text-xs font-semibold text-muted">Officer Sub-Routes:</span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Link to="/officer" className="text-primary hover:underline">/officer</Link> ·
                        <Link to="/officer/complaints" className="text-primary hover:underline">/officer/complaints</Link> ·
                        <Link to="/officer/complaints/NS-2026-01428" className="text-primary hover:underline">/officer/complaints/:id</Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Command Center Experience */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass size={20} className="text-primary" />
                        <CardTitle>3. Command Center</CardTitle>
                      </div>
                      <Badge variant="neutral">Executive Operations</Badge>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Citywide executive intelligence with hotspot tracking, department metrics, and conflict alerts.
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Link to="/command-center">
                      <Button variant="primary" className="w-full justify-between">
                        <span>Launch Command Center</span>
                        <ArrowRight size={16} />
                      </Button>
                    </Link>

                    <div className="flex flex-col gap-1 pt-2 border-t mt-2">
                      <span className="text-xs font-semibold text-muted">Command Center Sub-Routes:</span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Link to="/command-center" className="text-primary hover:underline">/overview</Link> ·
                        <Link to="/command-center/hotspots" className="text-primary hover:underline">/hotspots</Link> ·
                        <Link to="/command-center/departments" className="text-primary hover:underline">/departments</Link> ·
                        <Link to="/command-center/conflicts" className="text-primary hover:underline">/conflicts</Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: Civic Data & Models */}
          {activeTab === 'civic' && (
            <div className="flex flex-col gap-6 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Single Source of Truth: Complaint Lifecycle Card</CardTitle>
                  <p className="text-xs text-muted">
                    This sample complaint (NS-2026-01428) is structured to flow across Citizen, AI, Officer, and Command Center.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ComplaintCard
                    complaint={sampleComplaint}
                    to={`/citizen/complaints/${sampleComplaint.id}`}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Complaint Lifecycle Timeline:</h4>
                      <Timeline currentStatus={sampleComplaint.status} />
                    </div>

                    <div className="flex flex-col gap-3">
                      <h4 className="text-sm font-semibold">Civic Semantic Indicators:</h4>
                      <div className="flex flex-col gap-2">
                        <SLAIndicator sla={sampleComplaint.sla} />
                        <SLAIndicator sla={{ ...sampleComplaint.sla, isBreached: true }} />
                        <SLAIndicator sla={sampleComplaint.sla} isResolved={true} />
                        <DepartmentBadge code="OCW" name="Orange City Water" />
                        <DepartmentBadge code="NMC_ROAD" name="NMC Road Infrastructure" />
                        <LocationRow location={sampleComplaint.location} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: UI Component Library */}
          {activeTab === 'ui' && (
            <div className="flex flex-col gap-6 pt-2">
              {/* Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Buttons & Interactive Controls</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="danger">Danger Button</Button>
                    <Button variant="primary" isLoading>Loading State</Button>
                    <Button variant="primary" leftIcon={<Send size={16} />}>With Icon</Button>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs text-muted">Sizes:</span>
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="md">Medium</Button>
                    <Button variant="primary" size="lg">Large</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Form Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Elements</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Civic Input Field"
                      placeholder="e.g. Ward Number or Name"
                      helperText="Accessible helper text"
                    />
                    <Select
                      label="Civic Department Select"
                      placeholder="Choose Department"
                      defaultValue="ocw"
                    >
                      <option value="ocw">Orange City Water (OCW)</option>
                      <option value="roads">NMC Road Maintenance</option>
                      <option value="elec">NMC Streetlights</option>
                    </Select>
                  </div>

                  <SearchInput
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onClear={() => setSearchVal('')}
                    placeholder="Live Search Input with clear trigger..."
                  />

                  <div className="flex items-center gap-6">
                    <Checkbox
                      label="Receive SMS updates on complaint status"
                      checked={checkboxVal}
                      onChange={(e) => setCheckboxVal(e.target.checked)}
                    />
                    <Radio
                      name="sample-radio"
                      value="yes"
                      label="Issue is resolved"
                      checked={radioVal === 'yes'}
                      onChange={() => setRadioVal('yes')}
                    />
                  </div>

                  <FileUpload
                    label="Civic Evidence Dropzone"
                    helperText="Upload JPG/PNG photo evidence of civic problem"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: Feedback & Accessibility */}
          {activeTab === 'feedback' && (
            <div className="flex flex-col gap-6 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Semantic Alerts & Notifications</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Alert variant="info" title="AI Verification Complete">
                    Complaint NS-2026-01428 classified with 96% confidence as Water Leakage.
                  </Alert>
                  <Alert variant="success" title="Field Resolution Verified">
                    Collar clamp installed by OCW crew. Potable water line pressure restored.
                  </Alert>
                  <Alert variant="warning" title="SLA Countdown Warning">
                    19 hours remaining for Ward 2 pipeline restoration before escalation.
                  </Alert>
                  <Alert variant="error" title="Inter-Department Clash Flagged">
                    NMC Road paving directly conflicts with scheduled OCW pipeline excavation.
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Modals, Toasts & Loading States</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setModalOpen(true)}
                  >
                    Open Accessible Dialog
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => showToast('Civic grievance NS-2026-01428 synced successfully', 'success')}
                  >
                    Trigger Success Toast
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => showToast('SLA threshold breached on Central Avenue work order', 'error')}
                  >
                    Trigger Error Toast
                  </Button>

                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-xs text-muted">Spinner:</span>
                    <Spinner size="sm" />
                    <Spinner size="md" />
                  </div>
                </CardContent>
              </Card>

              {/* Accessible Modal Dialog */}
              <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Complaint Verification Modal"
                description="This accessible dialog traps focus, supports Esc to close, and provides clear action buttons."
                footer={
                  <>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => setModalOpen(false)}>
                      Confirm Action
                    </Button>
                  </>
                }
              >
                <div className="flex flex-col gap-3">
                  <p className="text-sm">
                    Confirming will mark work order <strong>NS-2026-01428</strong> as inspected by Ashi Nagar field team.
                  </p>
                  <LocationRow location={sampleComplaint.location} />
                </div>
              </Modal>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
