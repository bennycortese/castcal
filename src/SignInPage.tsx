import React from 'react';
import { NavBar } from './Navbar';
import { Footer } from './Footer';
import { SignIn } from '@clerk/clerk-react';

const SignInPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <section className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-white/40">Sign in to your Castcal account.</p>
          </div>
          <SignIn path="/sign-in" routing="path" signUpUrl="/login" fallbackRedirectUrl="/create" />
          <SignIn path="/login/sso-callback" routing="path" signUpUrl="/login" fallbackRedirectUrl="/create" />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SignInPage;
