'use client';

import { getTeam } from '@/lib/data';
import { BracketScores, QualifiedTeam } from '@/lib/standings';

type Props = {
  cup: 'gold' | 'silver' | 'bronze';
  round: 'qf' | 'sf' | 'f' | '3p';
  matchIdx: number;
  teams: [QualifiedTeam | null, QualifiedTeam | null];
  scores: BracketScores;
  onChange: (key: string, value: string) => void;
};

export function BracketMatch({ cup, round, matchIdx, teams, scores, onChange }: Props) {
  const k1 = `${cup}-${round}-${matchIdx}-1`;
  const k2 = `${cup}-${round}-${matchIdx}-2`;
  const v1 = scores[k1] ?? '';
  const v2 = scores[k2] ?? '';
  const s1 = v1 !== '' ? parseInt(v1, 10) : NaN;
  const s2 = v2 !== '' ? parseInt(v2, 10) : NaN;
  const decided = !Number.isNaN(s1) && !Number.isNaN(s2) && s1 !== s2;
  const topWinner = decided && s1 > s2;
  const botWinner = decided && s2 > s1;

  return (
    <div className="min-w-[240px] overflow-hidden rounded-xl border border-border/70 bg-surface/80 shadow-md shadow-black/30">
      <Row
        team={teams[0]}
        emphasis={topWinner ? 'winner' : decided ? 'loser' : 'normal'}
        value={v1}
        onChange={(v) => onChange(k1, v)}
      />
      <div className="h-px bg-border/60" />
      <Row
        team={teams[1]}
        emphasis={botWinner ? 'winner' : decided ? 'loser' : 'normal'}
        value={v2}
        onChange={(v) => onChange(k2, v)}
      />
    </div>
  );
}

function Row({
  team,
  emphasis,
  value,
  onChange,
}: {
  team: QualifiedTeam | null;
  emphasis: 'winner' | 'loser' | 'normal';
  value: string;
  onChange: (v: string) => void;
}) {
  const t = team ? getTeam(team.id) : null;
  const winnerBg = emphasis === 'winner' ? 'bg-primary/15' : '';
  const nameCls =
    emphasis === 'winner'
      ? 'text-white font-bold'
      : emphasis === 'loser'
        ? 'text-text-dim'
        : 'text-white';
  const badgeCls =
    emphasis === 'winner'
      ? 'bg-primary text-white'
      : 'bg-surface-2 text-text-dim';

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 ${winnerBg}`}>
      <span
        className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-md px-1.5 font-mono text-[11px] font-bold ${badgeCls}`}
      >
        {team?.seed ? `[${team.seed}]` : t ? `#${t.id}` : '–'}
      </span>
      <div className={`flex-1 text-sm leading-tight ${nameCls}`}>
        <div className="font-semibold">{t ? t.short : 'TBD'}</div>
        {t && <div className="text-[10px] uppercase tracking-wider text-text-dim">{t.school}</div>}
      </div>
      <input
        inputMode="numeric"
        type="number"
        min={0}
        max={8}
        value={value}
        disabled={!team}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        className="h-8 w-10 rounded-md border border-border bg-surface-2 text-center text-sm font-bold text-white outline-none focus:border-primary-bright disabled:opacity-40"
      />
    </div>
  );
}
