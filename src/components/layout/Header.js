import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BQMusicLogo from "../common/BQMusicLogo";
import "./Header.css"; // Import new SC styles

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

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

  const isLoginPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/";

  if (isLoginPage) return null;

  return (
    <header className="sc-header">
      <div className="sc-header-container">

        {/* --- LEFT NAVIGATION --- */}
        <div className="sc-header-left">
          {/* Logo */}
          <div className="sc-logo" onClick={() => navigate("/newF")} style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BQMusicLogo />
          </div>

          <div
            className={`sc-nav-item ${isActive('/newF') ? 'active' : ''}`}
            onClick={() => navigate('/newF')}
          >
            Home
          </div>
          <div
            className={`sc-nav-item ${isActive('/feed') ? 'active' : ''}`}
            onClick={() => navigate('/feed')}
          >
            Feed
          </div>
          <div
            className={`sc-nav-item ${isActive('/library') ? 'active' : ''}`}
            onClick={() => navigate('/library')}
          >
            Library
          </div>
        </div>

        {/* --- CENTER SEARCH --- */}
        <div className="sc-header-center">
          <div className="sc-search-bar">
            <input
              type="text"
              className="sc-search-input"
              placeholder="Search"
            />
            <button className="sc-search-icon">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>

        {/* --- RIGHT ACTIONS --- */}
        <div className="sc-header-right">
          {/* Pro Link */}
          <div className="sc-right-item sc-link-highlight" onClick={() => navigate('/pro')}>
            Try Artist Pro
          </div>

          <div className="sc-right-item" onClick={() => navigate('/upload')}>
            Upload
          </div>

          {/* User Dropdown */}
          <div className="position-relative" ref={dropdownRef}>
            <div
              className="sc-user-menu-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={user?.imageUrl ? `http://localhost:8080${user.imageUrl}` : "/placeholder-avatar.png"}
                alt="User"
                className="sc-user-avatar"
                onError={(e) => e.target.src = "/placeholder-avatar.png"}
              />
              <div className="d-none d-lg-block text-white small">
                {user?.name || "User"}
              </div>
              <i className="bi bi-chevron-down text-white small"></i>
            </div>

            <div className={`sc-dropdown ${showDropdown ? 'show' : ''}`}>
              <div className="sc-dropdown-item" onClick={() => navigate(`/user/userId=${user?.idUser}`)}>
                <i className="bi bi-person"></i> Profile
              </div>
              <div className="sc-dropdown-item" onClick={() => navigate('/likes')}>
                <i className="bi bi-heart"></i> Likes
              </div>
              <div className="sc-dropdown-item" onClick={() => navigate('/stations')}>
                <i className="bi bi-music-player"></i> Stations
              </div>
              <div className="sc-dropdown-divider"></div>
              <div className="sc-dropdown-item" onClick={() => navigate('/settings')}>
                <i className="bi bi-gear"></i> Settings
              </div>
              <div className="sc-dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Sign out
              </div>
            </div>
          </div>

          {/* Icons */}
          <div className="sc-icon-btn">
            <i className="bi bi-bell"></i>
          </div>
          <div className="sc-icon-btn">
            <i className="bi bi-envelope"></i>
          </div>
          <div className="sc-icon-btn">
            <i className="bi bi-three-dots"></i>
          </div>

        </div>

      </div>
    </header>
  );
}

export default Header;
