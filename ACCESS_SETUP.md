# Access Control - Setup Guide

## Overview

Simple access control system with:

- **Admin account**: Full system access, creates tournaments, grants scorer access
- **Scorers**: Access to specific tournaments (assigned by admin)
- **Public users**: Read-only view of all tournaments

## Setup

### Step 1: Run Database Schema

1. Open Supabase SQL Editor
2. Copy and paste the entire `supabase-schema.sql` file
3. Click Run

This creates everything including:

- Core tables (tournaments, matches, etc.)
- `user_roles` table for admin system
- `tournament_scorers` table for access control
- Helper functions: `is_admin()` and `has_scorer_access()`

### Step 2: Create Admin Account

```sql
-- Get your user ID
SELECT id, email FROM auth.users;

-- Make yourself admin
INSERT INTO user_roles (user_id, is_admin)
VALUES ('your-user-id-here', true)
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
```

**Important**: Admin has full access to everything.

### Step 3: Grant Scorer Access (Optional)

To give other users scorer access to specific tournaments:

```sql
-- Get user and tournament IDs
SELECT id, email FROM auth.users;
SELECT id, name FROM tournaments;

-- Grant access
INSERT INTO tournament_scorers (tournament_id, user_id)
VALUES ('tournament-uuid', 'user-uuid');
```

### Step 4: Test Access Control

1. **Admin user:**

   - Can see "+ New" button to create tournaments
   - Has scorer access to ALL tournaments automatically
   - Can score any match

2. **Scorer with access:**

   - Cannot create tournaments
   - Sees tournaments they're assigned to
   - Can create matches and score in those tournaments
   - Sees spectator mode banner on tournaments without access

3. **Scorer without access:**
   - Cannot create tournaments
   - Sees all tournaments in dashboard
   - Clicking tournament shows spectator mode (read-only)
   - Cannot create matches or score

## How It Works

### Admin Privileges

- Admin is determined by `user_roles.is_admin = true`
- `hasAccess()` function returns `true` for admins on ALL tournaments
- Only admins see the "+ New Tournament" button
- Only admins can successfully create tournaments

### Tournament Detail Page

- Checks `has_scorer_access(tournament_id)` for current user
- If TRUE → shows dashboard view (can score, create matches)
- If FALSE → redirects to public view (spectator only)

### Granting Access

**Option 1: SQL (Manual)**

```sql
INSERT INTO tournament_scorers (tournament_id, user_id)
VALUES ('tournament-id', 'user-id');
```

**Option 2: Build a Simple UI (Optional)**
You could create a simple page where tournament creators can:

- See their tournaments
- Add scorer emails
- Lookup user by email and insert into tournament_scorers

## Example Workflows

### Scenario 1: Tournament Creator

1. User creates a tournament
2. They want to add another scorer
3. They manually add via SQL:
   ```sql
   INSERT INTO tournament_scorers (tournament_id, user_id)
   VALUES ('abc-123', 'def-456');
   ```
4. That scorer can now access the tournament

### Scenario 2: Public Tournament

1. Tournament exists with matches being played
2. User without scorer access visits site
3. They see `/tournament/[id]` public view
4. They can watch live scores but cannot modify anything

### Scenario 3: Multiple Scorers

1. Tournament has 3 scorers
2. All 3 users have entries in `tournament_scorers` for that tournament
3. All 3 see the tournament in their dashboard
4. All 3 can score matches in that tournament

## Database Schema

```sql
tournament_scorers
├── id (uuid, primary key)
├── tournament_id (uuid, references tournaments)
├── user_id (uuid, references auth.users)
├── granted_at (timestamptz)
└── UNIQUE(tournament_id, user_id)
```

## Revoke Access

To remove scorer access:

```sql
DELETE FROM tournament_scorers
WHERE tournament_id = 'tournament-uuid'
AND user_id = 'user-uuid';
```

## Future Enhancement (Optional)

If you want a simple UI for managing access later, you could add:

1. **Tournament Access Page** (`/dashboard/tournament/[id]/scorers`)

   - List current scorers
   - Add scorer by email
   - Remove scorers

2. **Simple Action**
   ```typescript
   export async function addScorer(tournamentId: string, email: string) {
     // 1. Get user by email
     // 2. Insert into tournament_scorers
   }
   ```

But for now, manual SQL insertion works perfectly fine!

## Troubleshooting

**User can't see tournament in dashboard**

- Check if they have entry in tournament_scorers table
- Verify user_id and tournament_id are correct

**User gets redirected to public view**

- Same as above - check tournament_scorers table
- Make sure user is logged in

**Function not found error**

- Re-run the migration SQL
- Check that has_scorer_access() function exists:
  ```sql
  SELECT routine_name FROM information_schema.routines
  WHERE routine_name = 'has_scorer_access';
  ```

## Summary

This minimal approach:

- ✅ No roles or user management needed
- ✅ Simple junction table for access control
- ✅ Automatic view selection (scorer vs public)
- ✅ Easy to grant/revoke access via SQL
- ✅ Can add UI later if needed

Just run the migration and manually grant access via SQL inserts!
