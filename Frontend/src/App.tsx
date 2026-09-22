import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ComplaintProvider } from './context/ComplaintContext';
import { ToastProvider } from './components/ui/Toast';

// Layouts
import { CitizenLayout } from './components/layout/CitizenLayout';
import { OfficerLayout } from './components/layout/OfficerLayout';
import { CommandCenterLayout } from './components/layout/CommandCenterLayout';

// Root Portal & Design Showcase
import { FoundationShowcasePage } from './pages/FoundationShowcasePage';

// Citizen Experience Pages
import { CitizenHomePage } from './pages/citizen/CitizenHomePage';
import { ReportProblemPage } from './pages/citizen/ReportProblemPage';
import { AIUnderstandingPage } from './pages/citizen/AIUnderstandingPage';
import { DuplicateDetectionPage } from './pages/citizen/DuplicateDetectionPage';
import { CitizenComplaintsPage } from './pages/citizen/CitizenComplaintsPage';
import { ComplaintDetailPage } from './pages/citizen/ComplaintDetailPage';
import { ResolutionFeedbackPage } from './pages/citizen/ResolutionFeedbackPage';

// Officer Experience Pages
import { OfficerDashboardPage } from './pages/officer/OfficerDashboardPage';
import { OfficerComplaintsPage } from './pages/officer/OfficerComplaintsPage';
import { OfficerComplaintDetailPage } from './pages/officer/OfficerComplaintDetailPage';

// Command Center Experience Pages
import { CommandCenterOverviewPage } from './pages/command-center/CommandCenterOverviewPage';
import { HotspotMapPage } from './pages/command-center/HotspotMapPage';
import { DepartmentPerformancePage } from './pages/command-center/DepartmentPerformancePage';
import { DepartmentConflictsPage } from './pages/command-center/DepartmentConflictsPage';

export const App: React.FC = () => {
  return (
    <ComplaintProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Root Portal & Design Foundation Showcase */}
            <Route path="/" element={<FoundationShowcasePage />} />

            {/* 1. Citizen Experience Routes */}
            <Route path="/citizen" element={<CitizenLayout />}>
              <Route index element={<CitizenHomePage />} />
              <Route path="report" element={<ReportProblemPage />} />
              <Route path="ai-understanding" element={<AIUnderstandingPage />} />
              <Route path="duplicate" element={<DuplicateDetectionPage />} />
              <Route path="complaints" element={<CitizenComplaintsPage />} />
              <Route path="complaints/:id" element={<ComplaintDetailPage />} />
              <Route path="resolution/:id" element={<ResolutionFeedbackPage />} />
            </Route>

            {/* 2. Officer Experience Routes */}
            <Route path="/officer" element={<OfficerLayout />}>
              <Route index element={<OfficerDashboardPage />} />
              <Route path="complaints" element={<OfficerComplaintsPage />} />
              <Route path="complaints/:id" element={<OfficerComplaintDetailPage />} />
            </Route>

            {/* 3. Command Center Experience Routes */}
            <Route path="/command-center" element={<CommandCenterLayout />}>
              <Route index element={<CommandCenterOverviewPage />} />
              <Route path="hotspots" element={<HotspotMapPage />} />
              <Route path="departments" element={<DepartmentPerformancePage />} />
              <Route path="conflicts" element={<DepartmentConflictsPage />} />
            </Route>

            {/* Catch-all route redirecting to root showcase */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ComplaintProvider>
  );
};

export default App;
