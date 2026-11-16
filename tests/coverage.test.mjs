import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tournamentCoverage} from '../src/coverage.mjs';
import {normalizeMatches} from '../src/engine.mjs';

const base={date:'2026-08-21',tournament:'Fixture 2026',tier:'Super 750',team1:'AN Se Young',team2:'Akane YAMAGUCHI',score:'21-10 21-15',winner:1,source:'fixture'};
test('coverage distinguishes missing semifinals, verified byes and final-only entries',()=>{
 const round=r=>({...base,round:r,status:'completed'});
 const proof={'Fixture 2026':{source:'fixture',rounds:['QF','SF','F']}};
 assert.deepEqual(tournamentCoverage(['QF','F'].map(round),proof)[0].missing,['SF']);
 assert.equal(tournamentCoverage([round('F')],{})[0].status,'FINAL_ONLY');
 assert.equal(tournamentCoverage(['QF','SF','F'].map(round),{})[0].status,'PARTIAL');
 assert.equal(tournamentCoverage(['QF','SF','F'].map(round),proof)[0].status,'COMPLETE');
 assert.equal(tournamentCoverage([round('QF')],{'Fixture 2026':{source:'fixture',rounds:['QF']}})[0].status,'COMPLETE');
});
test('a quarterfinal remains a scored main-draw fixture while Q1 stays out of the aggregate',()=>{
 const result=normalizeMatches([{...base,round:'QF'},{...base,round:'Q1'}],'2026-11-16');
 assert.deepEqual(result.matches.map(r=>r.round),['QF']);
});
