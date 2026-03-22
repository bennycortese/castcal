# Briefcast — Setup Guide

## Neon database table

Run `server/schema.sql` in your Neon dashboard → SQL Editor before starting the server.

Table name: `briefcast-auth`

| Column | Type | Notes |
|---|---|---|
| user_id | text | primary key |
| notion_auth | text | nullable |
| current_usage | int4 | default 0 |
| max_monthly_usage | int4 | default 3 |
| total_usage | int4 | default 0 |
| all_usage_times | text[] | default {} |
| all_uploaded_content | text[] | default {} |
| stripe_subscription_id | text | nullable |
| hubspot_token | text | nullable |
| monday_token | text | nullable |
| monday_board_id | text | nullable |
| trello_api_key | text | nullable |
| trello_token | text | nullable |
| buffer_access_token | text | nullable |

## Environment variables

1. Copy `.env.example` → `.env` in the root (frontend vars)
2. Copy `.env.example` → `server/.env` (backend vars)
3. Fill in each value

## Frontend keys

- **Clerk**: Create app at [clerk.com](https://clerk.com), grab publishable key

## Backend keys

- **Anthropic**: Get key at [console.anthropic.com](https://console.anthropic.com)
- **Stripe**: Create product + price, grab both keys
- **Neon**: Project connection string from neon.tech dashboard

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
