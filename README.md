# Cricket Scoring Application 🏏

A full-stack cricket scoring application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. Designed for scorers to manage live cricket matches with real-time ball-by-ball scoring, while providing public access to live scoreboards.

**Live Demo**: https://www.cricksnap.com  
**GitHub**: https://github.com/AssassinAsh/scorecard

## ✨ Features

### 🔐 Role-Based Access Control

- **Admin**: Full system access - create tournaments, manage matches, delete matches, score anywhere
- **Manager**: Create tournaments and matches, score in any tournament (cannot delete matches)
- **Scorer**: Create matches and score in assigned tournaments only
- **Viewer**: View-only access with fullscreen display capability
- **Public**: Browse tournaments and matches, view live scorecards

### 🎯 For Authenticated Users

- **Tournament Management**: Create and organize tournaments (Admin & Manager)
- **Match Setup**: Configure matches with team names, overs, toss details
- **Player Management**: Add players to teams, manage batting orders
- **Live Ball-by-Ball Scoring**:
  - Record runs (0-6), wides, no balls, byes, leg byes
  - Handle wickets with detailed dismissal information
  - Automatic strike rotation and over management
  - Free hit tracking after no balls
  - Mid-over bowler changes
  - Player retirement handling
- **Undo Functionality**: Remove the last ball if needed
- **Match Completion**: Automatic innings and match result calculation
- **Fullscreen Display**: Access fullscreen mode for matches (authenticated users only)
- **QR Code Generation**: Generate and download QR codes for tournaments

### 👥 For Public Viewers

- Browse all tournaments and matches
- **Live Scoreboards**: Auto-refreshing match scores every 5 seconds
- View complete scorecards with:
  - Batting and bowling statistics
  - Ball-by-ball over history
  - Run rates and extras
  - Match results and winner information
