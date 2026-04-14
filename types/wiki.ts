/**
 * Wiki 퍼블릭 타입 정의
 * wiki.tenone.biz에서 사용하는 DB 기반 위키 페이지 타입
 */

export type WikiCategory =
    | 'universe'      // 세계관
    | 'vision-house'  // 비전하우스
    | 'core-values'   // 코어 밸류
    | 'protocols'     // 프로토콜
    | 'brands'        // 브랜드
    | 'agents'        // 에이전트
    | 'chronicle'     // 연대기
    | 'insights';     // 인사이트

export interface WikiPage {
    id: string;
    slug: string;
    title: string;
    category: WikiCategory;
    content: string;         // 마크다운 ([[wikilink]] 포함)
    summary: string | null;
    tags: string[];
    source_refs: string[];
    version: number;
    created_at: string;
    updated_at: string;
}

export interface WikiLink {
    id: string;
    from_slug: string;
    to_slug: string;
    link_type: 'reference' | 'parent' | 'related';
}

export interface WikiLog {
    id: string;
    page_slug: string | null;
    action: 'create' | 'update' | 'link' | 'lint';
    diff_summary: string | null;
    created_at: string;
}

export const WIKI_CATEGORIES: Record<WikiCategory, { label: string; description: string; color: string }> = {
    universe:       { label: '세계관',    description: '철학·미션·비전·전략',          color: '#171717' },
    'vision-house': { label: '비전하우스', description: 'Universe의 그림·가치·방향성', color: '#7C3AED' },
    'core-values':  { label: '코어 밸류', description: 'Plan·Connect·Expand',         color: '#D97706' },
    protocols:      { label: '프로토콜',  description: 'Vrief·GPR·Principle 10',      color: '#059669' },
    brands:         { label: '브랜드',    description: '26개 브랜드 프로필',           color: '#2563EB' },
    agents:         { label: '에이전트',  description: 'AI 에이전트 팀',               color: '#0891B2' },
    chronicle:      { label: '연대기',    description: '22년 역사와 전환점',           color: '#6B7280' },
    insights:       { label: '인사이트',  description: '발견과 교훈',                  color: '#8B5CF6' },
};

/** 정적 페이지 (인트라에서 이전된 페이지) */
export const WIKI_STATIC_PAGES = [
    { slug: 'onboarding', title: 'Onboarding', description: '온보딩 체크리스트·필수 교육', category: '교육' as const },
    { slug: 'faq',        title: 'FAQ',        description: '자주 묻는 질문 모음',         category: '운영' as const },
] as const;

/** 검색 인덱스용 아이템 */
export interface WikiSearchItem {
    slug: string;
    title: string;
    category: string;
    tags: string[];
    summary: string;
    isStatic?: boolean;
}

/** 그래프 노드 */
export interface WikiGraphNode {
    id: string;      // slug
    label: string;   // title
    category: string;
    group: number;   // 카테고리 인덱스 (색상용)
}

/** 그래프 엣지 */
export interface WikiGraphEdge {
    source: string;
    target: string;
    type: string;
}
