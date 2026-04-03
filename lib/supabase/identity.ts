import { createClient } from './client';
import type {
    CoreIdentity, UniverseRole, DerivedPermissions,
    SiteProfile, BrandPreferences, UniverseUser,
    JWTAppMetadata, MODULE_ACCESS_BY_ROLE,
} from '@/types/identity';

// ── DB Row → TypeScript 변환 헬퍼 ──

function mapToIdentity(row: Record<string, unknown>): CoreIdentity {
    return {
        id: row.id as string,
        authId: row.auth_id as string,
        email: row.email as string,
        name: row.name as string,
        avatarUrl: row.avatar_url as string | undefined,
        avatarInitials: (row.avatar_initials as string) || ((row.name as string) || '').substring(0, 2).toUpperCase(),
        phone: row.phone as string | undefined,
        bio: row.bio as string | undefined,
        status: (row.status as CoreIdentity['status']) || 'active',
        originSite: (row.origin_site as string) || 'tenone.biz',
        createdAt: row.created_at as string,
        lastLoginAt: row.last_login_at as string | undefined,
        newsletterSubscribed: row.newsletter_subscribed as boolean | undefined,
    };
}

function mapToRole(row: Record<string, unknown>): UniverseRole {
    return {
        id: row.id as string,
        memberId: row.member_id as string,
        role: row.role as string,
        context: row.context as string,
        grantedAt: row.granted_at as string,
        grantedBy: row.granted_by as string | undefined,
        expiresAt: row.expires_at as string | undefined,
        isActive: row.is_active as boolean,
    };
}

// ── 역할에서 권한 파생 ──

const MODULE_MAP: Record<string, string[]> = {
    super_admin: ['myverse', 'townity', 'project', 'hero', 'evolution', 'smarcomm', 'wiki', 'erp', 'vridge', 'bums', 'universe', 'agent'],
    staff: ['myverse', 'townity', 'project', 'hero', 'evolution', 'smarcomm', 'wiki', 'erp', 'vridge', 'bums', 'universe'],
    partner: ['myverse', 'townity', 'project', 'hero', 'evolution', 'wiki'],
    junior_partner: ['myverse', 'townity', 'hero', 'evolution'],
    alliance: ['myverse', 'townity', 'hero', 'evolution'],
    crew: ['myverse', 'townity', 'project', 'hero', 'evolution', 'wiki'],
    member: [],
};

export function derivePermissions(roles: UniverseRole[]): DerivedPermissions {
    const universeRoles = roles
        .filter(r => r.context === 'universe' && r.isActive)
        .map(r => r.role);

    const isSuperAdmin = universeRoles.includes('super_admin');
    const isStaff = isSuperAdmin || universeRoles.includes('staff');

    // 모듈 접근: 가장 높은 역할 기준
    let modules: string[] = [];
    for (const role of universeRoles) {
        const m = MODULE_MAP[role];
        if (m && m.length > modules.length) modules = m;
    }

    return {
        isSuperAdmin,
        isStaff,
        canAccessIntra: isStaff
            || universeRoles.includes('partner')
            || universeRoles.includes('junior_partner')
            || universeRoles.includes('crew'),
        accessibleBrands: isSuperAdmin
            ? ['*']
            : [...new Set(roles.filter(r => r.context !== 'universe' && r.isActive).map(r => r.context))],
        accessibleModules: modules,
    };
}

// ── JWT에서 빠르게 권한 판단 (DB 조회 없음) ──

export function permissionsFromJWT(appMeta: JWTAppMetadata | undefined): DerivedPermissions | null {
    if (!appMeta?.roles) return null;

    const isStaff = appMeta.is_staff === true;
    const isSuperAdmin = appMeta.is_super_admin === true;
    const brands = appMeta.brands || [];
    const roles = appMeta.roles || [];

    // 최고 유니버스 역할 찾기
    let modules: string[] = [];
    for (const r of roles) {
        const [role, ctx] = r.split(':');
        if (ctx === 'universe') {
            const m = MODULE_MAP[role];
            if (m && m.length > modules.length) modules = m;
        }
    }

    return {
        isSuperAdmin,
        isStaff,
        canAccessIntra: isStaff || roles.some(r =>
            r.startsWith('partner:') || r.startsWith('junior_partner:') || r.startsWith('crew:')
        ),
        accessibleBrands: isSuperAdmin ? ['*'] : brands,
        accessibleModules: modules,
    };
}

