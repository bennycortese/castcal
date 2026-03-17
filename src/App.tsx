import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useUser } from '@clerk/react';
import LandingPage from './LandingPage';
import NotionAuth from './NotionAuth';
import NotionRedirect from './NotionRedirect';
import RegistrationPage from './RegistrationPage';
import BriefInput from './BriefInput';
import ProfileInfo from './ProfileInfo';
import StripeSuccessPage from './StripeSuccessPage';
import StripeCancelPage from './StripeCancelPage';
import SignInPage from './SignInPage';

function App() {
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
        <Route path="/error" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
