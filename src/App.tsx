import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ClerkProvider, useUser } from '@clerk/react';
import LandingPage from './LandingPage';
import NotionAuth from './NotionAuth';
import NotionRedirect from './NotionRedirect';
import RegistrationPage from './RegistrationPage';
import BriefInput from './BriefInput';
import ProfileInfo from './ProfileInfo';
import StripeSuccessPage from './StripeSuccessPage';
import StripeCancelPage from './StripeCancelPage';
import SignInPage from './SignInPage';

// TODO: Replace with your Clerk publishable key
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || 'pk_test_REPLACE_ME';

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === 'pk_test_REPLACE_ME') {
  console.warn('Missing Clerk Publishable Key — set REACT_APP_CLERK_PUBLISHABLE_KEY in .env');
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <MainApp />
    </ClerkProvider>
  );
}

function MainApp() {
  const { user } = useUser();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cancel" element={<StripeCancelPage />} />
        <Route path="/success" element={<StripeSuccessPage />} />
        {!user && <Route path="/login" element={<RegistrationPage />} />}
        {user && <Route path="/login" element={<NotionAuth />} />}
        <Route path="/register" element={<NotionAuth />} />
        <Route path="/redirect" element={<NotionRedirect />} />
        <Route path="/create" element={<BriefInput />} />
        <Route path="/profile" element={<ProfileInfo />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/login/sso-callback" element={<SignInPage />} />
        <Route path="/error" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
