import { useState, useEffect } from 'react';
import { fplClient } from '../api/fpl/client';
import type {
  BootstrapStatic,
  EntryInfo,
  EntryHistory,
  EntryPicks,
  LiveGameweek,
  Fixture,
  FPLElement,
  FPLTeam,
} from '../api/fpl/fpl';
import type {
  GWInfo,
  GWStats,
  Player,
  Fixture as UIFixture,
  Injury,
  Transfer,
} from '../data/gwOverviewMocks';

interface UseFplDataResult {
  loading: boolean;
  error: string | null;
  teamName: string | null;
  managerName: string | null;
  gwInfo: GWInfo | null;
  stats: GWStats | null;
  squad: Player[] | null;
  fixtures: UIFixture[] | null;
  injuries: Injury[] | null;
  transfers: Transfer[] | null;
  manualPoints: number | null;
  pointsDifferent: boolean;
}

/**
 * Custom hook to fetch and process FPL data for a team
 */
export const useFplData = (teamId: string | null, currentGameweek?: number): UseFplDataResult => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Omit<UseFplDataResult, 'loading' | 'error'>>({
    teamName: null,
    managerName: null,
    gwInfo: null,
    stats: null,
    squad: null,
    fixtures: null,
    injuries: null,
    transfers: null,
    manualPoints: null,
    pointsDifferent: false,
  });

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [bootstrap, entryInfo, entryHistory] = await Promise.all([
          fplClient.getBootstrapStatic(),
          fplClient.getEntryInfo(teamId),
          fplClient.getEntryHistory(teamId),
        ]);

        // Get current gameweek
        const currentEvent = bootstrap.events.find((e) => e.is_current);
        const gw = currentGameweek || currentEvent?.id || entryInfo.current_event;

        if (!gw) {
          throw new Error('Could not determine current gameweek');
        }

        // Fetch gameweek-specific data
        const [picks, liveData, allFixtures] = await Promise.all([
          fplClient.getEntryPicks(teamId, gw),
          fplClient.getLiveGameweek(gw),
          fplClient.getFixtures(),
        ]);

        // Create lookup maps
        const elementsMap = new Map(bootstrap.elements.map((e) => [e.id, e]));
        const teamsMap = new Map(bootstrap.teams.map((t) => [t.id, t]));
        const liveMap = new Map(liveData.elements.map((e) => [e.id, e]));

        // Build GW Info
        const gwInfo: GWInfo = {
          gameweek: gw,
          deadline: currentEvent?.deadline_time || '',
          isFinished: currentEvent?.finished || false,
        };

        // Build GW Stats
        const gwHistory = entryHistory.current.find((h) => h.event === gw);
        const stats: GWStats = {
          points: gwHistory?.points || picks.entry_history.points,
          rank: gwHistory?.rank || picks.entry_history.rank,
          overallRank: gwHistory?.overall_rank || picks.entry_history.overall_rank,
          pointsOnBench: gwHistory?.points_on_bench || picks.entry_history.points_on_bench,
          transfersMade: gwHistory?.event_transfers || picks.entry_history.event_transfers,
          transfersCost: gwHistory?.event_transfers_cost || picks.entry_history.event_transfers_cost,
          teamValue: gwHistory?.value || picks.entry_history.value,
          bank: gwHistory?.bank || picks.entry_history.bank,
        };

        // Build squad with live points
        const squad: Player[] = picks.picks.map((pick) => {
          const element = elementsMap.get(pick.element);
          const team = element ? teamsMap.get(element.team) : null;
          const liveElement = liveMap.get(pick.element);
          const points = liveElement?.stats.total_points || 0;

          return {
            id: pick.element,
            name: element?.web_name || 'Unknown',
            team: team?.short_name || 'Unknown',
            teamCode: team?.code || 0,
            position: getPositionName(element?.element_type || 0),
            points: points * pick.multiplier,
            isCaptain: pick.is_captain,
            isViceCaptain: pick.is_vice_captain,
            multiplier: pick.multiplier,
          };
        });

        // Calculate manual points (sum of all player points including bench boost)
        const manualPoints = calculateManualPoints(squad, picks.active_chip);
        const apiPoints = picks.entry_history.points;
        const pointsDifferent = manualPoints !== apiPoints;

        // Build fixtures for this gameweek
        const gwFixtures = allFixtures
          .filter((f) => f.event === gw)
          .map((f): UIFixture => {
            const homeTeam = teamsMap.get(f.team_h);
            const awayTeam = teamsMap.get(f.team_a);
            return {
              id: f.id,
              date: f.kickoff_time ? new Date(f.kickoff_time).toISOString().split('T')[0] : '',
              homeTeam: homeTeam?.short_name || 'Unknown',
              homeTeamCode: homeTeam?.code || 0,
              awayTeam: awayTeam?.short_name || 'Unknown',
              awayTeamCode: awayTeam?.code || 0,
              homeScore: f.team_h_score,
              awayScore: f.team_a_score,
              kickoffTime: f.kickoff_time ? new Date(f.kickoff_time).toTimeString().split(' ')[0] : '',
              finished: f.finished,
              started: f.started,
            };
          })
          .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.kickoffTime.localeCompare(b.kickoffTime);
          });

        // Build injuries from squad
        const injuries: Injury[] = squad
          .filter((p) => {
            const element = elementsMap.get(p.id);
            return element && (element.status === 'd' || element.status === 'i' || element.status === 's');
          })
          .map((p) => {
            const element = elementsMap.get(p.id)!;
            return {
              player: p.name,
              team: p.team,
              teamCode: p.teamCode,
              status: getStatusName(element.status),
              news: element.news || '',
              chance: element.chance_of_playing_next_round,
            };
          });

        // Build transfers for current gameweek (from history)
        const transfers: Transfer[] = [];
        // Note: Full transfer history requires a different endpoint not included in basic API
        // This would need the entry/transfers endpoint which is not always available

        setData({
          teamName: entryInfo.name,
          managerName: `${entryInfo.player_first_name} ${entryInfo.player_last_name}`,
          gwInfo,
          stats,
          squad,
          fixtures: gwFixtures,
          injuries,
          transfers,
          manualPoints,
          pointsDifferent,
        });
      } catch (err) {
        console.error('Error fetching FPL data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred fetching FPL data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, currentGameweek]);

  return {
    loading,
    error,
    ...data,
  };
};

/**
 * Calculate manual points sum with bench boost logic
 */
function calculateManualPoints(squad: Player[], activeChip: string | null): number {
  if (activeChip === 'bboost') {
    // Bench boost: all players count
    return squad.reduce((sum, player) => sum + player.points, 0);
  } else {
    // Normal: only starting XI (position 1-11, multiplier > 0)
    return squad
      .filter((player) => player.multiplier > 0)
      .reduce((sum, player) => sum + player.points, 0);
  }
}

/**
 * Get position name from element_type ID
 */
function getPositionName(elementType: number): string {
  switch (elementType) {
    case 1:
      return 'GK';
    case 2:
      return 'DEF';
    case 3:
      return 'MID';
    case 4:
      return 'FWD';
    default:
      return 'Unknown';
  }
}

/**
 * Get human-readable status name
 */
function getStatusName(status: string): string {
  switch (status) {
    case 'd':
      return 'Doubtful';
    case 'i':
      return 'Injured';
    case 's':
      return 'Suspended';
    case 'u':
      return 'Unavailable';
    default:
      return 'Available';
  }
}
