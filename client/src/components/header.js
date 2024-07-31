import React, { useState } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { NavLink } from 'react-router-dom';
import PlaceholderLogo from '../statics/placeholder.png'; // Placeholder image

const Header = ({ authenticated }) => {
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
          <NavLink className="nav-link" to="/signout"><i className="fas fa-sign-out-alt"></i><span className="menu-text"> Sign out</span></NavLink>
        </li>
      );
    } else {
      return (
        <>
          <li className="nav-item">
            <NavLink to="/signin" className="nav-link">Sign in</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/signup" className="nav-link">Sign Up</NavLink>
          </li>
        </>
      );
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {collapsed ? <i className="fas fa-chevron-right"></i> : <i className="fas fa-chevron-left"></i>}
      </button>
      {authenticated && (
        <div className="logo-upload">
          <img src={logo} alt="Company Logo" className="logo" />
          <label htmlFor="logo-upload" className="edit-icon"><i className="fas fa-edit"></i></label>
          <input type="file" id="logo-upload" onChange={handleLogoUpload} />
        </div>
      )}
      <ul className="navbar-nav">
        <li className="nav-item">
          <NavLink className="nav-link" to="/"><i className="fas fa-tachometer-alt"></i><span className="menu-text"> Dashboard</span></NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/asm"><i className="fas fa-crosshairs"></i><span className="menu-text"> ASM</span></NavLink>
          <ul className="submenu">
            <li className="nav-item">
              <NavLink className="nav-link" to="/asm/assets"><i className="fas fa-database"></i><span className="menu-text"> Assets</span></NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/asm/vulnerability"><i className="fas fa-shield-alt"></i><span className="menu-text"> Vulnerability</span></NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/asm/discovery"><i className="fas fa-search"></i><span className="menu-text"> Discovery</span></NavLink>
            </li>
          </ul>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/account"><i className="fas fa-user"></i><span className="menu-text"> Account</span></NavLink>
        </li>
        {renderSignButton()}
      </ul>
    </nav>
  );
};

const mapStateToProps = (state) => {
  return {
    authenticated: state.auth.authenticated
  };
};

export default connect(mapStateToProps, actions)(Header);
