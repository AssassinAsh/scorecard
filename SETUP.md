# Cricket Scoring App - Complete Setup Guide 🏏

## 📌 Overview

This guide will walk you through setting up a fully functional cricket scoring application. The project is **production-ready** with:

- ✅ Complete database schema
- ✅ Authentication system
- ✅ **Admin role with access control**
- ✅ Scorer access management
- ✅ Tournament & match management
- ✅ **Live ball-by-ball scoring interface**
- ✅ Public scorecard viewing
- ✅ Real-time statistics calculation
- ✅ Responsive mobile design

## 🚀 Quick Start (10 Minutes)

### 1. Clone & Install

```bash
git clone https://github.com/AssassinAsh/scorecard.git
cd scorecard
npm install
```

### 2. Setup Supabase

1. **Create a Supabase project** at https://supabase.com (free tier available)

2. **Run the database schema**:

   - Open your Supabase project dashboard
   - Go to **SQL Editor**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste and run it
   - This creates:
     - All core tables (tournaments, matches, players, etc.)
     - Admin role system (user_roles table)
     - Tournament access control (tournament_scorers table)
     - Helper functions for access checks

3. **Create admin account**:

   - Go to **Authentication → Users**
   - Click "Add user"
   - Create your email/password account
   - Copy the user ID
   - In SQL Editor, run:
     ```sql
     INSERT INTO user_roles (user_id, is_admin)
     VALUES ('paste-user-id-here', true);
     ```

4. **Create additional scorer accounts** (optional):
   - Go to **Authentication → Users**
   - Click "Add user" for each scorer
   - You can grant tournament access via SQL (see ACCESS_SETUP.md)

### 3. Configure Environment

1. Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:

   - Go to **Project Settings → API**
   - Copy your **Project URL**
   - Copy your **anon public** key

3. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Launch

```bash
npm run dev
```

Open **http://localhost:3000** - you're ready to score! 🎉

## 📖 Complete User Guide

### Access Control Overview

The application has two types of users:

1. **Admin** (Required)

   - Full system access
   - Only user who can create tournaments
   - Has automatic scorer access to all tournaments
   - Grants access to scorers via SQL

2. **Scorers** (Optional)
   - Can view all tournaments
   - Get scorer access when granted by admin
   - Can score matches in assigned tournaments only
   - Read-only access to other tournaments

See [ACCESS_SETUP.md](ACCESS_SETUP.md) for detailed access management guide.

### For Admin Users

#### Step 1: Login

- Navigate to **http://localhost:3000/login**
- Use the admin credentials you created

#### Step 2: Create a Tournament

1. From dashboard, click **"+ New"** button (only visible to admin)
2. Fill in:
   - Tournament name
   - Start date
   - Location
3. Submit

#### Step 3: Grant Scorer Access (Optional)

If you want other users to score in this tournament:

```sql
-- In Supabase SQL Editor
INSERT INTO tournament_scorers (tournament_id, user_id)
VALUES ('tournament-uuid', 'scorer-user-uuid');
```

### For Scorer Users

#### Step 1: Login

- Navigate to **http://localhost:3000/login**
- Use your scorer credentials

#### Step 2: View Tournaments

- All tournaments visible in dashboard
- Click a tournament to view details
- If you have scorer access: full scoring interface
- If not: spectator mode (read-only)

#### Step 3: Create Teams (if you have access)

1. Open your tournament
2. Click **"Add Team"**
3. Add teams with names and contact numbers
4. Repeat to create multiple teams

#### Step 4: Create a Match

1. In tournament view, click **"New Match"**
2. Configure:
   - Select Team A and Team B from dropdown
   - Set overs per innings (e.g., 20 for T20, 50 for ODI)
   - Set match date and time
3. Submit - match will be created in "Upcoming" status

#### Step 5: Setup Match

1. Open the match and go to **Setup** page
2. **Update Toss**:
   - Select which team won the toss
   - Select their decision (Bat or Bowl)
3. **Add Players**:
   - Add 11 players for Team A (batting order 1-11)
   - Add 11 players for Team B (batting order 1-11)

#### Step 6: Start Scoring

