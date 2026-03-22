-- Run this in your Neon dashboard → SQL Editor before starting the server.

CREATE TABLE IF NOT EXISTS "briefcast-auth" (
  user_id                TEXT        PRIMARY KEY,
  notion_auth            TEXT,
  current_usage          INTEGER     NOT NULL DEFAULT 0,
  max_monthly_usage      INTEGER     NOT NULL DEFAULT 3,
  total_usage            INTEGER     NOT NULL DEFAULT 0,
  all_usage_times        TEXT[]      NOT NULL DEFAULT '{}',
  all_uploaded_content   TEXT[]      NOT NULL DEFAULT '{}',
  stripe_subscription_id TEXT,
  hubspot_token          TEXT,
  monday_token           TEXT,
  monday_board_id        TEXT,
  trello_api_key         TEXT,
  trello_token           TEXT,
  buffer_access_token    TEXT
);
