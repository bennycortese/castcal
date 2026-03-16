# Castcal — Phase 3 Breakdown: Direct Scheduling

The goal is to eliminate the copy-paste step between Castcal and a scheduling tool.
This is the moat. Buffer/Hootsuite charge $18-50/mo just for scheduling. Castcal would
do the writing AND the scheduling.

**Key risk up front:** LinkedIn's Marketing API requires app review that can take 2-4 weeks.
Start with X (user-owned API keys) to ship faster and prove the model works.

---

## Prerequisite: Post Review UI
*Before any scheduling can exist, users need to review AI output before it goes live.*

### Step 1 — PostReviewer component
**What:** After generation, instead of just showing export results, show each content
item as an editable card. Users can tweak the hook, toggle items off, and approve.

**Why it's required:** Auto-scheduling AI-generated content without review = brand risk.
Every scheduling tool (Buffer, Hootsuite) has an approval step. We need one too.

**Work:**
- New `PostReviewer.tsx` — grid of cards, each showing: emoji, title, channel, format, date, hook, description
- Each card has an edit toggle (inline edit for hook + description)
- Checkbox to include/exclude from scheduling
- "Schedule selected" button (disabled until OAuth connected)
- Store reviewed items in a new Jotai atom: `reviewedItemsAtom`

**Size:** 1.5–2 days

---

### Step 2 — Platform character limits
**What:** Surface per-platform character limits in the review UI and enforce them in
the generation prompt.

**Platform limits:**
- LinkedIn: 3,000 chars for posts
- X: 280 chars per tweet (threads need splitting)
- Instagram caption: 2,200 chars

**Work:**
- Add character count + warning bar per card in PostReviewer when channel = X/LinkedIn
- Update Claude system prompt to generate X hooks ≤ 270 chars and mark long descriptions
  as "thread" format
- No backend changes needed

**Size:** half day

---

## Step 3 — X (Twitter) scheduling
*Start here — faster to ship than LinkedIn because we can skip OAuth using user API keys.*

### Why X first:
- No app review process (LinkedIn takes weeks)
- User provides their own X API keys → no $100/mo cost on us
- The API is well-documented and works today
- Proves the scheduling model before investing in LinkedIn OAuth

### 3a — X credentials in Profile
**What:** Two new fields in Profile: X API Key + X API Secret (or Bearer Token + Access Token pair).
Users create a free X Developer app, get their keys, paste them in.

**DB columns:** `x_api_key TEXT`, `x_api_secret TEXT`, `x_access_token TEXT`, `x_access_token_secret TEXT`

**Work:** Profile fields + server save/retrieve. Same pattern as Trello.

**Size:** half day

### 3b — X post creation endpoint
**What:** `POST /api/schedule-x` — takes items + scheduled datetimes, creates tweets via X API v2.

**API:** `POST https://api.twitter.com/2/tweets`
- Uses OAuth 1.0a with user's own app keys (avoids the $100/mo Basic tier)
- For scheduling: `"scheduled_at": "2026-03-20T10:00:00Z"` (only available on paid tiers, otherwise post immediately)
- Thread splitting: if description > 280 chars, split into numbered replies

**Dependencies:** Install `twitter-api-v2` npm package in `/server`

**Size:** 1.5 days

### 3c — X destination card + scheduling UI
**What:** X destination card in DestinationSelector (disabled until API keys set).
DateTime picker per-item in PostReviewer when X is selected.

**Size:** half day

---

## Step 4 — LinkedIn scheduling
*Higher friction due to app review, but higher value (agencies live in LinkedIn).*

### 4a — LinkedIn app + OAuth flow
**What:** LinkedIn OAuth 2.0 Authorization Code flow — similar to how Notion OAuth works today.

**Scopes needed:**
- `w_member_social` — post on behalf of the signed-in user
- `r_liteprofile` — get their LinkedIn URN (needed for authoring posts)
- For company page posting: `w_organization_social` + `r_organization_social`

**App review reality:**
- `w_member_social` is available without review on the basic LinkedIn app
- `w_organization_social` (company pages) requires LinkedIn Marketing API access → 2-4 week review
- **Ship personal posting first**, add company page posting after review is approved

**Work:**
- LinkedIn app registration (Client ID + Secret in .env)
- `/oauth/linkedin/callback` route — exchange code for token
- Store `linkedin_access_token` + `linkedin_member_urn` in DB
- `LinkedInAuth.tsx` — redirect button (same pattern as `NotionAuth.tsx`)

