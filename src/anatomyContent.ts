export const chapters = [
 ['defense','철벽 수비','상대의 공격은 왜 통하지 않는가?','스매시를 받아낸 뒤 어디에 셔틀을 보낼지가 다음 공격을 결정한다. 준비 자세에서 무릎을 굽히고 라켓을 앞에 두면 양쪽으로 대응하기 쉽다. 리턴 뒤에는 상대가 가장 위협적으로 보낼 수 있는 공간을 기준으로 복귀한다.'],
 ['footwork','움직임의 비밀','왜 늘 셔틀콕에 먼저 도착하는가?','상대가 치는 순간 가볍게 착지하는 스플릿 스텝은 첫발을 내딛는 준비다. 전위에서는 런지로 균형을 잡고, 후위에서는 몸을 돌려 타점 뒤로 들어간다. 타격 뒤 복귀까지 한 동작으로 보면 움직임의 연결이 보인다.'],
 ['rally','랠리의 지배자','다음 득점 기회는 어디에서 오는가?','깊은 클리어에는 상대를 뒤로 보내고 자신의 자세를 정비하는 시간이 있다. 상대가 후위에 남았을 때 앞 공간이 열리지만, 짧은 공을 따라잡히면 오히려 역습을 받는다. 랠리 길이만으로 체력 소모를 판정할 수 없다.'],
 ['technique','기술의 해부학','안세영의 무기는 무엇인가?','같은 준비 자세에서도 타점과 세기를 바꾸면 셔틀이 다른 곳에 떨어진다. 각 기술의 궤적과, 그 기술을 선택했을 때 상대에게 열리는 다음 샷을 살펴보자.'],
 ['strategy','전술의 설계자','상대에 따라 어떻게 달라지는가?','상대전적은 결과의 변화를 보여준다. 영상을 볼 때는 첫 공격 직전의 상대 위치와, 수비 리턴이 코트 어느 쪽으로 향하는지를 비교하면 전술을 더 구체적으로 읽을 수 있다.'],
 ['mental','흔들리지 않는 마음','위기를 어떻게 극복하는가?','첫 게임을 내준 뒤 이긴 경기와 3게임까지 가서 이긴 경기는 서로 다른 표본이다. 게임별 점수는 반전이 일어난 시점을 보여주며, 경기 중 어떤 생각을 했는지는 인터뷰에서 확인할 수 있다.'],
 ['evolution','진화하는 챔피언','안세영은 어떻게 더 강해졌는가?','초기·정상 도전기·최근 경기의 승패를 비교한다. 영상에서는 수비 후 복귀, 공격을 시작하는 공, 타격 뒤 다음 발의 방향을 기준으로 관찰하자.'],
 ['evidence','기록이 말하는 것','실제 데이터는 무엇을 보여주는가?','완료 경기의 점수로 게임별 승패, 역전승과 결승 결과를 계산했다. 수록 범위가 시즌마다 달라 숫자 아래에 표본 건수를 함께 표시한다.']
] as const;

export const techniques = [
 ['하프 스매시','스매시 동작으로 속도를 줄인 공격','정타보다 힘을 덜 싣고 짧거나 옆으로 낮게 보낸다.','상대가 뒤에서 기다리면 빈 앞 공간을 공략할 수 있다. 높으면 상대가 먼저 공격한다.', [57,254,105,177,132,79]],
 ['헤어핀','네트 바로 앞에 떨어뜨리는 타구','라켓 면을 작게 움직여 셔틀을 네트 위로 살짝 넘긴다.','상대의 낮은 타점을 유도한다. 네트에 걸리거나 높게 뜨면 바로 실점할 수 있다.', [84,173,106,146,117,126]],
 ['클리어','셔틀을 상대 코트 깊숙이 보내는 타구','높고 깊은 궤적이 상대를 뒤로 밀고 복귀 시간을 준다.','길이가 짧으면 상대 후위 공격에 노출된다.', [65,244,107,4,154,34]],
 ['드롭샷','후위에서 앞 코트로 보내는 짧은 타구','클리어나 스매시와 비슷하게 준비한 뒤 힘을 빼 앞에 떨어뜨린다.','앞 공간을 열지만 느리고 높으면 상대가 네트 위에서 잡을 수 있다.', [58,251,96,82,128,132]],
 ['스매시 리턴','강한 공격을 받아 다음 타구를 만드는 기술','라켓을 몸 앞에 두고 상대 공격의 힘을 이용해 반대 방향으로 보낸다.','작은 동작으로 방향을 바꿀 수 있다. 회복할 시간이 부족하면 정면 깊은 리턴이 안전하다.', [139,226,123,110,54,68]],
 ['푸시','네트에서 셔틀을 빠르게 밀어 보내는 타구','셔틀이 높을 때 짧은 스윙으로 옆이나 몸쪽 공간을 찌른다.','상대가 자세를 고치기 전에 압박하지만 낮은 공에 무리하면 네트에 걸린다.', [78,172,118,124,169,65]],
 ['스매시','높은 타점에서 셔틀을 아래로 꽂는 공격','타점을 몸 앞에 두고 각도와 방향을 정한다.','높은 공을 즉시 공격할 수 있다. 타격 뒤 복귀가 늦으면 짧은 리턴에 취약하다.', [57,251,90,168,139,45]]
] as const;

