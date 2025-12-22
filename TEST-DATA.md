# QE Test Data: Tournament, Match & 3-Over Scoring

This document provides concrete sample data that a QE tester can use to validate the main flows:

1. Creating a tournament
2. Creating a match
3. Updating the toss result and scoring a 3-over innings with ball-by-ball data that covers all delivery types supported by the app

Types referenced below match the definitions in `src/types/index.ts`.

---

## 1. Creating a Tournament

Use this data in the **Create Tournament** form or API:

- `name`: **Premier Cricket Cup 2025**
- `start_date`: **2025-01-15** (ISO date string)
- `location`: **Mumbai, India**

**Expected outcome**

- Tournament appears on the home page list with:
  - Title: _Premier Cricket Cup 2025_
  - Location: _Mumbai, India_
  - Start Date formatted as: _Jan 15, 2025_

You can create 2–3 tournaments with small variations (different dates/locations) to verify sorting and display, but one is sufficient for core flow.

---

## 2. Creating a Match

Create a match under **Premier Cricket Cup 2025**.

### 2.1. Teams (conceptual)

If the UI asks you to choose existing teams, use analogous names; if it only uses text names from the match, use these directly.

- **Team A**: _Mumbai Strikers_
- **Team B**: _Delhi Warriors_

### 2.2. Match details

Use this data in the **Create Match** form:

- `tournament_id`: (select **Premier Cricket Cup 2025**)
- `team_a_id` / `team_a_name`: **Mumbai Strikers**
- `team_b_id` / `team_b_name`: **Delhi Warriors**
- `match_date`: **2025-01-16**
- `overs_per_innings`: **3** (short match to exercise all flows quickly)

After creation, ensure the match shows up under the tournament:

- Title: _Mumbai Strikers vs Delhi Warriors_
- Match date: _Jan 16, 2025_
- Overs: _3 overs_
- Initial status: **Upcoming**

### 2.3. Suggested playing XIs

You can add 6–11 players per side; for the 3-over test, 6 per side is enough to cover wicket flows.

**Mumbai Strikers (Team A)**

1. Rohit Sharma
2. Ishan Kishan
3. Suryakumar Yadav
4. Hardik Pandya
5. Tilak Varma
6. Jasprit Bumrah

**Delhi Warriors (Team B)**

1. David Warner
2. Prithvi Shaw
3. Rishabh Pant
4. Axar Patel
5. Kuldeep Yadav
6. Anrich Nortje

Make sure batting orders are set in these sequences so wicket flows and dismissals are easy to track.

---

## 3. Toss & 3-Over Scoring Scenario (Ball-by-Ball)

This section describes a **single 3-over innings** for Team A (Mumbai Strikers) batting first against Team B (Delhi Warriors). It is designed to cover:

- All `ExtrasType` values: `Wide`, `NoBall`, `Bye`, `LegBye`, `None`
- All `WicketType` values: `Bowled`, `Caught`, `RunOut`, `Stumps`, `HitWicket`, `LBW`, `None`
- Free hit behaviour after a no-ball
- Strike changes on odd runs, byes, leg byes
- Over completion and innings completion at 3 overs (18 legal balls)

### 3.1. Toss update

In the **Toss** / **Match Setup** UI, use:

- `toss_winner`: **A** (Mumbai Strikers)
- `toss_decision`: **Bat**

After saving:

- Match status should move from **Upcoming** to **Starting Soon** (or directly allow starting first innings, depending on your UI).

### 3.2. Innings configuration

- **Innings**: 1st Innings
- **Batting team**: Team A – _Mumbai Strikers_
- **Bowling team**: Team B – _Delhi Warriors_
- **Striker (start)**: Rohit Sharma
- **Non-striker (start)**: Ishan Kishan
- **Bowler (Over 1)**: Anrich Nortje
- **Bowler (Over 2)**: Axar Patel
- **Bowler (Over 3)**: Kuldeep Yadav

### 3.3. Ball-by-ball dataset (3 overs)

**Legend**

- `RunsBat`: runs off the bat (0–6)
- `ExtrasType`: one of `None | Wide | NoBall | Bye | LegBye`
- `ExtrasRuns`: runs from extras (1+ when applicable)
- `WicketType`: one of `None | Bowled | Caught | RunOut | Stumps | HitWicket | LBW`
- `Dismissed`: batter dismissed (if any)
- `Fielder`: fielder involved for catches/run outs (if known)
- `Keeper`: keeper for stumpings (if known)
- `FreeHitNext`: whether _next_ ball should be Free Hit (true after a no-ball wicket-safe delivery)

> QE tip: For each ball, you can mirror this info into your scoring UI, checking strike rotation, over summary, Free Hit label, and scorecard totals.

#### Over 1 – Bowler: Anrich Nortje

1. **Ball 0.1** – Dot ball

   - Striker: Rohit Sharma
   - RunsBat: **0**
   - ExtrasType: **None**
   - ExtrasRuns: **0**
   - WicketType: **None**
   - Notes: Plain dot ball, no strike change.

