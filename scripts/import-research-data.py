"""Import the public Harvard Dataverse v3 deposit; preserve source facts and nulls.

Run with the bundled Python (openpyxl is used only to read the source files).
Raw downloads and the detailed audit remain in ignored .research/.
"""
import collections
import datetime
import hashlib
import json
import re
import unicodedata
from pathlib import Path
from urllib.request import urlopen
import openpyxl

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / '.research'
DOI = '10.7910/DVN/RSAYV5'
SOURCE = 'https://doi.org/' + DOI
API = 'https://dataverse.harvard.edu/api/'

def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False)+'\n', encoding='utf-8')

def clean(value):
    return re.sub('[^a-z0-9\\[\\]]+', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(value)) if not unicodedata.combining(c)).lower()).strip()

def scalar(value):
    return value.date().isoformat() if isinstance(value, datetime.datetime) else value

def read(name):
    book = openpyxl.load_workbook(RAW / ('harvard-'+name+'.xlsx'), read_only=True, data_only=True)
    rows = iter(book.active.values)
    keys = next(rows)
    result = [dict(zip(keys, map(scalar, row))) for row in rows if any(v is not None for v in row)]
    book.close()
    return result

def main():
    RAW.mkdir(exist_ok=True)
    meta_path = RAW / 'harvard-metadata.json'
    if not meta_path.exists():
        meta_path.write_bytes(urlopen(API+'datasets/:persistentId/?persistentId=doi:'+DOI).read())
    metadata = json.loads(meta_path.read_text(encoding='utf-8-sig'))
    version = metadata['data']['latestVersion']
    assert version['versionNumber'] == 3, 'Review changed deposit version before ingestion'
    hashes = {}
    for item in version['files']:
        file = item['dataFile']
        if file['filename'] not in ('matches.xlsx', 'players.xlsx', 'tournaments.xlsx', 'codebook.tab'):
            continue
        assert not item['restricted']
        path = RAW / ('harvard-'+file['filename'])
        if not path.exists():
            path.write_bytes(urlopen(API+'access/datafile/'+str(file['id'])).read())
        md5 = hashlib.md5(path.read_bytes()).hexdigest()
        if not file.get('tabularData'):
            assert md5 == file['md5'], f'Checksum mismatch: {path}'
        # Dataverse regenerates tabular exports; their download hash can differ
        # from the ingested stored-file hash. Record both without claiming equality.
        hashes[file['filename']] = {'md5': md5, 'deposited_md5':file['md5'], 'checksum_matches_deposit':md5==file['md5'], 'tabular_export':file.get('tabularData',False), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size, 'url': API+'access/datafile/'+str(file['id'])}
    aliases_text = (ROOT/'src/engine.mjs').read_text(encoding='utf-8')
    aliases = dict(re.findall(r"'([^']+)':'([^']+)'", aliases_text.split('export const ALIASES = ',1)[1].split(';',1)[0]))
    selected = json.loads((ROOT/'data/players.json').read_text(encoding='utf-8-sig'))
    target_keys = {p['id'] for p in selected}
    for p in selected:
        aliases[clean(p['en'])] = p['id']
    players = read('players')
    lookup = {p['player_id']: p for p in players}
    canonical = {p['player_id']: aliases.get(clean(p['name'])) if p['gender']=='F' else None for p in players}
    targets = {pid for pid,key in canonical.items() if key in target_keys}
    tournaments = {t['tournament_id']:t for t in read('tournaments')}
    matches = read('matches')
    # Draw depth must use the entire WS draw, not just comparison players.
    # Preserve observed labels rather than infer missing draw rounds.
    draw_rounds = collections.defaultdict(set)
    qf_tournaments = set()
    for r in matches:
        if r['type'] != 'WS':
            continue
        label = str(r['round'] or '')
        numeric = re.fullmatch(r'Round (\d+)', label)
        if numeric:
            draw_rounds[r['tournament_id']].add(int(numeric.group(1)))
        if label == 'Quarter-final':
            qf_tournaments.add(r['tournament_id'])
    for tid,t in tournaments.items():
        observed = sorted(draw_rounds[tid])
        t.update(main_round_count=max(observed,default=0), main_rounds=observed, has_quarterfinal=tid in qf_tournaments)
    audit = {'source_rows':len(matches), 'source_ws_rows':0, 'matched_players':[], 'unmatched_players':[], 'duplicates':0, 'conflicts':[], 'orientation_failures':[], 'invalid_dates':[], 'missing_tournaments':[], 'source':SOURCE, 'version':3, 'hashes':hashes}
    audit['matched_players'] = [dict(lookup[pid],canonical_key=canonical[pid]) for pid in sorted(targets)]
    audit['unmatched_players'] = sorted(target_keys-{canonical[p] for p in targets})
    output, seen, needed_players, needed_tournaments = [], {}, set(), set()
    for index,r in enumerate(matches,2):
        if r['type'] != 'WS':
            continue
        audit['source_ws_rows'] += 1
        if r['winner_id'] not in targets and r['loser_id'] not in targets:
            continue
        date = r['match_date']
        if not isinstance(date,str) or not '2006-01-01' <= date <= '2025-12-31':
            audit['invalid_dates'].append(index)
            continue
        t = tournaments.get(r['tournament_id'])
        if not t:
            audit['missing_tournaments'].append(index)
            continue
        raw_score = str(r['score'] or '')
        games = [(int(a),int(b)) for a,b in re.findall(r'(\d+)\s*[-–]\s*(\d+)',raw_score)]
        fmt = r['score_format']
        wins = [sum(a>b for a,b in games),sum(b>a for a,b in games)]
        # Published columns explicitly identify winner/loser. Validate score orientation
        # independently against every completed standard-scoring selected row.
        valid_game = lambda a,b: (max(a,b)==21 and min(a,b)<=19) or (21<max(a,b)<30 and abs(a-b)==2) or (max(a,b)==30 and min(a,b)==29)
        complete = fmt=='BWF21' and len(games) in (2,3) and wins==[2,len(games)-2] and all(valid_game(a,b) for a,b in games)
        if fmt=='BWF21' and not complete:
            audit['orientation_failures'].append({'row':index,'score':raw_score,'wins':wins})
        status = 'completed' if complete else 'walkover' if fmt=='walkover' else 'retired' if fmt=='retirement' else 'uncertain'
        winner,loser = lookup[r['winner_id']],lookup[r['loser_id']]
        p1,p2 = canonical.get(r['winner_id']) or 'harvard:'+str(r['winner_id']),canonical.get(r['loser_id']) or 'harvard:'+str(r['loser_id'])
        row = dict(r,date=date,discipline='WS',team1=winner['name'],team2=loser['name'],winner=1,p1=p1,p2=p2,winner_key=p1,loser_key=p2,tournament=t['name'],tier=t['ranking_level'],ranking_level=t['ranking_level'],score=' '.join(f'{a}-{b}' for a,b in games) if games else raw_score,raw_score=raw_score,status=status,source='harvard',source_url=SOURCE,source_version=3,source_row=index,score_orientation='winner-first',team_event=None)
        key = (date,r['tournament_id'],r['round'],*sorted((r['winner_id'],r['loser_id'])))
        signature = (r['winner_id'],raw_score,fmt)
        if key in seen:
            audit['duplicates']+=1
            if seen[key]!=signature:
                audit['conflicts'].append({'key':key,'row':index})
                row['status']='conflict'
            else:
                continue
        seen[key]=signature
        output.append(row)
        needed_players.update((r['winner_id'],r['loser_id']))
        needed_tournaments.add(r['tournament_id'])
    output.sort(key=lambda r:(r['date'],r['tournament_id'],r['source_row']))
    profiles = [dict(lookup[pid],canonical_key=canonical.get(pid) or 'harvard:'+str(pid),source='harvard',source_url=SOURCE) for pid in sorted(needed_players)]
    tourneys = [dict(tournaments[tid],source='harvard',source_url=SOURCE) for tid in sorted(needed_tournaments)]
    audit.update(output_rows=len(output),opponents_and_targets=len(profiles),tournaments=len(tourneys),statuses=dict(collections.Counter(r['status'] for r in output)),tiers=dict(collections.Counter(r['ranking_level'] for r in output)),counts_by_player={key:sum(key in (r['p1'],r['p2']) for r in output) for key in sorted(target_keys)},min_date=min(r['date'] for r in output),max_date=max(r['date'] for r in output),team_event_note='No team-event field exists in source; null retained. Do not infer team status from a round name.')
    dump(ROOT/'data/research-matches.json',output)
    dump(ROOT/'data/research-players.json',profiles)
    dump(ROOT/'data/research-tournaments.json',tourneys)
    dump(RAW/'harvard-audit.json',audit)
    dump(ROOT/'data/research-provenance.json',audit)
    attribution = ROOT/'public/licenses/harvard-attribution.txt'
    attribution.parent.mkdir(parents=True,exist_ok=True)
    attribution.write_text('Sun, Mingchao; Zhang, Fengkai (2026). A Relational Dataset of International Badminton Singles Matches with Ranking and Elo Measures, 2006–2025. Harvard Dataverse, V3. '+SOURCE+'\nCC BY 4.0: https://creativecommons.org/licenses/by/4.0/\nArticle: https://doi.org/10.1038/s41597-026-08408-4\nChanges: selected women\'s singles records involving archive comparison players; normalized dates and score separators, added canonical player keys and provenance. Rankings and Elo nulls preserved. Elo is model-based, not official BWF statistics. Original tier codes retained.\nThe authors license their schema, identifiers, curation/corrections, classifications, Elo series and compilation. This does not override independently applicable source-website/database rights.\nDownloaded source hashes:\n'+json.dumps(hashes,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in audit.items() if k not in ('hashes','matched_players')},ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
