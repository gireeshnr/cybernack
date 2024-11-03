import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Header from './components/header';
import Account from './components/auth/account';
import ManageUsers from './components/auth/ManageUsers'; // Ensure exact match with file
import Signin from './components/auth/signin';
import Signup from './components/auth/signup';
import Signout from './components/auth/signout';
import ActivateAccount from './components/auth/ActivateAccount';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AuthComponent from './components/auth/require_auth';
import CreateOrganization from './components/superAdmin/CreateOrganization';
import SuperAdminDashboard from './components/superAdmin/SuperAdminDashboard';
import Users from './components/superAdmin/Users';
import ManageSubscriptions from './components/superAdmin/manageSubscriptions'; // Ensure exact match with file
import { AUTH_USER } from './actions/types';
import { getUserProfile } from './auth/actions';
import { store } from './store';
import './style/style.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const token = localStorage.getItem('auth_jwt_token');
if (token) {
  console.log('Token found in localStorage, dispatching AUTH_USER');
  store.dispatch({ type: AUTH_USER });
}

const App = () => {
  return (
    <Provider store={store}>
      <HashRouter>
        <ToastContainer />
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/activate-account/:token" element={<ActivateAccount />} />
          <Route path="*" element={<ProtectedApp />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
};

const ProtectedApp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!localStorage.getItem('auth_jwt_token')) {
      navigate('/signin');
    } else {
      dispatch(getUserProfile());
    }
  }, [navigate, dispatch]);

  return (
    <div className="app">
      <Header />
      <div className="content">
        <Routes>
          {/* Account and Manage Users for Admins */}
          <Route path="/account" element={<AuthComponent Component={Account} />} />
          <Route
            path="/users"
            element={<AuthComponent Component={ManageUsers} allowedRoles={['admin']} />}
          />

          {/* Super Admin Routes */}
          <Route
            path="/superadmin/dashboard"
            element={<AuthComponent Component={SuperAdminDashboard} allowedRoles={['superadmin']} />}
          />
          <Route
            path="/superadmin/create-organization"
            element={<AuthComponent Component={CreateOrganization} allowedRoles={['superadmin']} />}
          />
          <Route
            path="/superadmin/users"
            element={<AuthComponent Component={Users} allowedRoles={['superadmin']} />}
          />
          <Route
            path="/superadmin/manage-subscriptions"
            element={<AuthComponent Component={ManageSubscriptions} allowedRoles={['superadmin']} />}
          /> {/* New Manage Subscriptions route */}
          
          <Route path="/signout" element={<Signout />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;