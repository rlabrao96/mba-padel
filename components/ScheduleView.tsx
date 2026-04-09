'use client';

import { GROUPS, GROUP_ROUNDS, getTeam } from '@/lib/data';

/**
 * Build the Saturday group-stage slot schedule.
 *
 * 4 courts per slot. We interleave rounds across groups so that no team plays
 * two consecutive matches. Pattern (court A/B/C/D):
 *   2:00 PM — G1 R1 × 2,  G2 R1 × 2
 *   3:00 PM — G3 R1 × 2,  G1 R2 × 2
 *   4:00 PM — G2 R2 × 2,  G3 R2 × 2
 *   5:00 PM — G1 R3 × 2,  G2 R3 × 2
 *   6:00 PM — G3 R3 × 2,  rest × 2
 */
type SlotMatch = {
  court: number;
  group: string;
  tint: 'blue' | 'gold' | 'silver' | 'bronze';
  label: string;
};
type Slot = { time: string; matches: SlotMatch[] };

function groupRoundMatches(gi: number, roundIdx: number): SlotMatch[] {
  const teamIds = GROUPS[gi].teamIds;
  const round = GROUP_ROUNDS[roundIdx];
  return round.map(([i, j]) => {
    const a = getTeam(teamIds[i]);
    const b = getTeam(teamIds[j]);
    return {
      court: 0, // filled later
      group: `Group ${gi + 1}`,
      tint: 'blue' as const,
      label: `#${a.id} ${a.short} vs ${b.short} #${b.id}`,
    };
  });
}

function assignCourts(matches: SlotMatch[]): SlotMatch[] {
  return matches.map((m, idx) => ({ ...m, court: idx + 1 }));
}

const SATURDAY: Slot[] = [
  {
    time: '2:00 PM',
    matches: assignCourts([...groupRoundMatches(0, 0), ...groupRoundMatches(1, 0)]),
  },
  {
    time: '3:00 PM',
    matches: assignCourts([...groupRoundMatches(2, 0), ...groupRoundMatches(0, 1)]),
  },
  {
    time: '4:00 PM',
    matches: assignCourts([...groupRoundMatches(1, 1), ...groupRoundMatches(2, 1)]),
  },
  {
    time: '5:00 PM',
    matches: assignCourts([...groupRoundMatches(0, 2), ...groupRoundMatches(1, 2)]),
  },
  {
    time: '6:00 PM',
    matches: assignCourts(groupRoundMatches(2, 2)),
  },
];

const SATURDAY_KNOCKOUT: Slot[] = [
  {
    time: '7:00 PM',
    matches: [
      {
        court: 0,
        group: 'Calculation',
        tint: 'blue',
        label: 'Classifications + Seeding',
      },
    ],
  },
  {
    time: '7:30 PM',
    matches: [
      { court: 1, group: 'Gold QF', tint: 'gold', label: 'Seed 1 vs Seed 8' },
      { court: 2, group: 'Gold QF', tint: 'gold', label: 'Seed 4 vs Seed 5' },
      { court: 3, group: 'Gold QF', tint: 'gold', label: 'Seed 2 vs Seed 7' },
      { court: 4, group: 'Gold QF', tint: 'gold', label: 'Seed 3 vs Seed 6' },
    ],
  },
  {
    time: '8:30 PM',
    matches: [
      { court: 1, group: 'Bronze SF', tint: 'bronze', label: 'Semifinal 1' },
      { court: 2, group: 'Bronze SF', tint: 'bronze', label: 'Semifinal 2' },
    ],
  },
];

const SUNDAY: Slot[] = [
  {
    time: '11:00 AM',
    matches: [
      { court: 1, group: 'Gold SF',   tint: 'gold',   label: 'W(1v8) vs W(4v5)' },
      { court: 2, group: 'Gold SF',   tint: 'gold',   label: 'W(2v7) vs W(3v6)' },
      { court: 3, group: 'Silver SF', tint: 'silver', label: 'L(1v8) vs L(4v5)' },
      { court: 4, group: 'Silver SF', tint: 'silver', label: 'L(2v7) vs L(3v6)' },
    ],
  },
  {
    time: '12:00 PM',
    matches: [{ court: 1, group: 'Bronze Final', tint: 'bronze', label: '🏆 Final' }],
  },
  {
    time: '1:00 PM',
    matches: [
      { court: 1, group: 'Silver Final', tint: 'silver', label: '🏆 Final' },
      { court: 2, group: 'Gold 3rd Place', tint: 'gold', label: '🥉 3rd Place Match' },
    ],
  },
  {
    time: '2:00 PM',
    matches: [{ court: 1, group: 'Gold Grand Final', tint: 'gold', label: '🏆 GRAND FINAL' }],
  },
];

function tintClasses(tint: SlotMatch['tint']) {
  switch (tint) {
    case 'gold':
      return 'border-amber-400/40 bg-amber-400/10';
    case 'silver':
      return 'border-slate-300/30 bg-slate-300/10';
    case 'bronze':
      return 'border-orange-600/40 bg-orange-600/10';
    default:
      return 'border-primary/40 bg-primary/10';
  }
}

function SlotRow({ slot }: { slot: Slot }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-3 border-b border-border/30 py-3 last:border-b-0">
      <div className="text-sm font-bold text-primary-bright">{slot.time}</div>
      <div className="flex flex-wrap gap-2">
        {slot.matches.map((m, i) => (
          <div
            key={i}
            className={`min-w-[180px] rounded-lg border px-3 py-2 text-xs ${tintClasses(m.tint)}`}
          >
            <div className="text-[10px] uppercase tracking-wider text-text-dim">
              {m.court > 0 ? `Court ${m.court} · ${m.group}` : m.group}
            </div>
            <div className="mt-0.5 text-sm font-medium text-white">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScheduleView() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-3 border-b border-border/60 pb-2 font-display text-2xl tracking-[0.18em] text-primary-bright">
          Saturday April 11 · Groups + Knockouts
        </h2>
        {SATURDAY.map((s, i) => (
          <SlotRow key={`sat-${i}`} slot={s} />
        ))}
        {SATURDAY_KNOCKOUT.map((s, i) => (
          <SlotRow key={`sat-ko-${i}`} slot={s} />
        ))}
      </section>

      <section>
        <h2 className="mb-3 border-b border-border/60 pb-2 font-display text-2xl tracking-[0.18em] text-primary-bright">
          Sunday April 12 · Semifinals + Finals
        </h2>
        {SUNDAY.map((s, i) => (
          <SlotRow key={`sun-${i}`} slot={s} />
        ))}
      </section>
    </div>
  );
}
