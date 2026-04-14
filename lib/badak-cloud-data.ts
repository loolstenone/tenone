import type { CloudWord, FeedItem, SkyInfo } from '@/types/badak';

// ── 니즈 클라우드 워드 (Mock) ──

export const CLOUD_WORDS: CloudWord[] = [
  { text: '페이스북 광고 어떻게 해?', size: 1.4, hasGroup: true, members: 12, group: {
    id: 'g1', title: '페이스북 광고 실전 스터디', type: 'recurring', maxMembers: 20, currentMembers: 12,
    leaderName: '김도현', leaderJob: 'IT · PM 5년차', schedule: '매주 수 19:30', location: '강남역', status: 'recruiting',
  }},
  { text: '이직 준비 같이할 사람!', size: 1.8, hasGroup: true, members: 23, group: {
    id: 'g2', title: '이직 준비 — 에이전시↔인하우스 경험 나누기', type: 'once', maxMembers: 25, currentMembers: 23,
    leaderName: '박서연', leaderJob: '광고 · AE 7년차', eventDate: '4/22 (화) 19:30', location: '강남역', status: 'recruiting',
  }},
  { text: '브랜딩 처음부터 배우고 싶어', size: 1.6, hasGroup: false, members: 8 },
  { text: '사이드 프로젝트 같이 할래?', size: 1.3, hasGroup: true, members: 8, group: {
    id: 'g3', title: '사이드 프로젝트 팀 빌딩', type: 'recurring', maxMembers: 12, currentMembers: 8,
    leaderName: '정민수', leaderJob: '개발 · 프론트엔드 3년차', schedule: '격주 토 14:00', location: '성수동', status: 'recruiting',
  }},
  { text: 'GA4 세팅 좀 알려줘', size: 1.1, hasGroup: false, members: 5 },
  { text: 'UX 리서치 어디서 배우지?', size: 1.0, hasGroup: false, members: 3 },
  { text: '팀장 됐는데 뭐부터 하지?', size: 1.5, hasGroup: true, members: 15, group: {
    id: 'g4', title: '리더 1년차 모임', type: 'once', maxMembers: 15, currentMembers: 14,
    leaderName: '이준호', leaderJob: '제조 · 팀장 1년차', eventDate: '4/20 (일) 11:00', location: '합정', status: 'confirmed',
  }},
  { text: '콘텐츠 마케팅 어떻게 하지?', size: 1.2, hasGroup: false, members: 11 },
  { text: '프리랜서로 전환할까 고민 중', size: 1.3, hasGroup: true, members: 6, group: {
    id: 'g5', title: '프리랜서 전환 경험 공유', type: 'once', maxMembers: 15, currentMembers: 6,
    leaderName: '한지은', leaderJob: '디자인 · 프리랜서 2년차', eventDate: '4/26 (토) 15:00', location: '홍대입구', status: 'recruiting',
  }},
  { text: '데이터 분석 같이 공부하자', size: 1.1, hasGroup: true, members: 19, group: {
    id: 'g6', title: '데이터 분석 스터디', type: 'recurring', maxMembers: 25, currentMembers: 19,
    leaderName: '오세진', leaderJob: '데이터 · 분석가 4년차', schedule: '매주 목 20:00', location: '선릉역', status: 'recruiting',
  }},
  { text: '창업 아이디어 검증해볼 사람?', size: 0.9, hasGroup: false, members: 7 },
  { text: 'AI 실무에서 쓰고 싶은데', size: 1.7, hasGroup: true, members: 31, group: {
    id: 'g7', title: 'AI 활용법 — 실무 프롬프트 엔지니어링', type: 'recurring', maxMembers: 40, currentMembers: 31,
    leaderName: '김도현', leaderJob: 'IT · PM 5년차', schedule: '매주 토 14:00', location: '성수동', status: 'recruiting',
  }},
  { text: '업계 사람들 만나고 싶어', size: 0.9, hasGroup: true, members: 9, group: {
    id: 'g8', title: '마케팅 업계 네트워킹 밋업', type: 'once', maxMembers: 20, currentMembers: 9,
    leaderName: '류하나', leaderJob: '홍보 · PR 6년차', eventDate: '5/3 (토) 18:00', location: '이태원', status: 'recruiting',
  }},
  { text: 'CRM 자동화 배우고 싶어', size: 1.3, hasGroup: true, members: 11, group: {
    id: 'g9', title: 'CRM 자동화 워크숍', type: 'once', maxMembers: 15, currentMembers: 11,
    leaderName: '송재혁', leaderJob: '마케팅 · CRM 3년차', eventDate: '4/27 (일) 13:00', location: '강남역', status: 'recruiting',
  }},
  { text: '마케팅 디렉터 되고 싶은데', size: 1.5, hasGroup: false, members: 13 },
  { text: '인플루언서 마케팅 해본 사람?', size: 1.2, hasGroup: true, members: 14, group: {
    id: 'g10', title: '인플루언서 마케팅 실전', type: 'recurring', maxMembers: 20, currentMembers: 14,
    leaderName: '윤서아', leaderJob: '소셜 · 인플루언서 마케터 4년차', schedule: '격주 수 19:00', location: '합정', status: 'recruiting',
  }},
  { text: '이커머스 성장 어떻게 하지?', size: 1.4, hasGroup: false, members: 9 },
  { text: '퍼포먼스 마케팅 입문할래', size: 1.3, hasGroup: true, members: 17, group: {
    id: 'g11', title: '퍼포먼스 마케팅 입문반', type: 'recurring', maxMembers: 20, currentMembers: 17,
    leaderName: '장우진', leaderJob: '퍼포먼스 · 마케터 5년차', schedule: '매주 화 20:00', location: '역삼역', status: 'recruiting',
  }},
  { text: '그로스해킹 실전에서 써보자', size: 1.6, hasGroup: true, members: 22, group: {
    id: 'g12', title: '그로스해킹 실전 랩', type: 'recurring', maxMembers: 25, currentMembers: 22,
    leaderName: '최영준', leaderJob: '그로스 · PM 6년차', schedule: '매주 월 19:30', location: '선릉역', status: 'recruiting',
  }},
  { text: '연봉 협상 노하우 공유해!', size: 1.4, hasGroup: true, members: 26, group: {
    id: 'g13', title: '연봉 협상 노하우 공유 모임', type: 'once', maxMembers: 30, currentMembers: 26,
    leaderName: '김태리', leaderJob: 'HR · 헤드헌터 8년차', eventDate: '5/10 (토) 14:00', location: '강남역', status: 'recruiting',
  }},
  { text: '영상 촬영 배우고 싶어', size: 1.0, hasGroup: false, members: 4 },
  { text: '미디어 바잉 노하우 있는 분?', size: 1.2, hasGroup: true, members: 7, group: {
    id: 'g14', title: '미디어 바잉 노하우 공유', type: 'once', maxMembers: 12, currentMembers: 7,
    leaderName: '박진우', leaderJob: '매체 · 미디어 바이어 5년차', eventDate: '5/4 (일) 15:00', location: '광화문', status: 'recruiting',
  }},
  { text: 'SEO 어디서부터 시작하지?', size: 1.1, hasGroup: false, members: 6 },
  { text: '카피라이팅 같이 연습할래?', size: 1.3, hasGroup: true, members: 10, group: {
    id: 'g15', title: '카피라이팅 실전 연습', type: 'recurring', maxMembers: 15, currentMembers: 10,
    leaderName: '이수민', leaderJob: '콘텐츠 · 카피라이터 3년차', schedule: '격주 목 19:30', location: '합정', status: 'recruiting',
  }},
  { text: '에이전시 창업 고민 중', size: 0.9, hasGroup: false, members: 2 },
  { text: 'B2B 마케팅 해본 사람?', size: 1.2, hasGroup: true, members: 13, group: {
    id: 'g16', title: 'B2B 마케팅 실무 모임', type: 'recurring', maxMembers: 20, currentMembers: 13,
    leaderName: '강현우', leaderJob: 'B2B · 마케터 4년차', schedule: '매주 금 12:00', location: '삼성역', status: 'recruiting',
  }},
  { text: '포트폴리오 피드백 받고 싶어', size: 1.4, hasGroup: true, members: 18, group: {
    id: 'g17', title: '포트폴리오 피드백 세션', type: 'once', maxMembers: 20, currentMembers: 18,
    leaderName: '정유리', leaderJob: '디자인 · 시니어 디자이너 6년차', eventDate: '4/25 (금) 19:00', location: '성수동', status: 'recruiting',
  }},
  { text: '마케터 번아웃 극복한 사람?', size: 1.5, hasGroup: true, members: 20, group: {
    id: 'g18', title: '마케터 번아웃 극복 모임', type: 'once', maxMembers: 25, currentMembers: 20,
    leaderName: '임서현', leaderJob: '마케팅 · 브랜드 매니저 7년차', eventDate: '5/1 (목) 19:30', location: '홍대입구', status: 'recruiting',
  }},
  { text: '리텐션 전략 공유해요', size: 1.1, hasGroup: false, members: 10 },
  { text: '소셜미디어 트렌드 같이 분석', size: 1.3, hasGroup: true, members: 16, group: {
    id: 'g19', title: '소셜미디어 트렌드 분석 모임', type: 'recurring', maxMembers: 20, currentMembers: 16,
    leaderName: '나은비', leaderJob: '소셜 · 콘텐츠 마케터 3년차', schedule: '매주 수 12:00', location: '강남역', status: 'recruiting',
  }},
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
    badge: '모임 확정',
    title: 'AI 활용법 — 실무에서 바로 쓰는 프롬프트 엔지니어링',
    leader: '바닥장 김도현',
    leaderJob: 'IT · PM 5년차',
    members: 31,
    max: 40,
    date: '4/19 (토) 14:00',
    location: '성수동',
    tags: ['AI', '실무', '프롬프트'],
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
    badge: '모임 확정',
    title: '이직 준비 — 에이전시↔인하우스 경험 나누기',
    leader: '바닥장 박서연',
    leaderJob: '광고 · AE 7년차',
    members: 23,
    max: 25,
    date: '4/22 (화) 19:30',
    location: '강남역',
    tags: ['이직', '커리어', '광고'],
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
    badge: '마감 임박',
    title: '팀장 되었는데 막막해 — 리더 1년차 모임',
    leader: '바닥장 이준호',
    leaderJob: '제조 · 팀장 1년차',
    members: 14,
    max: 15,
    date: '4/20 (일) 11:00',
    location: '합정',
    tags: ['리더십', '팀장', '고민상담'],
  },
  {
    type: 'story',
    badge: 'Next Stage 스토리',
    title: '"바닥에서 만난 개발자 덕분에 사이드 프로젝트가 회사가 됐어요"',
    author: '최민지',
    authorJob: '前 마케터 → 現 스타트업 대표',
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
