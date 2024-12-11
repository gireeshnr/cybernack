import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import AppLogo from '../statics/Logo.png'; // Application logo

const Header = ({ authenticated, role, organization }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleSignOut = () => {
    navigate('/signin'); // Redirect to the sign-in page
  };

  if (!role || !organization) {
    return null;
  }

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Collapse/Expand Button */}
      <button className="toggle-btn" onClick={toggleSidebar}>
        {collapsed ? <i className="fas fa-chevron-right"></i> : <i className="fas fa-chevron-left"></i>}
      </button>

      {/* Logo Section */}
      {!collapsed && (
        <div className="logo-container">
          <img src={AppLogo} alt="Company Logo" className="logo" />
        </div>
      )}

      {/* Menu Items */}
      <ul className="navbar-nav">
        {/* Standard Menu Items */}
        <li className="nav-item">
          <NavLink className="nav-link" to="/">
            <i className="fas fa-tachometer-alt"></i>
            <span className="menu-text"> Dashboard</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/account">
            <i className="fas fa-user"></i>
            <span className="menu-text"> Account</span>
          </NavLink>
        </li>

        {/* Super Admin Specific Menu Items */}
        {authenticated && role === 'superadmin' && organization === 'Cybernack' && (
          <>
            <li className="nav-item">
              <NavLink className="nav-link" to="/superadmin/dashboard">
                <i className="fas fa-user-shield"></i>
                <span className="menu-text"> Super Admin Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/superadmin/users">
                <i className="fas fa-users"></i>
                <span className="menu-text"> Manage Users</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/superadmin/manage-subscriptions">
                <i className="fas fa-list-alt"></i>
                <span className="menu-text"> Manage Subscriptions</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/superadmin/reports">
                <i className="fas fa-chart-line"></i>
                <span className="menu-text"> Reports</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/superadmin/settings">
                <i className="fas fa-cogs"></i>
                <span className="menu-text"> Admin Settings</span>
              </NavLink>
            </li>
          </>
        )}

        {/* Sign Out */}
        <li className="nav-item">
          <button className="nav-link signout-btn" onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt"></i>
            <span className="menu-text"> Sign out</span>
          </button>
        </li>
      </ul>
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