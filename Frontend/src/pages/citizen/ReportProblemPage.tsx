import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mic,
  Camera,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Navigation,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { StepProgress } from '../../components/civic/StepProgress';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useComplaints } from '../../context/ComplaintContext';
import { useToast } from '../../components/ui/Toast';
import { translations } from '../../utils/translations';
import { SupportedLanguage } from '../../types';

export const ReportProblemPage: React.FC = () => {
  const navigate = useNavigate();
  const { reportDraft, updateReportDraft, activeLanguage, setActiveLanguage } = useComplaints();
  const { showToast } = useToast();

  const [description, setDescription] = useState(reportDraft.description);
  const [isListening, setIsListening] = useState(false);
  const [photoAttached, setPhotoAttached] = useState(reportDraft.hasPhoto);
  const [gpsSimulated, setGpsSimulated] = useState(false);

  const t = translations[activeLanguage] || translations.en;

  // Voice simulation
  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const voiceText =
        activeLanguage === 'mr'
          ? 'आशी नगर कम्युनिटी हॉलजवळ पाण्याची मुख्य पाईपलाईन फुटली आहे. कालपासून रस्त्यावर पाणी वाहत आहे.'
          : activeLanguage === 'hi'
          ? 'आशी नगर कम्युनिटी हॉल के पास पेयजल पाइपलाइन फट गई है। कल से सड़क पर पानी बह रहा है।'
          : 'There is a major water pipeline leak near the community hall in Ashi Nagar. Water has been flowing onto the road since yesterday.';

      setDescription(voiceText);
      updateReportDraft({ description: voiceText });
      showToast(
        activeLanguage === 'mr'
          ? 'आवाज यशस्वीरीत्या नोंदवला गेला'
          : activeLanguage === 'hi'
          ? 'आवाज सफलतापूर्वक रिकॉर्ड किया गया'
          : 'Voice input captured and transcribed',
        'success'
      );
    }, 1200);
  };

  // GPS Simulation
  const handleGpsDetect = () => {
    setGpsSimulated(true);
    showToast('GPS: Ashi Nagar Ward 2, Nagpur verified (±4m accuracy)', 'info');
  };

  // Simulated Photo Toggle
  const handlePhotoToggle = () => {
    const nextState = !photoAttached;
    setPhotoAttached(nextState);
    updateReportDraft({
      hasPhoto: nextState,
      photoUrl: nextState
        ? 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&q=80'
        : undefined,
    });
    if (nextState) {
      showToast('Photo evidence attached (water_leak_ashi_nagar.jpg)', 'success');
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    updateReportDraft({
      description,
      language: activeLanguage,
    });
    navigate('/citizen/ai-understanding');
  };

  return (
    <div className="page-container flex flex-col gap-4 max-w-3xl">
      <Breadcrumb
        items={[
          { label: 'Citizen Portal', to: '/citizen' },
          { label: 'Report Civic Problem' },
        ]}
      />

      {/* Progress Stepper (Step 1) */}
      <StepProgress currentStep={1} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{t.reportHeading}</h1>
        <p className="text-sm text-muted">{t.reportSubheading}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleContinue} className="flex flex-col gap-5">
            {/* Language Switcher Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b">
              <span className="text-xs font-semibold text-muted uppercase">Input Language:</span>
              <div className="flex items-center gap-1">
                {(['en', 'mr', 'hi'] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLanguage(lang)}
                    className={`ns-btn ns-btn--sm ${
                      activeLanguage === lang ? 'ns-btn--primary' : 'ns-btn--secondary'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'mr' ? 'मराठी' : 'हिंदी'}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Textarea with Voice Prototype */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="problem-desc" className="ns-label">
                  {t.descriptionLabel} <span className="ns-label__required">*</span>
                </label>

                {/* Voice Prototype Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  className={`ns-btn ns-btn--sm ${
                    isListening ? 'ns-btn--danger' : 'ns-btn--secondary'
                  }`}
                  aria-label="Use voice input"
                >
                  <Mic size={14} className={isListening ? 'animate-pulse' : ''} />
                  <span>{isListening ? t.listeningState : t.useVoiceBtn}</span>
                </button>
              </div>

              <Textarea
                id="problem-desc"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  updateReportDraft({ description: e.target.value });
                }}
                rows={4}
                required
                showCharCount
                maxLength={500}
                placeholder="Describe the defect, location details, or road hazard..."
              />
            </div>

            {/* Simulated Photo Attachment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="ns-label">Photo Evidence (Visual AI Intake)</span>
                <button
                  type="button"
                  onClick={handlePhotoToggle}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {photoAttached ? 'Remove Photo' : '+ Attach Sample Evidence'}
                </button>
              </div>

              {photoAttached ? (
                <div
                  className="flex items-center justify-between p-3 border rounded-md bg-white"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&q=80"
                      alt="Water leakage evidence"
                      className="w-12 h-12 object-cover rounded border"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <div>
                      <p className="text-xs font-semibold text">water_leak_ashi_nagar.jpg</p>
                      <span className="ns-status-badge ns-status-badge--success text-xs mt-1">
                        <CheckCircle2 size={11} />
                        Ready for AI Diagnostic
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handlePhotoToggle}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePhotoToggle}
                  className="w-full border-1.5 border-dashed rounded-md p-4 text-center flex flex-col items-center gap-2 hover:bg-surface-muted transition"
                  style={{ borderColor: 'var(--border-strong)', borderStyle: 'dashed' }}
                >
                  <Camera size={22} className="text-muted" />
                  <span className="text-xs font-semibold text-primary">
                    Click to attach photo evidence (Sample Pipeline Rupture)
                  </span>
                  <span className="text-xs text-muted">Supports JPG, PNG (Max 5MB)</span>
                </button>
              )}
            </div>

            {/* Location Row with GPS Simulator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="ns-label">{t.locationLabel}</span>
                <button
                  type="button"
                  onClick={handleGpsDetect}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Navigation size={12} />
                  {t.useCurrentLocationBtn}
                </button>
              </div>

              <div
                className="p-3 border rounded-md bg-surface-muted flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text">{reportDraft.location.address}</p>
                    <p className="text-xs text-muted">
                      {reportDraft.location.ward} · {reportDraft.location.city}
                      {gpsSimulated && ' (Verified by GPS)'}
                    </p>
                  </div>
                </div>
                <span className="ns-badge ns-badge--neutral text-xs">
                  {reportDraft.location.zone}
                </span>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Link to="/citizen">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                variant="primary"
                type="submit"
                rightIcon={<ArrowRight size={16} />}
              >
                {t.continueBtn}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
