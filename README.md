# Cricket Scoring Application

A full-stack cricket scoring application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

### Authenticated Scorers Can:

- Create tournaments
- Create matches under tournaments
- Start and manage live scorecards ball-by-ball
- Assign match winners

### Public (Unauthenticated) Users Can:

- View tournament list
- View matches under tournaments
- View live or completed scorecards
- See match status (Upcoming / Live / Completed)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **State Management**: React Context + Server Actions
- **Styling**: Mobile-first responsive design

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### 2. Supabase Setup

1. Create a new project in Supabase
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Create scorer accounts in Supabase Authentication (manual email/password accounts)
4. Note your project URL and anon key

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app                    # Next.js App Router pages
  /dashboard           # Scorer dashboard pages (auth required)
  /tournament          # Public tournament pages
  /match               # Public match pages
  /login               # Authentication
/components            # Reusable React components
/lib                   # Core utilities
  /cricket             # Cricket scoring logic
  /supabase            # Supabase client
/types                 # TypeScript definitions
/context               # React Context providers
```

## Cricket Scoring Rules

- **Legal Balls**: Increment ball count (1-6 per over)
- **Wide/No-Ball**: Do NOT increment ball count, but add to extras
- **Runs**: Can be scored off bat (0-6), wide (0-6), bye/leg bye (1-6)
- **Strike Rotation**: Batters swap ends on odd runs (including byes/leg byes)
- **End of Over**: Strike automatically rotates
- **Wickets**: Can fall on any delivery type

## Database Schema

See `supabase-schema.sql` for complete table definitions:

- **tournaments**: Tournament information
- **matches**: Match details, toss, status, winner
- **players**: Players in each match (11 per team)
- **innings**: Innings aggregate data
- **overs**: Over-level tracking
- **balls**: Ball-by-ball records

## Development Guide

### Adding New Features

1. Add types to `/types`
2. Add server actions to `/app/actions`
3. Add UI components to `/components`
4. Add pages to `/app`

### Cricket Logic

Core cricket functions are in `/lib/cricket`:

- Strike rotation logic
- Ball counting (legal vs extras)
- Over completion
- Innings progression

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Make sure to add environment variables in Vercel dashboard.

## TODOs

- [ ] Add player statistics aggregation
- [ ] Add match highlights/commentary
- [ ] Add real-time score updates (Supabase Realtime)
- [ ] Add match analytics/charts
- [ ] Add score export functionality
- [ ] Improve mobile UX with gestures
- [ ] Add undo last ball feature
- [ ] Add over-by-over summary view
