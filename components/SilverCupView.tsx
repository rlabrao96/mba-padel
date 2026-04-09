'use client';

import { BracketMatch } from './BracketMatch';
import { CupHeader, Placeholder, Round } from './GoldCupView';
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

      <div className="bracket-scroll -mx-4 overflow-x-auto px-4 pb-3">
        <div className="flex items-center gap-8 min-w-max">
          <Round title="Semifinals">
            {sf.map((match, i) => (
              <BracketMatch
                key={`sf-${i}`}
                cup="silver"
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
              cup="silver"
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