1. Click **"Start Match"** button
2. Match status changes to "Live"
3. You'll see the **Scoring Interface** with:

   **Initial Setup:**

   - Select **striker** (first batter)
   - Select **non-striker** (second batter)
   - Select **bowler** (opening bowler)
   - Click **"Start Over 1"**

   **Recording Each Ball:**

   - Click **run buttons** (0-6) for regular deliveries
   - Click **extras buttons** for:
     - **Wide** (adds 1 + extra runs, no ball count)
     - **No Ball** (adds 1 + runs, triggers free hit)
     - **Bye** (runs to team, not batter)
     - **Leg Bye** (runs off body)
   - Click **Wicket** to open dismissal modal:
     - Select wicket type (Bowled, Caught, Run Out, etc.)
     - Select fielder/keeper if applicable
     - Select new batter after wicket

   **Automatic Features:**

   - Strike rotation after odd runs
   - Strike rotation at end of over
   - Free hit after no ball
   - New over prompt after 6 legal balls
   - Innings completion at 10 wickets or max overs
   - Match result calculation

#### Step 7: Between Innings

- After first innings completes, click **"Start Second Innings"**
- System automatically switches batting/bowling teams

#### Step 8: Match Completion

- Match automatically completes when:
  - Second innings: 10 wickets fall
  - Second innings: Max overs reached
  - Second innings: Target achieved
- Winner is automatically determined

### For Public Viewers (Unauthenticated)

1. Visit **http://localhost:3000**
2. Browse all tournaments (no login required)
3. Click any tournament to see matches
4. Click any match to view:
   - **Live scorecard** (auto-refreshes every 5 seconds during live matches)
   - Current batting and bowling statistics
   - Ball-by-ball over history
   - Match result for completed matches
5. Expand **"Scorecard"** section to see:
   - Complete batting and bowling tables
   - Run rates and extras
   - Detailed player statistics

## 🎓 Cricket Scoring Reference

### Ball Types

| Type          | Ball Count | Runs Added     | Notes                                        |
| ------------- | ---------- | -------------- | -------------------------------------------- |
| Regular (0-6) | Yes        | Runs off bat   | Strike rotates on odd runs                   |
| Wide          | No         | 1 + extra runs | Bowler penalty, strike rotates on odd extras |
| No Ball       | No         | 1 + runs       | Triggers free hit next ball                  |
| Bye           | Yes        | Runs scored    | Doesn't count for batter or bowler           |
| Leg Bye       | Yes        | Runs scored    | Off body, not bat                            |

### Wicket Types

- **Bowled**: Ball hits stumps
- **Caught**: Fielder catches the ball
- **Run Out**: Batter out of crease, stumps broken
- **Stumped**: Keeper breaks stumps when batter out of crease
- **LBW**: Leg Before Wicket
- **Hit Wicket**: Batter hits their own stumps

### Key Rules

- **Over**: 6 legal balls (excludes wides and no balls)
- **Strike Rotation**: Batters swap on odd runs (1, 3, 5) and at end of over
- **Free Hit**: After no ball, batter can't be dismissed (except run out)
- **Bowler Change**: Same bowler cannot bowl consecutive overs
- **Innings End**: 10 wickets OR maximum overs completed
- **Match Result**:
  - First innings wins by runs (First Total - Second Total)
  - Second innings wins by wickets (10 - Wickets Lost)

## 🛠️ Advanced Features

### Undo Last Ball

- In scoring interface, click **"Undo Last Ball"**
- Removes the most recent delivery from database
- Restores previous score and statistics

### Retire Batsman

- Select a batter and click **"Retire"**
- Enter retirement reason (hurt, not out, etc.)
- Batter is removed from active play
- Shows in scorecard with retirement status

### Change Bowler Mid-Over

- During an over, click **"Change Bowler"**
- Select new bowler
- Creates a new over segment for tracking
- Previous balls still credited to original bowler

### Player Management

- Add players anytime during match setup
- Click **"+ New"** next to player dropdowns
- Enter player name and assign to team
- Batting order assigned automatically

## 📊 Statistics Calculated

### Batting Stats (Per Player)

- **Runs**: Total runs scored
- **Balls**: Balls faced (excludes wides and no balls)
- **4s**: Number of boundaries
- **6s**: Number of sixes
- **Strike Rate**: (Runs × 100) / Balls Faced

### Bowling Stats (Per Bowler)

- **Overs**: Formatted as X.Y (e.g., 3.4 = 3 overs and 4 balls)
- **Maidens**: Complete overs with 0 runs
- **Runs**: Total runs conceded (includes extras except byes/leg byes)
- **Wickets**: Dismissals (excludes run outs)
- **Economy**: (Runs × 6) / Legal Balls

### Team Stats

