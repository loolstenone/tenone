// ============================================================================
// TenOne Universe Identity Architecture - TypeScript 타입 정의
// 3계층 다중 페르소나 회원 시스템
// ============================================================================

// ── Tier 1: Core Identity (여권) ──

export interface CoreIdentity {
    id: string;
    authId: string;
    email: string;
    name: string;
    avatarUrl?: string;
    avatarInitials: string;
    phone?: string;
    bio?: string;
    status: 'active' | 'suspended' | 'deactivated';
    originSite: string;
    createdAt: string;
    lastLoginAt?: string;
    newsletterSubscribed?: boolean;
}

// ── Tier 2: Universe Roles (뱃지) ──

export type UniverseRoleType =
    | 'super_admin' | 'staff' | 'partner' | 'junior_partner'
    | 'alliance' | 'crew' | 'investor' | 'member';

export interface UniverseRole {
    id: string;
    memberId: string;
    role: string;
    context: string;  // 'universe' 또는 브랜드 ID
    grantedAt: string;
    grantedBy?: string;
    expiresAt?: string;
    isActive: boolean;
}

export interface DerivedPermissions {
    canAccessIntra: boolean;
    accessibleBrands: string[];
    accessibleModules: string[];
    isStaff: boolean;
    isSuperAdmin: boolean;
}

// ── Tier 3A: Site-Specific Profiles ──

export interface TenOneStaffProfile {
    memberId: string;
    department?: string;
    position?: string;
    employeeId?: string;
    hireDate?: string;
    employmentType?: string;
    team?: string;
    officeLocation?: string;
}

export interface SmarCommProfile {
    memberId: string;
    subscriptionTier: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
    workspaceId?: string;
    company?: string;
    companySize?: string;
    industry?: string;
    billingEmail?: string;
    trialEndsAt?: string;
}

export interface BadakProfile {
    memberId: string;
    isCertified: boolean;
    certificationDate?: string;
    badge?: 'bronze' | 'silver' | 'gold' | 'platinum';
    specialty?: string[];
    jobFunction?: string;
    industry?: string;
    experienceYears?: number;
    company?: string;
    canOffer?: string[];
    lookingFor?: string[];
}

export interface MadLeagueProfile {
    memberId: string;
    university?: string;
    clubName?: string;
    generation?: number;
    leagueRole?: 'leader' | 'vice_leader' | 'member' | 'alumni';
    major?: string;
    graduationYear?: number;
    isAlumni: boolean;
}

export interface HeroProfile {
    memberId: string;
    talentType?: string;
    experienceLevel?: 'junior' | 'mid' | 'senior' | 'lead';
    resumeUrl?: string;
    portfolioUrl?: string;
    availability: 'actively_looking' | 'open' | 'not_looking';
    skills?: string[];
}

export interface EvolutionProfile {
    memberId: string;
    isInstructor: boolean;
    instructorBio?: string;
    totalLearningHours: number;
}

export interface MyverseProfile {
    memberId: string;
    displayName?: string;
    bio?: string;
    interests?: string[];
    mood?: string;
    coverImage?: string;
}

export type SiteProfile =
    | { type: 'tenone'; data: TenOneStaffProfile }
    | { type: 'smarcomm'; data: SmarCommProfile }
    | { type: 'badak'; data: BadakProfile }
    | { type: 'madleague'; data: MadLeagueProfile }
    | { type: 'hero'; data: HeroProfile }
    | { type: 'evolution'; data: EvolutionProfile }
    | { type: 'myverse'; data: MyverseProfile };

// ── Tier 3B: Activity Records ──

export interface PointEntry {
    id: string;
    memberId: string;
    brandId: string;
    points: number;
    reason: string;
    createdAt: string;
}

export interface PointsSummary {
    memberId: string;
    brandId: string;
    totalPoints: number;
    grade: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
}

export interface RoleHistoryEntry {
    id: string;
    memberId: string;
    brandId: string;
    action: 'granted' | 'revoked' | 'upgraded' | 'downgraded' | 'expired';
    roleOrLevel: string;
    previousValue?: string;
    newValue?: string;
    reason?: string;
    changedBy?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

// ── Tier 3C: Preferences ──

export interface BrandPreferences {
    memberId: string;
    brandId: string;
    newsletterSubscribed: boolean;
    marketingEmailOptIn: boolean;
    marketingSmsOptIn: boolean;
    notifyEmail: boolean;
    notifyPush: boolean;
    notifyKakao: boolean;
    language: string;
    theme: 'light' | 'dark' | 'system';
    timezone: string;
}

// ── 전체 조립형 유저 ──

export interface UniverseUser {
    identity: CoreIdentity;
    roles: UniverseRole[];
    permissions: DerivedPermissions;
    siteProfile: SiteProfile | null;
    preferences: BrandPreferences | null;
}

// ── JWT App Metadata (auth.users.raw_app_meta_data) ──

export interface JWTAppMetadata {
    member_id: string;
    roles: string[];     // ['staff:universe', 'certified:badak']
    brands: string[];    // ['badak', 'madleague']
    is_staff: boolean;
    is_super_admin: boolean;
    roles_synced_at: string;
}

// ── 모듈 접근 매핑 ──

export const MODULE_ACCESS_BY_ROLE: Record<string, string[]> = {
    super_admin: ['myverse', 'townity', 'project', 'hero', 'evolution', 'smarcomm', 'wiki', 'erp', 'vridge', 'bums', 'universe', 'agent'],
    staff: ['myverse', 'townity', 'project', 'hero', 'evolution', 'smarcomm', 'wiki', 'erp', 'vridge', 'bums', 'universe'],
    partner: ['myverse', 'townity', 'project', 'hero', 'evolution', 'wiki'],
    junior_partner: ['myverse', 'townity', 'hero', 'evolution'],
    alliance: ['myverse', 'townity', 'hero', 'evolution'],
    crew: ['myverse', 'townity', 'project', 'hero', 'evolution', 'wiki'],
    member: [],
};
