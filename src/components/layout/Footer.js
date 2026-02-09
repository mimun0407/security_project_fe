import React from "react";
import "../../pages/admin/css/Block.css";

function Footer() {
  return (
    <footer className="modern-footer">
      <div className="container">
        <div className="row">
          {/* Brand Column */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                <i className="bi bi-shield-lock-fill" style={{ fontSize: 14 }}></i>
              </div>
              <span className="fw-bold text-dark" style={{ fontSize: 18 }}>AdminPortal</span>
            </div>
            <p className="footer-desc">
              A professional, secure, and beautiful administration dashboard built for modern businesses.
            </p>
            <div className="footer-social">
              <a href="/" className="social-icon"><i className="bi bi-github"></i></a>
              <a href="/" className="social-icon"><i className="bi bi-twitter"></i></a>
              <a href="/" className="social-icon"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="col-6 col-md-3 col-lg-2 offset-lg-1 mb-4 mb-md-0">
            <div className="footer-links">
              <h6>Product</h6>
              <a href="/" className="footer-link">Dashboard</a>
              <a href="/" className="footer-link">Analytics</a>
              <a href="/" className="footer-link">Settings</a>
              <a href="/" className="footer-link">Updates</a>
            </div>
          </div>

          <div className="col-6 col-md-3 col-lg-2 mb-4 mb-md-0">
            <div className="footer-links">
              <h6>Company</h6>
              <a href="/" className="footer-link">About Us</a>
              <a href="/" className="footer-link">Careers</a>
              <a href="/" className="footer-link">Blog</a>
              <a href="/" className="footer-link">Press</a>
            </div>
          </div>

          <div className="col-md-3 col-lg-3">
            <div className="footer-links">
              <h6>Support</h6>
              <a href="/" className="footer-link">Help Center</a>
              <a href="/" className="footer-link">API Documentation</a>
              <a href="/" className="footer-link">Community</a>
              <a href="/" className="footer-link">Status Page</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AdminPortal. All rights reserved.</span>
          <div className="d-flex gap-3">
            <a href="/" className="footer-link mb-0" style={{ fontSize: 13 }}>Privacy Policy</a>
            <a href="/" className="footer-link mb-0" style={{ fontSize: 13 }}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