- **Total Runs**: All runs including extras
- **Wickets**: Number of dismissals
- **Extras**: Sum of wides, no balls, byes, leg byes
- **Run Rate**: (Total Runs × 6) / Balls Bowled
- **Required Run Rate** (2nd innings): Target calculation

## 🐛 Troubleshooting

### "Unauthorized" Errors

- Ensure you're logged in at `/login`
- Check `.env.local` has correct Supabase credentials
- Verify scorer account exists in Supabase Auth

### Players Not Showing

- Ensure 11 players added for each team
- Check player team assignment is correct
- Verify players were added before starting match

### Match Won't Start

- Verify toss is set (winner and decision)
- Ensure both teams have players added
- Check match status is not already "Live"

### Scorecard Not Updating

- Public view auto-refreshes every 5 seconds
- Scorer view does NOT auto-refresh (by design)
- Check browser console for errors

### Strike Not Rotating

- Verify correct runs entered (odd numbers rotate)
- Check if it's end of over (should auto-rotate)
- Review recent balls in "This Over" section

## 🔄 Typical Match Flow

```
1. Create Tournament
   ↓
2. Add Teams to Tournament
   ↓
3. Create Match (Select teams, set overs)
   ↓
4. Setup Match (Add 22 players, set toss)
   ↓
5. Start Match → Status: "Live"
   ↓
6. Score First Innings (ball-by-ball)
   ↓
7. First Innings Completes → Status: "Innings Break"
   ↓
8. Start Second Innings
   ↓
9. Score Second Innings
   ↓
10. Match Completes → Status: "Completed"
    ↓
11. Winner Displayed Automatically
```

## 📁 Key File Reference

### Server Actions (Data Operations)

```
src/app/actions/
├── auth.ts           # Login, logout, getUser
├── tournaments.ts    # Tournament CRUD
├── teams.ts          # Team management
├── matches.ts        # Match CRUD, player management
└── scoring.ts        # startInnings, startNewOver, recordBall
```

### Components

```
src/components/
├── ScoringInterface.tsx       # Main scoring UI (500+ lines)
├── TossForm.tsx              # Toss configuration
├── StartMatchButton.tsx      # Start first innings
├── StartSecondInningsButton.tsx
└── AutoRefresh.tsx           # Public scorecard auto-refresh
```

### Cricket Logic

```
src/lib/cricket/scoring.ts
├── isLegalBall()            # Check if ball counts toward over
├── shouldRotateStrike()     # Determine strike rotation
├── calculateOvers()         # Convert balls to overs (13 → 2.1)
├── calculateRunRate()       # CRR and RRR calculations
└── getBallDisplayText()     # Format balls for display
```

### Pages

```
src/app/
├── page.tsx                 # Home (tournament list)
├── login/page.tsx           # Authentication
├── tournament/[id]/page.tsx # Public tournament view
├── match/[id]/page.tsx      # Public scorecard
└── dashboard/
    ├── page.tsx             # Scorer dashboard
    ├── tournament/
    │   ├── new/page.tsx     # Create tournament
    │   └── [id]/page.tsx    # Manage tournament
    └── match/[id]/
        ├── setup/page.tsx   # Match setup
        └── score/page.tsx   # Live scoring interface
```

## 🚀 Deployment to Production

### Option 1: Netlify (Recommended)

1. Push code to GitHub:

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to [netlify.com](https://www.netlify.com/)
3. Click **"Import Project"**
4. Select your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

### Option 2: Self-Host

```bash
npm run build
npm start
```

Environment variables must be set on your server.

## 🎯 Next Steps & Enhancements

Ready to extend the application? Consider:

1. **Real-time Updates**: Implement Supabase Realtime for live score push
2. **Player Profiles**: Add photos, stats history, career records
3. **Match Analytics**: Wagon wheel, manhattan charts, win probability
4. **Commentary System**: Add ball-by-ball commentary
5. **Team Rankings**: Calculate points tables and standings
6. **Mobile App**: React Native version for mobile scorers
7. **Offline Mode**: PWA with offline scoring sync
8. **Export Features**: Generate PDF scorecards, CSV data exports
9. **Video Integration**: Link ball highlights to deliveries
10. **Multi-language**: i18n support for different regions

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Cricket Rules**: https://www.lords.org/mcc/the-laws-of-cricket

## 🆘 Getting Help

- **GitHub Issues**: Report bugs or request features
- **Supabase Community**: https://github.com/supabase/supabase/discussions
- **Next.js Discord**: https://nextjs.org/discord

---

**You're all set! Start scoring some cricket! 🏏✨**
