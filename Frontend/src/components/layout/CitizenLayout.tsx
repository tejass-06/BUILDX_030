import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, PlusCircle, FileText, Map, User, Globe } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintContext';
import { SupportedLanguage } from '../../types';

export const CitizenLayout: React.FC = () => {
  const { activeLanguage, setActiveLanguage } = useComplaints();

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveLanguage(e.target.value as SupportedLanguage);
  };

  return (
    <div className="ns-citizen-shell">
      {/* Top Header */}
      <header className="ns-citizen-header">
        <div className="ns-citizen-header__inner">
          <Link to="/" className="ns-brand" aria-label="NagarSaathi Home">
            <div className="ns-brand__emblem">NS</div>
            <div className="ns-brand__text">
              <span className="ns-brand__name">NagarSaathi</span>
              <span className="ns-brand__tag">Nagpur Civic Intelligence</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="ns-citizen-nav" aria-label="Citizen Navigation">
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
              to="/citizen/report"
              className={({ isActive }) =>
                `ns-nav-link ${isActive ? 'ns-nav-link--active' : ''}`
              }
            >
              Report Problem
            </NavLink>
            <NavLink
              to="/citizen/complaints"
              className={({ isActive }) =>
                `ns-nav-link ${isActive ? 'ns-nav-link--active' : ''}`
              }
            >
              My Complaints
            </NavLink>
          </nav>

          {/* Language Switcher & Portal Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Globe size={14} className="text-muted" aria-hidden="true" />
              <label htmlFor="citizen-lang-select" className="sr-only">
                Select Language
              </label>
              <select
                id="citizen-lang-select"
                value={activeLanguage}
                onChange={handleLangChange}
                className="ns-lang-select"
              >
                <option value="en">English</option>
                <option value="mr">मराठी</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
            <Link to="/" className="text-xs text-muted hover:text-primary font-medium">
              Portal Home
            </Link>
          </div>
        </div>
      </header>

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
