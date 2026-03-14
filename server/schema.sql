-- Run this in your Neon dashboard → SQL Editor before starting the server.

CREATE TABLE IF NOT EXISTS "castcal-auth" (
  user_id              TEXT        PRIMARY KEY,
  notion_auth          TEXT,
  current_usage        INTEGER     NOT NULL DEFAULT 0,
  max_monthly_usage    INTEGER     NOT NULL DEFAULT 3,
  total_usage          INTEGER     NOT NULL DEFAULT 0,
  all_usage_times      TEXT[]      NOT NULL DEFAULT '{}',
  all_uploaded_content TEXT[]      NOT NULL DEFAULT '{}',
  stripe_subscription_id TEXT,
  airtable_token       TEXT,
  gamma_api_key        TEXT
);
