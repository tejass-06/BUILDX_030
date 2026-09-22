import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { PlaceholderPage } from '../../components/layout/PlaceholderPage';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useComplaints } from '../../context/ComplaintContext';

export const AIUnderstandingPage: React.FC = () => {
  const { complaints } = useComplaints();
  const sample = complaints[0]; // NS-2026-01428 with AI analysis

  return (
    <div className="page-container">
      <PlaceholderPage
        title="AI Problem Understanding"
        section="Citizen Experience"
        workflowStage="2. AI Understands"
        description="Multimodal neural analysis parsing visual evidence, predicting civic department responsibility, and computing urgency score."
        breadcrumbs={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'AI Understanding' },
        ]}
        icon={<Sparkles size={24} />}
      >
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI Diagnostic Summary</CardTitle>
                <StatusBadge status="ai_analyzed" />
              </div>
            </CardHeader>
            <CardContent>
              {sample.aiAnalysis && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-sm text-muted">Predicted Classification</span>
                    <span className="text-sm font-semibold">{sample.aiAnalysis.predictedCategory}</span>
                  </div>

                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-sm text-muted">Model Confidence</span>
                    <span className="text-sm font-semibold text-success">
                      {(sample.aiAnalysis.confidenceScore * 100).toFixed(0)}% Certainty
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-sm text-muted">Target Civic Agency</span>
                    <Badge variant="primary" size="md">
                      {sample.departmentName} ({sample.departmentCode})
                    </Badge>
                  </div>

                  <div>
                    <span className="text-xs text-muted block mb-2">Extracted Semantic Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {sample.aiAnalysis.extractedKeywords.map((kw, i) => (
                        <span key={i} className="ns-badge ns-badge--neutral">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PlaceholderPage>
    </div>
  );
};
