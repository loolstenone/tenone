// SmarComm Workspace 티어 정책 SSOT
// DashboardSidebar + DashboardLayout + TierGate 공통 임포트.

export type UserTier = 'free' | 'starter' | 'pro' | 'business';
export const TIER_ORDER: UserTier[] = ['free', 'starter', 'pro', 'business'];

export const TIER_LABELS: Record<UserTier, { name: string; price: string }> = {
    free:     { name: 'Free',     price: '무료' },
    starter:  { name: 'Starter',  price: '월 4.9만원' },
    pro:      { name: 'Pro',      price: '월 14.9만원' },
    business: { name: 'Business', price: '월 39.9만원' },
};

// 팩 → 최소 티어
export type PackType = 'core' | 'action' | 'crm' | 'experiment' | 'ops' | 'launch' | 'setting';
export const PACK_TIER: Record<PackType, UserTier> = {
    core: 'free',
    action: 'starter',
    crm: 'starter',
    experiment: 'pro',
    ops: 'pro',
    launch: 'business',
    setting: 'free',
};

// 페이지 경로 → 팩 매핑 (sidebar MENU_SECTIONS와 정합)
// /smarcomm/dashboard prefix 기준. 자식 경로는 longest prefix 매칭.
const PATH_TO_PACK: Array<[string, PackType]> = [
    ['/smarcomm/dashboard/workflow', 'ops'],
    ['/smarcomm/dashboard/calendar', 'ops'],
    ['/smarcomm/dashboard/cohort', 'experiment'],
    ['/smarcomm/dashboard/abtest', 'experiment'],
    ['/smarcomm/dashboard/airm', 'experiment'],
    ['/smarcomm/dashboard/journey', 'experiment'],
    ['/smarcomm/dashboard/events', 'experiment'],
    ['/smarcomm/dashboard/crm', 'crm'],
    ['/smarcomm/dashboard/creative', 'action'],
    ['/smarcomm/dashboard/content', 'action'],
    ['/smarcomm/dashboard/archive', 'action'],
    ['/smarcomm/dashboard/advisor', 'action'],
];

export function getRequiredTier(pathname: string | null | undefined): UserTier {
    if (!pathname) return 'free';
    // 가장 긴 prefix 우선 (workflow/projects가 workflow보다 먼저 매칭되도록)
    const sorted = [...PATH_TO_PACK].sort((a, b) => b[0].length - a[0].length);
    for (const [prefix, pack] of sorted) {
        if (pathname === prefix || pathname.startsWith(prefix + '/')) {
            return PACK_TIER[pack];
        }
    }
    return 'free';
}

export function hasAccess(currentTier: UserTier, requiredTier: UserTier): boolean {
    return TIER_ORDER.indexOf(currentTier) >= TIER_ORDER.indexOf(requiredTier);
}
