# Castcal — Setup Guide

## Supabase table

Create a table named `castcal-auth` with these columns:

| Column | Type | Notes |
|---|---|---|
| user_id | text | primary key |
| notion_auth | text | |
| current_usage | int4 | default 0 |
| max_monthly_usage | int4 | default 3 |
| total_usage | int4 | default 0 |
| all_usage_times | jsonb | default [] |
| all_uploaded_content | jsonb | default [] |
| stripe_subscription_id | text | nullable |
| airtable_token | text | nullable |
| gamma_api_key | text | nullable |

## Environment variables

1. Copy `.env.example` → `.env` in the root (frontend vars)
2. Copy `.env.example` → `server/.env` (backend vars)
3. Fill in each value

## Frontend keys

- **Clerk**: Create app at [clerk.com](https://clerk.com), grab publishable key
- **Notion client ID**: Create integration at [notion.so/my-integrations](https://notion.so/my-integrations)

## Backend keys

- **Anthropic**: Get key at [console.anthropic.com](https://console.anthropic.com)
- **Notion client secret**: From your Notion integration settings
- **Stripe**: Create product + price, grab both keys
- **Supabase**: Project URL + service role key from project settings

## Run locally

```bash
# Frontend
npm install
npm start

# Backend (separate terminal)
cd server
npm install
npm run dev
```

## Notion OAuth setup

In your Notion integration settings, set the redirect URI to:
- Dev: `http://localhost:3000/redirect`
- Prod: `https://yourdomain.com/redirect`
