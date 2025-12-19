# Cricket Scoring App - Quick Start Guide

## 🎯 What's Been Built

A foundation for a cricket scoring application with:

- ✅ Complete database schema (Supabase)
- ✅ Authentication system (login/logout)
- ✅ Tournament management
- ✅ Match management
- ✅ Core cricket logic functions
- ✅ Public viewing pages
- ✅ Scorer dashboard
- ⚠️ **Scoring UI is a TODO placeholder** (requires the most work)

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. **Create a Supabase project** at https://supabase.com
2. **Run the SQL schema**:
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy the entire contents of `supabase-schema.sql`
   - Paste and run it
3. **Create scorer accounts**:
   - Go to Authentication → Users
   - Click "Add user"
   - Create email/password accounts for scorers
   - Note: No signup page exists - accounts must be created manually

### 3. Configure Environment Variables

1. Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:

   - Go to Project Settings → API
   - Copy your Project URL
   - Copy your `anon public` key

3. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 📋 User Flows

### Public Users (No Login)

1. Visit http://localhost:3000
2. View tournament list
3. Click a tournament to see matches
4. Click a match to see scorecard

### Scorers (Requires Login)

1. Visit http://localhost:3000/login
2. Login with scorer credentials
3. Dashboard → Create tournament
4. Create matches under tournament
5. Setup match (players + toss)
6. **Start scoring** → Currently a TODO placeholder

## 🔨 What Needs to Be Built

### HIGH PRIORITY: Live Scoring Interface

The file `/app/dashboard/match/[id]/score/page.tsx` currently shows a placeholder. You need to build:

#### Required State Management

```typescript
const [striker, setStriker] = useState<string>("");
const [nonStriker, setNonStriker] = useState<string>("");
const [bowler, setBowler] = useState<string>("");
const [currentOver, setCurrentOver] = useState<Over | null>(null);
const [legalBallsInOver, setLegalBallsInOver] = useState(0);
```

#### UI Components Needed

1. **Player Selectors**

   - Dropdown for striker (from available batters)
   - Dropdown for non-striker
   - Dropdown for bowler (from bowling team)

2. **Run Buttons**

   ```tsx
   <button onClick={() => handleRun(0)}>0</button>
   <button onClick={() => handleRun(1)}>1</button>
   // ... up to 6
   ```

3. **Extras Buttons**

   - Wide (0-6 runs)
   - No Ball (0-6 runs)
   - Bye (1-6 runs)
   - Leg Bye (1-6 runs)

4. **Wicket Modal**

   - Wicket type selector
   - Dismissed player selector
   - Runs on wicket (optional)

5. **Current Over Display**
   ```tsx
   <div>Current Over: [•] [4] [1] [W] [•] [6]</div>
   ```

#### Server Actions to Call

Already created in `/app/actions/scoring.ts`:

```typescript
// Start first innings
await startInnings(matchId, "A", "B");

// Start a new over
await startNewOver(inningsId, overNumber, bowlerName);

// Record each ball
const result = await recordBall({
  over_id: currentOver.id,
  ball_number: legalBallsInOver + 1,
  striker,
  non_striker,
  bowler,
  runs_off_bat: 4,
  extras_type: "None",
  extras_runs: 0,
  wicket_type: "None",
  dismissed_player: null,
});

// result contains:
// - rotateStrike: boolean (swap striker/non-striker)
// - shouldEndInnings: boolean (10 wickets or max overs)
// - isLegalBall: boolean (increment ball count)

// End match
await updateMatchWinner(matchId, "team_a");
```

#### Cricket Logic Helpers

Use functions from `/lib/cricket/scoring.ts`:

```typescript
import {
  isLegalBall,
  shouldRotateStrike,
  getBallDisplayText,
  validateBallInput,
} from "@/lib/cricket/scoring";
```

### MEDIUM PRIORITY: Player & Toss Forms

1. **Player Form** (`/dashboard/match/[id]/setup`)

   - Form to add 11 players for Team A
   - Form to add 11 players for Team B
   - Batting order (1-11)
   - Use `addPlayers()` server action

2. **Toss Form** (`/dashboard/match/[id]/setup`)
   - Radio buttons: Team A won / Team B won
   - Radio buttons: Bat / Bowl
   - Use `updateToss()` server action

## 📁 Key File Locations

```
app/
  actions/
    auth.ts           # login, logout, getUser
    tournaments.ts    # createTournament, getTournaments, etc.
    matches.ts        # createMatch, getMatches, addPlayers, updateToss, etc.
    scoring.ts        # startInnings, startNewOver, recordBall

  dashboard/
    page.tsx          # Dashboard home
    tournament/
      new/            # Create tournament form
      [id]/           # Tournament detail
    match/
      new/            # Create match form
      [id]/
        setup/        # Match setup (players + toss)
        score/        # ⚠️ TODO: Live scoring interface

  tournament/[id]/    # Public tournament view
  match/[id]/         # Public match scorecard
  login/              # Login page

lib/
  cricket/
    scoring.ts        # Core cricket logic functions
  supabase/
    client.ts         # Browser Supabase client
    server.ts         # Server Supabase client
    middleware.ts     # Auth middleware helper

types/
  index.ts            # All TypeScript types

supabase-schema.sql   # Complete database schema
```

## 🧪 Testing Flow

1. **Create a tournament**

   - Login as scorer
   - Dashboard → New Tournament
   - Enter details

2. **Create a match**

   - Open tournament
   - New Match → Fill form

3. **Add players** (currently manual via Supabase dashboard)

   - Go to Supabase dashboard → Table Editor → players
   - Insert 11 players for Team A (batting_order 1-11)
   - Insert 11 players for Team B (batting_order 1-11)

4. **Update toss** (currently manual via Supabase dashboard)

   - Go to matches table
   - Edit your match row
   - Set toss_winner ('team_a' or 'team_b')
   - Set toss_decision ('Bat' or 'Bowl')

5. **Start scoring**
   - Go to match setup page
   - Click "Start Scoring"
   - See the TODO placeholder

## 🎓 Cricket Rules Reference

- **Legal Ball**: Counts toward 6-ball over (excludes Wide, NoBall)
- **Wide**: Bowler error, 1 run penalty + any extra runs, no ball count
- **No Ball**: Bowler error, 1 run penalty + any runs, no ball count
- **Bye**: Runs while ball misses bat and stumps, counts for strike
- **Leg Bye**: Runs off body (not bat), counts for strike
- **Strike Rotation**: On odd total runs (1, 3, 5) including byes/leg byes
- **Over End**: Strike automatically rotates
- **Innings End**: 10 wickets OR max overs reached

## 🐛 Common Issues

**"Unauthorized" errors**: Make sure you're logged in and `.env.local` is configured

**Players not showing**: Add them manually in Supabase dashboard for now

**Match won't start**: Ensure 22 players (11 per team) and toss is set

## 📚 Next Steps

1. Build the scoring interface (highest priority)
2. Add player management forms
3. Add toss form
4. Add real-time updates using Supabase Realtime
5. Add ball-by-ball view
6. Add player statistics

## 🤝 Need Help?

Check these files:

- `README.md` - General project info
- `.github/copilot-instructions.md` - Developer guide
- `SETUP.md` - This file
- Supabase docs: https://supabase.com/docs

Good luck! 🏏