2. **Ball 0.2** – Single

   - Striker: Rohit Sharma
   - RunsBat: **1**
   - ExtrasType: **None**
   - ExtrasRuns: **0**
   - WicketType: **None**
   - Notes: Total +1 run. Strike rotates; Ishan becomes striker.

3. **Ball 0.3** – Four

   - Striker: Ishan Kishan
   - RunsBat: **4**
   - ExtrasType: **None**
   - ExtrasRuns: **0**
   - WicketType: **None**
   - Notes: Boundary; total +4 runs. Strike stays with Ishan.

4. **Ball 0.4** – Bye (odd runs, strike change via bye)

   - Striker: Ishan Kishan
   - RunsBat: **0**
   - ExtrasType: **Bye**
   - ExtrasRuns: **1**
   - WicketType: **None**
   - Notes: 1 bye, total +1. Strike rotates; Rohit becomes striker.

5. **Ball 0.5** – Leg bye (even runs)

   - Striker: Rohit Sharma
   - RunsBat: **0**
   - ExtrasType: **LegBye**
   - ExtrasRuns: **2**
   - WicketType: **None**
   - Notes: 2 leg byes, total +2. Even runs, strike does _not_ rotate; Rohit remains striker.

6. **Ball 0.6** – Wicket: Bowled
   - Striker: Rohit Sharma
   - RunsBat: **0**
   - ExtrasType: **None**
   - ExtrasRuns: **0**
   - WicketType: **Bowled**
   - Dismissed: **Rohit Sharma**
   - Notes: Wicket on last ball of over. New batter for next over.

**End of Over 1**

- Total runs after Over 1: **8**
  - Breakdown: 1 (single) + 4 (four) + 1 (bye) + 2 (leg byes)
- Wickets: **1** (Rohit bowled)
- Next batters at crease for Over 2:
  - New striker: **Suryakumar Yadav** (replacing Rohit)
  - Non-striker: **Ishan Kishan**

#### Over 2 – Bowler: Axar Patel

7. **Ball 1.1** – No-ball + boundary (classic Free Hit setup)

   - Striker: Suryakumar Yadav
   - RunsBat: **4**
   - ExtrasType: **NoBall**
   - ExtrasRuns: **1** (penalty run)
   - WicketType: **None**
   - FreeHitNext: **true**
   - Notes: Total +5 (4 off bat + 1 no-ball). Ball does **not** count as legal, so still ball 1.1 in terms of legal delivery count. Strike stays with Suryakumar.

8. **Ball 1.1 (Free Hit)** – Dot on Free Hit

   - Striker: Suryakumar Yadav
   - RunsBat: **0**
   - ExtrasType: **None**
   - ExtrasRuns: **0**
   - WicketType: **None**
   - FreeHitNext: **false**
   - Notes: Legal ball. No runs. Strike stays with Suryakumar.

9. **Ball 1.2** – Wicket: LBW

   - Striker: Suryakumar Yadav
   - RunsBat: **0**
   - ExtrasType: **None**
   - ExtrasRuns: **0**
   - WicketType: **LBW**
   - Dismissed: **Suryakumar Yadav**
   - Notes: Legal ball, wicket; new batter comes in.

10. **Ball 1.3** – Two runs

    - Striker: Hardik Pandya (new batter)
    - RunsBat: **2**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **None**
    - Notes: Total +2. Even runs, strike stays with Hardik.

11. **Ball 1.4** – Wide (with extra run from overthrow)

    - Striker: Hardik Pandya
    - RunsBat: **0**
    - ExtrasType: **Wide**
    - ExtrasRuns: **2** (1 for wide + 1 extra run)
    - WicketType: **None**
    - Notes: Total +2, ball does **not** count as legal, strike does **not** change.

12. **Ball 1.4 (legal)** – Wicket: Caught

    - Striker: Hardik Pandya
    - RunsBat: **1**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **Caught**
    - Dismissed: **Hardik Pandya**
    - Fielder: **David Warner**
    - Notes: Total +1 and wicket. New batter comes in.

13. **Ball 1.5** – Single (new batter)

    - Striker: Tilak Varma (new batter)
    - RunsBat: **1**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **None**
    - Notes: Total +1, strike rotates; Ishan becomes striker for next ball.

14. **Ball 1.6** – Dot ball
    - Striker: Ishan Kishan
    - RunsBat: **0**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **None**
    - Notes: End of over.

**End of Over 2**

Let’s compute runs in Over 2:

- No-ball + 4: +5
- Free Hit dot: +0
- LBW: +0
- 2 runs: +2
- Wide + extra: +2
- Single: +1
- Dot: +0

**Runs in Over 2**: 5 + 0 + 0 + 2 + 2 + 1 + 0 = **10**

**Cumulative after Over 2**

