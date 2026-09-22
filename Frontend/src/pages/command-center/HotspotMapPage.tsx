import React from 'react';
import { Flame, MapPin, AlertTriangle } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useComplaints } from '../../context/ComplaintContext';

export const HotspotMapPage: React.FC = () => {
  const { hotspots } = useComplaints();

  return (
    <PlaceholderPage
      title="City Hotspot Intelligence"
      section="Command Center"
      workflowStage="9. Hotspot Clustering"
      description="Spatial density analysis identifying recurrent failure zones across Nagpur pipelines, roads, and electrical grids."
      breadcrumbs={[
        { label: 'Command Center', to: '/command-center' },
        { label: 'Hotspot Map' },
      ]}
      icon={<Flame size={24} />}
    >
      <div className="flex flex-col gap-6">
        {/* Map Placeholder Canvas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Geographic Heatmap (Nagpur Grid Map Container)</CardTitle>
              <span className="text-xs text-muted font-mono">21.1458° N, 79.0882° E</span>
            </div>
          </CardHeader>
          <CardContent>
            <div
              style={{
                height: '280px',
                backgroundColor: 'var(--surface-muted)',
                border: '1.5px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <MapPin size={32} className="text-primary" />
              <p className="text-sm font-semibold">Nagpur Spatial Hotspot Map Container</p>
              <p className="text-xs text-muted max-w-sm text-center">
                Interactive Leaflet/GIS layer will be rendered here in future phases.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hotspot Cluster Details */}
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold">Active Clustered Problem Hotspots</h3>
          {hotspots.map((hs) => (
            <Card key={hs.id}>
              <CardContent className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold">{hs.category}</span>
                    <StatusBadge
                      status={hs.riskLevel === 'high' ? 'sla_breached' : 'sla_approaching'}
                      customLabel={`${hs.riskLevel.toUpperCase()} RISK`}
                    />
                  </div>
                  <p className="text-xs text-muted">
                    {hs.zone} · {hs.ward} · Trend: {hs.trend.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-error">{hs.complaintCount}</span>
                  <span className="text-xs text-muted block">Linked Reports</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PlaceholderPage>
  );
};
