import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../pages/admin/css/Block.css"; // Styles

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isLoginPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/forgot-password" || location.pathname === "/";

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Outside Click for Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoginPage) return null;

  return (
    <header className={`modern-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-fluid px-4 h-100">
        <div className="d-flex justify-content-between align-items-center h-100">

          {/* Left: Brand & Mobile Menu */}
          <div className="d-flex align-items-center gap-3">
            <button className="mobile-toggle me-2">
              <i className="bi bi-list"></i>
            </button>
            <div className="brand-logo" onClick={() => navigate('/admin')}>
              <div className="bg-primary text-white rounded p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                <i className="bi bi-shield-lock-fill" style={{ fontSize: 18 }}></i>
              </div>
              <span className="fw-bold">AdminPortal</span>
            </div>

            {/* Desktop Nav */}
            <nav className="d-none d-md-flex gap-2 ms-4 border-start ps-4" style={{ borderColor: '#e5e7eb' }}>
              <div
                className={`nav-link-modern ${location.pathname.includes('/admin') || location.pathname === '/' ? 'active' : ''}`}
                onClick={() => navigate('/admin')}
              >
                <i className="bi bi-grid me-2"></i>Dashboard
              </div>
              <div
                className={`nav-link-modern ${location.pathname.includes('/history') ? 'active' : ''}`}
                onClick={() => navigate('/history')}
              >
                <i className="bi bi-clock-history me-2"></i>Activity Logs
              </div>
              {/* Placeholder for future links */}
              <div className="nav-link-modern" style={{ opacity: 0.6 }}>
                <i className="bi bi-gear me-2"></i>Configuration
              </div>
            </nav>
          </div>

          {/* Right: Actions & User */}
          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <button className="header-icon-btn position-relative" title="Notifications">
              <i className="bi bi-bell" style={{ fontSize: 20 }}></i>
              <span className="notification-badge"></span>
            </button>

            {/* Settings Icon */}
            <button className="header-icon-btn d-none d-sm-flex" title="Settings">
              <i className="bi bi-gear" style={{ fontSize: 20 }}></i>
            </button>

            {/* User Dropdown */}
            <div className="position-relative" ref={dropdownRef}>
              <div
                className={`d-flex align-items-center gap-2 cursor-pointer profile-trigger ${showDropdown ? 'active' : ''}`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="d-none d-sm-block text-end user-meta">
                  <div className="user-name-small">{user?.name || "Admin User"}</div>
                  <div className="user-role-small">{user?.roles?.[0] || "Administrator"}</div>
                </div>
                <div className="user-avatar-small">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <i className="bi bi-chevron-down text-muted small ms-1 d-none d-sm-block"></i>
              </div>

              {/* Dropdown Menu */}
              <div className={`dropdown-menu-custom ${showDropdown ? 'show' : ''}`}>
                <div className="px-3 py-2 border-bottom mb-2 d-sm-none">
                  <div className="fw-bold">{user?.name || "Admin User"}</div>
                  <div className="text-muted small">{user?.email || "admin@example.com"}</div>
                </div>

                <div className="dropdown-item-custom">
                  <i className="bi bi-person text-muted"></i> My Profile
                </div>
                <div className="dropdown-item-custom">
                  <i className="bi bi-sliders text-muted"></i> Account Settings
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item-custom">
                  <i className="bi bi-question-circle text-muted"></i> Help & Support
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item-custom danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i> Sign Out
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
