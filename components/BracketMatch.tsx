'use client';

import { getTeam } from '@/lib/data';
import { BracketScores, QualifiedTeam } from '@/lib/standings';

export type MatchMeta = { time: string; court: number };

/**
 * 'single'  — one score per team (group stage, not used here)
 * '2-sets'  — 2 sets + super tie-break if 1-1
 * '3-sets'  — best of 3 sets (Gold Final only)
 */
export type MatchFormat = '2-sets' | '3-sets';

type Props = {
  cup: 'gold' | 'silver' | 'bronze';
  round: 'qf' | 'sf' | 'f' | '3p';
  matchIdx: number;
  teams: [QualifiedTeam | null, QualifiedTeam | null];
  scores: BracketScores;
  onChange: (key: string, value: string) => void;
  meta?: MatchMeta;
  format: MatchFormat;
};

/** Compute how many sets each team has won and who won the match. */
export function computeSetResult(
  scores: BracketScores,
  prefix: string,
  format: MatchFormat,
): { setsWon: [number, number]; decided: boolean; winnerIdx: 0 | 1 | -1 } {
  let sets: [number, number] = [0, 0];

  for (let s = 1; s <= 3; s++) {
    const v1 = scores[`${prefix}-1-s${s}`] ?? '';
    const v2 = scores[`${prefix}-2-s${s}`] ?? '';
    if (v1 === '' || v2 === '') break;
    const n1 = parseInt(v1, 10);
    const n2 = parseInt(v2, 10);
    if (Number.isNaN(n1) || Number.isNaN(n2)) break;
    if (n1 > n2) sets[0]++;
    else if (n2 > n1) sets[1]++;
  }

  const needed = format === '3-sets' ? 2 : 2;
  // For '2-sets': win 2-0 outright, or 1-1 decided by set 3 (super tie-break)
  // For '3-sets': first to 2 sets
  const decided = sets[0] >= needed || sets[1] >= needed;
  const winnerIdx: 0 | 1 | -1 = decided ? (sets[0] >= needed ? 0 : 1) : -1;

  return { setsWon: sets, decided, winnerIdx };
}

export function BracketMatch({ cup, round, matchIdx, teams, scores, onChange, meta, format }: Props) {
  const prefix = `${cup}-${round}-${matchIdx}`;
  const { setsWon, decided, winnerIdx } = computeSetResult(scores, prefix, format);

  // Determine how many set columns to show
  const set1T1 = scores[`${prefix}-1-s1`] ?? '';
  const set1T2 = scores[`${prefix}-2-s1`] ?? '';
  const set2T1 = scores[`${prefix}-1-s2`] ?? '';
  const set2T2 = scores[`${prefix}-2-s2`] ?? '';
  const set3T1 = scores[`${prefix}-1-s3`] ?? '';
  const set3T2 = scores[`${prefix}-2-s3`] ?? '';

  const set1Filled = set1T1 !== '' && set1T2 !== '';
  const set2Filled = set2T1 !== '' && set2T2 !== '';
  const set3HasData = set3T1 !== '' || set3T2 !== '';

  // Show set 3 column when:
  // - sets are tied 1-1 (user needs to enter the TB / 3rd set), OR
  // - any set 3 score is already present (keep the column visible after
  //   the TB is entered so the result stays visible for the rest of the
  //   tournament)
  const showSet3 =
    set3HasData ||
    (set1Filled && set2Filled && setsWon[0] === 1 && setsWon[1] === 1);

  const setLabels = format === '2-sets'
    ? ['S1', 'S2', ...(showSet3 ? ['TB'] : [])]
    : ['S1', 'S2', ...(showSet3 ? ['S3'] : [])];

  return (
    <div className="w-[280px] overflow-hidden rounded-xl border border-border/70 bg-surface/80 shadow-md shadow-black/30 sm:w-[300px]">
      {meta && (
        <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-surface-2/50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-text-dim sm:px-3 sm:text-[10px]">
          <span>{meta.time}</span>
          <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[9px] text-primary-bright sm:text-[10px]">
            Court {meta.court}
          </span>
        </div>
      )}
      {/* Set column headers */}
      <div className="flex items-center border-b border-border/40 bg-surface-2/30 px-2.5 py-1 sm:px-3">
        <div className="flex-1" />
        <div className="flex gap-1">
          {setLabels.map((label) => (
            <div
              key={label}
              className="w-8 text-center text-[9px] font-semibold uppercase tracking-wider text-text-dim sm:w-9"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      <TeamRow
        team={teams[0]}
        teamNum={1}
        prefix={prefix}
        scores={scores}
        onChange={onChange}
        emphasis={decided ? (winnerIdx === 0 ? 'winner' : 'loser') : 'normal'}
        setCount={setLabels.length}
        isTieBreak={showSet3 && format === '2-sets'}
      />
      <div className="h-px bg-border/60" />
      <TeamRow
        team={teams[1]}
        teamNum={2}
        prefix={prefix}
        scores={scores}
        onChange={onChange}
        emphasis={decided ? (winnerIdx === 1 ? 'winner' : 'loser') : 'normal'}
        setCount={setLabels.length}
        isTieBreak={showSet3 && format === '2-sets'}
      />
    </div>
  );
}

function TeamRow({
  team,
  teamNum,
  prefix,
  scores,
  onChange,
  emphasis,
  setCount,
  isTieBreak,
}: {
  team: QualifiedTeam | null;
  teamNum: 1 | 2;
  prefix: string;
  scores: BracketScores;
  onChange: (key: string, value: string) => void;
  emphasis: 'winner' | 'loser' | 'normal';
  setCount: number;
  isTieBreak: boolean;
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
    <div className={`flex items-center gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-3 sm:py-2.5 ${winnerBg}`}>
      <span
        className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1 font-mono text-[10px] font-bold sm:h-6 sm:min-w-[22px] sm:text-[11px] ${badgeCls}`}
      >
        {team?.seed ? `[${team.seed}]` : t ? `#${t.id}` : '–'}
      </span>
      <div className={`min-w-0 flex-1 text-[12px] leading-tight sm:text-[13px] ${nameCls}`}>
        <div className="truncate font-semibold">{t ? t.short : 'TBD'}</div>
        {t && (
          <div className="text-[9px] uppercase tracking-wider text-text-dim">
            {t.school}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: setCount }, (_, i) => {
          const setNum = i + 1;
          const key = `${prefix}-${teamNum}-s${setNum}`;
          const value = scores[key] ?? '';
          const isLastTB = isTieBreak && setNum === 3;
          return (
            <input
              key={setNum}
              inputMode="numeric"
              type="number"
              min={0}
              max={isLastTB ? 10 : 7}
              value={value}
              disabled={!team}
              onChange={(e) => onChange(key, e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              className="h-7 w-8 rounded border border-border bg-surface-2 text-center text-xs font-bold text-white outline-none focus:border-primary-bright disabled:opacity-40 sm:h-8 sm:w-9 sm:text-sm"
            />
          );
        })}
      </div>
    </div>
  );
}
