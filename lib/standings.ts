import { GROUPS, Group, matchKey } from './data';

export type MatchScore = { s1: string; s2: string };
export type GroupMatches = Record<string, MatchScore>;
export type BracketScores = Record<string, string>;

export type TeamStanding = {
  id: number;
  w: number;
  l: number;
  gf: number;
  ga: number;
};

export type QualifiedTeam = TeamStanding & {
  group: number;
  groupName: string;
  seed?: number;
};

/** Sort helper: matches won → game difference → total games won. */
function standingSort(a: TeamStanding, b: TeamStanding): number {
  if (b.w !== a.w) return b.w - a.w;
  const diffA = a.gf - a.ga;
  const diffB = b.gf - b.ga;
  if (diffB !== diffA) return diffB - diffA;
  return b.gf - a.gf;
}

/** Compute standings for a single group. */
export function calcStandings(groupIdx: number, gm: GroupMatches): TeamStanding[] {
  const g = GROUPS[groupIdx];
  const stats: Record<number, TeamStanding> = {};
  g.teamIds.forEach((id) => {
    stats[id] = { id, w: 0, l: 0, gf: 0, ga: 0 };
  });

  for (let i = 0; i < g.teamIds.length; i++) {
    for (let j = i + 1; j < g.teamIds.length; j++) {
      const a = g.teamIds[i];
      const b = g.teamIds[j];
      const m = gm[matchKey(groupIdx, a, b)];
      if (!m || m.s1 === '' || m.s2 === '') continue;
      const s1 = parseInt(m.s1, 10);
      const s2 = parseInt(m.s2, 10);
      if (Number.isNaN(s1) || Number.isNaN(s2)) continue;

      stats[a].gf += s1;
      stats[a].ga += s2;
      stats[b].gf += s2;
      stats[b].ga += s1;

      if (s1 > s2) {
        stats[a].w += 1;
        stats[b].l += 1;
      } else if (s2 > s1) {
        stats[b].w += 1;
        stats[a].l += 1;
      }
    }
  }

  return Object.values(stats).sort(standingSort);
}

export function allGroupMatchesEntered(gm: GroupMatches): boolean {
  for (let gi = 0; gi < GROUPS.length; gi++) {
    const g = GROUPS[gi];
    for (let i = 0; i < g.teamIds.length; i++) {
      for (let j = i + 1; j < g.teamIds.length; j++) {
        const key = matchKey(gi, g.teamIds[i], g.teamIds[j]);
        const m = gm[key];
        if (!m || m.s1 === '' || m.s2 === '') return false;
        if (Number.isNaN(parseInt(m.s1, 10)) || Number.isNaN(parseInt(m.s2, 10))) return false;
      }
    }
  }
  return true;
}

export type Classification = {
  goldSeeds: QualifiedTeam[];   // length 8, seeded 1..8
  bronzeTeams: QualifiedTeam[]; // length 4
  firsts: QualifiedTeam[];
  seconds: QualifiedTeam[];
  qualifiedThirds: QualifiedTeam[];
  eliminatedThirds: QualifiedTeam[];
  fourths: QualifiedTeam[];
  complete: boolean;
};

export function getClassification(gm: GroupMatches): Classification {
  const firsts: QualifiedTeam[] = [];
  const seconds: QualifiedTeam[] = [];
  const thirds: QualifiedTeam[] = [];
  const fourths: QualifiedTeam[] = [];

  GROUPS.forEach((g: Group, gi: number) => {
    const s = calcStandings(gi, gm);
    s.forEach((team, pos) => {
      const entry: QualifiedTeam = { ...team, group: gi, groupName: g.name };
      if (pos === 0) firsts.push(entry);
      else if (pos === 1) seconds.push(entry);
      else if (pos === 2) thirds.push(entry);
      else fourths.push(entry);
    });
  });

  firsts.sort(standingSort);
  seconds.sort(standingSort);
  thirds.sort(standingSort);

  const qualifiedThirds = thirds.slice(0, 2);
  const eliminatedThirds = thirds.slice(2);

  const goldSeeds: QualifiedTeam[] = [
    ...firsts.map((t, i) => ({ ...t, seed: i + 1 })),
    ...seconds.map((t, i) => ({ ...t, seed: i + 4 })),
    ...qualifiedThirds.map((t, i) => ({ ...t, seed: i + 7 })),
  ];

  const bronzeTeams = [...eliminatedThirds, ...fourths];

  return {
    goldSeeds,
    bronzeTeams,
    firsts,
    seconds,
    qualifiedThirds,
    eliminatedThirds,
    fourths,
    complete: allGroupMatchesEntered(gm),
  };
}

/** Compute winner or loser of a bracket match from stored set scores. */
export function bracketResult(
  bs: BracketScores,
  cup: string,
  round: string,
  matchIdx: number,
  teams: [QualifiedTeam | null, QualifiedTeam | null],
): { winner: QualifiedTeam | null; loser: QualifiedTeam | null } {
  if (!teams[0] || !teams[1]) return { winner: null, loser: null };

  const prefix = `${cup}-${round}-${matchIdx}`;
  let sets: [number, number] = [0, 0];

  for (let s = 1; s <= 3; s++) {
    const v1 = bs[`${prefix}-1-s${s}`];
    const v2 = bs[`${prefix}-2-s${s}`];
    if (v1 === undefined || v2 === undefined || v1 === '' || v2 === '') break;
    const n1 = parseInt(v1, 10);
    const n2 = parseInt(v2, 10);
    if (Number.isNaN(n1) || Number.isNaN(n2)) break;
    if (n1 > n2) sets[0]++;
    else if (n2 > n1) sets[1]++;
  }

  const decided = sets[0] >= 2 || sets[1] >= 2;
  if (!decided) return { winner: null, loser: null };

  return sets[0] >= 2
    ? { winner: teams[0], loser: teams[1] }
    : { winner: teams[1], loser: teams[0] };
}
