import React from 'react';
import { NavBar } from './Navbar';
import { Footer } from './Footer';
import { SignUp } from '@clerk/react';

const RegistrationPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <section className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-white/40">Start generating content calendars in minutes.</p>
          </div>
          <SignUp path="/login" routing="path" signInUrl="/sign-in" />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default RegistrationPage;
