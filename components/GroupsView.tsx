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
              <div className="flex items-center justify-between border-b border-border/60 bg-surface-2/70 px-5 py-3">
                <div className="font-display text-xl tracking-[0.18em] text-white">
                  {g.name}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {schools.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-medium text-text-dim"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    {['#', 'Team', 'W', 'L', 'GF', 'GA', 'Diff'].map((h) => (
                      <th
                        key={h}
                        className="border-b border-border/60 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-dim"
                      >
                        {h}
                      </th>
                    ))}
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
                        <td className="px-4 py-3 align-middle">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${badgeCls}`}>
                            {pos + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded bg-surface-2/80 px-1 font-mono text-[10px] font-bold text-text-dim">
                              #{t.id}
                            </span>
                            <div className="leading-tight">
                              <div className="text-sm font-semibold text-white">{t.short}</div>
                              <div className="text-[10px] uppercase tracking-wider text-text-dim">
                                {t.school}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle text-sm font-semibold text-white">{s.w}</td>
                        <td className="px-4 py-3 align-middle text-sm text-text-dim">{s.l}</td>
                        <td className="px-4 py-3 align-middle text-sm text-white">{s.gf}</td>
                        <td className="px-4 py-3 align-middle text-sm text-text-dim">{s.ga}</td>
                        <td className="px-4 py-3 align-middle text-sm font-semibold text-white">
                          {diff > 0 ? '+' : ''}
                          {diff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="border-t border-border/50 px-5 py-4">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-dim">
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
                          className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border/20 py-2 last:border-b-0"
                        >
                          <div
                            className={`flex items-center justify-end gap-2 text-right text-sm ${
                              decided ? (leftWinner ? 'text-white' : 'text-text-dim') : 'text-white'
                            }`}
                          >
                            <span className="flex-1 truncate font-medium">{ta.short}</span>
                            <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded bg-surface-2/80 px-1 font-mono text-[10px] font-bold text-text-dim">
                              #{ta.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              inputMode="numeric"
                              type="number"
                              min={0}
                              max={8}
                              value={m.s1}
                              onChange={(e) => onScoreChange(key, 's1', e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                              className="h-9 w-10 rounded-md border border-border bg-surface-2 text-center text-sm font-bold text-white outline-none focus:border-primary-bright"
                            />
                            <span className="text-text-dim">–</span>
                            <input
                              inputMode="numeric"
                              type="number"
                              min={0}
                              max={8}
                              value={m.s2}
                              onChange={(e) => onScoreChange(key, 's2', e.target.value)}
                              onFocus={(e) => e.currentTarget.select()}
                              className="h-9 w-10 rounded-md border border-border bg-surface-2 text-center text-sm font-bold text-white outline-none focus:border-primary-bright"
                            />
                          </div>
                          <div
                            className={`flex items-center gap-2 text-sm ${
                              decided ? (rightWinner ? 'text-white' : 'text-text-dim') : 'text-white'
                            }`}
                          >
                            <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded bg-surface-2/80 px-1 font-mono text-[10px] font-bold text-text-dim">
                              #{tb.id}
                            </span>
                            <span className="flex-1 truncate font-medium">{tb.short}</span>
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
