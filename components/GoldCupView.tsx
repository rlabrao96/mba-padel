'use client';

import { BracketMatch, MatchMeta } from './BracketMatch';
import { getTeam } from '@/lib/data';

const GOLD_QF_META: MatchMeta[] = [
  { time: 'Sat 7:30 PM', court: 1 }, // 1 vs 8
  { time: 'Sat 7:30 PM', court: 2 }, // 4 vs 5
  { time: 'Sat 7:30 PM', court: 3 }, // 2 vs 7
  { time: 'Sat 7:30 PM', court: 4 }, // 3 vs 6
];
const GOLD_SF_META: MatchMeta[] = [
  { time: 'Sun 12:00 PM', court: 1 },
  { time: 'Sun 12:00 PM', court: 2 },
];
const GOLD_FINAL_META: MatchMeta = { time: 'Sun 2:00 PM', court: 1 };
const GOLD_3P_META: MatchMeta = { time: 'Sun 1:00 PM', court: 2 };
import {
  BracketScores,
  bracketResult,
  Classification,
  QualifiedTeam,
} from '@/lib/standings';

type Props = {
  classification: Classification;
  bracketScores: BracketScores;
  onChange: (key: string, value: string) => void;
};

export function GoldCupView({ classification, bracketScores, onChange }: Props) {
  if (!classification.complete || classification.goldSeeds.length < 8) {
    return (
      <Placeholder
        tone="gold"
        title="🥇 Gold Cup"
        subtitle="Top 8 teams"
        message="Complete all group stage results to see the Gold Cup bracket."
      />
    );
  }

  const seeds = classification.goldSeeds;
  const qf: Array<[QualifiedTeam, QualifiedTeam]> = [
    [seeds[0], seeds[7]],
    [seeds[3], seeds[4]],
    [seeds[1], seeds[6]],
    [seeds[2], seeds[5]],
  ];

  const qfWinners: Array<QualifiedTeam | null> = qf.map(
    (m, i) => bracketResult(bracketScores, 'gold', 'qf', i, m).winner,
  );

  const sf: Array<[QualifiedTeam | null, QualifiedTeam | null]> = [
    [qfWinners[0], qfWinners[1]],
    [qfWinners[2], qfWinners[3]],
  ];

  const sfResults = sf.map((m, i) =>
    bracketResult(bracketScores, 'gold', 'sf', i, m),
  );
  const sfWinners = sfResults.map((r) => r.winner);
  const sfLosers = sfResults.map((r) => r.loser);

  const final: [QualifiedTeam | null, QualifiedTeam | null] = [sfWinners[0], sfWinners[1]];
  const thirdPlace: [QualifiedTeam | null, QualifiedTeam | null] = [sfLosers[0], sfLosers[1]];

  const champion = bracketResult(bracketScores, 'gold', 'f', 0, final).winner;
  const runnerUp = bracketResult(bracketScores, 'gold', 'f', 0, final).loser;
  const thirdPlaceWinner = bracketResult(bracketScores, 'gold', '3p', 0, thirdPlace).winner;

  return (
    <div>
      <CupHeader
        tone="gold"
        title="🥇 Gold Cup"
        subtitle="Top 8 teams · QF → SF → Final + 3rd Place Match"
      />

      {(champion || thirdPlaceWinner) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <PodiumCard
            rank="1st"
            medal="🥇"
            accent="amber"
            team={champion}
          />
          <PodiumCard
            rank="2nd"
            medal="🥈"
            accent="slate"
            team={champion ? runnerUp : null}
          />
          <PodiumCard
            rank="3rd"
            medal="🥉"
            accent="orange"
            team={thirdPlaceWinner}
          />
        </div>
      )}

      {/* Main bracket: QF → SF → Final */}
      <div className="bracket-scroll -mx-3 overflow-x-auto px-3 pb-4 sm:-mx-4 sm:px-4">
        {/* Round titles */}
        <div className="mb-3 flex min-w-max gap-4 sm:gap-6">
          <div className="w-[280px] text-center font-display text-sm tracking-[0.18em] text-text-dim sm:w-[300px]">Quarterfinals</div>
          <div className="w-[280px] text-center font-display text-sm tracking-[0.18em] text-text-dim sm:w-[300px]">Semifinals</div>
          <div className="w-[280px] text-center font-display text-sm tracking-[0.18em] text-text-dim sm:w-[300px]">Final</div>
        </div>

        {/* Nested bracket — each next round is centered between its feeders */}
        <div className="flex min-w-max items-center gap-4 sm:gap-6">
          {/* QF → SF pairs */}
          <div className="flex flex-col gap-8">
            {/* Top half: QF1 + QF2 → SF1 */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex flex-col gap-3">
                <BracketMatch cup="gold" round="qf" matchIdx={0} teams={qf[0]} scores={bracketScores} onChange={onChange} meta={GOLD_QF_META[0]} format="2-sets" />
                <BracketMatch cup="gold" round="qf" matchIdx={1} teams={qf[1]} scores={bracketScores} onChange={onChange} meta={GOLD_QF_META[1]} format="2-sets" />
              </div>
              <BracketMatch cup="gold" round="sf" matchIdx={0} teams={sf[0]} scores={bracketScores} onChange={onChange} meta={GOLD_SF_META[0]} format="2-sets" />
            </div>
            {/* Bottom half: QF3 + QF4 → SF2 */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex flex-col gap-3">
                <BracketMatch cup="gold" round="qf" matchIdx={2} teams={qf[2]} scores={bracketScores} onChange={onChange} meta={GOLD_QF_META[2]} format="2-sets" />
                <BracketMatch cup="gold" round="qf" matchIdx={3} teams={qf[3]} scores={bracketScores} onChange={onChange} meta={GOLD_QF_META[3]} format="2-sets" />
              </div>
              <BracketMatch cup="gold" round="sf" matchIdx={1} teams={sf[1]} scores={bracketScores} onChange={onChange} meta={GOLD_SF_META[1]} format="2-sets" />
            </div>
          </div>

          {/* Final — centered between SF1 and SF2 */}
          <div>
            <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
              🥇 Best of 3
            </div>
            <BracketMatch cup="gold" round="f" matchIdx={0} teams={final} scores={bracketScores} onChange={onChange} meta={GOLD_FINAL_META} format="3-sets" />
          </div>
        </div>
      </div>

      {/* 3rd Place — standalone below the bracket */}
      <div className="mt-6">
        <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-300 sm:text-left">
          🥉 3rd Place Match (SF losers)
        </div>
        <div className="flex justify-center sm:justify-start">
          <BracketMatch cup="gold" round="3p" matchIdx={0} teams={thirdPlace} scores={bracketScores} onChange={onChange} format="2-sets" meta={GOLD_3P_META} />
        </div>
      </div>
    </div>
  );
}

function PodiumCard({
  rank,
  medal,
  accent,
  team,
}: {
  rank: string;
  medal: string;
  accent: 'amber' | 'slate' | 'orange';
  team: QualifiedTeam | null;
}) {
  const accentCls =
    accent === 'amber'
      ? 'border-amber-400/50 bg-amber-400/10 text-amber-200'
      : accent === 'slate'
        ? 'border-slate-300/40 bg-slate-300/10 text-slate-200'
        : 'border-orange-500/40 bg-orange-500/10 text-orange-200';
  const info = team ? getTeam(team.id) : null;
  return (
    <div className={`rounded-2xl border p-4 text-center ${accentCls}`}>
      <div className="text-[10px] uppercase tracking-[0.18em]">{rank}</div>
      <div className="mt-1 font-display text-xl tracking-wider">
        {medal} {info ? info.short : 'TBD'}
      </div>
      {info && (
        <div className="mt-0.5 text-[10px] text-text-dim">
          #{info.id} · {info.school}
          {team?.seed ? ` · Seed ${team.seed}` : ''}
        </div>
      )}
    </div>
  );
}

export function Round({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center font-display text-sm tracking-[0.18em] text-text-dim">
        {title}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

export function CupHeader({
  tone,
  title,
  subtitle,
}: {
  tone: 'gold' | 'silver' | 'bronze';
  title: string;
  subtitle: string;
}) {
  const classes =
    tone === 'gold'
      ? 'from-amber-400/20 to-amber-400/5 border-amber-400/40 text-amber-300'
      : tone === 'silver'
        ? 'from-slate-300/20 to-slate-300/5 border-slate-300/30 text-slate-200'
        : 'from-orange-600/20 to-orange-600/5 border-orange-500/40 text-orange-300';

  return (
    <div className={`mb-6 rounded-2xl border bg-gradient-to-br ${classes} px-5 py-6 text-center`}>
      <div className={`font-display text-3xl tracking-[0.22em] sm:text-4xl`}>{title}</div>
      <div className="mt-1 text-xs text-text-dim sm:text-sm">{subtitle}</div>
    </div>
  );
}

export function Placeholder({
  tone,
  title,
  subtitle,
  message,
}: {
  tone: 'gold' | 'silver' | 'bronze';
  title: string;
  subtitle: string;
  message: string;
}) {
  return (
    <div>
      <CupHeader tone={tone} title={title} subtitle={subtitle} />
      <p className="text-center text-sm text-text-dim">{message}</p>
    </div>
  );
}
