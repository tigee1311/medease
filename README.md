# MedEase

MedEase is a senior-friendly medication assistant built for fast live judging and real day-to-day clarity.
It combines:

- secure email/password auth
- a large-type senior dashboard
- prescription management
- demo mode with instant medication simulation
- camera capture with graceful fallback
- instant mock AI verification
- medication event logging
- caregiver alerts and notes
- seeded demo data for a sub-30-second walkthrough

## Live Product

- Production app: https://medease-ashen.vercel.app
- GitHub repo: https://github.com/tigee1311/medease

## Demo Credentials

- Senior account: `senior@medease.app` / `DemoPass123`
- Caregiver account: `caregiver@medease.app` / `DemoPass123`

## 30-Second Demo

1. Open the live app and sign in with the senior account.
2. Confirm that `Demo mode` is enabled in the left sidebar.
3. On the dashboard, click `Take Medication (Try Demo)`.
4. Choose one of:
   `Simulate Correct Medication`
   `Simulate Wrong Medication`
   `Simulate Missed Dose`
5. Show the verification result, confidence score, and alert banner.
6. Click `Complete demo step`.
7. Point to the updated dashboard intelligence and caregiver feed.

Recommended wow moment:

- use `Simulate Wrong Medication`
- highlight the red mismatch state and confidence bar
- show the `Caregiver has been notified` banner
- open `Caregiver feed` to confirm the alert was created

The app still supports the broader medication flow when you want a deeper walkthrough:

- the timeline page supports camera capture and upload fallback
- demo mode also adds one-click simulation buttons to the tracking cards
- caregiver events are created automatically for missed or review-required doses

## Screenshots

### Login

![MedEase login screen](docs/screenshots/login.png)

### Dashboard

![MedEase dashboard](docs/screenshots/dashboard.png)

### Prescription Management

![MedEase prescriptions view](docs/screenshots/prescriptions.png)

### Mobile Timeline

![MedEase mobile timeline](docs/screenshots/timeline-mobile.png)

## Core Features

- Senior-first interface with high-contrast panels, large hierarchy, and mobile-friendly spacing
- Dashboard-first demo CTA designed for a judge-friendly medication story in one screen
- System intelligence layer showing next dose timing, last taken time, and missed-dose alerts
- Caregiver visibility panel with contact info, monitoring status, and last alert timestamp
- Prescription cards with schedule times, day-of-week cadence, refill dates, and status controls
- Camera capture flow with permission handling, photo upload fallback, and verification state feedback
- Mock AI verification service that produces deterministic demo-friendly verification results
- Medication timeline that records taken, missed, and review-required events
- Caregiver event feed that can be triggered automatically or updated manually
- Demo mode toggle for instant judging and smoother walkthroughs
- Motion cues for success, mismatch, and step transitions

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Prisma ORM 7 with the `@prisma/adapter-pg` driver adapter
- Prisma Postgres on Vercel
- Custom JWT cookie auth with `jose`
- Playwright-based screenshot generation for docs

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` points at a PostgreSQL database
- `AUTH_SECRET` signs the session cookie and is mandatory in production

`.env.local` is also read and takes precedence over `.env`, matching Next.js.

### 3. Apply the schema

```bash
npx prisma migrate deploy
```

Use `npm run prisma:migrate` instead when you are changing `prisma/schema.prisma`
and need a new migration.

### 4. Seed demo data

```bash
npm run db:seed
```

### 5. Start the app

```bash
npm run dev
```

## Production Notes

- The app is deployed on Vercel.
- Prisma Postgres is connected through the Vercel marketplace integration.
- `AUTH_SECRET` is configured in Vercel for production, preview, and development environments.
- The production build uses `next build --webpack` for stable deployment behavior.

## Verification Notes

The live deployment was smoke-tested for:

- public page load
- production login with the seeded senior account
- authenticated dashboard rendering
- dashboard CTA demo flow execution
- seeded prescription reads
- production prescription creation
- medication event creation
- caregiver alert creation after a missed-dose write
- browser-level smoke test with no page or console errors during the demo flow

## Scripts

- `npm run dev` starts local development
- `npm run build` builds the production app with Webpack
- `npm run lint` runs ESLint
- `npm run db:seed` seeds the demo accounts and workflow data
- `npm run prisma:generate` regenerates the Prisma client
- `npm run prisma:migrate` creates and applies a new migration during development

The screenshot assets in `docs/screenshots` were generated from the live deployment with:

```bash
node scripts/capture-screenshots.mjs
```
