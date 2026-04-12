# MedEase

MedEase is a senior-friendly medication assistant built for fast live judging and real day-to-day clarity.
It combines:

- secure email/password auth
- a large-type senior dashboard
- prescription management
- camera capture with graceful fallback
- instant mock AI verification
- medication event logging
- caregiver alerts and notes
- seeded demo data for a sub-60-second walkthrough

## Live Product

- Production app: https://medease-ashen.vercel.app
- GitHub repo: https://github.com/tigee1311/medease

## Demo Credentials

- Senior account: `senior@medease.app` / `DemoPass123`
- Caregiver account: `caregiver@medease.app` / `DemoPass123`

## Quick Demo

1. Open the live app and sign in with the senior account.
2. Confirm that `Demo mode` is enabled in the left sidebar.
3. Open `Dose log`.
4. Use `Verify capture` on any active medication card.
5. Click `Log event`.
6. Open `Caregiver feed` to see the generated alert or reminder.

This flow is intentionally designed to work quickly even if camera permissions are denied:

- the camera UI supports upload fallback
- demo mode returns instant mock verification
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
- Prescription cards with schedule times, day-of-week cadence, refill dates, and status controls
- Camera capture flow with permission handling, photo upload fallback, and verification state feedback
- Mock AI verification service that produces deterministic demo-friendly verification results
- Medication timeline that records taken, missed, and review-required events
- Caregiver event feed that can be triggered automatically or updated manually
- Demo mode toggle for instant judging and smoother walkthroughs

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- Prisma Postgres on Vercel
- Custom JWT cookie auth with `jose`
- Playwright-based screenshot generation for docs

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

### 3. Push the schema

```bash
npx prisma db push
```

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
- seeded prescription reads
- production prescription creation
- medication event creation
- caregiver alert creation after a missed-dose write

## Scripts

- `npm run dev` starts local development
- `npm run build` builds the production app with Webpack
- `npm run lint` runs ESLint
- `npm run db:seed` seeds the demo accounts and workflow data
- `npm run prisma:generate` regenerates the Prisma client

The screenshot assets in `docs/screenshots` were generated from the live deployment with:

```bash
node scripts/capture-screenshots.mjs
```
