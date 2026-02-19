// Custom hook for fetching and processing FPL data

import { useState, useEffect } from 'react';
import {
  getBootstrap,
  getEntry,
  getEntryHistory,
  getPicks,
  getLive,
} from '../api/fpl/client';
import type {
  Player,
  GWInfo,
  GWStats,
  BootstrapResponse,
  PicksResponse,
  LiveResponse,
} from '../types/fpl';

interface UseFplDataResult {
  loading: boolean;
  error: string | null;
  gwInfo: GWInfo | null;
  gwStats: GWStats | null;
  players: Player[];
  teamName: string | null;
}

/**
 * Calculate manual GW points from player picks
 * This manually sums up player points, accounting for multipliers and bench boost
 */
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

/**
 * Main hook for fetching FPL data
 */
export function useFplData(teamId: number | null): UseFplDataResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gwInfo, setGwInfo] = useState<GWInfo | null>(null);
  const [gwStats, setGwStats] = useState<GWStats | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // teamId is checked above, so it's guaranteed to be non-null here
        const teamIdNum = teamId!;

        // Fetch all required data in parallel
        const [bootstrap, entry] = await Promise.all([
          getBootstrap(),
          getEntry(teamIdNum),
          getEntryHistory(teamIdNum),
        ]);

        if (!isMounted) return;

        // Get current gameweek
        const currentGW = bootstrap.events.find(e => e.is_current);
        if (!currentGW) {
          throw new Error('No current gameweek found');
        }

        // Fetch picks and live data for current gameweek
        const [picks, live] = await Promise.all([
          getPicks(teamIdNum, currentGW.id),
          getLive(currentGW.id),
        ]);

        if (!isMounted) return;

        // Set team name
        setTeamName(entry.name);

        // Set GW info
        setGwInfo({
          gameweek: currentGW.id,
          deadline: currentGW.deadline_time,
          isFinished: currentGW.finished,
        });

        // Build player list with actual points from live data
        const playerList = buildPlayerList(picks, bootstrap, live);
        setPlayers(playerList);

        // Check if bench boost is active
        const benchBoostActive = picks.active_chip === 'bboost';

        // Calculate manual points
        const manualPoints = calculateManualGWPoints(playerList, benchBoostActive);

        // Get API-reported points
        const apiPoints = picks.entry_history.points;

        // Calculate discrepancy
        const pointsDiscrepancy = manualPoints - apiPoints;

        // Set GW stats
        setGwStats({
          gwPoints: apiPoints,
          manualPoints: manualPoints,
          totalPoints: picks.entry_history.total_points,
          gwRank: picks.entry_history.rank,
          overallRank: picks.entry_history.overall_rank,
          teamValue: picks.entry_history.value / 10, // Convert to millions
          bank: picks.entry_history.bank / 10, // Convert to millions
          transfers: picks.entry_history.event_transfers,
          transferCost: picks.entry_history.event_transfers_cost,
          benchPoints: picks.entry_history.points_on_bench,
          pointsDiscrepancy: pointsDiscrepancy,
        });

      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching FPL data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch FPL data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [teamId]);

  return { loading, error, gwInfo, gwStats, players, teamName };
}

/**
 * Build player list from picks, bootstrap, and live data
 */
function buildPlayerList(
  picks: PicksResponse,
  bootstrap: BootstrapResponse,
  live: LiveResponse
): Player[] {
  const elementMap = new Map(bootstrap.elements.map(e => [e.id, e]));
  const teamMap = new Map(bootstrap.teams.map(t => [t.id, t]));
  const positionMap = new Map(bootstrap.element_types.map(et => [et.id, et]));
  const liveMap = new Map(live.elements.map(e => [e.id, e]));

  return picks.picks.map(pick => {
    const element = elementMap.get(pick.element);
    const liveData = liveMap.get(pick.element);
    const team = element ? teamMap.get(element.team) : null;
    const position = element ? positionMap.get(element.element_type) : null;

    const actualPoints = liveData?.stats.total_points ?? 0;

    return {
      id: pick.element,
      name: element?.web_name ?? 'Unknown',
      position: position?.singular_name_short ?? 'UNK',
      team: team?.short_name ?? 'UNK',
      points: actualPoints * pick.multiplier, // Points with multiplier applied
      isCaptain: pick.is_captain,
      isViceCaptain: pick.is_vice_captain,
      multiplier: pick.multiplier,
      isBench: pick.position > 11, // Positions 12-15 are bench
      actualPoints: actualPoints, // Raw points without multiplier
    };
  });
}
