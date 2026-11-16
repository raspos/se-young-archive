export const knockoutRounds = ['R64', 'R32', 'R16', 'QF', 'SF', 'F'];

export function tournamentCoverage(matches, evidence) {
  const events = new Map();
  for (const match of matches) {
    const key = match.date.slice(0, 4) + '|' + match.tournament;
    if (!events.has(key)) events.set(key, []);
    events.get(key).push(match);
  }
  return [...events].map(([key, rows]) => {
    const proof = evidence[rows[0].tournament];
    const rounds = [...new Set(rows.map(row => row.round))];
    const hasFinal = rounds.includes('F');
    const detected = hasFinal && rounds.some(r => knockoutRounds.slice(0, 5).includes(r))
      ? knockoutRounds.slice(Math.min(...rounds.map(r => knockoutRounds.indexOf(r)).filter(i => i >= 0)), -1)
      : hasFinal ? ['SF'] : [];
    const missing = (proof?.rounds ?? detected).filter(r => !rounds.includes(r));
    const status = rows.every(r => !r.source || r.status === 'uncertain') ? 'UNVERIFIED'
      : proof && missing.length === 0 ? 'COMPLETE'
      : rounds.length === 1 && hasFinal ? 'FINAL_ONLY' : 'PARTIAL';
    return {key, tournament: rows[0].tournament, season: rows[0].date.slice(0, 4),
      status, matches: rows.length, missing, source: proof?.source ?? null};
  });
}
