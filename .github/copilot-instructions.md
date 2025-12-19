# Cricket Scoring Application - Copilot Instructions

## Project Overview

Full-stack cricket scoring application using Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- React Context for state management
- Server Actions for data mutations

## Project Structure

- `/app` - Next.js app router pages
  - `/actions` - Server actions for database operations
  - `/dashboard` - Authenticated scorer pages
  - `/tournament/[id]` - Public tournament pages
  - `/match/[id]` - Public match scorecard pages
  - `/login` - Authentication page
- `/components` - Reusable React components
- `/lib` - Utilities, Supabase client, cricket logic
  - `/cricket` - Cricket scoring logic functions
  - `/supabase` - Supabase client configurations
- `/types` - TypeScript type definitions
- `/middleware.ts` - Route protection middleware

## Cricket Scoring Rules

- Legal balls increment ball count (1-6)
- Wide and No-Ball do NOT increment ball count
- Strike rotates on odd runs (including byes/leg byes)
- End of over rotates strike
- 6 legal balls = 1 complete over
- Innings ends at 10 wickets or max overs

## Key Files

- `supabase-schema.sql` - Complete database schema
- `lib/cricket/scoring.ts` - Core cricket logic functions
- `app/actions/scoring.ts` - Ball recording and innings management
- `middleware.ts` - Auth protection for /dashboard routes

## Setup Completed ✓

- [x] Next.js 14 scaffolding
- [x] Supabase schema with RLS policies
- [x] Authentication flow (login/logout)
- [x] Tournament CRUD
- [x] Match CRUD
- [x] Core cricket scoring functions
- [x] Server actions for all database operations
- [x] Public pages (home, tournament, match scorecard)
- [x] Dashboard pages (overview, tournaments, matches)

## TODO - Implementation Priorities

1. **HIGH PRIORITY**: Build the live scoring UI (`/dashboard/match/[id]/score`)
   - Striker/non-striker/bowler selectors
   - Run buttons (0-6)
   - Extras buttons (Wide, NoBall, Bye, LegBye)
   - Wicket modal
   - Current over display
   - State management for ball recording
2. **MEDIUM PRIORITY**: Add player management forms
   - Form to add 11 players per team
   - Batting order assignment
3. **MEDIUM PRIORITY**: Add toss form component
   - Select toss winner and decision
4. **LOW PRIORITY**: Enhancements
   - Real-time updates (Supabase Realtime)
   - Ball-by-ball scorecard view
   - Player statistics
   - Undo last ball feature
   - Commentary/highlights

## Environment Setup Required

1. Create Supabase project
2. Run `supabase-schema.sql` in Supabase SQL Editor
3. Create scorer accounts in Supabase Auth dashboard
4. Copy `.env.local.example` to `.env.local` and add Supabase credentials
