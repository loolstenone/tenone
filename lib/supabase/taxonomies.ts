/**
 * Taxonomies — DB 기반 분류 체계
 * job_function / industry / job_level 등을 taxonomies 테이블에서 조회한다.
 * 정적 badak-constants.ts의 DB 버전.
 */
import { createClient } from '@supabase/supabase-js';

export type TaxonomyKind = 'job_function' | 'industry' | 'job_level';

export interface Taxonomy {
  id: string;
  kind: TaxonomyKind;
  value: string;
  label: string;
  category: string | null;
  sort_order: number;
}

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── 단일 kind 조회 ─────────────────────────────────────────────────

export async function getTaxonomies(kind: TaxonomyKind): Promise<string[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('taxonomies')
    .select('label')
    .eq('kind', kind)
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data?.length) return getFallback(kind);
  return data.map((r) => r.label);
}

// ── 전체 조회 (kind → labels[]) ────────────────────────────────────

export async function getAllTaxonomies(): Promise<Record<TaxonomyKind, string[]>> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('taxonomies')
    .select('kind, label, sort_order')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data?.length) {
    return {
      job_function: getFallback('job_function'),
      industry: getFallback('industry'),
      job_level: getFallback('job_level'),
    };
  }

  const result: Record<TaxonomyKind, string[]> = {
    job_function: [],
    industry: [],
    job_level: [],
  };

  for (const row of data) {
    if (row.kind in result) {
      result[row.kind as TaxonomyKind].push(row.label);
    }
  }

  // 빈 kind는 정적 fallback으로 채움
  for (const kind of Object.keys(result) as TaxonomyKind[]) {
    if (!result[kind].length) result[kind] = getFallback(kind);
  }

  return result;
}

// ── 정적 fallback ──────────────────────────────────────────────────

function getFallback(kind: TaxonomyKind): string[] {
  switch (kind) {
    case 'job_function':
      return JOB_FUNCTIONS_FALLBACK;
    case 'industry':
      return INDUSTRIES_FALLBACK;
    case 'job_level':
      return JOB_LEVELS_FALLBACK;
  }
}

const JOB_FUNCTIONS_FALLBACK = [
  '마케팅', '광고', '홍보/PR', '브랜딩', '퍼포먼스 마케팅',
  '콘텐츠 마케팅', 'CRM', '그로스', 'SEO/SEM',
  '기획/전략', '서비스 기획', '상품 기획',
  '디자인', 'UX/UI', '영상/모션', '사진/포토그래피',
  '개발', '프론트엔드', '백엔드', '데이터/AI',
  '영업', '사업 개발', '파트너십', '구매/MD',
  '인사/HR', '조직문화', '채용', '재무/회계', '법무', '경영/대표', '컨설팅',
  '자영업/점포 운영', '요식업 운영 (식당·카페·베이커리)',
  '크리에이터/인플루언서', '프리랜서',
  '학생', '취업 준비', '기타',
];

const INDUSTRIES_FALLBACK = [
  '광고대행사', '미디어렙', 'MCN', '프로덕션',
  '브랜드(인하우스)', '유통/리테일', '이커머스',
  'IT/테크', 'SaaS', '스타트업', '핀테크',
  '금융/보험', '컨설팅/회계법인', '로펌',
  '제조', '건설/부동산', '물류/모빌리티',
  '미디어/출판', '엔터테인먼트', '게임',
  'F&B (기업형)', '식당·카페·베이커리 (자영업)', '패션/뷰티',
  '여행/호스피탈리티', '소상공인/자영업 (기타 업종)',
  '교육/에듀테크', '헬스케어/바이오', '공공/비영리',
  '프리랜서/1인기업', '기타',
];

const JOB_LEVELS_FALLBACK = [
  '신입 (0~2년)', '주니어 (3~5년)', '미들 (6~9년)', '시니어 (10년+)',
  '팀장/매니저', '임원/C-Level',
  '대표/공동창업자', '자영업자/사장님', '프리랜서/개인사업자',
  '학생', '취업 준비 중',
];
