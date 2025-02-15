// client/src/components/header.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import AppLogo from '../statics/Logo.png';

const Header = ({ authenticated, role, organization }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleSignOut = () => {
    navigate('/signin');
  };

  const toggleMenu = (menu) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  if (!role || !organization) {
    return null;
  }

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Collapse/Expand Button */}
      <button className="toggle-btn" onClick={toggleSidebar}>
        {collapsed ? (
          <i className="fas fa-chevron-right" />
        ) : (
          <i className="fas fa-chevron-left" />
        )}
      </button>

      {/* Logo Section */}
      {!collapsed && (
        <div className="logo-container">
          <img src={AppLogo} alt="Company Logo" className="logo" />
        </div>
      )}

      {/* Menu Items */}
      <ul className="navbar-nav">
        {/* Dashboard */}
        <li className="nav-item">
          <NavLink className="nav-link" to="/">
            <i className="fas fa-tachometer-alt" />
            <span className="menu-text">Dashboard</span>
          </NavLink>
        </li>

        {/* Admin Settings (for both admin and superadmin) */}
        {authenticated && (role === 'superadmin' || role === 'admin') && (
          <li className="nav-item">
            <div className="nav-link" onClick={() => toggleMenu('adminSettings')}>
              <i className="fas fa-cogs" />
              <span className="menu-text">Admin Settings</span>
              <i
                className={`fas fa-chevron-${
                  activeMenu === 'adminSettings' ? 'up' : 'down'
                } submenu-icon`}
              />
            </div>
            {activeMenu === 'adminSettings' && (
              <ul className="submenu">
                {/* superadmin-only submenu items */}
                {role === 'superadmin' && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/superadmin/dashboard">
                        <i className="fas fa-user-shield" />
                        <span className="menu-text">Organizations</span>
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/superadmin/users">
                        <i className="fas fa-users" />
                        <span className="menu-text">Manage Users</span>
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        className="nav-link"
                        to="/superadmin/manage-subscriptions"
                      >
                        <i className="fas fa-list-alt" />
                        <span className="menu-text">Subscriptions</span>
                      </NavLink>
                    </li>
                  </>
                )}

                <li className="nav-item">
                  <NavLink className="nav-link" to="/superadmin/your-subscription">
                    <i className="fas fa-star" />
                    <span className="menu-text">Your Subscription</span>
                  </NavLink>
                </li>

                {/* admin only */}
                {role === 'admin' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin/users">
                      <i className="fas fa-users" />
                      <span className="menu-text">Users</span>
                    </NavLink>
                  </li>
                )}
                {role === 'admin' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin/domains-subjects">
                      <i className="fas fa-globe" />
                      <span className="menu-text">Manage Domains & Subjects</span>
                    </NavLink>
                  </li>
                )}
                {/* Admin bulk upload */}
                {role === 'admin' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin/bulk-upload">
                      <i className="fas fa-upload" />
                      <span className="menu-text">Bulk Upload</span>
                    </NavLink>
                  </li>
                )}
              </ul>
            )}
          </li>
        )}

        {/* App Settings (superadmin only) */}
        {authenticated && role === 'superadmin' && organization === 'Cybernack' && (
          <li className="nav-item">
            <div className="nav-link" onClick={() => toggleMenu('appSettings')}>
              <i className="fas fa-wrench" />
              <span className="menu-text">App Settings</span>
              <i
                className={`fas fa-chevron-${
                  activeMenu === 'appSettings' ? 'up' : 'down'
                } submenu-icon`}
              />
            </div>
            {activeMenu === 'appSettings' && (
              <ul className="submenu">
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/application/settings/industries"
                  >
                    <i className="fas fa-database" />
                    <span className="menu-text">Industries</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/application/settings/domains"
                  >
                    <i className="fas fa-globe" />
                    <span className="menu-text">Domains</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/application/settings/subjects"
                  >
                    <i className="fas fa-book" />
                    <span className="menu-text">Subjects</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/application/settings/questions"
                  >
                    <i className="fas fa-question-circle" />
                    <span className="menu-text">Questions</span>
                  </NavLink>
                </li>
                {/* superadmin bulk upload */}
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/application/settings/bulk-upload"
                  >
                    <i className="fas fa-upload" />
                    <span className="menu-text">Bulk Upload</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}

        {/* Reports */}
        <li className="nav-item">
          <NavLink className="nav-link" to="/superadmin/reports">
            <i className="fas fa-chart-line" />
            <span className="menu-text">Reports</span>
          </NavLink>
        </li>

        {/* Account */}
        <li className="nav-item">
          <NavLink className="nav-link" to="/account">
            <i className="fas fa-user" />
            <span className="menu-text">Account</span>
          </NavLink>
        </li>

        {/* Sign Out */}
        <li className="nav-item">
          <button className="nav-link signout-btn" onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt" />
            <span className="menu-text">Sign out</span>
          </button>
        </li>
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <span>&copy; 2025 Cybernack</span>
      </div>
    </nav>
  );
};

Header.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  role: PropTypes.string,
  organization: PropTypes.string,
};

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
  role: state.auth.profile?.role,
  organization: state.auth.profile?.org,
});

export default connect(mapStateToProps)(Header);