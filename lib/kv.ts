import { Redis } from '@upstash/redis';
import type { GroupMatches, BracketScores } from './standings';

export type TournamentState = {
  rev: number;
  groupMatches: GroupMatches;
  bracketScores: BracketScores;
  /** False when the server has no Redis configured and is using a non-persistent in-memory store. */
  persistent: boolean;
};

const EMPTY_STATE: Omit<TournamentState, 'persistent'> = {
  rev: 0,
  groupMatches: {},
  bracketScores: {},
};

const K_STATE = 'tournament:state:v1';

// In-memory fallback used when Redis env vars are not configured (local dev).
let memoryState: Omit<TournamentState, 'persistent'> = {
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
      persistent: false,
    };
  }
  try {
    const raw = await redis.get<Omit<TournamentState, 'persistent'>>(K_STATE);
    if (!raw) {
      return { ...EMPTY_STATE, groupMatches: {}, bracketScores: {}, persistent: true };
    }
    return {
      rev: raw.rev ?? 0,
      groupMatches: raw.groupMatches ?? {},
      bracketScores: raw.bracketScores ?? {},
      persistent: true,
    };
  } catch (err) {
    console.error('Redis read failed, falling back to memory', err);
    return {
      rev: memoryState.rev,
      groupMatches: { ...memoryState.groupMatches },
      bracketScores: { ...memoryState.bracketScores },
      persistent: false,
    };
  }
}

export async function writeState(update: {
  groupMatches?: GroupMatches;
  bracketScores?: BracketScores;
  reset?: boolean;
}): Promise<TournamentState> {
  const current = await readState();
  const base: Omit<TournamentState, 'persistent'> = update.reset
    ? { rev: current.rev + 1, groupMatches: {}, bracketScores: {} }
    : {
        rev: current.rev + 1,
        groupMatches: { ...current.groupMatches, ...(update.groupMatches ?? {}) },
        bracketScores: { ...current.bracketScores, ...(update.bracketScores ?? {}) },
      };

  const redis = getClient();
  let persistent = false;
  if (redis) {
    try {
      await redis.set(K_STATE, base);
      persistent = true;
    } catch (err) {
      console.error('Redis write failed, falling back to memory', err);
      memoryState = base;
    }
  } else {
    memoryState = base;
  }

  return { ...base, persistent };
}
