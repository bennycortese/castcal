import { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useNotionAuth = (user: any) => {
  const [notionAuth, setNotionAuth] = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_URL}/api/notion-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const { notion_auth } = await res.json();
        setNotionAuth(notion_auth);
      } catch {
        setNotionAuth(null);
      }
    };
    fetch_();
  }, [user]);

  return notionAuth;
};

export const useCurrentMonthCount = (user: any) => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_URL}/api/notion-current-month`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const { current_usage } = await res.json();
        setCount(current_usage);
      } catch {
        setCount(null);
      }
    };
    fetch_();
  }, [user]);

  return count;
};

export const useMaxMonthCount = (user: any) => {
  const [max, setMax] = useState<number | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_URL}/api/notion-max-month`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const { max_monthly_usage } = await res.json();
        setMax(max_monthly_usage);
      } catch {
        setMax(null);
      }
    };
    fetch_();
  }, [user]);

  return max;
};

export const useStripeSubscription = (user: any) => {
  const [sub, setSub] = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_URL}/api/stripe-user-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const { stripe_subscription_id } = await res.json();
        setSub(stripe_subscription_id);
      } catch {
        setSub(null);
      }
    };
    fetch_();
  }, [user]);

  return sub;
};

export const useUserIntegrations = (user: any) => {
  const [integrations, setIntegrations] = useState<{
    airtable_token: string | null;
    slack_webhook_url: string | null;
  }>({ airtable_token: null, slack_webhook_url: null });

  useEffect(() => {
    const fetch_ = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_URL}/api/user-integrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        setIntegrations({
          airtable_token:    data.airtable_token    || null,
          slack_webhook_url: data.slack_webhook_url || null,
        });
      } catch {
        setIntegrations({ airtable_token: null, slack_webhook_url: null });
      }
    };
    fetch_();
  }, [user]);

  return integrations;
};
