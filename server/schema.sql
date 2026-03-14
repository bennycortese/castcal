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
  gamma_api_key        TEXT,
  slack_webhook_url    TEXT,
  hubspot_token        TEXT,
  monday_token         TEXT,
  monday_board_id      TEXT,
  trello_api_key       TEXT,
  trello_token         TEXT
);

-- If the table already exists, run these once in Neon SQL Editor:
-- ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT;
-- ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS hubspot_token TEXT;
-- ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS monday_token TEXT;
-- ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS monday_board_id TEXT;
-- ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS trello_api_key TEXT;
-- ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS trello_token TEXT;