**Size:** 1.5–2 days (plus waiting for LinkedIn app approval if needed)

### 4b — LinkedIn post creation endpoint
**What:** `POST /api/schedule-linkedin`

**API:** `POST https://api.linkedin.com/rest/posts`
```
{
  "author": "urn:li:person:{memberId}",
  "commentary": "{hook}\n\n{description}",
  "visibility": "PUBLIC",
  "distribution": { "feedDistribution": "MAIN_FEED" },
  "lifecycleState": "PUBLISHED"  // or "DRAFT" for review
}
```
For scheduled posts: `"lifecycleState": "SCHEDULED"` + `"scheduledAt": unix_timestamp`

**Note:** Scheduled posts only work with `w_organization_social` (company pages).
Personal posts (`w_member_social`) can only be published immediately.

**Size:** 1 day

### 4c — LinkedIn destination card + scheduling UI
**What:** LinkedIn card in DestinationSelector (disabled until OAuth connected).
Show LinkedIn auth status — "Connect LinkedIn" button if not connected.

**Size:** half day

---

## Step 5 — Scheduling datetime picker
**What:** In PostReviewer, when a scheduling destination (X or LinkedIn) is selected,
show a datetime picker per post. Pre-fill from the `publish_date` field Claude already generates.

**Work:**
- Add `react-datepicker` (or use a native datetime-local input)
- Store `scheduledAt` per item in `reviewedItemsAtom`
- Validate: can't schedule in the past

**Size:** half day

---

## Step 6 — Scheduled posts queue view
**What:** A `/queue` page showing upcoming scheduled posts, their status, and platform.

**Why it matters:** Without this, users have no visibility into what's going out. This is
table stakes for any scheduling tool.

**DB changes:** New table `scheduled_posts`:
```sql
CREATE TABLE scheduled_posts (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  platform        TEXT NOT NULL,       -- 'x' | 'linkedin'
  content         TEXT NOT NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          TEXT DEFAULT 'pending', -- 'pending' | 'published' | 'failed'
  platform_post_id TEXT,               -- returned by platform after publishing
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Work:**
- `ScheduleQueue.tsx` page — table/list of upcoming posts
- `GET /api/scheduled-posts` — fetch user's queue
- Status polling or webhook (X and LinkedIn have webhooks)

**Size:** 2–3 days

---

## Step 7 — Pricing tier + paywall
**What:** New "Scheduler" tier at $39/mo. Gate X and LinkedIn destinations behind it.

**Work:**
- New Stripe price ID for `$39/mo`
- `useSchedulerSubscription()` hook (similar to `useStripeSubscription`)
- In DestinationSelector: show X and LinkedIn cards as "Pro" locked with upgrade prompt
- Upgrade CTA that opens Stripe Checkout for the Scheduler tier

**Size:** 1 day

---

## Recommended order of execution

```
Step 1: PostReviewer UI          → unblocks everything, needed now
Step 2: Character limits          → half day, do with Step 1
Step 3a: X credentials            → half day
Step 3b: X posting endpoint       → proves the model, ships fast
Step 3c: X in UI + datetime       → shippable end-to-end MVP
──── FIRST SHIPPABLE MILESTONE ────
Step 4a: LinkedIn OAuth           → start app submission early (wait time)
Step 5:  Datetime picker          → already partially done in Step 3
Step 4b: LinkedIn endpoint        → after OAuth works
Step 4c: LinkedIn in UI
──── SECOND MILESTONE ────
Step 6:  Queue view               → needed for Pro tier to feel real
Step 7:  Pricing tier             → monetize after proving value
──── PHASE 3 COMPLETE ────
```

**Total estimate:** ~14–18 days of focused work, spread over 4–6 weeks.

The first milestone (X scheduling end-to-end) can ship in under a week and
validates the model before LinkedIn is even approved.

---

## Open questions before starting

1. **X API tier:** User's own API keys (free, but requires users to have a dev account)
   vs. Castcal's own app keys ($100/mo Basic). Start with user-owned to prove demand.

2. **LinkedIn company pages vs. personal:** Personal is faster to ship, but agencies
   need company pages. Apply for Marketing API access now — it runs in parallel.

3. **"Schedule" vs. "post immediately":** For X personal posts, immediate only.
   For LinkedIn personal, immediate only. Scheduling requires company page + paid tier.
   Be transparent about this in the UI.

4. **Content ownership / compliance:** AI-generated posts being sent directly to
   social platforms — do we need a ToS update? Likely yes.
