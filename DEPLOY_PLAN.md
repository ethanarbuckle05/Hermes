# Hermes: Complete Build Plan

Stack: **Supabase → Next.js → Vercel**, managed via **GitHub**, built with **Cursor + Claude Code**

---

## Cursor vs Claude Code: When to Use Which

These are not competing tools — they solve different problems. Use both.

### Cursor = your editor. Where you write code.

Cursor is a VS Code fork with AI baked in. Use it for:

- **Writing new code** — Tab completions keep you in flow
- **Small edits** — Cmd+K to change a function, fix a typo, adjust styling
- **Visual diffs** — see exactly what the AI wants to change before accepting
- **File-by-file work** — when you're focused on one component or page
- **Quick questions** — "what does this function do?" in the chat panel

Think of Cursor as your hands. It makes you faster at what you're already doing.

### Claude Code = your terminal agent. Where you delegate work.

Claude Code runs in your terminal and operates on your whole codebase. Use it for:

- **Multi-file changes** — "add race_id to the workout form, the API call, and the types"
- **Debugging across layers** — "the workout isn't saving, trace from the form submit through to Supabase"
- **Scaffolding** — "create a new /settings page with email change and password change"
- **Git workflows** — it can stage, commit, and push
- **Refactoring** — "extract all Supabase calls from page.tsx into src/lib/api.ts"
- **Running commands** — it can run your dev server, run builds, check errors

Think of Claude Code as a junior engineer. You describe what you want, it goes and does it.

### The Hermes workflow

```
Cursor          → daily editing, writing components, CSS tweaks, small fixes
Claude Code     → multi-file features, debugging, refactors, git operations
```

In practice for a session:

