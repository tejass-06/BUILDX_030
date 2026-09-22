import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import { mockOfficers } from '../../data/mockData';

export const OfficerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const officer = mockOfficers[0]; // Ramesh Patil, OCW

  return (
    <div className="ns-app-shell">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="ns-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Officer Sidebar */}
      <aside className={`ns-sidebar ${sidebarOpen ? 'ns-sidebar--open' : ''}`} aria-label="Officer Sidebar">
        <div className="ns-sidebar__header">
          <Link to="/officer" className="ns-brand">
            <div className="ns-brand__emblem">NS</div>
            <div className="ns-brand__text">
              <span className="ns-brand__name">NagarSaathi</span>
              <span className="ns-brand__tag">Officer Portal</span>
            </div>
          </Link>
          <div className="lg:hidden">
            <IconButton
              icon={<X size={18} />}
              aria-label="Close sidebar menu"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            />
          </div>
        </div>

        <nav className="ns-sidebar__nav">
          <NavLink
            to="/officer"
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `ns-sidebar-link ${isActive ? 'ns-sidebar-link--active' : ''}`
            }
          >
            <span className="ns-sidebar-link__icon">
              <LayoutDashboard size={18} />
            </span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/officer/complaints"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `ns-sidebar-link ${isActive ? 'ns-sidebar-link--active' : ''}`
            }
          >
            <span className="ns-sidebar-link__icon">
              <ClipboardList size={18} />
            </span>
            <span>Assigned Complaints</span>
          </NavLink>

          <div className="ns-divider ns-divider--horizontal ns-divider--spacing-sm" />

          {/* Foundation Navigation Placeholders */}
          <span className="ns-sidebar-link text-muted" style={{ cursor: 'default' }}>
            <span className="ns-sidebar-link__icon">
              <MapPin size={18} />
            </span>
            <span>Field Map</span>
          </span>

          <span className="ns-sidebar-link text-muted" style={{ cursor: 'default' }}>
            <span className="ns-sidebar-link__icon">
              <Calendar size={18} />
            </span>
            <span>Work Schedule</span>
          </span>

          <span className="ns-sidebar-link text-muted" style={{ cursor: 'default' }}>
            <span className="ns-sidebar-link__icon">
              <MessageSquare size={18} />
            </span>
            <span>Messages</span>
          </span>

          <span className="ns-sidebar-link text-muted" style={{ cursor: 'default' }}>
            <span className="ns-sidebar-link__icon">
              <BarChart3 size={18} />
            </span>
            <span>Resolution Reports</span>
          </span>

          <span className="ns-sidebar-link text-muted" style={{ cursor: 'default' }}>
            <span className="ns-sidebar-link__icon">
              <Settings size={18} />
            </span>
            <span>Settings</span>
          </span>
        </nav>

        <div className="ns-sidebar__footer">
          <Avatar name={officer.name} size="sm" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text">{officer.name}</span>
            <span className="text-xs text-muted">{officer.departmentCode} · {officer.zone}</span>
          </div>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="ns-main-wrapper">
        <header className="ns-top-bar">
          <div className="ns-top-bar__left">
            <IconButton
              icon={<Menu size={20} />}
              aria-label="Toggle navigation menu"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold ns-badge ns-badge--neutral">
                {officer.zone}
              </span>
              <span className="text-xs text-muted hidden sm:inline">
                Nagpur Municipal Corporation & Orange City Water
              </span>
            </div>
          </div>

          <div className="ns-top-bar__right">
            <Link to="/" className="text-xs text-muted hover:text-primary font-medium">
              Portal Home
            </Link>
            <IconButton
              icon={<Bell size={18} />}
              aria-label="View notifications"
              size="sm"
            />
            <div className="flex items-center gap-2">
              <Avatar name={officer.name} size="sm" />
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-medium">{officer.name}</span>
                <span className="text-xs text-muted">{officer.designation}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="ns-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
