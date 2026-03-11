import React from 'react';
import { Check } from 'lucide-react';
import { Button } from './@/components/ui/button';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { useNotionAuth, useStripeSubscription } from './hooks';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PricingCard: React.FC<{
  title: string;
  price: string;
  description: string;
  features: string[];
  highlighted: boolean;
}> = ({ title, price, description, features, highlighted }) => {
  const { user } = useUser();
  const notionAuth = useNotionAuth(user);
  const stripeSubscription = useStripeSubscription(user);

  const handleCheckout = async () => {
    if (!user) return;
    const res = await fetch(`${API_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  const isActive = highlighted && stripeSubscription;

  return (
    <div
      className={`relative rounded-xl p-8 flex flex-col gap-6 ${
        highlighted
          ? 'bg-white border-2 border-indigo-500 glow-purple shadow-lg'
          : 'glass-card'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-semibold tracking-widest uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          Most popular
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">{title}</h3>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-400 mb-1.5">/mo</span>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <ul className="flex flex-col gap-3 flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
            <Check className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {highlighted ? (
        isActive ? (
          <Button variant="outline" disabled className="w-full opacity-60">
            Active subscription
          </Button>
        ) : user && notionAuth ? (
          <Button variant="primary" className="w-full" onClick={handleCheckout}>
            Subscribe now
          </Button>
        ) : (
          <Link to="/login" className="w-full">
            <Button variant="primary" className="w-full">Get started</Button>
          </Link>
        )
      ) : (
        <Link to={(!user || !notionAuth) ? '/login' : '/create'} className="w-full">
          <Button variant="outline" className="w-full">Start free</Button>
        </Link>
      )}
    </div>
  );
};

const Pricing: React.FC = () => {
  return (
    <section className="py-24 px-6 border-t border-gray-100">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-gray-500">No per-seat fees. No surprise charges.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <PricingCard
            title="Free"
            price="$0"
            description="Try Castcal with no commitment."
            features={['3 calendar exports per month', 'Notion export', 'PDF & DOCX upload', 'Claude claude-sonnet-4-6 generation']}
            highlighted={false}
          />
          <PricingCard
            title="Pro"
            price="$15"
            description="For agencies running multiple clients."
            features={[
              'Unlimited exports per month',
              'Notion + Airtable + Gamma',
              'Priority generation',
              'PDF & DOCX upload',
              'Multi-destination in one click',
            ]}
            highlighted={true}
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;
