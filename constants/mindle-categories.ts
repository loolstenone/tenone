/**
 * Mindle 정보 분류 카테고리 11개
 * Whole See 크롤링 파이프라인 + Mindle 트렌드 카드 분류 기준
 */

export const MINDLE_CATEGORIES = [
  {
    id: 'trend_market',
    label: '트렌드·시장',
    description: '시장 동향, 소비자 변화, 거시 트렌드',
  },
  {
    id: 'marketing_branding',
    label: '마케팅·브랜딩·광고',
    description: '캠페인 사례, 퍼포먼스, 브랜딩 전략',
  },
  {
    id: 'tech',
    label: '기술',
    description: 'AI, SaaS, 개발, 인프라, 디지털 전환',
  },
  {
    id: 'community_signal',
    label: '커뮤니티 시그널·밈',
    description: '바닥·MAD 반응, SNS 밈, 여론',
  },
  {
    id: 'creative_reference',
    label: '크리에이티브·레퍼런스',
    description: '디자인, 카피, 영상, 광고 레퍼런스',
  },
  {
    id: 'talent_career',
    label: '인재·커리어',
    description: '채용 시장, 직무 트렌드, 역량 개발',
  },
  {
    id: 'industry_vertical',
    label: '업계 버티컬',
    description: '패션, 관광, 지역, 식품 등 유니버스 연관 업계',
  },
  {
    id: 'creator_trend',
    label: '크리에이터 동향',
    description: '인플루언서, 크리에이터 이코노미, 플랫폼',
  },
  {
    id: 'business_corporate',
    label: '기업',
    description: '창업, 투자, 상장, 기업 공시, M&A',
  },
  {
    id: 'empathy_emotion',
    label: '공감·감성',
    description: '공감 콘텐츠, 감성, 윤리, 인간적 이야기',
  },
  {
    id: 'growth_network',
    label: '성장·네트워크',
    description: '유니버스 철학 키워드, 연결, 성장 스토리',
  },
] as const;

export type MindleCategory = (typeof MINDLE_CATEGORIES)[number]['id'];

export const MINDLE_CATEGORY_IDS = MINDLE_CATEGORIES.map((c) => c.id);

export const MINDLE_CATEGORY_MAP = Object.fromEntries(
  MINDLE_CATEGORIES.map((c) => [c.id, c]),
) as Record<MindleCategory, (typeof MINDLE_CATEGORIES)[number]>;

/** Claude API 분류 프롬프트용 카테고리 목록 문자열 */
export const MINDLE_CATEGORY_LIST_FOR_PROMPT = MINDLE_CATEGORIES.map(
  (c) => `${c.id} (${c.label}: ${c.description})`,
).join('\n');
