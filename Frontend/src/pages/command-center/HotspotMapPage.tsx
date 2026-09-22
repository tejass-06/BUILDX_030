import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Building2,
  Clock,
  Layers,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DepartmentBadge } from '../../components/civic/DepartmentBadge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useComplaints } from '../../context/ComplaintContext';

export const HotspotMapPage: React.FC = () => {
  const { hotspots, complaints } = useComplaints();
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('hs-01');

  const selectedHotspot = hotspots.find((h) => h.id === selectedHotspotId) || hotspots[0];
  const primaryDemoComplaint = complaints.find((c) => c.id === 'NS-2026-01428');

  // Stylized zone map layout coordinates on a 800x450 canvas
  const mapZones = [
    {
      id: 'hs-01',
      name: 'Zone 9 - Ashi Nagar',
      ward: 'Ward 2 & 3',
      category: 'Water Pipeline Faults',
      count: 38,
      risk: 'high',
      x: 580,
      y: 90,
      pinColor: '#EF4444',
      bgZone: 'M 480 30 L 680 30 L 720 160 L 520 170 Z',
    },
    {
      id: 'hs-02',
      name: 'Zone 6 - Gandhibagh',
      ward: 'Ward 14 & 15',
      category: 'Monsoon Road Damage',
      count: 29,
      risk: 'high',
      x: 440,
      y: 220,
      pinColor: '#F59E0B',
      bgZone: 'M 360 170 L 520 170 L 540 290 L 370 290 Z',
    },
    {
      id: 'hs-03',
      name: 'Zone 2 - Dharampeth',
      ward: 'Ward 36',
      category: 'Streetlight Cable Failures',
      count: 14,
      risk: 'medium',
      x: 230,
      y: 260,
      pinColor: '#3B82F6',
      bgZone: 'M 140 190 L 350 170 L 360 320 L 160 340 Z',
    },
    {
      id: 'hs-04',
      name: 'Zone 3 - Hanuman Nagar',
      ward: 'Ward 28',
      category: 'Drainage Overflows',
      count: 19,
      risk: 'medium',
      x: 420,
      y: 350,
      pinColor: '#8B5CF6',
      bgZone: 'M 370 295 L 540 295 L 520 410 L 350 400 Z',
    },
  ];

  return (
    <div className="page-container flex flex-col gap-6 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Command Center', to: '/command-center' },
          { label: 'Civic Problem Hotspots' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 px-2 py-0.5 rounded bg-amber-50 flex items-center gap-1">
              <Flame size={12} />
              Spatial Density Clustering
            </span>
            <span className="text-xs text-muted">Nagpur Municipal Corporation GIS Layer</span>
          </div>
          <h1 className="text-2xl font-bold text">Nagpur Civic Problem Hotspots</h1>
          <p className="text-sm text-muted">
            Predictive clustering of recurring infrastructure failures across 10 administrative zones.
          </p>
        </div>
      </div>

      {/* Main Layout: Interactive Visual Map + Detailed Hotspot Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Map Canvas (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="overflow-hidden border-2 border-slate-200">
            <CardHeader className="bg-slate-50/80 border-b border-slate-200 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text">
                    Nagpur Municipal Spatial Grid
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    High Risk
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    Medium Risk
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-slate-900 relative">
              {/* Simulated Stylized SVG Map of Nagpur */}
              <svg
                viewBox="0 0 800 450"
                className="w-full h-auto select-none"
                style={{ maxHeight: '420px', minHeight: '320px' }}
                aria-label="Interactive Nagpur Civic Hotspot Map"
              >
                {/* Background Grid Pattern */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="800" height="450" fill="#0F172A" />
                <rect width="800" height="450" fill="url(#grid)" />

                {/* City Landmark Roads / Arteries */}
                <path
                  d="M 100 240 Q 300 220 500 200 T 750 160"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="6"
                  strokeDasharray="4 2"
                />
                <path
                  d="M 450 40 L 440 420"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="5"
                />
                <circle cx="440" cy="220" r="160" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="6 6" />

                {/* Zone Boundary Polygons */}
                {mapZones.map((z) => {
                  const isSelected = selectedHotspotId === z.id;
                  return (
                    <g key={z.id} onClick={() => setSelectedHotspotId(z.id)} className="cursor-pointer">
                      <path
                        d={z.bgZone}
                        fill={isSelected ? `${z.pinColor}25` : '#1E293B40'}
                        stroke={isSelected ? z.pinColor : '#334155'}
                        strokeWidth={isSelected ? 2 : 1}
                        className="transition-all duration-200 hover:fill-opacity-50"
                      />
                    </g>
                  );
                })}

                {/* Hotspot Pins with Pulsing Rings */}
                {mapZones.map((z) => {
                  const isSelected = selectedHotspotId === z.id;
                  return (
                    <g
                      key={`pin-${z.id}`}
                      onClick={() => setSelectedHotspotId(z.id)}
                      className="cursor-pointer group"
                      transform={`translate(${z.x}, ${z.y})`}
                    >
                      {/* Pulse Circle for High Risk */}
                      {z.risk === 'high' && (
                        <circle
                          r={isSelected ? 26 : 18}
                          fill="none"
                          stroke={z.pinColor}
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-ping"
                        />
                      )}

                      {/* Selection Aura */}
                      {isSelected && (
                        <circle
                          r="24"
                          fill={z.pinColor}
                          fillOpacity="0.25"
                          stroke={z.pinColor}
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Main Node */}
                      <circle
                        r={isSelected ? 16 : 12}
                        fill={z.pinColor}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="filter drop-shadow"
                      />

                      {/* Incident Count inside Pin */}
                      <text
                        textAnchor="middle"
                        dy="4.5"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {z.count}
                      </text>

                      {/* Label under node */}
                      <rect
                        x="-60"
                        y="18"
                        width="120"
                        height="20"
                        rx="4"
                        fill="#0F172AEB"
                        stroke={isSelected ? z.pinColor : '#334155'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="32"
                        textAnchor="middle"
                        fill={isSelected ? '#F8FAFC' : '#94A3B8'}
                        fontSize="10"
                        fontWeight={isSelected ? 'bold' : '500'}
                      >
                        {z.name.split(' - ')[1]} ({z.count})
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Map Footer Helper */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Nagpur Municipal Corporation GIS Layer (Zone 1 to 10)</span>
                <span className="font-mono text-emerald-400">● Live Sensors Active</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Zone Selector List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {hotspots.map((hs) => (
              <button
                key={hs.id}
                type="button"
                onClick={() => setSelectedHotspotId(hs.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedHotspotId === hs.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 line-clamp-1">{hs.zone}</span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      hs.riskLevel === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {hs.complaintCount}
                  </span>
                </div>
                <p className="text-xs text-muted line-clamp-1">{hs.category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Hotspot Inspector & Connected Complaint Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="border-2 border-indigo-200 shadow-sm">
            <CardHeader className="bg-indigo-50/60 pb-3 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Hotspot Telemetry Panel
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    selectedHotspot.riskLevel === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedHotspot.riskLevel.toUpperCase()} RISK
                </span>
              </div>
              <h3 className="text-lg font-bold text mt-1">{selectedHotspot.zone}</h3>
              <p className="text-xs text-muted">
                {selectedHotspot.ward} · Trend: <strong>{selectedHotspot.trend.toUpperCase()}</strong>
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 pt-4">
              {/* Problem Focus Card */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-muted">Core Infrastructure Issue:</span>
                  <span className="text-xs font-bold text-rose-600">
                    {selectedHotspot.complaintCount} Linked Incidents
                  </span>
                </div>
                <h4 className="text-base font-bold text">{selectedHotspot.category}</h4>
                <p className="text-xs text-muted mt-1">
                  High concentration of citizen reports within 400m radius over the past 48 hours.
                </p>
              </div>

              {/* SECTION 5: PRIMARY HOTSPOT CONNECTION TO NS-2026-01428 */}
              {selectedHotspot.id === 'hs-01' ? (
                <div className="p-4 rounded-lg border-2 border-indigo-300 bg-indigo-50/70 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-primary" />
                      Lead Active Complaint
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">NS-2026-01428</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-indigo-950">
                      Major Drinking Water Pipeline Leakage Near Community Hall
                    </h4>
                    <p className="text-xs text-indigo-800 mt-1">
                      Ashi Nagar · Orange City Water (OCW) · Cluster: <strong>DUP-CLUST-041</strong> (89% similarity)
                    </p>
                  </div>

                  <div className="pt-2 border-t border-indigo-200 flex items-center justify-between">
                    <span className="text-xs text-indigo-900 font-semibold">
                      Assigned: Ramesh Patil (JE)
                    </span>
                    <Link to="/officer/complaints/NS-2026-01428">
                      <Button variant="primary" size="sm" rightIcon={<ExternalLink size={12} />}>
                        Inspect Work Order
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Alternate Hotspot Detail */
                <div className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col gap-2">
                  <span className="text-xs font-bold text-muted uppercase">Linked Department:</span>
                  <p className="text-sm font-semibold text">
                    {selectedHotspot.id === 'hs-02'
                      ? 'NMC Road Infrastructure & Pothole Cell'
                      : 'NMC Streetlight & Electrical Division'}
                  </p>
                  <p className="text-xs text-muted">
                    Automated repair dispatch recommendation sent to nodal division supervisors.
                  </p>
                </div>
              )}

              {/* Recommended Action Checklist */}
              <div className="flex flex-col gap-1.5 text-xs text-muted">
                <span className="font-semibold text text-xs block">Preventive Field Directives:</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
                  <span>Pressure monitoring valve deployed in Ashi Nagar main pipeline.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
                  <span>Automated duplicate grouping active for all Ward 2 citizen reports.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
