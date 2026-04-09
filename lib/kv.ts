import Redis from 'ioredis';
import type { GroupMatches, BracketScores } from './standings';

export type TournamentState = {
  rev: number;
  groupMatches: GroupMatches;
  bracketScores: BracketScores;
  persistent: boolean;
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

let memoryState: Omit<TournamentState, 'persistent'> = {
  ...EMPTY_STATE,
  groupMatches: {},
  bracketScores: {},
};

let lastClientError: string | null = null;

function describeEnv(): string {
  const present = [
    ['REDIS_URL', process.env.REDIS_URL],
    ['KV_URL', process.env.KV_URL],
  ]
    .filter(([, v]) => !!v)
    .map(([k, v]) => {
      try {
        const u = new URL(v as string);
        return `${k}=${u.protocol}//***@${u.host}`;
      } catch {
        return `${k}=<unparseable>`;
      }
    });
  return present.length ? present.join(', ') : '<none>';
}

// Cached connect promise. Module-level so warm Vercel instances reuse
// the same connection across invocations.
let connectPromise: Promise<Redis> | null = null;

/**
 * Return a connected Redis client. Uses lazyConnect + explicit await connect()
 * so we never issue commands before the TCP/TLS handshake completes.
 */
async function getConnectedClient(): Promise<Redis | null> {
  const url = process.env.REDIS_URL ?? process.env.KV_URL;
  if (!url) return null;

  if (connectPromise) {
    try {
      return await connectPromise;
    } catch {
      // Previous attempt failed — retry below.
      connectPromise = null;
    }
  }

  connectPromise = (async () => {
    // Trust the URL scheme: redis:// = plain, rediss:// = TLS.
    // ioredis handles rediss:// natively. No manual TLS override needed.
    const client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      connectTimeout: 5_000,
    });

    client.on('error', (err) => {
      lastClientError = err instanceof Error ? err.message : String(err);
      console.error('Redis client error', err);
    });

    await client.connect();
    return client;
  })();

  try {
    return await connectPromise;
  } catch (err) {
    lastClientError = err instanceof Error ? err.message : String(err);
    console.error('Redis connect failed', err);
    connectPromise = null;
    return null;
  }
}

export async function readState(): Promise<TournamentState> {
  const redis = await getConnectedClient();
  if (!redis) {
    return {
      rev: memoryState.rev,
      groupMatches: { ...memoryState.groupMatches },
      bracketScores: { ...memoryState.bracketScores },
      persistent: false,
      _debug: process.env.REDIS_URL || process.env.KV_URL
        ? { reason: 'connect-error', envSeen: describeEnv(), error: lastClientError ?? 'failed to connect' }
        : { reason: 'no-env', envSeen: describeEnv() },
    };
  }
  try {
    const raw = await redis.get(K_STATE);
    if (!raw) {
      return { ...EMPTY_STATE, groupMatches: {}, bracketScores: {}, persistent: true };
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

  const redis = await getConnectedClient();
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
