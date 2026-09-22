import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  FileText,
  Map,
  Globe,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { SupportedLanguage } from '../../types';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const CitizenLayout: React.FC = () => {
  const { activeLanguage, setActiveLanguage } = useComplaints();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveLanguage(e.target.value as SupportedLanguage);
  };

  return (
    <div className="ns-citizen-shell">
      {/* Top Header */}
      <header className="ns-citizen-header">
        <div className="ns-citizen-header__inner">
          {/* Brand Wordmark */}
          <Link to="/citizen" className="ns-brand" aria-label="NagarSaathi Citizen Home">
            <div className="ns-brand__emblem">NS</div>
            <div className="ns-brand__text">
              <span className="ns-brand__name">NagarSaathi</span>
              <span className="ns-brand__tag">Nagpur Civic Intelligence</span>
            </div>
          </Link>

          {/* Desktop Center Navigation */}
          <nav className="ns-citizen-nav" aria-label="Citizen Desktop Navigation">
            <NavLink
              to="/citizen"
              end
              className={({ isActive }) =>
                `ns-nav-link ${isActive ? 'ns-nav-link--active' : ''}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/citizen/complaints"
              className={({ isActive }) =>
                `ns-nav-link ${isActive ? 'ns-nav-link--active' : ''}`
              }
            >
              My Complaints
            </NavLink>
            <a
              href="#city-awareness"
              className="ns-nav-link"
            >
              City Map
            </a>
          </nav>

          {/* Header Right: Language, Notifications & Citizen Avatar */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1">
              <Globe size={15} className="text-muted" aria-hidden="true" />
              <label htmlFor="citizen-lang-select" className="sr-only">
                Choose Language
              </label>
              <select
                id="citizen-lang-select"
                value={activeLanguage}
                onChange={handleLangChange}
                className="ns-lang-select"
                aria-label="Application Language"
              >
                <option value="en">English</option>
                <option value="mr">मराठी</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>

            {/* Notification Bell */}
            <IconButton
              icon={<Bell size={18} />}
              aria-label="Civic Notifications"
              onClick={() => setNotificationOpen(true)}
              size="sm"
            />

            {/* Citizen Profile Avatar */}
            <div className="flex items-center gap-2">
              <Avatar name="Pooja Raut" size="sm" />
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-semibold">Pooja Raut</span>
                <span className="text-xs text-muted">Ashi Nagar, Nagpur</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Modal */}
      <Modal
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        title="Civic Notifications"
        description="Live governance and service updates for Ward 2, Ashi Nagar."
        footer={
          <Button variant="primary" size="sm" onClick={() => setNotificationOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="p-3 border rounded-md bg-white flex items-start gap-3" style={{ borderColor: 'var(--border)' }}>
            <div className="p-1 rounded bg-primary-subtle text-primary">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text">Complaint NS-2026-01428 In Progress</p>
              <p className="text-xs text-muted mt-0.5">
                Orange City Water field engineer Ramesh Patil assigned to pipeline leak at Kapil Nagar.
              </p>
              <span className="text-xs text-muted font-mono mt-1 block">1 hour ago</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Main Content Area */}
      <main className="ns-citizen-main">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (Mobile-first) */}
      <nav className="ns-mobile-bottom-nav" aria-label="Mobile Navigation">
        <NavLink
          to="/citizen"
          end
          className={({ isActive }) =>
            `ns-mobile-nav-item ${isActive ? 'ns-mobile-nav-item--active' : ''}`
          }
        >
          <Home size={18} aria-hidden="true" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/citizen/report"
          className={({ isActive }) =>
            `ns-mobile-nav-item ${isActive ? 'ns-mobile-nav-item--active' : ''}`
          }
        >
          <PlusCircle size={18} aria-hidden="true" />
          <span>Report</span>
        </NavLink>
        <NavLink
          to="/citizen/complaints"
          className={({ isActive }) =>
            `ns-mobile-nav-item ${isActive ? 'ns-mobile-nav-item--active' : ''}`
          }
        >
          <FileText size={18} aria-hidden="true" />
          <span>Complaints</span>
        </NavLink>
        <Link
          to="/"
          className="ns-mobile-nav-item"
        >
          <Map size={18} aria-hidden="true" />
          <span>Portal</span>
        </Link>
      </nav>
    </div>
  );
};