// ── 역할 조회 (새 테이블 우선 → 레거시 fallback) ──

async function getRoles(supabase: ReturnType<typeof createClient>, memberId: string): Promise<UniverseRole[]> {
    // 1차: member_roles 테이블 (새)
    const { data: newRoles, error } = await supabase
        .from('member_roles')
        .select('*')
        .eq('member_id', memberId)
        .eq('is_active', true);

    if (!error && newRoles && newRoles.length > 0) {
        return newRoles.map(mapToRole);
    }

    // 2차 fallback: members.roles[] (레거시) — Phase D에서 제거
    console.warn('[Identity] Falling back to legacy members.roles[]');
    const { data: member } = await supabase
        .from('members')
        .select('id, account_type, roles, affiliations')
        .eq('id', memberId)
        .single();

    if (!member) return [{ id: '', memberId, role: 'member', context: 'universe', grantedAt: '', isActive: true }];

    const result: UniverseRole[] = [];
    const now = new Date().toISOString();

    // account_type → universe 역할
    const acctType = (member.account_type as string) || 'member';
    const roleMap: Record<string, string> = {
        'staff': 'staff', 'partner': 'partner', 'junior-partner': 'junior_partner',
        'crew': 'crew', 'member': 'member',
    };
    result.push({
        id: '', memberId, role: roleMap[acctType] || 'member',
        context: 'universe', grantedAt: now, isActive: true,
    });

    // affiliations → 브랜드 역할
    const affiliations = (member.affiliations as string[]) || [];
    for (const aff of affiliations) {
        result.push({ id: '', memberId, role: 'member', context: aff, grantedAt: now, isActive: true });
    }

    return result;
}

// ── 사이트별 프로필 로드 ──

const PROFILE_TABLE_MAP: Record<string, string> = {
    tenone: 'tenone_staff_profiles',
    smarcomm: 'smarcomm_profiles',
    badak: 'badak_profiles',
    madleague: 'madleague_profiles',
    hero: 'hero_profiles',
    evolution: 'evolution_profiles',
    myverse: 'myverse_profiles',
};

async function loadSiteProfile(
    supabase: ReturnType<typeof createClient>,
    memberId: string,
    brand: string
): Promise<SiteProfile | null> {
    const table = PROFILE_TABLE_MAP[brand];
    if (!table) return null;

    const { data } = await supabase
        .from(table)
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();

    return data ? { type: brand, data } as SiteProfile : null;
}

// ── 전체 유저 조립 ──

export async function assembleUser(
    authId: string,
    currentBrand: string = 'tenone'
): Promise<UniverseUser | null> {
    const supabase = createClient();

    // Tier 1: 코어 신원
    const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('auth_id', authId)
        .single();

    if (!member) return null;

    // Tier 2: 역할
    const roles = await getRoles(supabase, member.id as string);
    const permissions = derivePermissions(roles);

    // Tier 3: 사이트 프로필 + 설정
    const siteProfile = await loadSiteProfile(supabase, member.id as string, currentBrand);

    const { data: prefs } = await supabase
        .from('member_preferences')
        .select('*')
        .eq('member_id', member.id)
        .eq('brand_id', currentBrand)
        .single();

    return {
        identity: mapToIdentity(member),
        roles,
        permissions,
        siteProfile,
        preferences: prefs ? {
            memberId: prefs.member_id,
            brandId: prefs.brand_id,
            newsletterSubscribed: prefs.newsletter_subscribed,
            marketingEmailOptIn: prefs.marketing_email_opt_in,
            marketingSmsOptIn: prefs.marketing_sms_opt_in,
            notifyEmail: prefs.notify_email,
            notifyPush: prefs.notify_push,
            notifyKakao: prefs.notify_kakao,
            language: prefs.language,
            theme: prefs.theme,
            timezone: prefs.timezone,
        } : null,
    };
}
