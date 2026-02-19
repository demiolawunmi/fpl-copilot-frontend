# Manual GW Points Calculation Feature

## Overview

This document explains the manual gameweek points calculation feature implemented to detect discrepancies between the FPL API-reported points and the actual sum of player points.

## Problem Statement

The FPL API sometimes reports gameweek points that differ from the actual sum of individual player points. This can occur due to:
- Delayed API updates
- Bonus points not yet finalized
- Auto-substitution timing issues
- Chip activation logic

## Solution

We implemented a **manual points calculation** system that:
1. Fetches individual player points from the live gameweek data
2. Sums them manually, accounting for captain multipliers and chips
3. Compares the manual calculation with the API-reported points
4. Displays a warning when there's a discrepancy

## Implementation Details

### Manual Calculation Algorithm

```typescript
function calculateManualGWPoints(players: Player[], benchBoostActive: boolean): number {
  const starterPlayers = players.filter(p => !p.isBench);
  const benchPlayers = players.filter(p => p.isBench);
  
  // Calculate starter points (with multiplier for captain)
  let total = starterPlayers.reduce((sum, p) => sum + (p.actualPoints * p.multiplier), 0);
  
  // If bench boost is active, add bench points
  if (benchBoostActive) {
    total += benchPlayers.reduce((sum, p) => sum + p.actualPoints, 0);
  }
  
  return total;
}
```

### Key Components

1. **API Layer** (`src/api/fpl/`)
   - `client.ts`: Fetch functions for FPL API endpoints
   - `endpoints.ts`: API endpoint definitions
   - `fpl.ts`: Module exports

2. **Data Fetching** (`src/hooks/useFplData.ts`)
   - Custom React hook that fetches all necessary data
   - Builds player list with actual points from live data
   - Calculates manual points and detects discrepancies
   - Returns both API points and manual points

3. **UI Components** (`src/components/gw-overview/`)
   - `GWHeader.tsx`: Displays gameweek number and deadline
   - `StatsStrip.tsx`: Shows statistics including both point values
   - `PitchCard.tsx`: Visual team display with player points

4. **Types** (`src/types/fpl.ts`)
   - Complete TypeScript definitions for FPL API responses
   - Application-specific types (Player, GWInfo, GWStats)

### Data Flow

```
1. User logs in with Team ID
2. useFplData hook fetches:
   - Bootstrap data (players, teams, gameweeks)
   - Entry data (team info)
   - Picks data (team selection, active chips)
   - Live data (player points for current GW)
3. Hook processes data:
   - Builds player list with actual points
   - Checks if bench boost is active
   - Calculates manual points
   - Gets API-reported points from picks.entry_history.points
   - Calculates discrepancy = manual - API
4. StatsStrip component displays:
   - API GW Points (orange if discrepancy exists)
   - Manual GW Points (green, highlighted if discrepancy)
   - Discrepancy value (yellow, shown only if non-zero)
   - Warning banner explaining the difference
```

### Handling Chips

#### Bench Boost
When bench boost is active (`picks.active_chip === 'bboost'`):
- Manual calculation includes bench player points
- All 15 players' points are counted

#### Captain/Vice-Captain
- Captain gets 2× multiplier (or 3× for triple captain)
- Vice-captain only gets multiplier if captain doesn't play
- Handled via `pick.multiplier` field

#### Other Chips
- Free Hit, Wildcard, Triple Captain: No special handling needed
- Points calculation works the same way

## UI/UX Design

### Stats Strip
Shows key statistics in a grid layout:
- **API GW Points**: Orange text if discrepancy exists
- **Manual GW Points**: Green text, highlighted background if discrepancy
- **Discrepancy**: Yellow text, only shown if non-zero
- Other stats: Total points, GW rank, overall rank, team value, etc.

### Warning Banner
Appears below stats when discrepancy is detected:
```
⚠️ Points Discrepancy Detected

The manually calculated points (62) differ from the API-reported 
points (58) by +4 points. This may be due to delayed API updates 
or bonus points not yet finalized.
```

### Color Coding
- **Green**: Manual calculation (the "correct" value)
- **Orange**: API value (potentially outdated)
- **Yellow**: Discrepancy amount and warning

## Testing

### Mock Data
- Located in `src/data/gwOverviewMocks.ts`
- Includes sample data with a +4 point discrepancy
- Used when API is unavailable or returns errors

### Manual Testing
1. Log in with a valid FPL Team ID
2. Navigate to GW Overview page
3. Check if points match or if discrepancy is shown
4. Verify captain multiplier is applied correctly
5. Test with bench boost active (if applicable)

## API Endpoints Used

- `GET /api/bootstrap-static/` - Players, teams, gameweeks
- `GET /api/entry/{team_id}/` - Team info
- `GET /api/entry/{team_id}/event/{gw}/picks/` - Team picks and chips
- `GET /api/event/{gw}/live/` - Live player points

## Error Handling

1. **API Errors**: Falls back to mock data
2. **Network Errors**: Shows error banner, displays mock data
3. **Invalid Team ID**: API returns 404, handled gracefully
4. **CORS Issues**: Handled via Vite proxy

## Future Enhancements

1. **Historical Tracking**: Store discrepancies over time
2. **Auto-Refresh**: Periodically update live data
3. **Notifications**: Alert when discrepancy is detected
4. **Detailed Breakdown**: Show per-player point comparison
5. **Export Data**: Allow downloading detailed reports

## Conclusion

The manual points calculation feature provides transparency and accuracy in gameweek scoring. By comparing API values with manual calculations, users can identify when the API data is outdated or incorrect, especially important for bench boost gameweeks or when bonus points are being finalized.
