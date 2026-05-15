/**
 * Action Hub Registry — 유니버스 공통 SSOT
 *
 * 역할: 각 브랜드의 "처리 대기 액션"을 하나의 레지스트리에 등록하면
 *       Dashboard Action Hub가 자동으로 pending count를 집계해 카드로 표시.
 *
 * 규약 (CLAUDE.md §1.11 참조):
 *   - 새 브랜드에 승인·모더레이션·CS·개인정보 등 관리자 액션 테이블이 생기면
 *     반드시 여기에 엔트리를 추가한다.
 *   - 브랜드 CLAUDE.md에도 "Action Hub Entries" 섹션으로 문서화.
 *   - 테이블 스키마: `status='pending'` (또는 지정 column/value) + admin이 처리
 *
 * 확장 시 고려:
 *   - category로 그룹핑 (approval · cs · privacy · moderation · payment)
 *   - priority로 정렬 (critical · high · normal)
 *   - 추가 테이블은 select에 필요한 필드만 (count:exact + head:true)
 */

export type ActionCategory = "approval" | "cs" | "privacy" | "moderation" | "payment" | "agent";

export interface ActionEntry {
    /** 고유 키 (snake_case) */
    key: string;
    /** 카드 제목 (한국어) */
    label: string;
    /** Supabase 테이블명 */
    table: string;
    /** 필터 조건: column → value (1차 필터) */
    filter: { column: string; value: string };
    /** 추가 AND 조건 (선택) — 예: severity='critical' 같이 second-axis 필터링 시 사용 */
    extraFilters?: Array<{ column: string; value: string }>;
    /** 클릭 시 이동할 관리 페이지 */
    href: string;
    /** 소속 브랜드 (공통이면 global) */
    brand_id: string | "global";
    /** 분류 */
    category: ActionCategory;
    /** 우선순위 (critical > high > normal) */
    priority?: "critical" | "high" | "normal";
}

