import Redis from 'ioredis';
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

// Module-level cached client. On Vercel, warm serverless instances reuse this
// across invocations; cold starts pay a single connection setup.
let cachedClient: Redis | null = null;

/**
 * Build / return a cached Redis client. We accept several env-var names so
 * the app "just works" whether the user attached:
 *   - Vercel Redis (native) → REDIS_URL
 *   - Upstash Redis (Marketplace) → UPSTASH_REDIS_REST_URL is for the REST
 *     SDK and NOT supported here; if present we ignore it and the memory
 *     fallback kicks in. Users should instead use REDIS_URL when possible.
 *   - Vercel KV (legacy) → KV_URL
 */
function getClient(): Redis | null {
  const url = process.env.REDIS_URL ?? process.env.KV_URL;
  if (!url) return null;
  if (cachedClient) return cachedClient;

  cachedClient = new Redis(url, {
    lazyConnect: false,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    // Short connection timeout — we'd rather fall through to local state
    // than hang the request for 10+ seconds on a bad config.
    connectTimeout: 5_000,
  });

  cachedClient.on('error', (err) => {
    // Log but don't crash the module — reads/writes will surface the error.
    console.error('Redis client error', err);
  });

  return cachedClient;
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
    const raw = await redis.get(K_STATE);
    if (!raw) {
      return {
        ...EMPTY_STATE,
        groupMatches: {},
        bracketScores: {},
        persistent: true,
      };
    }
    const parsed = JSON.parse(raw) as Omit<TournamentState, 'persistent'>;
    return {
      rev: parsed.rev ?? 0,
      groupMatches: parsed.groupMatches ?? {},
      bracketScores: parsed.bracketScores ?? {},
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
      await redis.set(K_STATE, JSON.stringify(base));
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
