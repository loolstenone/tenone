import type { CloudWord, FeedItem, SkyInfo } from '@/types/badak';

// ── 니즈 클라우드 워드 (Mock) ──

export const CLOUD_WORDS: CloudWord[] = [
  // ── 커리어 / 이직 ──
  { text: '이직 준비 같이할 사람!', size: 1.8, hasGroup: true, members: 23, group: {
    id: 'g2', title: '이직 준비 — 에이전시↔인하우스 경험 나누기', type: 'once', maxMembers: 25, currentMembers: 23,
    leaderName: '박서연', leaderJob: '광고 · AE 7년차', eventDate: '4/22 (화) 19:30', location: '강남역', status: 'recruiting',
  }},
  { text: '연봉 협상 어떻게 하지?', size: 1.4, hasGroup: true, members: 26, group: {
    id: 'g13', title: '연봉 협상 노하우 공유 모임', type: 'once', maxMembers: 30, currentMembers: 26,
    leaderName: '김태리', leaderJob: 'HR · 헤드헌터 8년차', eventDate: '5/10 (토) 14:00', location: '강남역', status: 'recruiting',
  }},
  { text: '팀장 됐는데 뭐부터 하지?', size: 1.5, hasGroup: true, members: 15, group: {
    id: 'g4', title: '리더 1년차 모임', type: 'once', maxMembers: 15, currentMembers: 14,
    leaderName: '이준호', leaderJob: '제조 · 팀장 1년차', eventDate: '4/20 (일) 11:00', location: '합정', status: 'confirmed',
  }},
  { text: '프리랜서로 전환할까 고민 중', size: 1.3, hasGroup: true, members: 6, group: {
    id: 'g5', title: '프리랜서 전환 경험 공유', type: 'once', maxMembers: 15, currentMembers: 6,
    leaderName: '한지은', leaderJob: '디자인 · 프리랜서 2년차', eventDate: '4/26 (토) 15:00', location: '홍대입구', status: 'recruiting',
  }},
  { text: '사이드 프로젝트 같이 할래?', size: 1.3, hasGroup: true, members: 8, group: {
    id: 'g3', title: '사이드 프로젝트 팀 빌딩', type: 'recurring', maxMembers: 12, currentMembers: 8,
    leaderName: '정민수', leaderJob: '개발 · 프론트엔드 3년차', schedule: '격주 토 14:00', location: '성수동', status: 'recruiting',
  }},
  { text: '에이전시 vs 인하우스 고민돼', size: 1.6, hasGroup: false, members: 24 },
  { text: '포트폴리오 피드백 받고 싶어', size: 1.4, hasGroup: true, members: 18, group: {
    id: 'g17', title: '포트폴리오 피드백 세션', type: 'once', maxMembers: 20, currentMembers: 18,
    leaderName: '정유리', leaderJob: '디자인 · 시니어 디자이너 6년차', eventDate: '4/25 (금) 19:00', location: '성수동', status: 'recruiting',
  }},

  // ── 리더십 / 조직관리 ──
  { text: '팀원 동기부여 어떻게 해?', size: 1.4, hasGroup: false, members: 17 },
  { text: '성과 평가 기준 만들기 어렵다', size: 1.2, hasGroup: false, members: 11 },
  { text: '조직문화 어떻게 바꾸나요?', size: 1.3, hasGroup: false, members: 14 },
  { text: '회의를 줄이고 싶어요', size: 1.5, hasGroup: false, members: 21 },
  { text: 'OKR 처음 도입해보려는데', size: 1.2, hasGroup: false, members: 9 },

  // ── HR / 인사 ──
  { text: '채용 기준 어떻게 잡아요?', size: 1.3, hasGroup: false, members: 13 },
  { text: '인사 평가 공정하게 하는 법', size: 1.4, hasGroup: false, members: 16 },
  { text: '온보딩 프로그램 설계하고 싶어', size: 1.1, hasGroup: false, members: 8 },
  { text: '퇴직 면담 어떻게 하나요?', size: 1.0, hasGroup: false, members: 6 },
  { text: 'HR 데이터 분석 시작하고 싶어', size: 1.2, hasGroup: false, members: 10 },
  { text: '노무 이슈 아는 분 계세요?', size: 1.1, hasGroup: false, members: 7 },
  { text: '직원 복지 제도 어떻게 만들어?', size: 1.3, hasGroup: false, members: 12 },

  // ── 재무 / 회계 ──
  { text: '재무제표 읽는 법 배우고 싶어', size: 1.5, hasGroup: false, members: 20 },
  { text: '예산 편성 어떻게 하면 좋아?', size: 1.2, hasGroup: false, members: 9 },
  { text: '세금 신고 혼자 해본 사람?', size: 1.4, hasGroup: false, members: 18 },
  { text: '원가 분석 어디서 배워요?', size: 1.1, hasGroup: false, members: 7 },
  { text: '재무 담당자 커리어 어떻게?', size: 1.0, hasGroup: false, members: 5 },
  { text: '회계사 vs 재무 담당 차이는?', size: 1.2, hasGroup: false, members: 9 },
  { text: '스타트업 회계 어디서 시작해?', size: 1.3, hasGroup: false, members: 13 },

  // ── R&D / 연구개발 ──
  { text: '특허 출원 해본 분 있나요?', size: 1.1, hasGroup: false, members: 6 },
  { text: 'R&D 성과 측정 어떻게 해?', size: 1.0, hasGroup: false, members: 4 },
  { text: '논문 작성 같이 해볼 사람?', size: 1.2, hasGroup: false, members: 10 },
  { text: '연구 아이디어 검증하고 싶어', size: 1.1, hasGroup: false, members: 7 },
  { text: '기술이전 경험 있는 분?', size: 0.9, hasGroup: false, members: 3 },

  // ── 개발 / IT ──
  { text: '데이터 분석 같이 공부하자', size: 1.1, hasGroup: true, members: 19, group: {
    id: 'g6', title: '데이터 분석 스터디', type: 'recurring', maxMembers: 25, currentMembers: 19,
    leaderName: '오세진', leaderJob: '데이터 · 분석가 4년차', schedule: '매주 목 20:00', location: '선릉역', status: 'recruiting',
  }},
  { text: 'AI 실무에서 쓰고 싶은데', size: 1.7, hasGroup: true, members: 31, group: {
    id: 'g7', title: 'AI 활용법 — 실무 프롬프트 엔지니어링', type: 'recurring', maxMembers: 40, currentMembers: 31,
    leaderName: '김도현', leaderJob: 'IT · PM 5년차', schedule: '매주 토 14:00', location: '성수동', status: 'recruiting',
  }},
  { text: 'SQL 처음 배워보고 싶어', size: 1.3, hasGroup: false, members: 14 },
  { text: '클라우드 자격증 공부 중', size: 1.2, hasGroup: false, members: 11 },
  { text: '파이썬 업무 자동화 배우고 싶어', size: 1.5, hasGroup: false, members: 22 },
  { text: '노코드 툴 어디까지 쓸 수 있어?', size: 1.3, hasGroup: false, members: 15 },

  // ── 창업 / 스타트업 ──
  { text: '창업 아이디어 검증해볼 사람?', size: 0.9, hasGroup: false, members: 7 },
  { text: '법인 설립 어떻게 하나요?', size: 1.2, hasGroup: false, members: 10 },
  { text: '투자 유치 경험 나눠요', size: 1.4, hasGroup: false, members: 16 },
  { text: '공동창업자 찾고 있어요', size: 1.5, hasGroup: false, members: 20 },
  { text: '초기 스타트업 생존 노하우', size: 1.3, hasGroup: false, members: 13 },

  // ── 마케팅 (축소) ──
  { text: 'SNS 콘텐츠 기획이 막막해', size: 1.3, hasGroup: false, members: 14 },
  { text: '브랜딩 처음부터 배우고 싶어', size: 1.6, hasGroup: false, members: 8 },
  { text: '업계 사람들 만나고 싶어', size: 0.9, hasGroup: true, members: 9, group: {
    id: 'g8', title: '네트워킹 밋업 모임', type: 'once', maxMembers: 20, currentMembers: 9,
    leaderName: '류하나', leaderJob: '홍보 · PR 6년차', eventDate: '5/3 (토) 18:00', location: '이태원', status: 'recruiting',
  }},
  { text: '퍼포먼스 광고 입문하고 싶어', size: 1.3, hasGroup: true, members: 17, group: {
    id: 'g11', title: '퍼포먼스 마케팅 입문반', type: 'recurring', maxMembers: 20, currentMembers: 17,
    leaderName: '장우진', leaderJob: '퍼포먼스 · 마케터 5년차', schedule: '매주 화 20:00', location: '역삼역', status: 'recruiting',
  }},
  { text: '유튜브 채널 키우는 법', size: 1.4, hasGroup: false, members: 19 },

  // ── 요리 / 음식 ──
  { text: '집에서 파스타 잘 만드는 법', size: 1.3, hasGroup: false, members: 15 },
  { text: '주말 베이킹 같이 배울 사람?', size: 1.5, hasGroup: false, members: 22 },
  { text: '식칼 다루는 게 무서워요', size: 1.1, hasGroup: false, members: 8 },
  { text: '혼밥족 요리 레시피 공유해요', size: 1.4, hasGroup: false, members: 18 },
  { text: '맛집 탐방 같이 다닐 사람!', size: 1.6, hasGroup: false, members: 25 },
  { text: '커피 내리는 법 제대로 배우고 싶어', size: 1.3, hasGroup: false, members: 14 },
  { text: '건강한 도시락 메뉴 아이디어?', size: 1.2, hasGroup: false, members: 10 },

  // ── 여행 ──
  { text: '혼자 유럽 여행 가본 분?', size: 1.5, hasGroup: false, members: 21 },
  { text: '동남아 한 달 살기 해봤어요?', size: 1.6, hasGroup: false, members: 26 },
  { text: '국내 캠핑 처음인데 어떻게?', size: 1.4, hasGroup: false, members: 17 },
  { text: '여행 경비 줄이는 꿀팁 있어?', size: 1.3, hasGroup: false, members: 13 },
  { text: '로컬 여행 코스 짜는 법', size: 1.2, hasGroup: false, members: 9 },
  { text: '여행 사진 예쁘게 찍고 싶어', size: 1.1, hasGroup: false, members: 7 },
  { text: '제주 한 달 살기 현실은?', size: 1.5, hasGroup: false, members: 20 },

  // ── 낚시 ──
  { text: '낚시 처음 시작하고 싶어요', size: 1.4, hasGroup: false, members: 16 },
  { text: '바다낚시 vs 민물낚시 뭐가 나아?', size: 1.2, hasGroup: false, members: 10 },
  { text: '루어 낚시 장비 뭐 사야 해?', size: 1.1, hasGroup: false, members: 7 },
  { text: '낚시 같이 갈 팀원 구해요!', size: 1.3, hasGroup: false, members: 12 },
  { text: '캠핑 낚시 같이 해볼 사람?', size: 1.2, hasGroup: false, members: 9 },

  // ── 만들기 / 공예 / DIY ──
  { text: '가죽공예 배울 수 있는 곳?', size: 1.2, hasGroup: false, members: 10 },
  { text: '목공 입문하고 싶어요', size: 1.4, hasGroup: false, members: 16 },
  { text: '드로잉 기초부터 같이 배워요', size: 1.5, hasGroup: false, members: 21 },
  { text: '도자기 만들기 해본 사람?', size: 1.1, hasGroup: false, members: 7 },
  { text: '뜨개질 배우고 싶은데 어렵나?', size: 1.0, hasGroup: false, members: 5 },
  { text: '3D 프린팅 같이 공부해요', size: 1.2, hasGroup: false, members: 9 },

  // ── 기타 취미 ──
  { text: '주말 등산 같이 갈 사람!', size: 1.5, hasGroup: false, members: 23 },
  { text: '필름 카메라 입문하고 싶어', size: 1.3, hasGroup: false, members: 13 },
  { text: '독서 모임 찾고 있어요', size: 1.4, hasGroup: false, members: 17 },
  { text: '악기 하나 배워보고 싶은데', size: 1.3, hasGroup: false, members: 12 },
  { text: '러닝 크루 함께 달려요', size: 1.6, hasGroup: false, members: 27 },
  { text: '보드게임 같이 할 사람 있어요?', size: 1.2, hasGroup: false, members: 11 },

  // ── 자기계발 / 네트워킹 ──
  { text: '영어 회화 스터디 찾고 있어요', size: 1.5, hasGroup: false, members: 22 },
  { text: '같은 고민 가진 사람 만나고 싶어', size: 1.7, hasGroup: false, members: 29 },
  { text: '멘토를 찾고 있어요', size: 1.4, hasGroup: false, members: 18 },
  { text: '번아웃 극복한 분 이야기 듣고 싶어', size: 1.5, hasGroup: true, members: 20, group: {
    id: 'g18', title: '번아웃 극복 모임', type: 'once', maxMembers: 25, currentMembers: 20,
    leaderName: '임서현', leaderJob: '브랜드 매니저 7년차', eventDate: '5/1 (목) 19:30', location: '홍대입구', status: 'recruiting',
  }},
  { text: '업계 선배 이야기 듣고 싶어', size: 1.5, hasGroup: false, members: 20 },
  { text: '나와 비슷한 연차 친구 만들기', size: 1.3, hasGroup: false, members: 14 },
  { text: '이 고민 나만 하는 건 아니겠지', size: 1.6, hasGroup: false, members: 24 },
];

