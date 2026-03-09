import React from 'react';
import { NavBar } from './Navbar';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { Features } from './Features';
import Pricing from './Pricing';

const StripeCancelPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default StripeCancelPage;