- Total runs: **8 (Over 1) + 10 (Over 2) = 18**
- Wickets: **3** (Rohit – Bowled, Suryakumar – LBW, Hardik – Caught)
- Batters at crease to start Over 3:
  - Striker: **Tilak Varma**
  - Non-striker: **Ishan Kishan**

#### Over 3 – Bowler: Kuldeep Yadav

15. **Ball 2.1** – Wicket: Stumped

    - Striker: Tilak Varma
    - RunsBat: **0**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **Stumps**
    - Dismissed: **Tilak Varma**
    - Keeper: **Rishabh Pant**
    - Notes: Legal ball, wicket; new batter comes in.

16. **Ball 2.2** – Wicket: Hit Wicket

    - Striker: Jasprit Bumrah (new batter)
    - RunsBat: **0**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **HitWicket**
    - Dismissed: **Jasprit Bumrah**
    - Notes: Legal ball, wicket; new batter comes in.

17. **Ball 2.3** – No-ball + run out (runs should count)

    - Striker: Ishan Kishan
    - RunsBat: **1** (run attempted before run-out)
    - ExtrasType: **NoBall**
    - ExtrasRuns: **1**
    - WicketType: **RunOut**
    - Dismissed: **Ishan Kishan**
    - Fielder: **Prithvi Shaw**
    - FreeHitNext: **true**
    - Notes:
      - Total runs from ball: 1 (bat) + 1 (no-ball) = +2
      - Run-out on a no-ball: runs **do** count.
      - Ball does **not** count as legal (no-ball), so still 2.3 in terms of legal ball index.

18. **Ball 2.3 (Free Hit)** – Single on Free Hit

    - Striker: New batter (e.g., _Substitute Batter A_)
    - RunsBat: **1**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **None** (only run-out allowed but does not happen here)
    - FreeHitNext: **false**
    - Notes: Total +1; strike rotates.

19. **Ball 2.4** – Wide only

    - Striker: Ishan is out; striker is **Substitute Batter A**
    - RunsBat: **0**
    - ExtrasType: **Wide**
    - ExtrasRuns: **1**
    - WicketType: **None**
    - Notes: +1 run, ball not legal, strike does not rotate.

20. **Ball 2.4 (legal)** – Two runs

    - Striker: Substitute Batter A
    - RunsBat: **2**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **None**
    - Notes: +2 runs, even, no strike change.

21. **Ball 2.5** – Single (to finish innings legally)

    - Striker: Substitute Batter A
    - RunsBat: **1**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **None**
    - Notes: +1, strike rotates.

22. **Ball 2.6** – Dot ball
    - Striker: Non-striker from previous ball (e.g., new batter or same, depending on your exact list). For testing, you can keep **Substitute Batter A** on strike if easier.
    - RunsBat: **0**
    - ExtrasType: **None**
    - ExtrasRuns: **0**
    - WicketType: **None**
    - Notes: End of over and innings (3 overs completed).

### 3.4. Final expected totals

Compute Over 3 runs:

- Stumped: 0
- Hit Wicket: 0
- No-ball + run out: +2
- Free Hit single: +1
- Wide: +1
- Two runs: +2
- Single: +1
- Dot: 0

**Runs in Over 3**: 2 + 1 + 1 + 2 + 1 = **7**

**Innings total**

- Over 1: 8 runs
- Over 2: 10 runs
- Over 3: 7 runs

**Total runs**: **25**

**Total wickets**: **6**

- Rohit Sharma – Bowled
- Suryakumar Yadav – LBW
- Hardik Pandya – Caught
- Tilak Varma – Stumps
- Jasprit Bumrah – HitWicket
- Ishan Kishan – RunOut

**Overs bowled**: **3.0** (18 legal balls)

### 3.5. What the QE should verify

For this scenario, a QE tester should check:

- Toss:
  - Toss winner and decision saved and reflected on Match Setup.
- Starting first innings:
  - Status transitions (Upcoming → Starting Soon → Live).
- Ball recording:
  - Total runs, wickets, and overs align with this dataset.
  - Strike rotation matches the rules (odd runs and odd byes/leg byes swap strike; wides and pure no-balls don’t).
  - Wicket flows show correct `WicketType`, dismissed batter, and fielder/keeper where applicable.
  - Free Hit behaviour:
    - Free Hit indicator appears after the no-ball.
    - Only **RunOut** allowed as wicket on Free Hit (UI enforces this).
    - Runs on a run-out ball (especially with a no-ball) are included in the total.
- Scorecard:
  - Batting card correctly aggregates runs/balls/fours/sixes and dismissal text.
  - Bowling card correctly aggregates overs, maidens, runs, wickets, and economy.
  - "This Over" display matches the ball display text rules (dots, runs, `wd`, `nb`, `b`, `lb`, `W`, `1W`, etc.).

This single tournament + match + 3-over script should be enough to exercise **all major flows** in your scoring engine and UI.
