import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/react';
import { useLocation, Link } from 'react-router-dom';
import { NavBar } from './Navbar';
import { Footer } from './Footer';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from './@/components/ui/button';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const StripeSuccessPage: React.FC = () => {
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const { user, isLoaded } = useUser();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!sessionId || !isLoaded || !user) return;
      try {
        const res = await fetch(`${API_URL}/api/checkout-success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, userId: user.id }),
        });
        const data = await res.json();
        if (data.result) setVerified(true);
      } catch { /* ignore */ }
    };
    verify();
  }, [sessionId, isLoaded, user]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="glass-card rounded-2xl p-10 text-center max-w-md w-full">
          {verified ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">You're on Pro!</h1>
              <p className="text-white/40 mb-8">Unlimited content calendar exports across all your platforms.</p>
              <Link to="/create">
                <Button variant="primary" className="gap-2">
                  Start generating <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-5" />
              <h1 className="text-xl font-semibold text-white mb-2">Verifying payment...</h1>
              <p className="text-sm text-white/40">This only takes a moment.</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StripeSuccessPage;
