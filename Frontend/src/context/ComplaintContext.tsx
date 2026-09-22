import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Complaint,
  ComplaintStatus,
  DepartmentData,
  OfficerData,
  HotspotData,
  DepartmentConflictData,
  SupportedLanguage,
  ReportDraft,
  ResolutionEvidenceData,
} from '../types';
import {
  mockComplaints,
  mockDepartments,
  mockOfficers,
  mockHotspots,
  mockDepartmentConflicts,
} from '../data/mockData';

const defaultReportDraft: ReportDraft = {
  description:
    'There is a major water pipeline leak near the community hall in Ashi Nagar. Water has been flowing onto the road since yesterday.',
  language: 'en',
  location: {
    address: 'Plot 42, Near Kapil Nagar Community Hall, Ring Road',
    landmark: 'Kapil Nagar Square',
    ward: 'Ward 2 (Ashi Nagar)',
    zone: 'Zone 9',
    city: 'Nagpur',
    pincode: '440026',
    latitude: 21.1894,
    longitude: 79.1128,
  },
  photoUrl:
    'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&q=80',
  hasPhoto: true,
  category: 'Water Leakage & Distribution',
  severity: 'high',
  departmentCode: 'OCW',
  departmentName: 'Orange City Water',
  slaHours: 48,
  aiConfidence: 0.96,
  duplicateClusterId: 'DUP-CLUST-041',
  duplicateSimilarity: 0.89,
  duplicateMemberCount: 3,
  existingComplaintId: 'NS-2026-01428',
};

interface ComplaintContextType {
  complaints: Complaint[];
  departments: DepartmentData[];
  officers: OfficerData[];
  hotspots: HotspotData[];
  conflicts: DepartmentConflictData[];
  activeLanguage: SupportedLanguage;
  reportDraft: ReportDraft;
  setActiveLanguage: (lang: SupportedLanguage) => void;
  updateReportDraft: (updates: Partial<ReportDraft>) => void;
  resetReportDraft: () => void;
  joinExistingIssue: () => string;
  reportSeparately: () => string;
  getComplaintById: (id: string) => Complaint | undefined;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
  updateResolutionEvidence: (id: string, evidence: Partial<ResolutionEvidenceData>) => void;
  closeComplaint: (id: string, rating?: number) => void;
  reopenComplaint: (id: string, reason: string) => void;
  updateConflictStatus: (id: string, status: 'active' | 'mitigated' | 'resolved') => void;
  assignComplaint: (id: string, officerId: string, departmentCode: string) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => string;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [departments] = useState<DepartmentData[]>(mockDepartments);
  const [officers] = useState<OfficerData[]>(mockOfficers);
  const [hotspots] = useState<HotspotData[]>(mockHotspots);
  const [conflicts, setConflicts] = useState<DepartmentConflictData[]>(mockDepartmentConflicts);
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('en');
  const [reportDraft, setReportDraft] = useState<ReportDraft>({
    ...defaultReportDraft,
    language: 'en',
  });

  const updateReportDraft = (updates: Partial<ReportDraft>) => {
    setReportDraft((prev) => ({ ...prev, ...updates }));
  };

  const resetReportDraft = () => {
    setReportDraft({ ...defaultReportDraft, language: activeLanguage });
  };

