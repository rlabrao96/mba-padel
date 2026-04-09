'use client';

import { SyncStatus } from '@/lib/useTournamentState';
import { useEffect, useState } from 'react';

type Props = {
  status: SyncStatus;
  lastUpdated: number;
};

export function Header({ status, lastUpdated }: Props) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const secondsAgo = Math.max(0, Math.round((now - lastUpdated) / 1000));
  const dotClass =
    status === 'live'
      ? 'bg-emerald-400 animate-pulse-slow'
      : status === 'offline'
        ? 'bg-amber-400'
        : 'bg-slate-400';
  const label =
    status === 'live'
      ? `Live · updated ${secondsAgo}s ago`
      : status === 'offline'
        ? 'Offline · retrying'
        : 'Connecting…';

  return (
    <header className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-surface to-bg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(26,140,255,0.12),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-4 sm:py-8">
        {/* Mobile (stacked, centered) */}
        <div className="flex flex-col items-center gap-3 text-center sm:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.squarespace-cdn.com/content/v1/6768de4972535a39d2be8adc/32669540-232c-43ef-a227-616a6147c41f/Horizontal+Logo+PadelHub_blue.png"
            alt="PadelHub USA"
            className="h-6 w-auto brightness-0 invert"
          />
          <div>
            <h1 className="font-display text-[22px] leading-[1.05] tracking-[0.12em] text-white">
              ADIDAS MBA
              <br />
              PADEL TOURNAMENT
            </h1>
            <div className="mt-1.5 text-[10px] leading-snug text-text-dim">
              PadelHub USA · Boston, MA
              <br />
              April 11–12, 2026
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/70 px-2.5 py-1 text-[10px] font-medium text-text-dim backdrop-blur">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} />
            {label}
          </div>
        </div>

        {/* Tablet / desktop (horizontal) */}
        <div className="hidden items-center justify-between gap-6 sm:flex">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.squarespace-cdn.com/content/v1/6768de4972535a39d2be8adc/32669540-232c-43ef-a227-616a6147c41f/Horizontal+Logo+PadelHub_blue.png"
              alt="PadelHub USA"
              className="h-10 w-auto brightness-0 invert md:h-11"
            />
            <div className="h-8 w-px bg-border/80" />
            <div>
              <h1 className="font-display text-3xl leading-none tracking-[0.18em] text-white md:text-4xl">
                ADIDAS MBA PADEL TOURNAMENT
              </h1>
              <div className="mt-1 text-sm text-text-dim">
                Hosted at PadelHub USA · Boston, MA · April 11–12, 2026
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-surface/70 px-3 py-1.5 text-xs font-medium text-text-dim backdrop-blur">
            <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
            {label}
          </div>
        </div>
      </div>
    </header>
  );
}
