/**
 * 직무 권한(duty) SSOT — 인사·급여·재무·회계 (2026-10-10)
 *   member_roles(role=duty key, context='duty') → JWT 'hr:duty' → RLS auth_has_duty('hr') (sql/staff-duty-roles.sql)
 *   직원이면 누구나가 아니라, 담당 직무가 있는 사람만 전원의 인사·재무 데이터를 본다 (개인정보보호법 제29조 접근권한 최소화)
 *   본인 기록은 직무와 상관없이 본인이 본다 (인트라 › My). super_admin은 모든 직무를 가진 것으로 본다
 *   부여·회수는 super_admin만 (member_roles RLS + /api/intra/duties). 직무를 추가하면 여기 + SQL 정책 + auth-context 메뉴 매핑을 함께 고친다
 */
export const STAFF_DUTIES = [
    {
        key: "hr",
        label: "인사",
        scope: "전 직원 근태 · GPR 평가 · 직원 정보 수정 · 교육 · 포인트 기록",
        menus: "ERP › HR · GPR",
    },
    {
        key: "payroll",
        label: "급여",
        scope: "전 직원 급여 · 인센티브 산정·지급 (근태 조회 포함)",
        menus: "ERP › 급여관리 · 인센티브",
    },
    {
        key: "finance",
        label: "재무",
        scope: "경비 승인 · 법인카드 · 청구·지급 · 사업계획·월별 전망 (작성·수정)",
        menus: "ERP › Finance",
    },
    {
        key: "accounting",
        label: "회계",
        scope: "급여·경비·카드·청구·지급 조회 (전표·결산·세무용, 수정 불가)",
        menus: "ERP › Finance (조회)",
    },
] as const;

export type StaffDuty = (typeof STAFF_DUTIES)[number]["key"];
export const DUTY_KEYS: readonly string[] = STAFF_DUTIES.map(d => d.key);
