// Mock scan result data for Phase 1 MVP
// URL 기반 해시로 결정적(deterministic) 결과 생성 — 같은 URL → 같은 점수

export interface ScanItem {
  name: string;
  score: number;
  maxScore: number;
  status: 'pass' | 'warning' | 'fail';
  description: string;
  action: string;
}

export interface GeoCheck {
  platform: string;
  mentioned: boolean;
  details: string;
}

export interface ScanResult {
  id: string;
  url: string;
  date: string;
  totalScore: number;
  seoScore: number;
  geoScore: number;
  grade: 'excellent' | 'good' | 'needs_work' | 'critical';
  techSeo: ScanItem[];
  contentSeo: ScanItem[];
  geoChecks: GeoCheck[];
  geoReadiness: ScanItem[];
  topIssues: { severity: 'high' | 'medium' | 'low'; title: string; description: string; action: string }[];
}

export const GRADE_MAP = {
  excellent: { color: '#10B981', label: 'Excellent', emoji: '🟢', message: 'AI 시대 검색 준비 완료' },
  good: { color: '#F59E0B', label: 'Good', emoji: '🟡', message: '기본은 갖췄지만 개선 여지 있음' },
  needs_work: { color: '#F97316', label: 'Needs Work', emoji: '🟠', message: '놓치고 있는 기회가 많음' },
  critical: { color: '#EF4444', label: 'Critical', emoji: '🔴', message: '지금 고객을 잃고 있을 가능성 높음' },
} as const;

// URL 문자열을 해시값으로 변환 — 같은 문자열이면 항상 같은 숫자
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit integer
  }
  return Math.abs(hash);
}

// 해시 기반 시드 난수 생성기 (같은 시드 → 같은 시퀀스)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function getGrade(score: number): ScanResult['grade'] {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'needs_work';
  return 'critical';
}

function getStatus(score: number, maxScore: number): ScanItem['status'] {
  const ratio = score / maxScore;
  if (ratio >= 0.7) return 'pass';
  if (ratio >= 0.4) return 'warning';
  return 'fail';
}

