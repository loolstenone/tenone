import type { CloudWord, FeedItem, SkyInfo } from '@/types/badak';

// ── 니즈 클라우드 워드 (Mock) ──

export const CLOUD_WORDS: CloudWord[] = [
  { text: '페이스북 광고 어떻게 해?', size: 1.4, hasGroup: true, members: 12 },
  { text: '이직 준비 같이할 사람!', size: 1.8, hasGroup: true, members: 23 },
  { text: '브랜딩 처음부터 배우고 싶어', size: 1.6, hasGroup: false, members: 0 },
  { text: '사이드 프로젝트 같이 할래?', size: 1.3, hasGroup: true, members: 8 },
  { text: 'GA4 세팅 좀 알려줘', size: 1.1, hasGroup: false, members: 0 },
  { text: 'UX 리서치 어디서 배우지?', size: 1.0, hasGroup: false, members: 0 },
  { text: '팀장 됐는데 뭐부터 하지?', size: 1.5, hasGroup: true, members: 15 },
  { text: '콘텐츠 마케팅 어떻게 하지?', size: 1.2, hasGroup: false, members: 0 },
  { text: '프리랜서로 전환할까 고민 중', size: 1.3, hasGroup: true, members: 6 },
  { text: '데이터 분석 같이 공부하자', size: 1.1, hasGroup: true, members: 19 },
  { text: '창업 아이디어 검증해볼 사람?', size: 0.9, hasGroup: false, members: 0 },
  { text: 'AI 실무에서 쓰고 싶은데', size: 1.7, hasGroup: true, members: 31 },
  { text: '업계 사람들 만나고 싶어', size: 0.9, hasGroup: true, members: 9 },
  { text: 'CRM 자동화 배우고 싶어', size: 1.3, hasGroup: true, members: 11 },
  { text: '마케팅 디렉터 되고 싶은데', size: 1.5, hasGroup: false, members: 0 },
  { text: '인플루언서 마케팅 해본 사람?', size: 1.2, hasGroup: true, members: 14 },
  { text: '이커머스 성장 어떻게 하지?', size: 1.4, hasGroup: false, members: 0 },
  { text: '퍼포먼스 마케팅 입문할래', size: 1.3, hasGroup: true, members: 17 },
  { text: '그로스해킹 실전에서 써보자', size: 1.6, hasGroup: true, members: 22 },
  { text: '연봉 협상 노하우 공유해!', size: 1.4, hasGroup: true, members: 26 },
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
  // 화이트 기반 파스텔 그라데이션 — 시간대를 은은하게 느낌
  if (hour >= 5 && hour < 8)
    return { bg: 'linear-gradient(180deg, #f8f0ff 0%, #fce4ec 40%, #fff8e1 100%)', period: 'dawn' };
  if (hour >= 8 && hour < 11)
    return { bg: 'linear-gradient(180deg, #e3f2fd 0%, #f1f8ff 40%, #ffffff 100%)', period: 'morning' };
  if (hour >= 11 && hour < 15)
    return { bg: 'linear-gradient(180deg, #e8f5e9 0%, #f5f5f5 50%, #ffffff 100%)', period: 'day' };
  if (hour >= 15 && hour < 18)
    return { bg: 'linear-gradient(180deg, #fff3e0 0%, #fff8f0 40%, #ffffff 100%)', period: 'afternoon' };
  if (hour >= 18 && hour < 21)
    return { bg: 'linear-gradient(180deg, #fce4ec 0%, #f3e5f5 40%, #ede7f6 100%)', period: 'sunset' };
  return { bg: 'linear-gradient(180deg, #e8eaf6 0%, #f5f5f5 50%, #fafafa 100%)', period: 'night' };
}

// ── 배지 색상 맵 ──

export const BADGE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  '모임 확정': { bg: 'rgba(46, 213, 115, 0.12)', color: '#2ed573', border: 'rgba(46, 213, 115, 0.25)' },
  '니즈 모이는 중': { bg: 'rgba(255, 200, 87, 0.12)', color: '#ffd93d', border: 'rgba(255, 200, 87, 0.25)' },
  '마감 임박': { bg: 'rgba(255, 107, 107, 0.12)', color: '#ff6b6b', border: 'rgba(255, 107, 107, 0.25)' },
  'Next Stage 스토리': { bg: 'rgba(116, 185, 255, 0.12)', color: '#74b9ff', border: 'rgba(116, 185, 255, 0.25)' },
};
