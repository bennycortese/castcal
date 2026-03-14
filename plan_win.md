# Castcal — Win Plan

Based on TrustMRR data: the tools that print money are ones that save high-value time
for people who already spend money on software (marketing teams, agencies, creators).
The pattern is: connect to things people already live in, show ROI immediately.

---

## Phase 1 — Broader reach, less setup friction (now)

### Google Sheets export
- Most universal destination — every marketing team already has it, zero learning curve
- Implementation: generate a properly formatted CSV → trigger browser download
  OR use Google Sheets API to create a real spreadsheet in their Drive (needs OAuth)
- CSV download is 1 hour of work. Real Sheets API is ~1 day (add OAuth flow + googleapis package)
- **Start with CSV download** — call it "Google Sheets" since that's what they'll use it for

### Slack summary
- After generating, post a summary of the calendar to a Slack channel via webhook URL
- User pastes their Slack Incoming Webhook URL in their profile — done
- Super simple: POST JSON to their webhook URL, no OAuth needed
- Shows Castcal's value to the whole team automatically

### Remove Gamma, keep Airtable
- Gamma has almost no adoption — remove from the default destinations list
- Airtable stays — it's real and used by actual content teams
- Replace Gamma slot with Google Sheets / Slack

---

## Phase 2 — Higher-value integrations (next 4-6 weeks)

### HubSpot
- Marketing teams who use HubSpot plan all their content there
- HubSpot has a Marketing Calendar and Blog tools that accept structured content
- Integration: use HubSpot API to create Marketing Tasks or Blog Posts from the calendar
- Needs HubSpot API key (Private App token) — no OAuth, just paste a key
- This unlocks a higher-willingness-to-pay customer segment (agencies on HubSpot = $$)

### Monday.com / Trello
- Monday and Trello are the most common content workflow tools for mid-size teams
- Both have clean APIs: create items/cards from the calendar data
- Trello: create cards per content item in a "Content Calendar" board
- Monday.com: create items in a board (needs Personal API token)

---

## Phase 3 — The real money (2-3 months)

### Direct LinkedIn scheduling
- Skip "export to a doc" entirely — schedule approved posts directly to LinkedIn
- LinkedIn API allows scheduling posts via the Company Pages API (needs verification)
- This is the Stan model: remove steps between idea and execution
- Could be sold as a separate higher tier ($29-49/mo vs $15 for export-only)

### Direct X (Twitter) scheduling
- Same model as LinkedIn — schedule posts with media directly
- X API v2 allows post creation (Basic tier ~$100/mo — build cost into Pro tier pricing)

### Why this is the ceiling-lifter:
- Content teams today: brief → Castcal → Notion → copy-paste to scheduling tool
- With direct scheduling: brief → Castcal → posts scheduled ✓
- This is a full content pipeline, not just a "calendar generator"
- Comparable to Buffer/Hootsuite but AI-generated from a brief, not manually entered

---

## Pricing evolution

| Now | Phase 2 | Phase 3 |
|-----|---------|---------|
| Free: 3 exports | Free: 3 exports | Free: 3 exports |
| Pro $15/mo: unlimited exports | Pro $15/mo: unlimited + HubSpot/Monday | Starter $15/mo: exports |
| — | — | Pro $39/mo: direct scheduling |
| — | — | Agency $99/mo: multi-workspace + analytics |

The direct scheduling tier is where real recurring revenue lives — people pay Buffer
$18/mo just to schedule posts manually. Castcal does the writing AND the scheduling.

---

## Immediate todos (this week)
- [ ] Add CSV / Google Sheets download button (frontend only, 1 hour)
- [ ] Add Slack webhook destination (server + frontend, 2-3 hours)
- [ ] Remove Gamma from default destinations
- [ ] Update landing page destinations copy to reflect new integrations
