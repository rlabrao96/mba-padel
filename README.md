# Adidas MBA Padel Tournament

Live tournament web app for the **Adidas MBA Padel Tournament** — April 11–12, 2026 at [PadelHub USA](https://www.padelhubusa.com/), 653 Summer St., Boston, MA.

- 12 teams across 8 business schools
- 3 groups → Gold / Silver / Bronze cups
- Super Set to 8 games
- **Live shared results**: anyone with the link sees scores update within ~4 seconds

Built with **Next.js 14** (App Router) + **Tailwind CSS** + **Upstash Redis** (installed via Vercel Marketplace).

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Without `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or the equivalent legacy `KV_REST_API_*` vars) set, the app falls back to an in-memory store + `localStorage`. That's fine for local testing — but only the tab that made an edit will see it. Live sync across devices requires Upstash Redis in production.

## Deploy to Vercel (first time)

1. **Push this folder to a new GitHub repo.**

   ```bash
   cd adidas-mba-padel
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/adidas-mba-padel.git
   git push -u origin main
   ```

2. **Import the repo on Vercel.**

   - Go to https://vercel.com/new
   - Pick the `adidas-mba-padel` repo
   - Framework preset: **Next.js** (auto-detected)
   - Leave build / output settings as defaults
   - Click **Deploy**

3. **Attach an Upstash Redis database** (this is what makes scores live-shared).

   - Open the project → **Storage** tab → **Create Database**
   - Pick **Upstash Redis** from the Vercel Marketplace → Free tier → any region (US East recommended)
   - Vercel automatically injects these env vars into the project:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `REDIS_URL`
     (The code also still accepts the legacy `KV_REST_API_URL` / `KV_REST_API_TOKEN` names.)
   - Click **Redeploy** on the latest deployment so the new env vars take effect.

4. **Share the public URL.**

   The production URL (e.g. `https://adidas-mba-padel.vercel.app`) is now the single source of truth. Anyone with the link can view and enter scores, and everyone else sees updates within 4 seconds.

## Editing mode

Per the current design, **anyone with the link can edit scores** (no password). If that becomes a problem mid-tournament, you can lock it down quickly:

- **Option A** — temporarily hide the edit UI by setting `NEXT_PUBLIC_READ_ONLY=1` (you'd need to add a check in components, not currently implemented).
- **Option B** — remove public access by changing `app/api/state/route.ts` to require a secret query param.

## Reset

The **Groups** tab has a `Reset all` button that wipes all group and bracket scores. Confirmation dialog included.

## Project layout

```
app/
  layout.tsx         # fonts, metadata
  page.tsx           # main tabs + live state
  globals.css        # Tailwind + CSS vars
  api/state/route.ts # GET + POST tournament state
components/
  Header.tsx
  Tabs.tsx
  GroupsView.tsx
  ScheduleView.tsx
  GoldCupView.tsx
  SilverCupView.tsx
  BronzeCupView.tsx
  BracketMatch.tsx
  RulesView.tsx
  TeamBadge.tsx
lib/
  data.ts                 # teams, groups, round-robin rounds
  standings.ts            # standings + classification + bracket helpers
  kv.ts                   # Vercel KV read/write (with in-memory fallback)
  useTournamentState.ts   # client polling + optimistic updates
```

## Tournament format

- **Group stage:** round-robin (6 matches per group, 18 total)
- **Standings tiebreakers:** matches won → game difference → total games won
- **Gold Cup (8 teams):** top 2 per group + best 2 third-place teams
- **Gold Cup QF:** 1v8 · 4v5 · 2v7 · 3v6
- **Silver Cup:** the four Gold QF losers (SF → Final)
- **Bronze Cup:** worst third-place + all fourths (SF → Final)

Full rules are inside the app on the **Rules** tab.
