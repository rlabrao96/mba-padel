import { Redis } from '@upstash/redis';
import type { GroupMatches, BracketScores } from './standings';

export type TournamentState = {
  rev: number;
  groupMatches: GroupMatches;
  bracketScores: BracketScores;
};

const EMPTY_STATE: TournamentState = {
  rev: 0,
  groupMatches: {},
  bracketScores: {},
};

const K_STATE = 'tournament:state:v1';

// In-memory fallback used when Redis env vars are not configured (local dev).
let memoryState: TournamentState = {
  ...EMPTY_STATE,
  groupMatches: {},
  bracketScores: {},
};

/**
 * Build a Redis client from whichever env-var pair is available:
 *   - Vercel Marketplace Upstash integration injects UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *   - The older Vercel KV integration injects KV_REST_API_URL / KV_REST_API_TOKEN
 * We support both so it "just works" whichever path the user took in the Vercel dashboard.
 */
function getClient(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function readState(): Promise<TournamentState> {
  const redis = getClient();
  if (!redis) {
    return {
      rev: memoryState.rev,
      groupMatches: { ...memoryState.groupMatches },
      bracketScores: { ...memoryState.bracketScores },
    };
  }
  try {
    const raw = await redis.get<TournamentState>(K_STATE);
    if (!raw) {
      return { ...EMPTY_STATE, groupMatches: {}, bracketScores: {} };
    }
    return {
      rev: raw.rev ?? 0,
      groupMatches: raw.groupMatches ?? {},
      bracketScores: raw.bracketScores ?? {},
    };
  } catch (err) {
    console.error('Redis read failed, falling back to memory', err);
    return {
      rev: memoryState.rev,
      groupMatches: { ...memoryState.groupMatches },
      bracketScores: { ...memoryState.bracketScores },
    };
  }
}

export async function writeState(update: {
  groupMatches?: GroupMatches;
  bracketScores?: BracketScores;
  reset?: boolean;
}): Promise<TournamentState> {
  const current = await readState();
  let next: TournamentState;

  if (update.reset) {
    next = { rev: current.rev + 1, groupMatches: {}, bracketScores: {} };
  } else {
    next = {
      rev: current.rev + 1,
      groupMatches: { ...current.groupMatches, ...(update.groupMatches ?? {}) },
      bracketScores: { ...current.bracketScores, ...(update.bracketScores ?? {}) },
    };
  }

  const redis = getClient();
  if (redis) {
    try {
      await redis.set(K_STATE, next);
    } catch (err) {
      console.error('Redis write failed, falling back to memory', err);
      memoryState = next;
    }
  } else {
    memoryState = next;
  }

  return next;
}