- Mobile-responsive design for viewing on any device

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.1.0 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Server Components + Server Actions
- **Real-time Updates**: Auto-refresh for public viewers
- **Styling**: Responsive mobile-first design with custom CSS variables

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up free](https://supabase.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AssassinAsh/scorecard.git
   cd scorecard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase Database**

   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the entire `supabase-schema.sql` file
   - Click Run

4. **Create User Accounts and Assign Roles**

   - Go to Authentication → Users in Supabase
   - Click "Add user" to create accounts
   - Assign roles in SQL Editor:

   **For Admin (full access):**

   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id-here', 'Admin');
   ```

   **For Manager (can create tournaments):**

   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id-here', 'Manager');
   ```

   **For Scorer (tournament-specific access):**

   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id-here', 'Scorer');
   -- Also grant tournament access:
   INSERT INTO tournament_scorers (tournament_id, user_id)
   VALUES ('tournament-uuid', 'scorer-user-uuid');
   ```

   **For Viewer (public view only):**

   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('your-user-id-here', 'Viewer');
   ```

5. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Get these values from: Project Settings → API in your Supabase dashboard

6. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### User Roles Overview

| Role        | Create Tournaments | Create Matches   | Delete Matches | Score            | Fullscreen Display |
| ----------- | ------------------ | ---------------- | -------------- | ---------------- | ------------------ |
| **Admin**   | ✅ All             | ✅ All           | ✅ All         | ✅ All           | ✅ Yes             |
| **Manager** | ✅ All             | ✅ All           | ❌ No          | ✅ All           | ✅ Yes             |
| **Scorer**  | ❌ No              | ✅ Assigned only | ❌ No          | ✅ Assigned only | ✅ Yes             |
| **Viewer**  | ❌ No              | ❌ No            | ❌ No          | ❌ No            | ✅ Yes             |
| **Public**  | ❌ No              | ❌ No            | ❌ No          | ❌ No            | ❌ No              |

### Admin & Manager Users

Admin and Manager accounts have elevated privileges:

- **Create Tournaments**: Can create new tournaments
- **Full Match Access**: Can create matches in any tournament
- **Universal Scoring**: Can score in any match
- **Delete Matches**: Only Admin can delete matches
- **Fullscreen Display**: Access to fullscreen mode for live matches

See [ACCESS_SETUP.md](ACCESS_SETUP.md) for complete access control documentation.

### Scorer Users

1. **Login** at `/login` with your scorer credentials
2. **View Tournaments**: See all tournaments
3. **Tournament Access**:
   - Can create matches and score in assigned tournaments
   - Read-only "spectator mode" for tournaments without access
4. **Create Match** under accessible tournaments
5. **Setup Match**:
   - Add team names
   - Set overs per innings
   - Configure toss details
6. **Add Players** (11 per team)
7. **Start Scoring**:
   - Select striker, non-striker, and bowler
   - Record each ball with run buttons or extras
   - Handle wickets with detailed dismissal forms
   - System automatically manages strike rotation and over completion

### Viewer Users

1. **Login** at `/login` with viewer credentials
2. **Browse**: View all tournaments and matches
3. **Fullscreen Display**: Access `/match/[id]/display` for fullscreen mode
4. **Public Pages**: Same access as unauthenticated users for scorecards

### Public Access (Unauthenticated)

1. Visit the home page to see all tournaments
2. Click a tournament to see its matches
3. Click a match to view the live scorecard
4. Scorecard auto-refreshes every 5 seconds during live matches
5. Generate QR codes for tournaments to share match links

## 📁 Project Structure

```
scorecard/
├── src/
│   ├── app/
│   │   ├── actions/              # Server actions for data operations
│   │   │   ├── auth.ts           # Authentication (login/logout)
│   │   │   ├── tournaments.ts    # Tournament CRUD
│   │   │   ├── teams.ts          # Team management
│   │   │   ├── matches.ts        # Match CRUD
│   │   │   └── scoring.ts        # Ball recording & innings management
│   │   ├── dashboard/            # Scorer dashboard (auth required)
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── tournament/       # Tournament management
│   │   │   └── match/[id]/
│   │   │       ├── setup/        # Match & player setup
│   │   │       └── score/        # Live scoring interface
│   │   ├── tournament/[id]/      # Public tournament view
│   │   ├── match/[id]/           # Public match scorecard
│   │   ├── login/                # Authentication page
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── components/               # Reusable React components
│   │   ├── ScoringInterface.tsx  # Main scoring UI
│   │   ├── TossForm.tsx          # Toss configuration
│   │   ├── RealtimeRefresh.tsx   # Real-time WebSocket updates
│   │   └── ...
│   ├── lib/
│   │   ├── cricket/
│   │   │   └── scoring.ts        # Cricket logic functions
│   │   └── supabase/             # Supabase clients
│   │       ├── client.ts         # Browser client
│   │       ├── server.ts         # Server client
│   │       └── middleware.ts     # Auth middleware
│   └── types/
│       └── index.ts              # TypeScript definitions
├── supabase-schema.sql           # Database schema
├── middleware.ts                 # Route protection
└── ...
```

## 🏏 Cricket Scoring Rules Implemented

- **Legal Balls**: Increment ball count (1-6 per over)
- **Wide/No-Ball**: Do NOT increment ball count, add to extras and runs
- **Free Hit**: Automatically triggered after no ball (no wicket except run out)
- **Strike Rotation**:
  - Batters swap on odd runs (1, 3, 5)
  - Includes byes and leg byes
  - Automatic rotation at end of over
- **Over Completion**: After 6 legal balls
- **Bowler Restrictions**: Cannot bowl consecutive overs
- **Mid-Over Bowler Change**: Supported with proper over segmentation
- **Innings End Conditions**:
  - 10 wickets fall
  - Maximum overs completed
  - Target achieved (second innings)
- **Match Result**: Automatic calculation based on:
  - First innings win by runs
  - Second innings win by wickets
  - Tie when scores are equal

## 📊 Database Schema

Key tables (see `supabase-schema.sql` for complete schema):

- **tournaments**: Tournament information
- **teams**: Team details per tournament
- **matches**: Match metadata, toss, status, winner
- **players**: Player information (11 per team)
- **innings**: Innings aggregate data (runs, wickets, balls)
- **overs**: Over-level tracking with bowler information
- **balls**: Ball-by-ball records with runs, extras, wickets
- **retirements**: Player retirement tracking

## 🔧 Development Guide

### Adding New Features

1. Add types to `src/types/index.ts`
2. Add server actions to `src/app/actions/`
3. Add UI components to `src/components/`
4. Add pages to `src/app/`

### Cricket Logic

Core cricket functions are in `src/lib/cricket/scoring.ts`:

- Strike rotation logic
- Ball counting (legal vs extras)
- Over completion detection
- Innings progression rules

### Key Helper Functions

```typescript
// Check if a ball is legal (counts toward over)
isLegalBall(extrasType: ExtrasType): boolean

// Determine if strike should rotate
shouldRotateStrike(runs: number, extrasType: ExtrasType): boolean

// Calculate overs from balls (e.g., 13 balls = 2.1 overs)
calculateOvers(balls: number): number

// Format score display
formatScore(runs: number, wickets: number): string
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!
5. (Optional) Configure custom domain in Vercel dashboard

### Build Locally

```bash
npm run build
npm start
```

## 🗺️ Roadmap / Future Enhancements

- [ ] Admin UI for access management (currently via SQL)
- [ ] Player statistics aggregation and history
- [ ] Match highlights and commentary system
- [ ] Real-time WebSocket updates (Supabase Realtime)
- [ ] Match analytics and charts (wagon wheel, manhattan)
- [ ] Score export functionality (PDF/CSV)
- [ ] Enhanced mobile UX with gesture controls
- [ ] Multiple undo levels
- [ ] Over-by-over summary view
- [ ] Team management with player profiles
- [ ] Tournament brackets and standings

## 📄 Documentation

- [SETUP.md](SETUP.md) - Complete setup guide with step-by-step instructions
- [ACCESS_SETUP.md](ACCESS_SETUP.md) - Access control and user management guide

## 🤝 Contributing

Contributions are welcome! This is an open-source project.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Server Actions for data mutations
- Keep cricket logic in `lib/cricket/` for reusability
- Write clear commit messages
- Test scorer and public views thoroughly

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js 16](https://nextjs.org/)
- Database and Authentication by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Inspired by ESPN Cricinfo and other cricket scoring platforms

## 📧 Support

For questions, issues, or feature requests:

- Open an issue on [GitHub](https://github.com/AssassinAsh/scorecard/issues)
- Check existing issues before creating new ones
- Provide detailed information for bug reports

---

**Made with ❤️ for Cricket Lovers | Happy Scoring! 🏏**
