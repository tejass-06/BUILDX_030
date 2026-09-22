import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Complaint,
  ComplaintStatus,
  DepartmentData,
  OfficerData,
  HotspotData,
  DepartmentConflictData,
  SupportedLanguage,
} from '../types';
import {
  mockComplaints,
  mockDepartments,
  mockOfficers,
  mockHotspots,
  mockDepartmentConflicts,
} from '../data/mockData';

interface ComplaintContextType {
  complaints: Complaint[];
  departments: DepartmentData[];
  officers: OfficerData[];
  hotspots: HotspotData[];
  conflicts: DepartmentConflictData[];
  activeLanguage: SupportedLanguage;
  setActiveLanguage: (lang: SupportedLanguage) => void;
  getComplaintById: (id: string) => Complaint | undefined;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
  assignComplaint: (id: string, officerId: string, departmentCode: string) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => string;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [departments] = useState<DepartmentData[]>(mockDepartments);
  const [officers] = useState<OfficerData[]>(mockOfficers);
  const [hotspots] = useState<HotspotData[]>(mockHotspots);
  const [conflicts] = useState<DepartmentConflictData[]>(mockDepartmentConflicts);
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('en');

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
        setActiveLanguage,
        getComplaintById,
        updateComplaintStatus,
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
