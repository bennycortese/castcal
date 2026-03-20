import { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    hubspot_token:       string | null;
    monday_token:        string | null;
    monday_board_id:     string | null;
    trello_api_key:      string | null;
    trello_token:        string | null;
    buffer_access_token: string | null;
  }>({
    hubspot_token: null, monday_token: null, monday_board_id: null,
    trello_api_key: null, trello_token: null, buffer_access_token: null,
  });

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
          hubspot_token:       data.hubspot_token       || null,
          monday_token:        data.monday_token        || null,
          monday_board_id:     data.monday_board_id     || null,
          trello_api_key:      data.trello_api_key      || null,
          trello_token:        data.trello_token        || null,
          buffer_access_token: data.buffer_access_token || null,
        });
      } catch {
        setIntegrations({
          hubspot_token: null, monday_token: null, monday_board_id: null,
          trello_api_key: null, trello_token: null, buffer_access_token: null,
        });
      }
    };
    fetch_();
  }, [user]);

  return integrations;
};
