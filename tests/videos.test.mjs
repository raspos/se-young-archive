import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matchVideoLinks,primaryVideoLink,youtubeSearchUrl} from '../src/videos.mjs';
const registry=JSON.parse(readFileSync(new URL('../data/videos.json',import.meta.url)));
const match={date:'2026-08-23',tournament:'BWF World Championships 2026',round:'F',team1:'AN Se Young',team2:'Akane YAMAGUCHI'};
test('verified full match and highlights match exact event and both players',()=>{const links=matchVideoLinks(match,registry);assert.equal(links.length,2);assert.equal(links[0].href,'https://www.youtube.com/watch?v=99riPBazzfk');assert.equal(links[1].kind,'highlights');assert.equal(primaryVideoLink(match,registry).verified,true);assert.equal(matchVideoLinks({...match,team1:match.team2,team2:match.team1,round:'Final'},registry).length,2);});
test('never borrows a video from another opponent, year, event date or round',()=>{for(const patch of [{team2:'PUSARLA V. Sindhu'},{date:'2025-08-23'},{tournament:'French Open 2026'},{round:'SF'}]){assert.equal(matchVideoLinks({...match,...patch},registry).length,0);assert.equal(primaryVideoLink({...match,...patch},registry).verified,false);}});
test('unverified games have encoded YouTube searches, never fabricated watch IDs',()=>{const m={...match,tournament:'French Open',date:'2026-10-25',team2:'PUSARLA V. Sindhu'};const link=primaryVideoLink(m,registry);const url=new URL(link.href);assert.equal(url.hostname,'www.youtube.com');assert.equal(url.pathname,'/results');assert.match(url.searchParams.get('search_query'),/French Open 2026 Final/);assert.match(url.searchParams.get('search_query'),/AN Se Young vs PUSARLA V. Sindhu/);assert.equal(link.href,youtubeSearchUrl(m));});
