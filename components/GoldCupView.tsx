'use client';

import { BracketMatch } from './BracketMatch';
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

  const sfWinners: Array<QualifiedTeam | null> = sf.map((m, i) =>
    bracketResult(bracketScores, 'gold', 'sf', i, m).winner,
  );

  const final: [QualifiedTeam | null, QualifiedTeam | null] = [sfWinners[0], sfWinners[1]];
  const champion = bracketResult(bracketScores, 'gold', 'f', 0, final).winner;

  return (
    <div>
      <CupHeader tone="gold" title="🥇 Gold Cup" subtitle="Top 8 teams · Quarterfinals → Final" />

      {champion && (
        <div className="mb-6 rounded-2xl border border-amber-400/50 bg-amber-400/10 p-5 text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-200">Champion</div>
          <div className="mt-1 font-display text-3xl tracking-wider text-amber-300">
            #{champion.id} · {champion.seed && `Seed ${champion.seed} · `}
          </div>
        </div>
      )}

      <div className="bracket-scroll -mx-4 overflow-x-auto px-4 pb-3">
        <div className="flex items-center gap-8 min-w-max">
          <Round title="Quarterfinals">
            {qf.map((match, i) => (
              <BracketMatch
                key={`qf-${i}`}
                cup="gold"
                round="qf"
                matchIdx={i}
                teams={match}
                scores={bracketScores}
                onChange={onChange}
              />
            ))}
          </Round>

          <Round title="Semifinals">
            {sf.map((match, i) => (
              <BracketMatch
                key={`sf-${i}`}
                cup="gold"
                round="sf"
                matchIdx={i}
                teams={match}
                scores={bracketScores}
                onChange={onChange}
              />
            ))}
          </Round>

          <Round title="Final">
            <BracketMatch
              cup="gold"
              round="f"
              matchIdx={0}
              teams={final}
              scores={bracketScores}
              onChange={onChange}
            />
          </Round>
        </div>
      </div>
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
