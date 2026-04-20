/**
 * CRM 세그먼트 규칙 엔진
 * rules(JSONB) → Supabase PostgREST 필터 체인으로 변환
 *
 * 예:
 * {
 *   logic: 'and',
 *   conditions: [
 *     { field: 'lifecycle_stage', op: 'eq', value: 'customer' },
 *     { field: 'created_at', op: 'gte', value: 'now-7d' },
 *     { field: 'tags', op: 'overlaps', value: ['VIP'] }
 *   ]
 * }
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type SegmentLogic = 'and' | 'or';
export type SegmentOp =
    | 'eq' | 'neq' | 'in' | 'not_in'
    | 'contains' | 'gte' | 'lte'
    | 'is_null' | 'is_not_null'
    | 'overlaps';

export interface SegmentCondition {
    field: string;
    op: SegmentOp;
    value?: unknown;
}

export interface SegmentRules {
    logic: SegmentLogic;
    conditions: SegmentCondition[];
}

export interface Segment {
    id: string;
    name: string;
    description?: string;
    kind: 'dynamic' | 'static';
    rules: SegmentRules | { person_ids: string[] };
    personIds?: string[];
    color: string;
    brandId: string;
    createdBy?: string;
    createdAt: string;
    lastComputedCount?: number;
    lastComputedAt?: string;
}

/** 허용 필드 목록 — 임의 컬럼 필터 방지 */
export const ALLOWED_FIELDS = [
    'lifecycle_stage', 'type', 'status', 'brand_id', 'source',
    'do_not_email', 'do_not_contact',
    'tags', 'cohort', 'company',
    'created_at', 'last_touched_at', 'next_follow_up_at',
    'has_member', 'email',
] as const;

export const FIELD_LABELS: Record<string, string> = {
    lifecycle_stage: '라이프사이클',
    type: '타입',
    status: '상태',
    brand_id: '브랜드',
    source: '유입 경로',
    do_not_email: '이메일 수신 거부',
    do_not_contact: '연락 거부',
    tags: '태그',
    cohort: 'Cohort',
    company: '회사',
    created_at: '생성일',
    last_touched_at: '마지막 접점일',
    next_follow_up_at: '다음 Follow-up',
    has_member: '회원 가입 여부',
    email: '이메일',
};

export const OP_LABELS: Record<SegmentOp, string> = {
    eq: '=',
    neq: '≠',
    in: '∈ (목록)',
    not_in: '∉ (제외)',
    contains: '포함',
    gte: '≥',
    lte: '≤',
    is_null: '없음',
    is_not_null: '있음',
    overlaps: '교집합',
};

/** 상대 시각 토큰 → ISO 문자열 (e.g. "now-7d" → 7일 전) */
function resolveTimeToken(value: unknown): string {
    if (typeof value !== 'string') return String(value);
    const m = value.match(/^now([+-])(\d+)([dhm])$/);
    if (!m) return value;
    const [, sign, num, unit] = m;
    const n = parseInt(num, 10) * (sign === '-' ? -1 : 1);
    const d = new Date();
    if (unit === 'd') d.setDate(d.getDate() + n);
    else if (unit === 'h') d.setHours(d.getHours() + n);
    else if (unit === 'm') d.setMinutes(d.getMinutes() + n);
    return d.toISOString();
}

/**
 * 규칙 → Supabase 쿼리 체인
 * AND: .eq().gte()... 연쇄
 * OR: .or('col.eq.x,col.gte.y')
 */
export function buildSegmentQuery(
    supabase: SupabaseClient,
    rules: SegmentRules,
    select = '*',
    opts: { count?: 'exact' | 'planned' | 'estimated' } = {}
) {
    let q = opts.count
        ? supabase.from('crm_people').select(select, { count: opts.count })
        : supabase.from('crm_people').select(select);

    // has_member는 별도 처리 (member_id IS [NOT] NULL)
    const conditions = rules.conditions.filter(c => ALLOWED_FIELDS.includes(c.field as typeof ALLOWED_FIELDS[number]));

    if (rules.logic === 'and') {
        for (const c of conditions) {
            q = applyCondition(q, c);
        }
    } else {
        // OR: 문자열로 조합
        const orStr = conditions.map(c => conditionToOrString(c)).filter(Boolean).join(',');
        if (orStr) q = q.or(orStr);
    }
    return q;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyCondition(q: any, c: SegmentCondition): any {
    const { field, op, value } = c;

    if (field === 'has_member') {
        return value ? q.not('member_id', 'is', null) : q.is('member_id', null);
    }

    switch (op) {
        case 'eq':          return q.eq(field, value);
        case 'neq':         return q.neq(field, value);
        case 'in':          return q.in(field, Array.isArray(value) ? value : [value]);
        case 'not_in':      return q.not(field, 'in', `(${(Array.isArray(value) ? value : [value]).map(v => `"${v}"`).join(',')})`);
        case 'contains':    return q.ilike(field, `%${value}%`);
        case 'gte':         return q.gte(field, resolveTimeToken(value));
        case 'lte':         return q.lte(field, resolveTimeToken(value));
        case 'is_null':     return q.is(field, null);
        case 'is_not_null': return q.not(field, 'is', null);
        case 'overlaps':    return q.overlaps(field, Array.isArray(value) ? value : [value]);
        default:            return q;
    }
}

function conditionToOrString(c: SegmentCondition): string {
    const { field, op, value } = c;
    if (field === 'has_member') return value ? 'member_id.not.is.null' : 'member_id.is.null';
    switch (op) {
        case 'eq':       return `${field}.eq.${value}`;
        case 'neq':      return `${field}.neq.${value}`;
        case 'contains': return `${field}.ilike.%${value}%`;
        case 'gte':      return `${field}.gte.${resolveTimeToken(value)}`;
        case 'lte':      return `${field}.lte.${resolveTimeToken(value)}`;
        case 'is_null':  return `${field}.is.null`;
        default:         return '';
    }
}
