import React from 'react';
import { NavBar } from './Navbar';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { Features } from './Features';
import { HowItWorks } from './HowItWorks';
import Pricing from './Pricing';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      {/* Greptile-style: border-x frames content in a subtle vertical channel */}
      <div className="flex-grow w-full max-w-[1400px] mx-auto border-x border-white/[0.04]">
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
