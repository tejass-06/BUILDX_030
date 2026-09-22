import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  Compass,
  Flame,
  Building,
  GitMerge,
  BarChart2,
  FileSpreadsheet,
  Sliders,
  Activity,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { useComplaints } from '../../context/ComplaintContext';

export const CommandCenterLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { conflicts, hotspots } = useComplaints();

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

      {/* Command Center Sidebar */}
      <aside className={`ns-sidebar ${sidebarOpen ? 'ns-sidebar--open' : ''}`} aria-label="Command Center Sidebar">
        <div className="ns-sidebar__header">
          <Link to="/command-center" className="ns-brand">
            <div className="ns-brand__emblem">CC</div>
            <div className="ns-brand__text">
              <span className="ns-brand__name">Command Center</span>
              <span className="ns-brand__tag">City Operations Room</span>
            </div>
          </Link>
          <div className="lg:hidden">
            <IconButton
              icon={<X size={18} />}
              aria-label="Close sidebar menu"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        <nav className="ns-sidebar__nav">
          <NavLink
            to="/command-center"
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `ns-sidebar-link ${isActive ? 'ns-sidebar-link--active' : ''}`
            }
          >
            <span className="ns-sidebar-link__icon">
              <Compass size={18} />
            </span>
            <span>City Overview</span>
          </NavLink>

          <NavLink
            to="/command-center/hotspots"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `ns-sidebar-link ${isActive ? 'ns-sidebar-link--active' : ''}`
            }
          >
            <span className="ns-sidebar-link__icon">
              <Flame size={18} />
            </span>
            <span>Hotspot Map</span>
            {hotspots.length > 0 && (
              <span className="ns-status-badge ns-status-badge--warning text-xs ml-auto">
                {hotspots.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/command-center/departments"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `ns-sidebar-link ${isActive ? 'ns-sidebar-link--active' : ''}`
            }
          >
            <span className="ns-sidebar-link__icon">
              <Building size={18} />
            </span>
            <span>Dept Performance</span>
          </NavLink>

          <NavLink
            to="/command-center/conflicts"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `ns-sidebar-link ${isActive ? 'ns-sidebar-link--active' : ''}`
            }
          >
            <span className="ns-sidebar-link__icon">
              <GitMerge size={18} />
            </span>
            <span>Inter-Dept Conflicts</span>
            {conflicts.length > 0 && (
              <span className="ns-status-badge ns-status-badge--error text-xs ml-auto">
                {conflicts.length}
              </span>
            )}
          </NavLink>

          <div className="ns-divider ns-divider--horizontal ns-divider--spacing-sm" />

          {/* Placeholders for Information Architecture */}
          <span className="ns-sidebar-link text-muted" style={{ cursor: 'default' }}>
            <span className="ns-sidebar-link__icon">
              <BarChart2 size={18} />
            </span>
            <span>Data Analytics</span>
          </span>

          <span className="ns-sidebar-link text-muted" style={{ cursor: 'default' }}>
            <span className="ns-sidebar-link__icon">
              <FileSpreadsheet size={18} />
            </span>
            <span>Governance Reports</span>
          </span>

          <span className="ns-sidebar-link text-muted" style={{ cursor: 'default' }}>
            <span className="ns-sidebar-link__icon">
              <Sliders size={18} />
            </span>
            <span>System Settings</span>
          </span>
        </nav>

        <div className="ns-sidebar__footer">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-success animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold">Nagpur Ops Node 1</span>
              <span className="text-xs text-muted">All 10 Municipal Zones Synced</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
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
              <span className="ns-status-badge ns-status-badge--success">
                <Activity size={12} />
                Live Network Active
              </span>
              <span className="text-xs text-muted hidden md:inline">
                Nagpur Municipal Corporation Central Operations
              </span>
            </div>
          </div>

          <div className="ns-top-bar__right">
            <Link to="/" className="text-xs text-muted hover:text-primary font-medium">
              Portal Home
            </Link>
            <span className="text-xs text-muted font-mono">
              22 Sep 2026
            </span>
          </div>
        </header>

        <main className="ns-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