type InterviewRecord = {chapter:string;speaker:string;role:string;date:string;media:string;language:string;url:string;summary:string;topic:string;match:string;status:string;quote?:string;translation?:string};
export const interviews:InterviewRecord[] = [
 {"chapter":"evidence","speaker":"안세영","role":"선수","date":"2026-11-08","media":"연합뉴스 · 코리아오픈 결승 인터뷰","language":"영어","url":"https://en.yna.co.kr/view/AEN20261108002151315","summary":"시즌 11번째 우승을 거둔 뒤 체력이 떨어진 순간에도 경기를 뒤집는 방법을 배웠다고 돌아봤다.","topic":"위기 대응","match":"2026 코리아오픈 결승","status":"기사 요약"},
 {"chapter":"rally","speaker":"왕즈이","role":"2025 월드투어 파이널 결승 상대","date":"2025-12-23","media":"조선비즈 · 경기 후 BWF 인터뷰 인용","language":"영어","url":"https://biz.chosun.com/en/en-sports/2025/12/23/FSYBHKYJ6NBQLB43VXQCZPWCAY/","summary":"결승에서 자신의 전략이 통했던 구간도 있었지만 체력이 떨어지면서 격차가 벌어졌다고 돌아봤다.","topic":"랠리와 체력","match":"2025 월드투어 파이널 결승","status":"기사 요약"},
 {"chapter":"mental","speaker":"안세영","role":"선수","date":"2025-03-16","media":"Sarawak Tribune · 경기 후 인터뷰 인용","language":"영어","url":"https://www.sarawaktribune.com/olympic-champion-an-wins-all-england-open/","summary":"첫 게임을 내준 전영오픈 결승에서 2·3게임을 따낸 뒤의 소감.","quote":"The only thought that stayed with me was not to give up.","translation":"포기하지 말자는 생각만 끝까지 남아 있었어요.","topic":"집중력과 역전","match":"2025 전영오픈 결승","status":"기사 요약"},
 {chapter:'defense',speaker:'아파르나 포팟',role:'전 인도 여자단식 올림픽 대표',date:'2026-01',media:'The Indian Express',language:'영어',url:'https://indianexpress.com/article/sports/badminton/india-open-an-se-young-dominance-success-peers-aparna-popat-10481514/',summary:'포팟은 좋은 풋워크 덕분에 잘못 고른 샷 뒤에도 셔틀을 다시 받아낼 수 있다고 평가했다. 다양한 타구 중 기본에 맞는 선택을 꾸준히 한다는 점도 짚었다.',topic:'수비와 이동',match:'2026 인디아오픈',status:'기사 요약'},
 {chapter:'footwork',speaker:'이현일',role:'안세영 코치',date:'2026-01-18',media:'The New Indian Express',language:'영어',url:'https://www.newindianexpress.com/sport/sports-news/2026/Jan/18/behind-the-womens-world-no-1-an-se-young-her-coach-former-mens-world-no-1',summary:'인타논과의 준결승을 높이 평가하면서도 움직임과 공격 타구를 계속 다듬는다고 설명했다.',quote:'She has been working on her movements and attacking strokes',translation:'움직임과 공격 타구를 다듬어 왔습니다.',topic:'풋워크와 공격',match:'2026 인디아오픈 준결승',status:'기사 요약'},
 {chapter:'technique',speaker:'안세영',role:'선수',date:'2026-01-09',media:'조선일보 · The Star 인터뷰 인용',language:'영어',url:'https://www.chosun.com/english/sports-en/2026/01/09/AFZGGCWTLBDAZCR56IVFE3P3BI/',summary:'말레이시아오픈 8강을 마친 뒤 경기가 순조로웠다고 돌아보고, 준결승 준비에 집중하겠다고 밝혔다.',topic:'공격 훈련',match:'2026 말레이시아오픈 8강',status:'기사 요약'},
 {chapter:'strategy',speaker:'풀렐라 고피찬드',role:'인도 대표팀 감독',date:'2026-08',media:'Hindustan Times',language:'영어',url:'https://www.hindustantimes.com/sports/badminton/solving-the-an-se-young-puzzle-101785775299888.html',summary:'세계선수권을 앞두고 안세영을 다른 우승 후보와 구분해 평가했다.',topic:'라이벌 구도',match:'2026 세계선수권 사전 보도',status:'기사 요약'},
 {chapter:'evolution',speaker:'안세영',role:'선수',date:'2026-01-02',media:'조선비즈 · BWF TV 인터뷰 인용',language:'영어',url:'https://biz.chosun.com/en/en-sports/2026/01/02/UGMT3UVRFZFZBFTCO2LHCSVILM/',summary:'2025년 세계선수권에서 느낀 아쉬움을 동기로 삼았고, 이후 공격을 더 발전시키는 데 집중했다고 말했다.',topic:'경기 스타일의 변화',match:'2025 세계선수권 이후',status:'기사 요약'}
];
export const imageSources = [
 {"file":"anatomy/yonex-banner.jpg","use":"특집 첫 화면","source":"YONEX 공식 선수 프로필","originalUrl":"https://www.yonex.com/media/athletes/tmp/banner/1400x400_an-se-young.jpg","pageUrl":"https://www.yonex.com/athletes/details/?athlete_id=107","captureDate":null,"event":null,"terms":"사용자가 확인한 보도용 사용 허가"},
 {"file":"anatomy/yonex-profile.jpg","use":"기술의 해부학","source":"YONEX 공식 선수 프로필","originalUrl":"https://www.yonex.com/media/wysiwyg/Athletes/Badminton/810x540_an-se-young.jpg","pageUrl":"https://www.yonex.com/athletes/details/?athlete_id=107","captureDate":null,"event":null,"terms":"사용자가 확인한 보도용 사용 허가"},
 {file:'an-victory.jpg',use:'위기 대응',source:'사용자 제공 기존 사이트 사진',originalUrl:null,captureDate:null,event:null,terms:'기존 사이트에 게시된 자산'},
 {file:'an-medal.jpg',use:'시기별 비교',source:'사용자 제공 기존 사이트 사진',originalUrl:null,captureDate:null,event:null,terms:'기존 사이트에 게시된 자산'}
];
