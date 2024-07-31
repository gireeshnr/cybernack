import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Header from './components/header';
import Dashboard from './components/Dashboard';
import ASM from './components/ASM';
import Assets from './components/ASM/Assets';
import Vulnerability from './components/ASM/Vulnerability';
import Discovery from './components/ASM/Discovery';
import AssetDetailView from './components/ASM/AssetDetailView'; // Import the new component
import Account from './components/account';
import Signin from './components/auth/signin';
import Signup from './components/auth/signup';
import Signout from './components/auth/signout';
import AuthComponent from './components/auth/require_auth';
import { AUTH_USER } from './actions/types';
import { store } from './store';
import './style/style.scss';

const token = localStorage.getItem('auth_jwt_token');

// if we have a token, consider the user to be signed in
if (token) {
  store.dispatch({ type: AUTH_USER });
}

const App = () => {
  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<ProtectedApp />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}

const ProtectedApp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('auth_jwt_token')) {
      navigate('/signin');
    }
  }, [navigate]);

  return (
    <div className="app">
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/asm" element={<ASM />} />
          <Route path="/asm/assets" element={<Assets />} />
          <Route path="/asm/assets/:assetId" element={<AssetDetailView />} /> {/* Add the new route */}
          <Route path="/asm/vulnerability" element={<Vulnerability />} />
          <Route path="/asm/discovery" element={<Discovery />} />
          <Route path="/account" element={<AuthComponent Component={Account} />} />
          <Route path="/signout" element={<Signout />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
