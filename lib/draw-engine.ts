// Draw engine logic

export interface DrawEntry {
  user_id: string;
  scores: number[];
}

/**
 * Generate 5 random draw numbers between 1 and 45
 */
export function generateRandomDraw(): number[] {
  const numbers: number[] = [];
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return numbers.sort((a, b) => a - b);
}

/**
 * Generate 5 algorithmic draw numbers weighted by score frequency across all entries.
 * Numbers appearing MORE often in user scores are MORE likely to be drawn
 * (attracts more winners = more engagement)
 */
export function generateAlgorithmicDraw(entries: DrawEntry[]): number[] {
  const freq: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) freq[i] = 1; // baseline weight

  entries.forEach(({ scores }) => {
    scores.forEach((s) => {
      if (s >= 1 && s <= 45) freq[s] = (freq[s] || 1) + 3;
    });
  });

  // Weighted random selection without replacement
  const selected: number[] = [];
  const pool = Object.entries(freq).flatMap(([num, weight]) =>
    Array(weight).fill(Number(num))
  );

  const available = new Set(pool);

  while (selected.length < 5) {
    const poolArr = [...available];
    const pick = poolArr[Math.floor(Math.random() * poolArr.length)];
    if (!selected.includes(pick)) {
      selected.push(pick);
      // Remove all instances of pick from pool
      for (const v of [...available]) {
        if (v === pick) available.delete(v);
      }
    }
  }

  return selected.sort((a, b) => a - b);
}

/**
 * Count how many of a user's scores match the drawn numbers
 */
export function countMatches(userScores: number[], drawNumbers: number[]): number {
  const drawSet = new Set(drawNumbers);
  return userScores.filter((s) => drawSet.has(s)).length;
}

/**
 * Determine match tier (3, 4, or 5 match)
 */
export function getMatchTier(matchCount: number): 3 | 4 | 5 | null {
  if (matchCount >= 5) return 5;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 3;
  return null;
}

/**
 * Calculate prize pool tiers from total pool
 */
export function calculatePrizeTiers(
  totalPool: number,
  jackpotCarryover: number = 0
): { tier5: number; tier4: number; tier3: number } {
  return {
    tier5: totalPool * 0.4 + jackpotCarryover,
    tier4: totalPool * 0.35,
    tier3: totalPool * 0.25,
  };
}

/**
 * Calculate total pool from subscriber count + plan prices
 */
export function calculateTotalPool(
  monthlyCount: number,
  yearlyCount: number,
  monthlyPrice: number = 9.99,
  yearlyMonthlyPrice: number = 7.99,
  poolPct: number = 0.5
): number {
  const total =
    monthlyCount * monthlyPrice + yearlyCount * yearlyMonthlyPrice;
  return Math.round(total * poolPct * 100) / 100;
}

/**
 * Process all draw entries and return winners grouped by tier
 */
export function processDrawResults(
  entries: DrawEntry[],
  drawNumbers: number[]
): {
  tier5: DrawEntry[];
  tier4: DrawEntry[];
  tier3: DrawEntry[];
  allMatches: { user_id: string; match_count: number; tier: 3 | 4 | 5 | null }[];
} {
  const allMatches = entries.map((entry) => {
    const match_count = countMatches(entry.scores, drawNumbers);
    const tier = getMatchTier(match_count);
    return { user_id: entry.user_id, match_count, tier };
  });

  return {
    tier5: entries.filter((_, i) => allMatches[i].tier === 5),
    tier4: entries.filter((_, i) => allMatches[i].tier === 4),
    tier3: entries.filter((_, i) => allMatches[i].tier === 3),
    allMatches,
  };
}
