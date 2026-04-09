import { createClient } from 'redis';
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

const EMPTY: Omit<TournamentState, 'persistent'> = {
  rev: 0,
  groupMatches: {},
  bracketScores: {},
};

const K = 'tournament:state:v1';

let memoryState = { ...EMPTY, groupMatches: {}, bracketScores: {} };
let lastError: string | null = null;

function describeEnv(): string {
  const url = process.env.REDIS_URL ?? process.env.KV_URL;
  if (!url) return '<none>';
  try {
    const u = new URL(url);
    return `REDIS_URL=${u.protocol}//***@${u.host}`;
  } catch {
    return 'REDIS_URL=<unparseable>';
  }
}

// Exactly the pattern Vercel's docs show for Next.js App Router:
// module-level await createClient().connect()
// Cached across warm serverless invocations.
let clientPromise: ReturnType<typeof createClient> | null = null;

async function getClient(): Promise<ReturnType<typeof createClient> | null> {
  const url = process.env.REDIS_URL ?? process.env.KV_URL;
  if (!url) return null;

  if (clientPromise) {
    try {
      // If already connected, return it. If connection dropped, isReady is false.
      if (clientPromise.isReady) return clientPromise;
      // Try reconnecting
      await clientPromise.connect();
      return clientPromise;
    } catch {
      clientPromise = null;
    }
  }

  try {
    const client = createClient({ url });
    client.on('error', (err) => {
      lastError = err instanceof Error ? err.message : String(err);
      console.error('Redis client error', err);
    });
    await client.connect();
    clientPromise = client;
    return client;
  } catch (err) {
    lastError = err instanceof Error ? err.message : String(err);
    console.error('Redis connect failed', err);
    clientPromise = null;
    return null;
  }
}

export async function readState(): Promise<TournamentState> {
  const redis = await getClient();
  if (!redis) {
    return {
      ...memoryState,
      persistent: false,
      _debug: process.env.REDIS_URL || process.env.KV_URL
        ? { reason: 'connect-error', envSeen: describeEnv(), error: lastError ?? 'failed to connect' }
        : { reason: 'no-env', envSeen: describeEnv() },
    };
  }
  try {
    const raw = await redis.get(K);
    if (!raw) {
      return { ...EMPTY, groupMatches: {}, bracketScores: {}, persistent: true };
    }
    const parsed = JSON.parse(raw);
    return {
      rev: parsed.rev ?? 0,
      groupMatches: parsed.groupMatches ?? {},
      bracketScores: parsed.bracketScores ?? {},
      persistent: true,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Redis read failed', err);
    return {
      ...memoryState,
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
  const base = update.reset
    ? { rev: current.rev + 1, groupMatches: {}, bracketScores: {} }
    : {
        rev: current.rev + 1,
        groupMatches: { ...current.groupMatches, ...(update.groupMatches ?? {}) },
        bracketScores: { ...current.bracketScores, ...(update.bracketScores ?? {}) },
      };

  const redis = await getClient();
  let persistent = false;
  if (redis) {
    try {
      await redis.set(K, JSON.stringify(base));
      persistent = true;
    } catch (err) {
      console.error('Redis write failed', err);
      memoryState = base;
    }
  } else {
    memoryState = base;
  }

  return { ...base, persistent };
}
