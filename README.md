# SHRP Shop Floor App

Mobile-installable (PWA) replacement for the paper/AppSheet shop-floor data capture flow.

## What it does

- **Mould Setup / Approval** — operator (or supervisor/admin) proposes a part→machine assignment; a supervisor/admin approves or rejects it. Decoupled from Production Entry on purpose: the entry form only ever *reads* the currently approved part, it never sets it.
- **Production Entry** — operator picks a machine, sees the approved part read-only, logs start/end count, rejects, downtime. Shift (A 09:30–21:30 / B 21:30–09:30) and hour slot are computed server-side from the clock, not trusted from the client.
- **Bag Entry → Trimming → Inspection → Packing** — the multi-stage traceability pipeline, ported from the original workbook's `BAG_LOG` + `modBagStatus`/`modFIFOBagPicker`/`Modbagentry`. Each stage auto-picks the oldest ready bag for a part (FIFO), applies the same tolerance rules as the VBA version to decide when a bag is "close enough" to done, and asks the operator to confirm before closing it out — exactly like the original `MsgBox` prompts, just as an on-screen confirm. A bag can only advance through stages its part actually requires (trim/inspection/packing/dispatch flags per part), same as `PART_MASTER` columns D–G in the original.
- **Today's Log** — running table of the day's entries with good/reject totals.
- Role-based login via **Username + PIN** (operator / supervisor / admin), JWT session.
- Installable on Android: open the deployed URL in Chrome → "Add to Home screen" → runs full-screen like a native app, works from any phone/tablet on the shop floor.

**Scope note:** the original workbook has 91 VBA modules/forms covering a lot more than this (rework tracking, packing balance-pool/extra-cover logic, quality gates with PDF generation, label/QR printing, machine stats, a separate Access DB). Full source for all of it is in `docs/vba-reference/` with a README there listing exactly what's ported vs. still reference-only — worth reading before assuming a feature exists.

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

## 🎨 UI/UX & Layman Design Standard (Project Instructions)

All screens in this application MUST adhere to these mandatory shopfloor design guidelines:
1. **Layman-Friendly & Visual First**:
   - Short, simple wording. No wall-of-text paragraphs or complex legalistic instructions.
   - Use meaningful visual icons (🏭 Machines, 🛢️ Virgin Polymer, ♻️ Regrind, 🎨 Masterbatch, 📦 Stock, 🔬 QA Inspection, 👤 Profile).
2. **Clear 3-Color Status Badges**:
   - 🟢 **Green**: Online Active / Accepted / Healthy / Passed.
   - 🟡 **Yellow / Amber**: Online Idle / Pending QA / Warnings / Quarantine.
   - 🔴 **Red**: Offline / Rejected / Low Stock / Faults.
3. **Streamlined Filtering & Actions**:
   - Compact dropdown menus for status/role/category filtering.
   - Inline pure icon buttons (✏️ Edit, 🗑️ Delete, 🔬 Inspect, 📦 Issue).
   - Form inputs inside modal dialogs with auto-calculated previews (e.g. Bags × Std Weight = Total kg).
4. **Native CSS System**:
   - Use `client/src/app.css` design variables (`var(--panel)`, `var(--line)`, `var(--amber)`, `var(--green)`, `var(--red)`, `var(--text)`, `var(--text-muted)`). Avoid uncompiled Tailwind classes.

