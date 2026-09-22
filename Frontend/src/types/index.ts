/* ==========================================================================
   NagarSaathi Domain Data Models & Types
   Single source of truth for complaints flowing across:
   Citizen → AI → Duplicate → Tracking → Officer → Verification → Command Center
   ========================================================================== */

export type ComplaintStatus =
  | 'submitted'          // Initial citizen submission
  | 'ai_analyzed'        // AI processed category & department
  | 'duplicate_flagged'  // Grouped with existing cluster
  | 'assigned'           // Assigned to field officer / department
  | 'in_progress'        // Work commenced
  | 'resolved'           // Officer uploaded resolution evidence
  | 'ai_verified'        // Vision AI verified before-after work
  | 'citizen_confirmed'  // Citizen gave positive resolution feedback
  | 'closed'             // Complaint closed by citizen
  | 'reopened';          // Citizen rejected resolution

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface LocationData {
  address: string;
  landmark?: string;
  ward: string;
  zone: string;
  city: string; // e.g. 'Nagpur'
  pincode?: string;
  latitude: number;
  longitude: number;
}

export interface SLAData {
  targetHours: number;
  remainingHours: number;
  isBreached: boolean;
  isApproaching: boolean;
  deadline: string; // ISO String
}

export interface AIAnalysisData {
  predictedCategory: string;
  confidenceScore: number; // 0.0 - 1.0
  urgencyScore: number;    // 0.0 - 1.0
  extractedKeywords: string[];
  suggestedDepartmentCode: string;
  detectedHazards?: string[];
  analyzedAt: string;
}

export interface DuplicateClusterData {
  clusterId: string;
  primaryComplaintId: string;
  similarityScore: number; // 0.0 - 1.0
  memberCount: number;
  detectedAt: string;
}

export interface ResolutionEvidenceData {
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  officerNotes: string;
  resolvedAt: string;
  aiVerificationScore?: number; // 0.0 - 1.0
  aiVerificationStatus?: 'verified' | 'mismatch' | 'manual_review_needed';
}

export interface CitizenData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  ward: string;
  preferredLanguage: 'en' | 'mr' | 'hi';
}

export interface OfficerData {
  id: string;
  name: string;
  designation: string;
  departmentCode: string;
  zone: string;
  phone: string;
  activeComplaintsCount: number;
  resolvedComplaintsCount: number;
}

export interface DepartmentData {
  id: string;
  code: string; // e.g. 'OCW', 'NMC_ROAD', 'NMC_ELEC', 'NMC_HEALTH', 'PWD'
  name: string; // e.g. 'Orange City Water', 'NMC Road Infrastructure'
  headName: string;
  contactEmail: string;
  slaStandardHours: number;
  activeWorkload: number;
  performanceScore: number; // percentage e.g. 92
}

export interface Complaint {
  id: string; // e.g. 'NS-2026-01428'
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  location: LocationData;
  sla: SLAData;
  citizen: CitizenData;
  departmentCode: string;
  departmentName: string;
  assignedOfficer?: OfficerData;
  aiAnalysis?: AIAnalysisData;
  duplicateCluster?: DuplicateClusterData;
  resolutionEvidence?: ResolutionEvidenceData;
  reopenReason?: string;
  citizenRating?: number;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HotspotData {
  id: string;
  zone: string;
  ward: string;
  category: string;
  complaintCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  coordinates: { lat: number; lng: number };
  trend: 'increasing' | 'stable' | 'decreasing';
  lastIncidentAt: string;
}

export interface PlannedWorkData {
  id: string;
  departmentCode: string;
  title: string;
  description: string;
  location: LocationData;
  startDate: string;
  endDate: string;
  budgetAllocated?: string;
}

export interface DepartmentConflictData {
  id: string;
  primaryDeptCode: string;
  conflictingDeptCode: string;
  location: LocationData;
  description: string;
  status: 'active' | 'mitigated' | 'resolved';
  severity: 'high' | 'medium' | 'low';
  detectedAt: string;
  actionRequired: string;
}

export type SupportedLanguage = 'en' | 'mr' | 'hi';

export interface ReportDraft {
  description: string;
  language: SupportedLanguage;
  location: LocationData;
  photoUrl?: string;
  hasPhoto: boolean;
  category: string;
  severity: ComplaintPriority;
  departmentCode: string;
  departmentName: string;
  slaHours: number;
  aiConfidence: number;
  duplicateClusterId: string;
  duplicateSimilarity: number;
  duplicateMemberCount: number;
  existingComplaintId: string;
}
