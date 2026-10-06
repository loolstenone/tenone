/**
 * API 접근 정책 SSOT — middleware가 라우트 핸들러보다 먼저 강제한다.
 *
 * 원칙: 운영·관리·비용 발생(AI 실행·크롤링·메일 발송) API는 직원 전용.
 *       새 관리용 API는 아래 패턴에 걸리는 경로(/api/intra/*, /api/{x}/admin/*)에 만든다.
 */

/** SmarComm Pro 대시보드 베타 접근 허용 이메일 (dashboard layout과 공유) */
export const SMARCOMM_BETA_EMAILS = ['lools@tenone.biz', 'cheonil@tenone.biz', 'tenone@tenone.biz', 'admin@smarcomm.com'] as const;

const STAFF_ONLY_API: RegExp[] = [
    /^\/api\/intra(\/|$)/,
    /^\/api\/admin(\/|$)/,
    /^\/api\/.+\/admin(\/|$)/,
    // Gravity — AI 실행 체인 (공개 신청폼 /api/gravity/apply 제외)
    /^\/api\/gravity\/(?!apply(\/|$))/,
    // Mindle·TrendHunter 운영 (collect는 봇 API 키 인증 별도)
    /^\/api\/trendhunter\/(analyze|rss)(\/|$)/,
    // HeRo 매칭 큐레이션 (intra 전용) — 사용자용 request·inbox·[id]/report 제외
    /^\/api\/hero\/matching(\/(?!request(\/|$)|inbox(\/|$))[^/]+(\/curate)?)?\/?$/,
    // 운영 도구
    /^\/api\/analytics\/(sync|env-check)(\/|$)/,
    /^\/api\/external(\/|$)/,
    /^\/api\/ums(\/|$)/,
];

/** SmarComm Pro 대시보드 API — 직원 + 베타 이메일 */
const SMARCOMM_DASHBOARD_API = /^\/api\/smarcomm\/(airm|assets|broadcasts|campaigns|content|creatives|experiments|workflow)(\/|$)/;

export type ApiAccessRule = { level: 'staff'; allowEmails?: readonly string[] } | null;

export function getApiAccessRule(pathname: string): ApiAccessRule {
    if (SMARCOMM_DASHBOARD_API.test(pathname)) return { level: 'staff', allowEmails: SMARCOMM_BETA_EMAILS };
    if (STAFF_ONLY_API.some(re => re.test(pathname))) return { level: 'staff' };
    return null;
}
