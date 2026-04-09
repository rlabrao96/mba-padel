'use client';

import { SyncStatus } from '@/lib/useTournamentState';

export function StorageWarning({ status }: { status: SyncStatus }) {
  if (status !== 'local-only') return null;
  return (
    <div className="border-b border-red-500/40 bg-red-500/15">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 text-xs text-red-100 sm:text-sm">
        <span className="text-base leading-none">⚠️</span>
        <div className="flex-1 leading-relaxed">
          <strong className="font-semibold text-red-200">
            No shared storage configured.
          </strong>{' '}
          Scores you enter here will NOT appear on other devices. To fix, open
          the Vercel dashboard → Storage → create an <em>Upstash Redis</em>{' '}
          database (free tier) and then redeploy this project.
        </div>
      </div>
    </div>
  );
}
