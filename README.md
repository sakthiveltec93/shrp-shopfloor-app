# SHRP Shop Floor App

Mobile-installable (PWA) replacement for the paper/AppSheet shop-floor data capture flow.

## What it does

- **Mould Setup / Approval** — operator (or supervisor/admin) proposes a part→machine assignment; a supervisor/admin approves or rejects it. Decoupled from Production Entry on purpose: the entry form only ever *reads* the currently approved part, it never sets it.
- **Production Entry** — operator picks a machine, sees the approved part read-only, logs start/end count, rejects, downtime. Shift (A 09:30–21:30 / B 21:30–09:30) and hour slot are computed server-side from the clock, not trusted from the client.
- **Today's Log** — running table of the day's entries with good/reject totals.
- Role-based login via **Username + PIN** (operator / supervisor / admin), JWT session.
- Installable on Android: open the deployed URL in Chrome → "Add to Home screen" → runs full-screen like a native app, works from any phone/tablet on the shop floor.

## Stack

- `server/` — Node.js + Express + PostgreSQL (`pg`), JWT auth, bcrypt PINs
- `client/` — React (Vite) + `vite-plugin-pwa`, plain CSS (no framework), industrial dark theme
- Single Express service serves both the API (`/api/*`) and the built PWA — one Railway service, one Postgres instance.

## Local development

```bash
# 1. Postgres running locally, then:
cp server/.env.example server/.env   # edit DATABASE_URL
cd server && npm install && npm run migrate && npm start   # API on :8080

# separate terminal
cd client && npm install && npm run dev   # dev server on :5173, proxies /api to :8080
```

Default login after migrate: **admin / 0000** — change this PIN immediately once you're in (see "Next steps" below; there's no self-service PIN change screen yet, update it via SQL or add one).

## Deploying on Railway

1. Push this repo to GitHub: `sakthiveltec93/shrp-shopfloor-app`.
2. In Railway: create a project, add a **Postgres** database plugin, and a service connected to this GitHub repo.
3. Set service variables:
   - `DATABASE_URL` → reference the Postgres plugin's connection string
   - `JWT_SECRET` → a long random string
4. Railway builds via `railway.json` (`npm run build`) and starts via `npm run migrate && npm start` — every deploy re-applies the schema/seed (idempotent, safe).
5. Generate a domain for the service in Railway; open it on an Android phone and "Add to Home screen".

## Data model notes

- `machine_assignments` holds the full history of setup requests (pending/approved/rejected) — this is your audit trail for who set what, when, and who approved it.
- `production_entries.part_id` is always resolved server-side from the latest **approved** assignment for that machine — the API rejects a client-supplied part_id entirely, so entry and assignment can never drift apart.
- Machine list and shift timings are seeded from SHRP's actuals (10 machines, Shift A/B).

## Known gaps / next steps

- No PIN-change or user-management screen yet (add users via SQL for now: `INSERT INTO users (username, pin_hash, full_name, role) VALUES (...)` — hash the PIN with bcrypt).
- No offline queueing yet — the service worker caches the app shell so it *loads* offline, but entries need a network connection to save. If shop-floor wifi is unreliable, this is the next thing to build (queue entries locally, sync on reconnect).
- `parts`, `efficiency_bands`, and `check_items` masters need to be populated with your real data (currently only schema + seed scaffolding exist) — either via the `/api/masters/parts` POST endpoint or directly in SQL, or point me at your existing MOULD/PART/CYCLETIME master data and I'll write a one-off import.
- Reject reasons are logged as a single `reject_qty` on the entry; a `reject_log` table exists in the schema for itemized multi-reason rejects per entry if you want that granularity in the form.