  const joinExistingIssue = (): string => {
    // Links to existing primary demo complaint NS-2026-01428 and cluster DUP-CLUST-041
    const targetId = reportDraft.existingComplaintId || 'NS-2026-01428';
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === targetId && c.duplicateCluster) {
          return {
            ...c,
            duplicateCluster: {
              ...c.duplicateCluster,
              memberCount: c.duplicateCluster.memberCount + 1,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
    return targetId;
  };

  const reportSeparately = (): string => {
    // Deterministic ID generation based on count
    const nextNum = (complaints.length + 1429).toString().padStart(5, '0');
    const newId = `NS-2026-${nextNum}`;
    const deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours() + (reportDraft.slaHours || 48));

    const newComplaint: Complaint = {
      id: newId,
      title: reportDraft.category || 'Water Pipeline Leakage',
      description: reportDraft.description,
      category: reportDraft.category,
      priority: reportDraft.severity,
      status: 'submitted',
      location: reportDraft.location,
      sla: {
        targetHours: reportDraft.slaHours,
        remainingHours: reportDraft.slaHours,
        isBreached: false,
        isApproaching: false,
        deadline: deadlineDate.toISOString(),
      },
      citizen: {
        id: 'cit-9021',
        name: 'Pooja Raut',
        phone: '+91 98901 22334',
        ward: reportDraft.location.ward,
        preferredLanguage: activeLanguage,
      },
      departmentCode: reportDraft.departmentCode,
      departmentName: reportDraft.departmentName,
      aiAnalysis: {
        predictedCategory: reportDraft.category,
        confidenceScore: reportDraft.aiConfidence,
        urgencyScore: 0.85,
        extractedKeywords: ['water leakage', 'ruptured line', 'Ashi Nagar'],
        suggestedDepartmentCode: reportDraft.departmentCode,
        analyzedAt: new Date().toISOString(),
      },
      photoUrls: reportDraft.hasPhoto && reportDraft.photoUrl ? [reportDraft.photoUrl] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    return newId;
  };

  const getComplaintById = (id: string) => {
    return complaints.find((c) => c.id.toLowerCase() === id.toLowerCase());
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((item) =>
        item.id.toLowerCase() === id.toLowerCase()
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const updateResolutionEvidence = (id: string, evidence: Partial<ResolutionEvidenceData>) => {
    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id.toLowerCase() === id.toLowerCase()) {
          const currentEvidence = item.resolutionEvidence || {
            officerNotes: 'Pipeline joint repaired and affected road section cleared.',
            resolvedAt: new Date().toISOString(),
          };
          return {
            ...item,
            status: 'resolved',
            resolutionEvidence: {
              ...currentEvidence,
              ...evidence,
              resolvedAt: evidence.resolvedAt || new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );
  };

  const closeComplaint = (id: string, rating?: number) => {
    setComplaints((prev) =>
      prev.map((item) =>
        item.id.toLowerCase() === id.toLowerCase()
          ? {
              ...item,
              status: 'closed',
              citizenRating: rating ?? 5,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const reopenComplaint = (id: string, reason: string) => {
    setComplaints((prev) =>
      prev.map((item) =>
        item.id.toLowerCase() === id.toLowerCase()
          ? {
              ...item,
              status: 'reopened',
              reopenReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const updateConflictStatus = (id: string, status: 'active' | 'mitigated' | 'resolved') => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const assignComplaint = (id: string, officerId: string, departmentCode: string) => {
    const officer = officers.find((o) => o.id === officerId);
    const dept = departments.find((d) => d.code === departmentCode);

    setComplaints((prev) =>
      prev.map((item) =>
        item.id.toLowerCase() === id.toLowerCase()
          ? {
              ...item,
              departmentCode,
              departmentName: dept?.name || item.departmentName,
              assignedOfficer: officer,
              status: 'assigned',
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const addComplaint = (newComp: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const nextNum = (complaints.length + 1429).toString().padStart(5, '0');
    const newId = `NS-2026-${nextNum}`;
    const fullComplaint: Complaint = {
      ...newComp,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComplaints((prev) => [fullComplaint, ...prev]);
    return newId;
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        departments,
        officers,
        hotspots,
        conflicts,
        activeLanguage,
        reportDraft,
        setActiveLanguage,
        updateReportDraft,
        resetReportDraft,
        joinExistingIssue,
        reportSeparately,
        getComplaintById,
        updateComplaintStatus,
        updateResolutionEvidence,
        closeComplaint,
        reopenComplaint,
        updateConflictStatus,
        assignComplaint,
        addComplaint,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = (): ComplaintContextType => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
