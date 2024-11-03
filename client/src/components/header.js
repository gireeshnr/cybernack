import React, { useState } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import PlaceholderLogo from '../statics/placeholder.png';

const Header = ({ authenticated, role, organization }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [logo, setLogo] = useState(PlaceholderLogo);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderSignButton = () => {
    if (authenticated) {
      return (
        <li className="nav-item">
          <NavLink className="nav-link" to="/signout">
            <i className="fas fa-sign-out-alt"></i>
            <span className="menu-text"> Sign out</span>
          </NavLink>
        </li>
      );
    } else {
      return (
        <>
          <li className="nav-item">
            <NavLink to="/signin" className="nav-link">
              Sign in
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/signup" className="nav-link">
              Sign Up
            </NavLink>
          </li>
        </>
      );
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  if (!role || !organization) {
    return null;
  }

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {collapsed ? (
          <i className="fas fa-chevron-right"></i>
        ) : (
          <i className="fas fa-chevron-left"></i>
        )}
      </button>
      {authenticated && (
        <div className="logo-upload">
          <img src={logo} alt="Company Logo" className="logo" />
          <label htmlFor="logo-upload" className="edit-icon">
            <i className="fas fa-edit"></i>
          </label>
          <input type="file" id="logo-upload" onChange={handleLogoUpload} />
        </div>
      )}
      <ul className="navbar-nav">
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

        {/* User Settings Section for Super Admins */}
        {authenticated && role === 'superadmin' && organization === 'Cybernack' && (
          <li className="nav-item">
            <div className="nav-link">
              <i className="fas fa-cog"></i>
              <span className="menu-text"> User Settings</span>
            </div>
            <ul className="submenu">
              <li className="nav-item">
                <NavLink className="nav-link" to="/superadmin/dashboard">
                  <i className="fas fa-user-shield"></i>
                  <span className="menu-text"> Super Admin</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/superadmin/users">
                  <i className="fas fa-users"></i>
                  <span className="menu-text"> Users</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/superadmin/manage-subscriptions">
                  <i className="fas fa-list-alt"></i>
                  <span className="menu-text"> Manage Subscriptions</span>
                </NavLink>
              </li>
            </ul>
          </li>
        )}

        {renderSignButton()}
      </ul>
    </nav>
  );
};

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
  role: state.auth.profile?.role,
  organization: state.auth.profile?.org,
});

export default connect(mapStateToProps)(Header);