export function generateMockScan(url: string): ScanResult {
  const normalizedUrl = url.toLowerCase().replace(/\/+$/, '').replace(/^https?:\/\//, '');
  const hash = hashString(normalizedUrl);
  const rand = seededRandom(hash);

  const id = hash.toString(36).substring(0, 8);

  // 점수 생성 (URL 기반 결정적)
  const techSeoItems = [
    { name: '페이지 로딩 속도', maxScore: 15, descGood: 'LCP 2.1초 — 양호', descBad: 'LCP 3.2초 — 2.5초 이하 권장', action: '이미지 최적화 및 CDN 적용' },
    { name: '모바일 최적화', maxScore: 10, descGood: '반응형 레이아웃 적용됨', descBad: '모바일 뷰포트 미설정, 터치 요소 간격 부족', action: '반응형 디자인 적용 및 터치 요소 간격 확인' },
    { name: 'HTTPS 적용', maxScore: 5, descGood: 'SSL 인증서 유효', descBad: 'HTTP 혼합 콘텐츠 감지', action: '모든 리소스 HTTPS로 전환' },
    { name: '크롤링 접근성', maxScore: 5, descGood: 'robots.txt, sitemap.xml 정상', descBad: 'robots.txt 존재, sitemap.xml 누락', action: 'sitemap.xml 생성 및 Search Console 등록' },
    { name: '인덱싱 상태', maxScore: 5, descGood: '주요 페이지 정상 인덱싱', descBad: '등록 페이지 12/45 — 미등록 페이지 다수', action: 'Google Search Console에서 인덱싱 요청' },
    { name: '깨진 링크', maxScore: 5, descGood: '깨진 링크 없음', descBad: '404 에러 3건 발견', action: '깨진 링크 수정 또는 301 리다이렉트' },
    { name: '구조화 데이터', maxScore: 5, descGood: 'Organization 스키마 적용됨', descBad: 'Schema.org 마크업 없음', action: 'FAQ, LocalBusiness 스키마 추가' },
  ];

  const contentSeoItems = [
    { name: '타이틀 태그', maxScore: 10, descGood: '페이지별 고유 타이틀 설정됨', descBad: '일부 페이지 타이틀 중복', action: '페이지별 고유 타이틀 설정' },
    { name: '메타 디스크립션', maxScore: 5, descGood: '메타 디스크립션 정상 설정', descBad: '70% 페이지 메타 설명 누락', action: '모든 페이지에 150자 내외 매력적인 메타 설명 추가' },
    { name: 'H1~H3 구조', maxScore: 5, descGood: '제목 계층 구조 양호', descBad: 'H1 중복 2건, 계층 구조 혼란', action: '페이지당 H1 1개로 정리' },
    { name: '이미지 ALT 태그', maxScore: 5, descGood: 'ALT 태그 대부분 설정됨', descBad: 'ALT 누락률 60%', action: '모든 이미지에 설명 ALT 태그 추가' },
    { name: '키워드 커버리지', maxScore: 10, descGood: '업종 주요 키워드 70% 커버', descBad: '업종 주요 키워드 30% 커버', action: '키워드 기반 콘텐츠 제작 필요' },
    { name: '콘텐츠 볼륨', maxScore: 5, descGood: '콘텐츠 충분', descBad: 'thin content 5페이지 감지', action: '300자 이상으로 콘텐츠 보강' },
    { name: '내부 링크 구조', maxScore: 10, descGood: '내부 링크 구조 양호', descBad: '고아 페이지 8건, 링크 깊이 과다', action: '주요 페이지 간 내부 링크 추가' },
  ];

  const techSeo: ScanItem[] = techSeoItems.map(item => {
    const r = rand();
    const score = Math.floor(r * (item.maxScore * 0.6)) + Math.floor(item.maxScore * 0.2);
    const clampedScore = Math.min(score, item.maxScore);
    const status = getStatus(clampedScore, item.maxScore);
    return {
      name: item.name,
      score: clampedScore,
      maxScore: item.maxScore,
      status,
      description: status === 'pass' ? item.descGood : item.descBad,
      action: item.action,
    };
  });

  const contentSeo: ScanItem[] = contentSeoItems.map(item => {
    const r = rand();
    const score = Math.floor(r * (item.maxScore * 0.6)) + Math.floor(item.maxScore * 0.2);
    const clampedScore = Math.min(score, item.maxScore);
    const status = getStatus(clampedScore, item.maxScore);
    return {
      name: item.name,
      score: clampedScore,
      maxScore: item.maxScore,
      status,
      description: status === 'pass' ? item.descGood : item.descBad,
      action: item.action,
    };
  });

  const seoScore = Math.round(
    (techSeo.reduce((s, i) => s + i.score, 0) + contentSeo.reduce((s, i) => s + i.score, 0)) / 100 * 100
  );

  const geoPlatforms = [
    { platform: 'ChatGPT', mentionedDesc: '브랜드명 1회 언급', notDesc: '언급 없음' },
    { platform: 'Perplexity', mentionedDesc: '출처로 인용됨', notDesc: '인용 없음' },
    { platform: 'Google AI Overview', mentionedDesc: 'AI 요약에 포함', notDesc: '포함되지 않음' },
    { platform: '네이버 AI (Cue)', mentionedDesc: 'AI 답변에 포함', notDesc: '포함되지 않음' },
  ];

  const geoChecks: GeoCheck[] = geoPlatforms.map((p, i) => {
    const mentioned = rand() > (0.5 + i * 0.08); // 뒤 플랫폼일수록 노출 확률 낮음
    return {
      platform: p.platform,
      mentioned,
      details: mentioned ? p.mentionedDesc : p.notDesc,
    };
  });

  const geoExposureScore = geoChecks.reduce((s, c) => s + (c.mentioned ? [20, 20, 20, 15][geoPlatforms.findIndex(p => p.platform === c.platform)] : 0), 0);

  const geoReadinessItems = [
    { name: '구조화 데이터 AI 친화도', maxScore: 10, descGood: 'FAQ, HowTo 스키마 적용됨', descBad: 'FAQ 스키마 없음', action: 'FAQ, HowTo 스키마 마크업 추가' },
    { name: '콘텐츠 인용 가능성', maxScore: 10, descGood: '명확한 문장 구조, 팩트 기반 서술', descBad: '팩트 기반 서술 부족', action: '명확한 문장 구조 + 데이터 기반 서술' },
    { name: '도메인 권위도', maxScore: 5, descGood: '백링크 충분, 도메인 에이지 양호', descBad: '백링크 12건, 도메인 에이지 1년', action: '양질의 콘텐츠로 자연 백링크 확보' },
  ];

  const geoReadiness: ScanItem[] = geoReadinessItems.map(item => {
    const r = rand();
    const score = Math.floor(r * (item.maxScore * 0.6)) + Math.floor(item.maxScore * 0.15);
    const clampedScore = Math.min(score, item.maxScore);
    const status = getStatus(clampedScore, item.maxScore);
    return {
      name: item.name,
      score: clampedScore,
      maxScore: item.maxScore,
      status,
      description: status === 'pass' ? item.descGood : item.descBad,
      action: item.action,
    };
  });

  const geoReadinessScore = geoReadiness.reduce((s, i) => s + i.score, 0);
  const geoScore = Math.round((geoExposureScore + geoReadinessScore) / 100 * 100);
  const totalScore = Math.round(seoScore * 0.5 + geoScore * 0.5);

  // 상위 이슈: 점수가 낮은 항목 기반으로 동적 생성
  const allItems = [...techSeo, ...contentSeo, ...geoReadiness];
  const worstItems = allItems
    .map(item => ({ ...item, ratio: item.score / item.maxScore }))
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 3);

  const topIssues = worstItems.map((item, i) => ({
    severity: (i === 0 ? 'high' : i === 1 ? 'high' : 'medium') as 'high' | 'medium' | 'low',
    title: `${item.name} 개선 필요`,
    description: item.description,
    action: item.action,
  }));

  // GEO 노출 안 되는 경우 최우선 이슈로 추가
  const geoMentionCount = geoChecks.filter(c => c.mentioned).length;
  if (geoMentionCount <= 1) {
    topIssues.unshift({
      severity: 'high',
      title: 'AI 검색에서 브랜드 노출 부족',
      description: `${4 - geoMentionCount}개 AI 검색 플랫폼에서 브랜드가 노출되지 않고 있습니다.`,
      action: '구조화 데이터 + FAQ 콘텐츠로 AI 인용 가능성 향상',
    });
    topIssues.pop();
  }

  return {
    id,
    url,
    date: new Date().toISOString(),
    totalScore,
    seoScore,
    geoScore,
    grade: getGrade(totalScore),
    techSeo,
    contentSeo,
    geoChecks,
    geoReadiness,
    topIssues,
  };
}
