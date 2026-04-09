import Redis from 'ioredis';
import type { GroupMatches, BracketScores } from './standings';

export type TournamentState = {
  rev: number;
  groupMatches: GroupMatches;
  bracketScores: BracketScores;
  /** False when the server has no Redis configured and is using a non-persistent in-memory store. */
  persistent: boolean;
  /** Debug info about why persistence is off (only populated in failure cases). */
  _debug?: {
    reason: 'no-env' | 'connect-error' | 'read-error' | 'write-error';
    envSeen?: string;
    error?: string;
  };
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
let lastClientError: string | null = null;

function describeEnv(): string {
  const present = [
    ['REDIS_URL', process.env.REDIS_URL],
    ['KV_URL', process.env.KV_URL],
  ]
    .filter(([, v]) => !!v)
    .map(([k, v]) => {
      // Don't leak credentials: show the scheme and host only.
      try {
        const u = new URL(v as string);
        return `${k}=${u.protocol}//***@${u.host}`;
      } catch {
        return `${k}=<unparseable>`;
      }
    });
  return present.length ? present.join(', ') : '<none>';
}

/**
 * Build / return a cached Redis client. We accept several env-var names so
 * the app "just works" whether the user attached:
 *   - Vercel Redis (native) → REDIS_URL
 *   - Vercel KV (legacy) → KV_URL
 *
 * If the URL's host looks like a managed Redis service (Redis Cloud, Upstash,
 * etc.) and the scheme is plain `redis://` but the provider typically requires
 * TLS, we force TLS on anyway. Most managed Redis providers on public internet
 * require TLS even if the URL uses the non-TLS scheme.
 */
function getClient(): Redis | null {
  const url = process.env.REDIS_URL ?? process.env.KV_URL;
  if (!url) return null;
  if (cachedClient) return cachedClient;

  // Decide whether to force TLS based on the host. Redis Cloud
  // (*.redislabs.com, *.redns.redis-cloud.com) and Upstash endpoints are
  // TLS-only. Localhost is never TLS.
  let parsedHost = '';
  try {
    parsedHost = new URL(url).hostname;
  } catch {
    // leave empty; we'll let ioredis handle the parse error
  }
  const wantsTls =
    url.startsWith('rediss://') ||
    parsedHost.endsWith('.redislabs.com') ||
    parsedHost.endsWith('.redns.redis-cloud.com') ||
    parsedHost.endsWith('.upstash.io');

  try {
    cachedClient = new Redis(url, {
      lazyConnect: false,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      connectTimeout: 5_000,
      ...(wantsTls ? { tls: { rejectUnauthorized: false } } : {}),
    });

    cachedClient.on('error', (err) => {
      lastClientError = err instanceof Error ? err.message : String(err);
      console.error('Redis client error', err);
    });
  } catch (err) {
    lastClientError = err instanceof Error ? err.message : String(err);
    console.error('Redis client construction failed', err);
    cachedClient = null;
  }

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
      _debug: process.env.REDIS_URL || process.env.KV_URL
        ? { reason: 'connect-error', envSeen: describeEnv(), error: lastClientError ?? 'no client instance' }
        : { reason: 'no-env', envSeen: describeEnv() },
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
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Redis read failed, falling back to memory', err);
    return {
      rev: memoryState.rev,
      groupMatches: { ...memoryState.groupMatches },
      bracketScores: { ...memoryState.bracketScores },
      persistent: false,
      _debug: { reason: 'read-error', envSeen: describeEnv(), error: msg },
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