1. Open Cursor with the `hermes/` project
2. Open a terminal *inside* Cursor (Ctrl+`)
3. Run `claude` in that terminal — now Claude Code is right there alongside your editor
4. Use Cursor for the file you're looking at
5. Use Claude Code for everything that spans multiple files

---

## Phase 0 — Prerequisites

### Accounts (one-time)
- [ ] Supabase account → https://supabase.com
- [ ] Vercel account → https://vercel.com (connect with GitHub)
- [ ] GitHub account → https://github.com

### Local tools
```bash
node -v          # need v18+
npm -v           # comes with node
git --version    # need git
claude --version # need Claude Code installed
```

If Claude Code isn't installed:
```bash
npm install -g @anthropic-ai/claude-code
claude auth login
```

### Editors
- [ ] Cursor installed with the project folder ready
- [ ] Claude Code accessible from terminal

---

## Phase 1 — Supabase Setup (5 min)

### In the Supabase dashboard:

1. **Create project**
   - Name: `hermes`
   - Set a database password (save it)
   - Region: closest to your users (us-west-1 for Utah)

2. **Run the migration**
   - SQL Editor → New Query
   - Paste entire contents of `supabase-migration.sql`
   - Click Run → "Success. No rows returned"

3. **Verify tables**
   - Table Editor → should see `races` and `workouts`

4. **Confirm auth**
   - Authentication → Providers → Email is enabled
   - Turn OFF "Confirm email" for now (faster testing)

5. **Copy API keys**
   - Settings → API
   - Copy: `Project URL` and `anon public key`

---

## Phase 2 — Project Setup (5 min)

### In your terminal:

```bash
tar -xzf hermes.tar.gz
cd hermes
npm install
cp .env.local.example .env.local
```

### Edit `.env.local` — paste your Supabase values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Create `CLAUDE.md` in the project root:

This is the single most important file for Claude Code. It reads this automatically
every time you run `claude` in the project directory.

```markdown
# Hermes — Race Training Log

## Stack
- Next.js 14 (App Router, all client components for now)
- Supabase (Auth + Postgres + RLS)
- Tailwind CSS (no component library)
- Deploy target: Vercel

## Commands
- `npm run dev` — local dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — lint

## Database
- Two tables: `races` and `workouts`
- RLS enabled on both — every query filters by auth.uid()
- Migration lives in `supabase-migration.sql`
- Enum: workout_type (easy, long_run, workout, recovery, race, other)

## Architecture
- All pages are client components using `"use client"`
- Supabase clients: `src/lib/supabase/client.ts` (browser), `server.ts` (RSC)
- Auth middleware in `src/middleware.ts` redirects to /login if no session
- Types in `src/lib/types.ts`, utils in `src/lib/utils.ts`

## Conventions
- Miles, not kilometers
- Pace displayed as M:SS /mi
- Duration stored as total seconds in DB, displayed as H:MM:SS
- Dates stored as YYYY-MM-DD, parsed with T12:00:00 to avoid timezone shift
- Keep it minimal — this is a weekend MVP
```

### Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000` → should see login page.

---

## Phase 3 — Smoke Test (5 min)

### Use Cursor to watch the code while you test:

Open the project in Cursor. Keep `src/app/page.tsx` visible so you can see the flow.

### Test checklist:

**Auth**
- [ ] Sign up with a test email + password
- [ ] Logged in → redirected to home

**Races**
- [ ] Click "+ Set a target race"
- [ ] Select "Half Marathon" preset
- [ ] Set a future date, optionally set goal time
- [ ] Click "Set race" → race card with countdown appears

**Workouts — Create**
- [ ] Click "+ Log workout"
- [ ] Enter: 5.0 mi, 42 min 30 sec, Easy, "test run"
- [ ] Click "Log it" → appears in list with pace ~8:30 /mi

**Workouts — Update**
- [ ] Hover row → click edit icon
- [ ] Change distance to 6.0 → click Update

**Workouts — Delete**
- [ ] Hover row → trash → click again to confirm → gone

**Persistence**
- [ ] Sign out → sign back in → race + data still there

**If anything fails:** open Claude Code in the Cursor terminal and paste the error.

---

## Phase 4 — Git + GitHub (3 min)

### Using Claude Code (this is a great task for it):

```bash
claude
> Initialize a git repo, commit everything with message "hermes mvp", 
> create a private GitHub repo called hermes, and push.
```

Or manually:

```bash
git init
git add .
git commit -m "hermes mvp — race training log"
gh repo create hermes --private --source=. --push
```

---

## Phase 5 — Deploy to Vercel (5 min)

1. https://vercel.com/new → Import → select `hermes` repo
2. Framework auto-detects Next.js
3. **Environment Variables** — add before deploying:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |

4. Deploy → ~90 seconds → get URL like `https://hermes-xxxxxxxx.vercel.app`

### Verify on phone:
- [ ] Open the Vercel URL
- [ ] Sign up, create a race, log a workout
- [ ] Confirm mobile works

---

## Phase 6 — Production Config (2 min)

### In Supabase:

1. **Authentication → URL Configuration**
   - Site URL: `https://hermes-xxxxxxxx.vercel.app`

2. **Redirect URLs** → add:
   ```
   https://hermes-xxxxxxxx.vercel.app/auth/callback
   ```

---

## Phase 7 — Invite Users (5 min)

Share the URL. Signup is open:

```
https://hermes-xxxxxxxx.vercel.app/login
```

Or invite via Supabase → Authentication → Users → Invite user.

---

## Phase 8 — Iterate with Cursor + Claude Code

### Bug fix → use Cursor
Open the file, Cmd+K on the broken code, describe the fix.

### New feature → use Claude Code
```bash
claude
> Add a "this week vs last week" mileage comparison. 
> Two numbers side by side below the existing stats cards.
> Keep it minimal.
```
It edits the files, shows you the diff, you accept.

### After any change:
```bash
git add . && git commit -m "description" && git push
```
Vercel auto-deploys. Users see changes in ~60 seconds.

### Using both together:
```
1. Open Cursor with hermes/
2. Open terminal panel (Ctrl+`)
3. Run `claude` in the terminal
4. Cursor tabs for reading/editing individual files
5. Claude Code for multi-file work + git + debugging
6. Claude Code changes auto-refresh in Cursor's file view
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| ECONNRESET in Claude Code | Retry. If persistent: `claude auth status`, check VPN |
| "Invalid API key" on login | Check env vars in Vercel Settings. Redeploy after adding. |
| Email link goes to localhost | Set Site URL in Supabase → Auth → URL Configuration |
| "relation workouts does not exist" | Migration didn't run. Run `supabase-migration.sql` again. |
| Build fails on Vercel | Run `npm run build` locally first. |
| Claude Code can't find files | `cd hermes` before running `claude` |
| Cursor gives stale suggestions | Cmd+Shift+P → "Reindex" |

---

## File Inventory

```
hermes/
├── CLAUDE.md                    ← Claude Code reads this first
├── .env.local.example
├── .gitignore
├── README.md
├── DEPLOY_PLAN.md               ← this file
├── next.config.js
├── package.json
├── postcss.config.js
├── supabase-migration.sql       ← run in Supabase SQL Editor FIRST
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── middleware.ts
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx             ← main dashboard
    │   ├── login/page.tsx
    │   └── auth/callback/route.ts
    ├── components/
    │   ├── RaceCard.tsx
    │   ├── RaceForm.tsx
    │   ├── WorkoutForm.tsx
    │   └── WorkoutRow.tsx
    └── lib/
        ├── types.ts
        ├── utils.ts
        └── supabase/
            ├── client.ts
            ├── server.ts
            └── middleware.ts
```

18 files. 2 tables. 2 editors. 0 unnecessary complexity.
