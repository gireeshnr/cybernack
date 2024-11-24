import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
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

const token = localStorage.getItem('auth_jwt_token');
if (token) {
  store.dispatch({ type: AUTH_USER });
}

// Fallback loader for lazy components
const FallbackLoader = () => <div className="fallback-loader">Loading...</div>;

const App = () => {
  return (
    <Provider store={store}>
      <HashRouter>
        <Toaster position="top-center" />
        <React.Suspense fallback={<FallbackLoader />}>
          <Routes>
            <Route path="/signin" element={<LazySignin />} />
            <Route path="/signup" element={<LazySignup />} />
            <Route path="/forgot-password" element={<LazyForgotPassword />} />
            <Route path="/reset-password/:token" element={<LazyResetPassword />} />
            <Route path="/activate-account/:token" element={<LazyActivateAccount />} />
            <Route path="*" element={<ProtectedApp />} />
          </Routes>
        </React.Suspense>
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
        <React.Suspense fallback={<FallbackLoader />}>
          <Routes>
            <Route path="/account" element={<LazyAuthComponent Component={LazyAccount} />} />
            <Route path="/users" element={<LazyAuthComponent Component={LazyManageUsers} allowedRoles={['admin']} />} />
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
            <Route path="/signout" element={<LazySignout />} />
          </Routes>
        </React.Suspense>
      </div>
    </div>
  );
};

export default App;