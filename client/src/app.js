import React, { useEffect, memo } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/header';
import { AUTH_USER } from './actions/types';
import { getUserProfile } from './auth/actions';
import { store } from './store';
import './style/style.scss';

// Lazy load components
const LazySignup = React.lazy(() => import('./components/auth/signup'));
const LazySignin = React.lazy(() => import('./components/auth/signin'));
const LazyForgotPassword = React.lazy(() => import('./components/auth/ForgotPassword'));
const LazyResetPassword = React.lazy(() => import('./components/auth/ResetPassword'));
const LazyActivateAccount = React.lazy(() => import('./components/auth/ActivateAccount'));
const LazyAccount = React.lazy(() => import('./components/auth/account'));
const LazyManageUsers = React.lazy(() => import('./components/auth/ManageUsers'));
const LazyCreateOrganization = React.lazy(() => import('./components/superAdmin/CreateOrganization'));
const LazySuperAdminDashboard = React.lazy(() => import('./components/superAdmin/SuperAdminDashboard'));
const LazyUsers = React.lazy(() => import('./components/superAdmin/Users'));
const LazyManageSubscriptions = React.lazy(() => import('./components/superAdmin/manageSubscriptions'));
const LazySignout = React.lazy(() => import('./components/auth/signout'));
const LazyAuthComponent = React.lazy(() => import('./components/auth/require_auth'));

// NEW: Import IndustryPage (replaces EntityPage)
const LazyIndustryPage = React.lazy(() =>
  import('./components/AppSettings/Industries/IndustryPage')
);

// Check if token exists and dispatch auth action
const token = localStorage.getItem('auth_jwt_token');
if (token) {
  store.dispatch({ type: AUTH_USER });
}

// Fallback loader for lazy components
const FallbackLoader = () => (
  <div className="fallback-loader">
    <div className="spinner"></div>
    <span>Loading...</span>
  </div>
);

// Main App component
const App = () => {
  return (
    <Provider store={store}>
      <HashRouter>
        <Toaster position="top-center" />
        <React.Suspense fallback={<FallbackLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<LazySignin />} />
            <Route path="/signup" element={<LazySignup />} />
            <Route path="/forgot-password" element={<LazyForgotPassword />} />
            <Route path="/reset-password/:token" element={<LazyResetPassword />} />
            <Route path="/activate-account/:token" element={<LazyActivateAccount />} />

            {/* Protected Routes */}
            <Route path="*" element={<ProtectedApp />} />
          </Routes>
        </React.Suspense>
      </HashRouter>
    </Provider>
  );
};

// Protected App Component
const ProtectedApp = memo(() => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('auth_jwt_token');
    if (!token) {
      navigate('/signin');
    } else {
      dispatch(getUserProfile());
    }
  }, [navigate, dispatch]);

  return (
    <div className="app">
      {/* Application Header */}
      <Header />

      {/* Protected Routes */}
      <div className="content">
        <React.Suspense fallback={<FallbackLoader />}>
          <Routes>
            {/* Account */}
            <Route path="/account" element={<LazyAuthComponent Component={LazyAccount} />} />
            
            {/* Admin Settings */}
            <Route
              path="/superadmin/dashboard"
              element={
                <LazyAuthComponent
                  Component={LazySuperAdminDashboard}
                  allowedRoles={['superadmin']}
                />
              }
            />
            <Route
              path="/superadmin/create-organization"
              element={
                <LazyAuthComponent
                  Component={LazyCreateOrganization}
                  allowedRoles={['superadmin']}
                />
              }
            />
            <Route
              path="/superadmin/users"
              element={
                <LazyAuthComponent
                  Component={LazyUsers}
                  allowedRoles={['superadmin']}
                />
              }
            />
            <Route
              path="/superadmin/manage-subscriptions"
              element={
                <LazyAuthComponent
                  Component={LazyManageSubscriptions}
                  allowedRoles={['superadmin']}
                />
              }
            />

            {/* Application Settings */}
            {/* Old: /application/settings/entities => /application/settings/industries */}
            <Route
              path="/application/settings/industries"
              element={
                <LazyAuthComponent
                  Component={LazyIndustryPage}
                  allowedRoles={['superadmin']}
                />
              }
            />

            {/* Sign Out */}
            <Route path="/signout" element={<LazySignout />} />
          </Routes>
        </React.Suspense>
      </div>
    </div>
  );
});

export default App;