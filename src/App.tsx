import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import LandingPage from './LandingPage';
import RegistrationPage from './RegistrationPage';
import BriefInput from './BriefInput';
import ReviewPage from './ReviewPage';
import ProfileInfo from './ProfileInfo';
import StripeSuccessPage from './StripeSuccessPage';
import StripeCancelPage from './StripeCancelPage';
import SignInPage from './SignInPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cancel" element={<StripeCancelPage />} />
        <Route path="/success" element={<StripeSuccessPage />} />
        <Route path="/login" element={<RegistrationPage />} />
        <Route path="/create" element={<BriefInput />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/profile" element={<ProfileInfo />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/error" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
