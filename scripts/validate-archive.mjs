import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {record,seasonRecords,tournamentKey} from '../src/engine.mjs';
import {tournamentCoverage} from '../src/coverage.mjs';
const read = path => readFileSync(path,'utf8');
const a = JSON.parse(read('src/archive.json'));
assert.equal(read('src/archive.json'),read('public/data/archive.json'));
const sourceIds = new Set(a.sources.map(source=>source.id));
const seen = new Set();
for (const m of a.matches) {
  const day = Date.parse(m.date+'T00:00:00Z');
  assert.ok(Number.isFinite(day) && new Date(day).toISOString().slice(0,10)===m.date && day<=Date.now(), m.key);
  assert.ok(sourceIds.has(m.source), 'Missing source: '+m.key);
  assert.ok(m.round.trim() && !/^undefined|null$/i.test(m.round), 'Invalid round: '+m.key);
  const key = [m.date,tournamentKey(m.tournament,m.date.slice(0,4)),m.round,...[m.p1,m.p2].sort()].join('|');
  assert.ok(!seen.has(key), 'Duplicate or conflicting result: '+key);
  seen.add(key);
  if (m.status==='completed') {
    const gameWins = m.games.filter(([x,y])=>x>y).length;
    assert.equal(m.winner===1?gameWins:m.games.length-gameWins,2,m.key);
  }
}
assert.deepEqual(record(a.matches,'an'),a.summaries.an.record);
assert.deepEqual(seasonRecords(a.matches,'an'),a.summaries.an.seasons);
const evidence = JSON.parse(read('data/tournament-evidence.json'));
assert.deepEqual(tournamentCoverage(a.matches,evidence),a.tournamentCoverage);
assert.ok(a.tournamentCoverage.every(e=>e.status!=='COMPLETE'||(sourceIds.has(e.source)&&e.missing.length===0)));
assert.ok(a.achievementUpdates.every(e=>sourceIds.has(e.source)&&e.date>a.metadata.comparisonEnd&&e.date<=a.metadata.checked));
const s=a.summaries.an.record;
assert.ok(read('README.md').includes('원장 '+a.matches.length+'건 · 완료 '+s.n+'경기 · '+s.wins+'승 '+s.losses+'패 · '+(s.rate*100).toFixed(1)+'% · 마지막 경기 '+a.metadata.archiveCoverage.end));
const pending=a.tournamentCoverage.filter(e=>e.season==='2026'&&e.status!=='COMPLETE');
console.log(JSON.stringify({results:a.matches.length, completed:s.n, pending:pending.map(({tournament,status,missing})=>({tournament,status,missing}))}));