// ── 순환 프롬프트 ──

export const PROMPTS = [
  '어떤 걸 하고 싶으세요?',
  '요즘 어떤 고민이 있으세요?',
  '어떤 사람을 만나고 싶으세요?',
  '지금 가장 필요한 건 뭔가요?',
  '다음 단계로 뭘 준비하고 있어요?',
];

// ── 피드 아이템 (Mock) ──

export const FEED_ITEMS: FeedItem[] = [
  {
    type: 'group',
    groupId: 'g5',
    badge: '모임 확정',
    title: 'AI 활용법 — 실무에서 바로 쓰는 프롬프트 엔지니어링',
    leader: '바닥장 김도현',
    leaderJob: 'IT · PM 5년차',
    members: 31,
    max: 40,
    date: '4/19 (토) 14:00',
    location: '성수동',
    tags: ['AI', '실무', '프롬프트'],
    imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=860&h=320&fit=crop&auto=format',
  },
  {
    type: 'needs',
    badge: '니즈 모이는 중',
    title: '브랜딩 공부 — 처음부터 같이 배워볼 사람?',
    count: 47,
    threshold: 50,
    tags: ['브랜딩', '마케팅', '초보환영'],
  },
  {
    type: 'group',
    groupId: 'g1',
    badge: '모임 확정',
    title: '이직 준비 — 에이전시↔인하우스 경험 나누기',
    leader: '바닥장 박서연',
    leaderJob: '광고 · AE 7년차',
    members: 23,
    max: 25,
    date: '4/22 (화) 19:30',
    location: '강남역',
    tags: ['이직', '커리어', '광고'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=860&h=320&fit=crop&auto=format',
  },
  {
    type: 'needs',
    badge: '니즈 모이는 중',
    title: 'GA4 세팅 — 아는 사람 좀 알려줘요',
    count: 18,
    threshold: 30,
    tags: ['GA4', '데이터', '마케팅'],
  },
  {
    type: 'group',
    groupId: 'g8',
    badge: '마감 임박',
    title: '팀장 되었는데 막막해 — 리더 1년차 모임',
    leader: '바닥장 이준호',
    leaderJob: '제조 · 팀장 1년차',
    members: 14,
    max: 15,
    date: '4/20 (일) 11:00',
    location: '합정',
    tags: ['리더십', '팀장', '고민상담'],
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=860&h=320&fit=crop&auto=format',
  },
  {
    type: 'story',
    badge: 'Next Stage 스토리',
    title: '"바닥에서 만난 개발자 덕분에 사이드 프로젝트가 회사가 됐어요"',
    author: '최민지',
    authorJob: '前 마케터 → 現 스타트업 대표',
  },
  // ── 추가 피드 아이템 (무한 스크롤용) ──
  {
    type: 'group',
    groupId: 'g2',
    badge: '모임 확정',
    title: '카피라이팅 실전 — 매주 테마로 써오고 피드백 주고받기',
    leader: '바닥장 카피장인',
    leaderJob: '브랜드 마케터 7년차',
    members: 12,
    max: 12,
    date: '4/20 (일) 19:00',
    location: '성수동',
    tags: ['카피', '글쓰기', '광고'],
  },
  {
    type: 'needs',
    badge: '니즈 모이는 중',
    title: '재무제표 읽기 — 숫자 보는 눈 같이 키울 사람?',
    count: 32,
    threshold: 40,
    tags: ['재무', '회계', '초보환영'],
  },
  {
    type: 'group',
    groupId: 'g3',
    badge: '모임 확정',
    title: '소셜미디어 트렌드 분석 — 매주 인사이트 공유',
    leader: '바닥장 트렌디K',
    leaderJob: '소셜미디어 마케터 3년차',
    members: 8,
    max: 15,
    date: '5/3 (토) 14:00',
    location: '홍대',
    tags: ['SNS', '트렌드', '분석'],
  },
  {
    type: 'needs',
    badge: '니즈 모이는 중',
    title: '주말 등산 모임 — 같이 올라가고 맥주 한잔 하고 싶어요',
    count: 21,
    threshold: 25,
    tags: ['등산', '취미', '주말'],
  },
  {
    type: 'group',
    groupId: 'g6',
    badge: '모임 확정',
    title: '퍼포먼스 마케팅 네트워킹 — 페이스북/구글 광고 실무자 모임',
    leader: '바닥장 광고맨P',
    leaderJob: '퍼포먼스 마케팅 5년차',
    members: 18,
    max: 30,
    date: '5/17 (토) 19:30',
    location: '을지로',
    tags: ['퍼포먼스', '광고', '네트워킹'],
  },
  {
    type: 'story',
    badge: 'Next Stage 스토리',
    title: '"팀장 된 지 3개월, 리더 모임에서 들은 한 마디가 방향을 바꿨어요"',
    author: '김준혁',
    authorJob: '제조업 팀장 1년차',
  },
  {
    type: 'needs',
    badge: '니즈 모이는 중',
    title: '낚시 입문 — 장비도 모르고 혼자 가기 두려운 분들!',
    count: 14,
    threshold: 20,
    tags: ['낚시', '취미', '입문'],
  },
  {
    type: 'group',
    groupId: 'g7',
    badge: '모임 확정',
    title: 'AI 활용 마케팅 — 실무에서 당장 쓸 수 있는 프롬프트',
    leader: '바닥장 AI마스터',
    leaderJob: '그로스 마케터 5년차',
    members: 31,
    max: 40,
    date: '4/19 (토) 14:00',
    location: '성수동',
    tags: ['AI', '실무', '프롬프트'],
  },
  {
    type: 'needs',
    badge: '니즈 모이는 중',
    title: '인사 평가 — HR 담당자끼리 평가 기준 어떻게 잡는지 나누고 싶어요',
    count: 18,
    threshold: 30,
    tags: ['HR', '인사', '평가'],
  },
  {
    type: 'group',
    groupId: 'g4',
    badge: '마감 임박',
    title: '마케터 사이드 프로젝트 — 기획부터 런칭까지 같이',
    leader: '바닥장 기획자A',
    leaderJob: 'PM 4년차',
    members: 5,
    max: 8,
    date: '5/10 (토) 10:00',
    location: '온라인 (Zoom)',
    tags: ['사이드프로젝트', '기획', '런칭'],
  },
  {
    type: 'story',
    badge: 'Next Stage 스토리',
    title: '"요리 배우러 왔다가 지금 같이 식당 차릴 파트너를 만났어요"',
    author: '이지현',
    authorJob: '前 회계담당 → 現 식당 공동창업자',
  },
  {
    type: 'needs',
    badge: '니즈 모이는 중',
    title: '베이킹 스터디 — 주말마다 같이 만들고 나눠 먹어요',
    count: 29,
    threshold: 35,
    tags: ['베이킹', '요리', '취미'],
  },
  {
    type: 'group',
    groupId: 'g5',
    badge: '모임 확정',
    title: 'AI 프롬프트 엔지니어링 스터디 — 매주 과제 기반 실습',
    leader: '바닥장 AI마스터',
    leaderJob: '그로스 마케터 5년차',
    members: 11,
    max: 15,
    date: '4/27 (일) 15:00',
    location: '강남역',
    tags: ['AI', '프롬프트', 'ChatGPT'],
  },
];

// ── 시간대별 하늘 ──

export function getTimeBasedSky(): SkyInfo {
  const hour = new Date().getHours();
  // 다크 테마 시간대별 그라데이션
  if (hour >= 5 && hour < 8)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #2d1b3d 40%, #1a1a2e 100%)', period: 'dawn' };
  if (hour >= 8 && hour < 11)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #1a1a2e 100%)', period: 'morning' };
  if (hour >= 11 && hour < 15)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #1a2332 40%, #1a1a2e 100%)', period: 'day' };
  if (hour >= 15 && hour < 18)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #2a1f1a 40%, #1a1a2e 100%)', period: 'afternoon' };
  if (hour >= 18 && hour < 21)
    return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #2d1b2e 40%, #1a1a2e 100%)', period: 'sunset' };
  return { bg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #1a1a2e 100%)', period: 'night' };
}

// ── 배지 색상 맵 ──

export const BADGE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  '모임 확정': { bg: 'rgba(46, 213, 115, 0.12)', color: '#2ed573', border: 'rgba(46, 213, 115, 0.25)' },
  '니즈 모이는 중': { bg: 'rgba(255, 200, 87, 0.12)', color: '#ffd93d', border: 'rgba(255, 200, 87, 0.25)' },
  '마감 임박': { bg: 'rgba(255, 107, 107, 0.12)', color: '#ff6b6b', border: 'rgba(255, 107, 107, 0.25)' },
  'Next Stage 스토리': { bg: 'rgba(116, 185, 255, 0.12)', color: '#74b9ff', border: 'rgba(116, 185, 255, 0.25)' },
};