export const ACTION_HUB_REGISTRY: ActionEntry[] = [
    // ── 승인 (Approval)
    {
        key: "mad_applications",
        label: "MAD League 지원서",
        table: "mad_applications",
        filter: { column: "status", value: "pending" },
        href: "/intra/ums/madleague",
        brand_id: "madleague",
        category: "approval",
        priority: "normal",
    },
    {
        key: "jakka_seller_applications",
        label: "Jakka 판매자 심사",
        table: "jakka_seller_applications",
        filter: { column: "status", value: "pending" },
        href: "/intra/ums/jakka/sellers",
        brand_id: "jakka",
        category: "approval",
        priority: "high",
    },
    {
        key: "jakka_showcase_approvals",
        label: "Jakka 쇼케이스 승인",
        table: "jakka_showcase_approvals",
        filter: { column: "status", value: "pending" },
        href: "/intra/ums/jakka/showcases",
        brand_id: "jakka",
        category: "approval",
        priority: "normal",
    },
    {
        key: "badak_leader_applications",
        label: "Badak 바닥장 심사",
        table: "badak_leader_applications",
        filter: { column: "status", value: "pending" },
        href: "/intra/ums/badak/applications",
        brand_id: "badak",
        category: "approval",
        priority: "normal",
    },
    {
        key: "brand_membership_applications",
        label: "브랜드 멤버십 신청",
        table: "brand_membership_applications",
        filter: { column: "status", value: "pending" },
        href: "/intra/ums/members",
        brand_id: "global",
        category: "approval",
        priority: "normal",
    },
    {
        key: "montz_verifications",
        label: "MoNTZ 모델 인증",
        table: "montz_verification_requests",
        filter: { column: "status", value: "pending" },
        href: "/intra/ums/montz",
        brand_id: "montz",
        category: "approval",
        priority: "normal",
    },
    {
        key: "mad_hero_applications",
        label: "MAD Hero 지원서",
        table: "mad_hero_applications",
        filter: { column: "status", value: "pending" },
        href: "/intra/ums/madleague",
        brand_id: "madleague",
        category: "approval",
        priority: "normal",
    },

    // ── 개인정보 (Privacy)
    {
        key: "privacy_deletion",
        label: "탈퇴 처리 대기",
        table: "privacy_deletion_requests",
        filter: { column: "status", value: "pending" },
        href: "/intra/ums/members/privacy",
        brand_id: "global",
        category: "privacy",
        priority: "critical",
    },

    // ── CS · 문의
    {
        key: "contact_submissions",
        label: "연락/문의 미답변",
        table: "contact_submissions",
        filter: { column: "status", value: "new" },
        href: "/intra/marketing/crm/people",
        brand_id: "global",
        category: "cs",
        priority: "high",
    },
    {
        key: "jakka_qna",
        label: "Jakka 작품 Q&A 미답변",
        table: "jakka_product_qna",
        filter: { column: "status", value: "open" },
        href: "/intra/ums/jakka",
        brand_id: "jakka",
        category: "cs",
        priority: "normal",
    },
    {
        key: "jakka_orders_pending",
        label: "Jakka 주문 확정 대기",
        table: "jakka_orders",
        filter: { column: "status", value: "pending" },
        href: "/intra/ums/jakka/market",
        brand_id: "jakka",
        category: "payment",
        priority: "high",
    },

    // ── HeRo 탤런트 에이전시
    {
        key: "hero_talent_applications",
        label: "HeRo 탤런트 에이전시 신청",
        table: "hero_talent_applications",
        filter: { column: "status", value: "pending" },
        href: "/intra/hero/talent-agent/applications",
        brand_id: "hero",
        category: "approval",
        priority: "high",
    },

    // ── 비즈니스 기회 (Opportunity) — Whole See 수집 → ERP 운영
    {
        key: "opportunity_new",
        label: "신규 수주 기회 (미검토)",
        table: "wio_opportunities",
        filter: { column: "status", value: "new" },
        href: "/intra/opportunity",
        brand_id: "global",
        category: "approval",
        priority: "high",
    },
    {
        key: "opportunity_bidding",
        label: "입찰 진행 중",
        table: "wio_opportunities",
        filter: { column: "status", value: "bidding" },
        href: "/intra/opportunity",
        brand_id: "global",
        category: "approval",
        priority: "critical",
    },
    // ── Planner's
    {
        key: "myverse_feedback_new",
        label: "PP AI 베타 피드백",
        table: "myverse_feedback",
        filter: { column: "status", value: "new" },
        href: "/intra/planners/feedback",
        brand_id: "planners",
        category: "cs",
        priority: "normal",
    },
    {
        key: "myverse_moment_reports_open",
        label: "Myverse 모먼트 신고",
        table: "myverse_moment_reports",
        filter: { column: "status", value: "open" },
        href: "/intra/ums/myverse/reports",
        brand_id: "myverse",
        category: "moderation",
        priority: "high",
    },

    // ── SmarComm AIRM (V2.0 § 3-C — Pro/Enterprise 핵심 모듈)
    {
        key: "smarcomm_airm_critical_flags",
        label: "SmarComm AIRM Critical 플래그",
        table: "smarcomm_ai_flags",
        filter: { column: "status", value: "open" },
        extraFilters: [{ column: "severity", value: "critical" }],
        href: "/intra/ums/smarcomm",
        brand_id: "smarcomm",
        category: "moderation",
        priority: "critical",
    },
    {
        key: "smarcomm_airm_open_flags",
        label: "SmarComm AIRM 신규 플래그",
        table: "smarcomm_ai_flags",
        filter: { column: "status", value: "open" },
        href: "/intra/ums/smarcomm",
        brand_id: "smarcomm",
        category: "moderation",
        priority: "high",
    },
    {
        key: "smarcomm_airm_todo_actions",
        label: "SmarComm AIRM 교정 액션 대기",
        table: "smarcomm_airm_actions",
        filter: { column: "status", value: "todo" },
        href: "/intra/ums/smarcomm",
        brand_id: "smarcomm",
        category: "moderation",
        priority: "normal",
    },
];

/** category별 라벨 */
export const CATEGORY_LABEL: Record<ActionCategory, string> = {
    approval: "승인",
    cs: "CS · 문의",
    privacy: "개인정보",
    moderation: "모더레이션",
    payment: "결제",
    agent: "에이전트",
};

/** priority별 색상 */
export const PRIORITY_COLOR: Record<NonNullable<ActionEntry["priority"]>, string> = {
    critical: "bg-rose-600 text-white",
    high: "bg-amber-500 text-white",
    normal: "bg-neutral-900 text-white",
};
