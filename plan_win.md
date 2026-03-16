# Castcal — Win Plan

Based on TrustMRR data: the tools that print money are ones that save high-value time
for people who already spend money on software (marketing teams, agencies, creators).
The pattern is: connect to things people already live in, show ROI immediately.

---

## Phase 1 — Broader reach, less setup friction ✅ DONE

### Google Sheets export ✅
- CSV download implemented — triggers browser download, opens directly in Sheets
- Labeled "Google Sheets" in the UI, no OAuth needed

### Slack summary ✅
- Slack Incoming Webhook URL field in Profile
- Server posts a formatted Slack block message (header + per-item bullets)
- Validated to `https://hooks.slack.com/` only

### Remove Gamma, keep Airtable ✅
- Gamma removed from destinations, Profile settings, and landing copy
- Replaced by Google Sheets + Slack

### Landing page copy updated ✅
- Features.tsx and HowItWorks.tsx reflect new integrations

---

## Phase 2 — Higher-value integrations ✅ DONE

### HubSpot ✅
- Private App token in Profile (`crm.objects.tasks:write` scope)
- Batch creates CRM Tasks via HubSpot API
- Fetches portal ID for a direct link to the tasks list

### Monday.com ✅
- API token + board ID in Profile
- Two batched GraphQL mutations: creates items, then attaches detail updates

### Trello ✅
- API key + token in Profile
- Creates a private board per calendar, one "Content Calendar" list, cards with due dates

### DB migrations needed (run once in Neon):
```sql
ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS slack_webhook_url TEXT;
ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS hubspot_token TEXT;
ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS monday_token TEXT;
ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS monday_board_id TEXT;
ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS trello_api_key TEXT;
ALTER TABLE "castcal-auth" ADD COLUMN IF NOT EXISTS trello_token TEXT;
```

---

## Phase 3 — The real money (in progress — see plan_phase3.md)

Direct LinkedIn + X scheduling. Eliminates the copy-paste step between Castcal and a
scheduling tool entirely. Full breakdown with 7 ordered steps is in `plan_phase3.md`.

**TL;DR order:** PostReviewer UI → X scheduling (user-owned API keys, ships fast) →
LinkedIn OAuth (submit app now, 2-4 week review) → Queue view → Pricing tier.

### Pricing target:
| Starter $15/mo | Pro $39/mo |
|----------------|------------|
| Unlimited exports to all current destinations | Everything in Starter + direct X & LinkedIn scheduling |

---

## Current destination support

| Destination | Status | Auth type |
|-------------|--------|-----------|
| Notion | ✅ Live | OAuth |
| Airtable | ✅ Live | Personal Access Token |
| Google Sheets | ✅ Live | None (CSV download) |
| Slack | ✅ Live | Incoming Webhook URL |
| HubSpot | ✅ Live | Private App Token |
| Monday.com | ✅ Live | API Token + Board ID |
| Trello | ✅ Live | API Key + Token |
| LinkedIn | 🔲 Phase 3 | OAuth 2.0 |
| X (Twitter) | 🔲 Phase 3 | OAuth 2.0 / User API keys |
