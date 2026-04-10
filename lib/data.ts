export type Team = {
  id: number;
  name: string;
  short: string;
  school: string;
};

export const TEAMS: Team[] = [
  { id: 1,  name: 'James Lin & Renato Favaro',                 short: 'Lin / Favaro',          school: 'HBS' },
  { id: 2,  name: 'Matty Cartwright & Michael Chen',           short: 'Cartwright / Chen',     school: 'MIT' },
  { id: 3,  name: 'Ivan Esquinca & Tomas Verdier',             short: 'Esquinca / Verdier',    school: 'Yale SOM' },
  { id: 4,  name: 'Guillermo Ochoa & Alec Roslin',             short: 'Ochoa / Roslin',        school: 'Wharton' },
  { id: 5,  name: 'Pelayo Alvarez & Bo Curry',                 short: 'Alvarez / Curry',       school: 'HBS' },
  { id: 6,  name: 'Rob Simon & Ben Keating',                   short: 'Simon / Keating',       school: 'HBS' },
  { id: 7,  name: 'Vittorio Tosi & Sebastiano Cultrera di Montesano', short: 'Tosi / Cultrera', school: 'MIT' },
  { id: 8,  name: 'Rafael Labra & Jose Coloma',                short: 'Labra / Coloma',        school: 'Wharton' },
  { id: 9,  name: 'Ricardo Medinilla & Daniel Alameh',         short: 'Medinilla / Alameh',    school: 'Booth' },
  { id: 10, name: 'Daniel Rossi & Julio Del Rio',              short: 'Rossi / Del Rio',       school: 'Boston University' },
  { id: 11, name: 'Josh Menezes & Jubin Gorji',                short: 'Menezes / Gorji',       school: 'HBS' },
  { id: 12, name: 'Stephan Koenigsfest & Marco Troina',        short: 'Koenigsfest / Troina',  school: 'MIT' },
];

export type Group = {
  name: string;
  teamIds: number[];
};

export const GROUPS: Group[] = [
  { name: 'Group 1', teamIds: [4, 2, 3, 1] },
  { name: 'Group 2', teamIds: [8, 6, 7, 5] },
  { name: 'Group 3', teamIds: [12, 10, 9, 11] },
];

export function getTeam(id: number): Team {
  const t = TEAMS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown team id ${id}`);
  return t;
}

// Round-robin rounds for a 4-team group. Each sub-array is one round (2 matches).
// Order ensures no team plays consecutive matches within the group.
export const GROUP_ROUNDS: [number, number][][] = [
  // Round 1: (a, d) and (b, c)
  [[0, 3], [1, 2]],
  // Round 2: (a, c) and (b, d)
  [[0, 2], [1, 3]],
  // Round 3: (a, b) and (c, d)
  [[0, 1], [2, 3]],
];

export type MatchKey = string; // "g{groupIdx}-{teamIdA}-{teamIdB}" where A < B by position order

export function matchKey(groupIdx: number, a: number, b: number): MatchKey {
  return `g${groupIdx}-${a}-${b}`;
}
