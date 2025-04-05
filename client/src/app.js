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

/* LAZY IMPORTS */
// Public & Auth pages
const LazySignup = React.lazy(() => import('./components/auth/signup'));
const LazySignin = React.lazy(() => import('./components/auth/signin'));
const LazyForgotPassword = React.lazy(() => import('./components/auth/ForgotPassword'));
const LazyResetPassword = React.lazy(() => import('./components/auth/ResetPassword'));
const LazyActivateAccount = React.lazy(() => import('./components/auth/ActivateAccount'));
const LazyAccount = React.lazy(() => import('./components/auth/account'));
const LazyManageUsers = React.lazy(() => import('./components/auth/ManageUsers'));
const LazySignout = React.lazy(() => import('./components/auth/signout'));

// Superadmin pages
const LazyCreateOrganization = React.lazy(() => import('./components/superAdmin/CreateOrganization'));
const LazySuperAdminDashboard = React.lazy(() => import('./components/superAdmin/SuperAdminDashboard'));
const LazyUsers = React.lazy(() => import('./components/superAdmin/Users'));
const LazyManageSubscriptions = React.lazy(() => import('./components/superAdmin/manageSubscriptions'));
const LazyYourSubscription = React.lazy(() => import('./components/superAdmin/yourSubscription'));

// App Settings pages (used by both superadmin and admin)
const LazyIndustryPage = React.lazy(() => import('./components/AppSettings/Industries/IndustryPage'));
const LazyDomainPage = React.lazy(() => import('./components/AppSettings/Domains/DomainPage'));
const LazySubjectPage = React.lazy(() => import('./components/AppSettings/Subjects/SubjectPage'));
const LazyQuestionPage = React.lazy(() => import('./components/AppSettings/Questions/QuestionPage'));
const LazyRolePage = React.lazy(() => import('./components/AppSettings/Roles/RolePage'));
const LazyTrainingPathPage = React.lazy(() =>
  import('./components/AppSettings/TrainingPaths/TrainingPathPage')
);

// Admin pages – client-admin view
const LazyClientAdminUsers = React.lazy(() => import('./components/admin/ClientAdminUsers'));
const LazyBulkUpload = React.lazy(() => import('./components/admin/BulkUpload'));
// Removed LazyManageContentPage as the file './components/admin/Clientappsettings/ClientquestionsPage' no longer exists.

// Check if token exists in localStorage and dispatch auth action.
const token = localStorage.getItem('auth_jwt_token');
if (token) {
  store.dispatch({ type: AUTH_USER });
}

const FallbackLoader = () => (
  <div className="fallback-loader">
    <div className="spinner"></div>
    <span>Loading...</span>
  </div>
);

const LazyAuthComponent = ({ Component, allowedRoles }) => <Component allowedRoles={allowedRoles} />;

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
      <Header />
      <div className="content">
        <React.Suspense fallback={<FallbackLoader />}>
          <Routes>
            {/* Account */}
            <Route path="/account" element={<LazyAuthComponent Component={LazyAccount} />} />

            {/* Superadmin Routes */}
            <Route
              path="/superadmin/dashboard"
              element={<LazyAuthComponent Component={LazySuperAdminDashboard} allowedRoles={['superadmin']} />}
            />
            <Route
              path="/superadmin/create-organization"
              element={<LazyAuthComponent Component={LazyCreateOrganization} allowedRoles={['superadmin']} />}
            />
            <Route
              path="/superadmin/users"
              element={<LazyAuthComponent Component={LazyUsers} allowedRoles={['superadmin']} />}
            />
            <Route
              path="/superadmin/manage-subscriptions"
              element={<LazyAuthComponent Component={LazyManageSubscriptions} allowedRoles={['superadmin']} />}
            />
            <Route
              path="/superadmin/your-subscription"
              element={<LazyAuthComponent Component={LazyYourSubscription} allowedRoles={['superadmin', 'admin']} />}
            />

            {/* App Settings - accessible to both superadmin and admin */}
            <Route
              path="/application/settings/industries"
              element={<LazyAuthComponent Component={LazyIndustryPage} allowedRoles={['superadmin', 'admin']} />}
            />
            <Route
              path="/application/settings/domains"
              element={<LazyAuthComponent Component={LazyDomainPage} allowedRoles={['superadmin', 'admin']} />}
            />
            <Route
              path="/application/settings/subjects"
              element={<LazyAuthComponent Component={LazySubjectPage} allowedRoles={['superadmin', 'admin']} />}
            />
            <Route
              path="/application/settings/questions"
              element={<LazyAuthComponent Component={LazyQuestionPage} allowedRoles={['superadmin', 'admin']} />}
            />
            <Route
              path="/application/settings/roles"
              element={<LazyAuthComponent Component={LazyRolePage} allowedRoles={['superadmin']} />}
            />
            <Route
              path="/application/settings/training-path"
              element={<LazyAuthComponent Component={LazyTrainingPathPage} allowedRoles={['superadmin', 'admin']} />}
            />
            <Route
              path="/application/settings/bulk-upload"
              element={<LazyAuthComponent Component={LazyBulkUpload} allowedRoles={['superadmin']} />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin/users"
              element={<LazyAuthComponent Component={LazyClientAdminUsers} allowedRoles={['admin']} />}
            />
            {/* Removed the route for manage-content as the corresponding file was removed */}
            <Route
              path="/admin/bulk-upload"
              element={<LazyAuthComponent Component={LazyBulkUpload} allowedRoles={['admin']} />}
            />
            <Route
              path="/admin/training-path"
              element={<LazyAuthComponent Component={LazyTrainingPathPage} allowedRoles={['admin']} />}
            />
            {/* Sign Out */}
            <Route path="/signout" element={<LazyAuthComponent Component={LazySignout} />} />
          </Routes>
        </React.Suspense>
      </div>
    </div>
  );
});

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

export default App;