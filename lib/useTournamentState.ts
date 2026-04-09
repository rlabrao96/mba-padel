'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GroupMatches, BracketScores } from './standings';

export type TournamentState = {
  rev: number;
  groupMatches: GroupMatches;
  bracketScores: BracketScores;
};

export type SyncStatus = 'connecting' | 'live' | 'offline' | 'local-only';

const LS_KEY = 'adidas_mba_padel_state_v1';
const POLL_MS = 4000;

function loadLocal(): TournamentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TournamentState;
  } catch {
    return null;
  }
}

function saveLocal(state: TournamentState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function useTournamentState() {
  const [state, setState] = useState<TournamentState>(() => {
    return (
      loadLocal() ?? {
        rev: 0,
        groupMatches: {},
        bracketScores: {},
      }
    );
  });
  const [status, setStatus] = useState<SyncStatus>('connecting');
  const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());
  const inflight = useRef(false);
  const localRevRef = useRef<number>(state.rev);

  const fetchState = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw: TournamentState & { persistent?: boolean } = await res.json();
      setStatus(raw.persistent === false ? 'local-only' : 'live');
      setLastUpdated(Date.now());
      const next: TournamentState = {
        rev: raw.rev,
        groupMatches: raw.groupMatches,
        bracketScores: raw.bracketScores,
      };
      if (next.rev >= localRevRef.current) {
        localRevRef.current = next.rev;
        setState(next);
        saveLocal(next);
      }
    } catch {
      setStatus('offline');
    } finally {
      inflight.current = false;
    }
  }, []);

  useEffect(() => {
    fetchState();
    const id = window.setInterval(fetchState, POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchState]);

  const pushUpdate = useCallback(
    async (update: {
      groupMatches?: GroupMatches;
      bracketScores?: BracketScores;
      reset?: boolean;
    }) => {
      // Optimistic local update
      setState((prev) => {
        const next: TournamentState = update.reset
          ? { rev: prev.rev + 1, groupMatches: {}, bracketScores: {} }
          : {
              rev: prev.rev + 1,
              groupMatches: { ...prev.groupMatches, ...(update.groupMatches ?? {}) },
              bracketScores: { ...prev.bracketScores, ...(update.bracketScores ?? {}) },
            };
        localRevRef.current = next.rev;
        saveLocal(next);
        return next;
      });

      try {
        const res = await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw: TournamentState & { persistent?: boolean } = await res.json();
        setStatus(raw.persistent === false ? 'local-only' : 'live');
        setLastUpdated(Date.now());
        const server: TournamentState = {
          rev: raw.rev,
          groupMatches: raw.groupMatches,
          bracketScores: raw.bracketScores,
        };
        if (server.rev >= localRevRef.current) {
          localRevRef.current = server.rev;
          setState(server);
          saveLocal(server);
        }
      } catch {
        setStatus('offline');
      }
    },
    [],
  );

  const updateGroupMatch = useCallback(
    (key: string, field: 's1' | 's2', value: string) => {
      setState((prev) => {
        const current = prev.groupMatches[key] ?? { s1: '', s2: '' };
        const nextMatch = { ...current, [field]: value };
        const nextGm = { ...prev.groupMatches, [key]: nextMatch };
        const next: TournamentState = {
          rev: prev.rev + 1,
          groupMatches: nextGm,
          bracketScores: prev.bracketScores,
        };
        localRevRef.current = next.rev;
        saveLocal(next);
        // Fire network update in background
        void pushUpdate({ groupMatches: { [key]: nextMatch } });
        return next;
      });
    },
    [pushUpdate],
  );

  const updateBracketScore = useCallback(
    (key: string, value: string) => {
      setState((prev) => {
        const nextBs = { ...prev.bracketScores, [key]: value };
        const next: TournamentState = {
          rev: prev.rev + 1,
          groupMatches: prev.groupMatches,
          bracketScores: nextBs,
        };
        localRevRef.current = next.rev;
        saveLocal(next);
        void pushUpdate({ bracketScores: { [key]: value } });
        return next;
      });
    },
    [pushUpdate],
  );

  const resetAll = useCallback(() => {
    void pushUpdate({ reset: true });
  }, [pushUpdate]);

  return {
    state,
    status,
    lastUpdated,
    updateGroupMatch,
    updateBracketScore,
    resetAll,
  };
}
