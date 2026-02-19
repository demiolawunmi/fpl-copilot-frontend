/**
 * Opponent difficulty utilities for fixture coloring
 */

// Numeric difficulty mapping (1-5 scale)
export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return 'emerald'; // green
  if (difficulty === 3) return 'yellow';  // yellow
  return 'rose';  // red for 4-5
}

// Heuristic difficulty map based on team strength (fallback if numeric difficulty not available)
const TEAM_DIFFICULTY: Record<string, number> = {
  // Top tier (5 - very difficult)
  'MCI': 5, 'LIV': 5, 'ARS': 5,
  // Strong (4 - difficult)
  'TOT': 4, 'CHE': 4, 'MUN': 4, 'NEW': 4,
  // Mid-upper (3 - medium)
  'AVL': 3, 'WHU': 3, 'BHA': 3, 'FUL': 3, 'WOL': 3, 'BRE': 3, 'EVE': 3,
  // Lower (2 - easier)
  'CRY': 2, 'BOU': 2, 'NFO': 2, 'IPS': 2,
  // Weakest (1 - easiest)
  'SOU': 1, 'LEI': 1, 'SHU': 1,
};

/**
 * Get difficulty rating for an opponent (1-5 scale)
 * Falls back to heuristic map if no explicit difficulty provided
 */
export function getOpponentDifficulty(opponentShort: string, explicitDifficulty?: number): number {
  if (explicitDifficulty !== undefined && explicitDifficulty >= 1 && explicitDifficulty <= 5) {
    return explicitDifficulty;
  }
  return TEAM_DIFFICULTY[opponentShort] ?? 3; // default to medium
}

/**
 * Get Tailwind color classes for opponent badge based on difficulty
 */
export function getOpponentBadgeClasses(difficulty: number): string {
  const color = getDifficultyColor(difficulty);
  
  if (color === 'emerald') {
    return 'bg-emerald-500/20 border-emerald-600 text-emerald-400';
  }
  if (color === 'yellow') {
    return 'bg-yellow-500/20 border-yellow-600 text-yellow-400';
  }
  // rose/red
  return 'bg-rose-500/20 border-rose-600 text-rose-400';
}
