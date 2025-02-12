// client/src/App.js
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
const LazyCreateOrganization = React.lazy(() =>
  import('./components/superAdmin/CreateOrganization')
);
const LazySuperAdminDashboard = React.lazy(() =>
  import('./components/superAdmin/SuperAdminDashboard')
);
const LazyUsers = React.lazy(() => import('./components/superAdmin/Users'));
const LazyManageSubscriptions = React.lazy(() =>
  import('./components/superAdmin/manageSubscriptions')
);
const LazyYourSubscription = React.lazy(() =>
  import('./components/superAdmin/yourSubscription')
);
const LazySignout = React.lazy(() => import('./components/auth/signout'));
const LazyAuthComponent = React.lazy(() => import('./components/auth/require_auth'));

const LazyIndustryPage = React.lazy(() =>
  import('./components/AppSettings/Industries/IndustryPage')
);
const LazyDomainPage = React.lazy(() =>
  import('./components/AppSettings/Domains/DomainPage')
);
const LazySubjectPage = React.lazy(() =>
  import('./components/AppSettings/Subjects/SubjectPage')
);
const LazyQuestionPage = React.lazy(() =>
  import('./components/AppSettings/Questions/QuestionPage')
);

// New: Import the ClientAdminUsers component
const LazyClientAdminUsers = React.lazy(() =>
  import('./components/admin/ClientAdminUsers')
);

// New: Import the ManageDomainsAndSubjects component
const LazyManageDomainsAndSubjects = React.lazy(() =>
  import('./components/admin/ManageDomainsAndSubjects')
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

            {/* 
              *** KEY CHANGE ***
              Before: allowedRoles={['superadmin']}
              Now: allow superadmin OR admin
            */}
            <Route
              path="/superadmin/your-subscription"
              element={
                <LazyAuthComponent
                  Component={LazyYourSubscription}
                  allowedRoles={['superadmin', 'admin']}
                />
              }
            />

            {/* Application Settings */}
            <Route
              path="/application/settings/industries"
              element={
                <LazyAuthComponent
                  Component={LazyIndustryPage}
                  allowedRoles={['superadmin']}
                />
              }
            />
            <Route
              path="/application/settings/domains"
              element={
                <LazyAuthComponent
                  Component={LazyDomainPage}
                  allowedRoles={['superadmin']}
                />
              }
            />
            <Route
              path="/application/settings/subjects"
              element={
                <LazyAuthComponent
                  Component={LazySubjectPage}
                  allowedRoles={['superadmin']}
                />
              }
            />
            <Route
              path="/application/settings/questions"
              element={
                <LazyAuthComponent
                  Component={LazyQuestionPage}
                  allowedRoles={['superadmin']}
                />
              }
            />

            {/* New: Client Admin User Management */}
            <Route
              path="/admin/users"
              element={
                <LazyAuthComponent
                  Component={LazyClientAdminUsers}
                  allowedRoles={['admin']}
                />
              }
            />

            {/* New: Manage Domains and Subjects */}
            <Route
              path="/admin/domains-subjects"
              element={
                <LazyAuthComponent
                  Component={LazyManageDomainsAndSubjects}
                  allowedRoles={['admin']}
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