'use client';

import { BracketMatch, MatchMeta } from './BracketMatch';
import { CupHeader, Placeholder } from './GoldCupView';
import {
  BracketScores,
  bracketResult,
  Classification,
  QualifiedTeam,
} from '@/lib/standings';

const SILVER_SF_META: MatchMeta[] = [
  { time: 'Sun 11:00 AM', court: 1 },
  { time: 'Sun 11:00 AM', court: 2 },
];
const SILVER_FINAL_META: MatchMeta = { time: 'Sun 1:00 PM', court: 1 };

type Props = {
  classification: Classification;
  bracketScores: BracketScores;
  onChange: (key: string, value: string) => void;
};

export function SilverCupView({ classification, bracketScores, onChange }: Props) {
  if (!classification.complete || classification.goldSeeds.length < 8) {
    return (
      <Placeholder
        tone="silver"
        title="🥈 Silver Cup"
        subtitle="Gold Cup Quarterfinal losers"
        message="The Silver Cup bracket appears after the Gold Cup Quarterfinals are played."
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
  const losers = qf.map((m, i) => bracketResult(bracketScores, 'gold', 'qf', i, m).loser);

  const sf: Array<[QualifiedTeam | null, QualifiedTeam | null]> = [
    [losers[0], losers[1]],
    [losers[2], losers[3]],
  ];
  const sfWinners = sf.map((m, i) =>
    bracketResult(bracketScores, 'silver', 'sf', i, m).winner,
  );
  const final: [QualifiedTeam | null, QualifiedTeam | null] = [sfWinners[0], sfWinners[1]];

  return (
    <div>
      <CupHeader
        tone="silver"
        title="🥈 Silver Cup"
        subtitle="Gold Cup Quarterfinal losers · Semifinals → Final"
      />

      <div className="bracket-scroll -mx-3 overflow-x-auto px-3 pb-4 sm:-mx-4 sm:px-4">
        {/* Round titles */}
        <div className="mb-3 flex min-w-max gap-4 sm:gap-6">
          <div className="w-[280px] text-center font-display text-sm tracking-[0.18em] text-text-dim sm:w-[300px]">Semifinals</div>
          <div className="w-[280px] text-center font-display text-sm tracking-[0.18em] text-text-dim sm:w-[300px]">Final</div>
        </div>

        {/* Nested layout — Final centered between the two SFs */}
        <div className="flex min-w-max items-center gap-4 sm:gap-6">
          <div className="flex flex-col gap-3">
            <BracketMatch cup="silver" round="sf" matchIdx={0} teams={sf[0]} scores={bracketScores} onChange={onChange} format="2-sets" meta={SILVER_SF_META[0]} />
            <BracketMatch cup="silver" round="sf" matchIdx={1} teams={sf[1]} scores={bracketScores} onChange={onChange} format="2-sets" meta={SILVER_SF_META[1]} />
          </div>
          <BracketMatch cup="silver" round="f" matchIdx={0} teams={final} scores={bracketScores} onChange={onChange} format="2-sets" meta={SILVER_FINAL_META} />
        </div>
      </div>
    </div>
  );
}
