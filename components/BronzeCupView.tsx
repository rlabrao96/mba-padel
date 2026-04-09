'use client';

import { BracketMatch, MatchMeta } from './BracketMatch';
import { CupHeader, Placeholder } from './GoldCupView';
import {
  BracketScores,
  bracketResult,
  Classification,
  QualifiedTeam,
} from '@/lib/standings';

const BRONZE_SF_META: MatchMeta[] = [
  { time: 'Sat 8:30 PM', court: 1 },
  { time: 'Sat 8:30 PM', court: 2 },
];
const BRONZE_FINAL_META: MatchMeta = { time: 'Sun 11:00 AM', court: 3 };

type Props = {
  classification: Classification;
  bracketScores: BracketScores;
  onChange: (key: string, value: string) => void;
};

export function BronzeCupView({ classification, bracketScores, onChange }: Props) {
  if (!classification.complete || classification.bronzeTeams.length < 4) {
    return (
      <Placeholder
        tone="bronze"
        title="🥉 Bronze Cup"
        subtitle="Non-qualified teams"
        message="Complete all group stage results to see the Bronze Cup bracket."
      />
    );
  }

  const teams = classification.bronzeTeams;
  const sf: Array<[QualifiedTeam, QualifiedTeam]> = [
    [teams[0], teams[3]],
    [teams[1], teams[2]],
  ];
  const sfWinners = sf.map((m, i) =>
    bracketResult(bracketScores, 'bronze', 'sf', i, m).winner,
  );
  const final: [QualifiedTeam | null, QualifiedTeam | null] = [sfWinners[0], sfWinners[1]];

  return (
    <div>
      <CupHeader
        tone="bronze"
        title="🥉 Bronze Cup"
        subtitle="Non-qualified teams · Semifinals → Final"
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
            <BracketMatch cup="bronze" round="sf" matchIdx={0} teams={sf[0]} scores={bracketScores} onChange={onChange} format="2-sets" meta={BRONZE_SF_META[0]} />
            <BracketMatch cup="bronze" round="sf" matchIdx={1} teams={sf[1]} scores={bracketScores} onChange={onChange} format="2-sets" meta={BRONZE_SF_META[1]} />
          </div>
          <BracketMatch cup="bronze" round="f" matchIdx={0} teams={final} scores={bracketScores} onChange={onChange} format="2-sets" meta={BRONZE_FINAL_META} />
        </div>
      </div>
    </div>
  );
}
