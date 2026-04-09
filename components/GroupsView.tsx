'use client';

import { GROUPS, getTeam, matchKey } from '@/lib/data';
import { calcStandings, GroupMatches } from '@/lib/standings';

type Props = {
  groupMatches: GroupMatches;
  onScoreChange: (key: string, field: 's1' | 's2', value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
};

export function GroupsView({ groupMatches, onScoreChange, onCalculate, onReset }: Props) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCalculate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-primary-bright active:translate-y-[1px]"
        >
          Calculate classifications
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-border/80 bg-surface/60 px-4 py-2 text-sm font-semibold text-text-dim transition hover:border-border hover:text-white"
        >
          Reset all
        </button>
      </div>

      <div className="space-y-5">
        {GROUPS.map((g, gi) => {
          const standings = calcStandings(gi, groupMatches);
          const schools = Array.from(
            new Set(g.teamIds.map((id) => getTeam(id).school)),
          );

          return (
            <div
              key={gi}
              className="overflow-hidden rounded-2xl border border-border/60 bg-surface/70 shadow-lg shadow-black/20"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-surface-2/70 px-3 py-2.5 sm:px-5 sm:py-3">
                <div className="font-display text-lg tracking-[0.18em] text-white sm:text-xl">
                  {g.name}
                </div>
                <div className="flex flex-wrap justify-end gap-1 sm:gap-1.5">
                  {schools.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text-dim sm:px-2.5 sm:text-[10px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="border-b border-border/60 px-2 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-text-dim sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.12em]">
                      #
                    </th>
                    <th className="border-b border-border/60 px-2 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-text-dim sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.12em]">
                      Team
                    </th>
                    <th className="border-b border-border/60 px-1.5 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.08em] text-text-dim sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.12em] sm:text-left">
                      W
                    </th>
                    <th className="border-b border-border/60 px-1.5 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.08em] text-text-dim sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.12em] sm:text-left">
                      L
                    </th>
                    <th className="hidden border-b border-border/60 px-2 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-text-dim sm:table-cell sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.12em]">
                      GF
                    </th>
                    <th className="hidden border-b border-border/60 px-2 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-text-dim sm:table-cell sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.12em]">
                      GA
                    </th>
                    <th className="border-b border-border/60 px-2 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.08em] text-text-dim sm:px-4 sm:py-2.5 sm:text-[10px] sm:tracking-[0.12em] sm:text-left">
                      Diff
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, pos) => {
                    const t = getTeam(s.id);
                    const diff = s.gf - s.ga;
                    const rowCls =
                      pos < 2
                        ? 'bg-primary/10'
                        : pos === 2
                          ? 'bg-amber-500/5'
                          : '';
                    const badgeCls =
                      pos === 0
                        ? 'bg-primary text-white'
                        : pos === 1
                          ? 'bg-primary/70 text-white'
                          : pos === 2
                            ? 'bg-amber-500/40 text-amber-100'
                            : 'bg-surface-2 text-text-dim';
                    return (
                      <tr key={s.id} className={`${rowCls} border-b border-border/30 last:border-b-0`}>
                        <td className="px-2 py-2.5 align-middle sm:px-4 sm:py-3">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${badgeCls}`}>
                            {pos + 1}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 align-middle sm:px-4 sm:py-3">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded bg-surface-2/80 px-1 font-mono text-[10px] font-bold text-text-dim">
                              #{t.id}
                            </span>
                            <div className="min-w-0 leading-tight">
                              <div className="truncate text-[13px] font-semibold text-white sm:text-sm">
                                {t.short}
                              </div>
                              <div className="text-[9px] uppercase tracking-wider text-text-dim sm:text-[10px]">
                                {t.school}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-1.5 py-2.5 text-center align-middle text-sm font-semibold text-white sm:px-4 sm:py-3 sm:text-left">
                          {s.w}
                        </td>
                        <td className="px-1.5 py-2.5 text-center align-middle text-sm text-text-dim sm:px-4 sm:py-3 sm:text-left">
                          {s.l}
                        </td>
                        <td className="hidden px-2 py-2.5 align-middle text-sm text-white sm:table-cell sm:px-4 sm:py-3">
                          {s.gf}
                        </td>
                        <td className="hidden px-2 py-2.5 align-middle text-sm text-text-dim sm:table-cell sm:px-4 sm:py-3">
                          {s.ga}
                        </td>
                        <td className="px-2 py-2.5 text-center align-middle text-sm font-semibold text-white sm:px-4 sm:py-3 sm:text-left">
                          {diff > 0 ? '+' : ''}
                          {diff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="border-t border-border/50 px-3 py-3 sm:px-5 sm:py-4">
                <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim sm:mb-3">
                  Matches
                </div>
                <div className="space-y-1">
                  {g.teamIds.flatMap((_, i) =>
                    g.teamIds.slice(i + 1).map((_, jOffset) => {
                      const j = i + 1 + jOffset;
                      const a = g.teamIds[i];
                      const b = g.teamIds[j];
                      const key = matchKey(gi, a, b);
                      const m = groupMatches[key] ?? { s1: '', s2: '' };
                      const ta = getTeam(a);
                      const tb = getTeam(b);
                      const s1 = m.s1 !== '' ? parseInt(m.s1, 10) : NaN;
                      const s2 = m.s2 !== '' ? parseInt(m.s2, 10) : NaN;
                      const decided = !Number.isNaN(s1) && !Number.isNaN(s2);
                      const leftWinner = decided && s1 > s2;
                      const rightWinner = decided && s2 > s1;

                      return (
                        <div
                          key={key}
                          className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 border-b border-border/20 py-2 last:border-b-0 sm:gap-3"
                        >
                          <div
                            className={`flex items-center justify-end gap-1 text-right sm:gap-2 ${
                              decided ? (leftWinner ? 'text-white' : 'text-text-dim') : 'text-white'
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate text-[13px] font-medium sm:text-sm">{ta.short}</span>
                            <span className="hidden min-w-[22px] items-center justify-center rounded bg-surface-2/80 px-1 font-mono text-[10px] font-bold text-text-dim sm:inline-flex">
                              #{ta.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <input
                              inputMode="numeric"
                              type="number"
                              min={0}
                              max={8}
                              value={m.s1}
                              onChange={(e) => onScoreChange(key, 's1', e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                              className="h-8 w-9 rounded-md border border-border bg-surface-2 text-center text-sm font-bold text-white outline-none focus:border-primary-bright sm:h-9 sm:w-10"
                            />
                            <span className="text-xs text-text-dim sm:text-base">–</span>
                            <input
                              inputMode="numeric"
                              type="number"
                              min={0}
                              max={8}
                              value={m.s2}
                              onChange={(e) => onScoreChange(key, 's2', e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                              className="h-8 w-9 rounded-md border border-border bg-surface-2 text-center text-sm font-bold text-white outline-none focus:border-primary-bright sm:h-9 sm:w-10"
                            />
                          </div>
                          <div
                            className={`flex items-center gap-1 sm:gap-2 ${
                              decided ? (rightWinner ? 'text-white' : 'text-text-dim') : 'text-white'
                            }`}
                          >
                            <span className="hidden min-w-[22px] items-center justify-center rounded bg-surface-2/80 px-1 font-mono text-[10px] font-bold text-text-dim sm:inline-flex">
                              #{tb.id}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[13px] font-medium sm:text-sm">{tb.short}</span>
                          </div>
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
