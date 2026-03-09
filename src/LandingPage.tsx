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
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default LandingPage;
