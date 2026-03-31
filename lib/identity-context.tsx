"use client";

/**
 * Identity Context — 3계층 페르소나 시스템
 * Director's Phase 2: auth-context.tsx를 망가뜨리지 않는 Adapter Pattern
 *
 * 사용법:
 *   <AuthProvider>           ← 기존 (로그인/세션 관리)
 *     <IdentityProvider>     ← 신규 (3계층 페르소나)
 *       {children}
 *     </IdentityProvider>
 *   </AuthProvider>
 *
 * useIdentity()로 접근: identity, roles, permissions, siteProfile, preferences
 * useAuth()는 그대로 동작 — 로그인/로그아웃/세션은 auth-context가 담당
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { assembleUser, derivePermissions, permissionsFromJWT } from '@/lib/supabase/identity';
import type {
    CoreIdentity, UniverseRole, DerivedPermissions,
    SiteProfile, BrandPreferences, UniverseUser,
    JWTAppMetadata,
} from '@/types/identity';

// ── Context 타입 ──

interface IdentityContextType {
    // 3계층 데이터
    identity: CoreIdentity | null;
    roles: UniverseRole[];
    permissions: DerivedPermissions | null;
    siteProfile: SiteProfile | null;
    preferences: BrandPreferences | null;

    // 상태
    isLoaded: boolean;

    // 파생 편의 접근자 (auth-context 호환)
    isSuperAdmin: boolean;
    isStaff: boolean;
    canAccessIntra: boolean;
    accessibleModules: string[];
    accessibleBrands: string[];

    // 액션
    refreshIdentity: () => Promise<void>;
    switchBrand: (brandId: string) => Promise<void>;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

// ── Provider ──

export function IdentityProvider({
    children,
    defaultBrand = 'tenone',
}: {
    children: ReactNode;
    defaultBrand?: string;
}) {
    const { user, isAuthenticated } = useAuth();
    const [universeUser, setUniverseUser] = useState<UniverseUser | null>(null);
    const [currentBrand, setCurrentBrand] = useState(defaultBrand);
    const [isLoaded, setIsLoaded] = useState(false);
    const supabase = createClient();

    // 3계층 유저 조립
    const loadIdentity = useCallback(async (brandOverride?: string) => {
        if (!user) {
            setUniverseUser(null);
            setIsLoaded(true);
            return;
        }

        const brand = brandOverride || currentBrand;

        try {
            // 빠른 경로: JWT에서 권한 먼저 추출 (DB 조회 없이 즉시)
            const { data: { session } } = await supabase.auth.getSession();
            const appMeta = session?.user?.app_metadata as JWTAppMetadata | undefined;
            const jwtPerms = permissionsFromJWT(appMeta);

            if (jwtPerms && !universeUser) {
                // JWT 기반 임시 상태 (DB 로딩 전 빠른 UI 표시)
                setUniverseUser({
                    identity: {
                        id: user.id,
                        authId: session?.user?.id || '',
                        email: user.email,
                        name: user.name,
                        avatarInitials: user.avatarInitials || user.name.substring(0, 2).toUpperCase(),
                        status: 'active',
                        originSite: 'tenone.biz',
                        createdAt: user.createdAt || '',
                    },
                    roles: [],
                    permissions: jwtPerms,
                    siteProfile: null,
                    preferences: null,
                });
            }

            // 풀 로딩: DB에서 3계층 전체 조립
            const authId = session?.user?.id;
            if (authId) {
                const assembled = await assembleUser(authId, brand);
                if (assembled) {
                    setUniverseUser(assembled);
                }
            }
        } catch (err) {
            console.error('[Identity] Failed to load:', err);
        } finally {
            setIsLoaded(true);
        }
    }, [user, currentBrand, supabase, universeUser]);

    // user 변경 시 (로그인/로그아웃) 자동 로드
    useEffect(() => {
        if (isAuthenticated && user) {
            loadIdentity();
        } else {
            setUniverseUser(null);
            setIsLoaded(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?.id]);

    // 브랜드 전환
    const switchBrand = useCallback(async (brandId: string) => {
        setCurrentBrand(brandId);
        await loadIdentity(brandId);
    }, [loadIdentity]);

    // 새로고침
    const refreshIdentity = useCallback(async () => {
        setIsLoaded(false);
        await loadIdentity();
    }, [loadIdentity]);

    // 파생 값
    const permissions = universeUser?.permissions || null;

    const value: IdentityContextType = {
        identity: universeUser?.identity || null,
        roles: universeUser?.roles || [],
        permissions,
        siteProfile: universeUser?.siteProfile || null,
        preferences: universeUser?.preferences || null,
        isLoaded,
        isSuperAdmin: permissions?.isSuperAdmin || false,
        isStaff: permissions?.isStaff || false,
        canAccessIntra: permissions?.canAccessIntra || false,
        accessibleModules: permissions?.accessibleModules || [],
        accessibleBrands: permissions?.accessibleBrands || [],
        refreshIdentity,
        switchBrand,
    };

    return (
        <IdentityContext.Provider value={value}>
            {children}
        </IdentityContext.Provider>
    );
}

// ── Hook ──

export function useIdentity() {
    const context = useContext(IdentityContext);
    if (!context) throw new Error('useIdentity must be used within an IdentityProvider');
    return context;
}

/**
 * Adapter Hook: 기존 useAuth() 코드와 3계층 Identity를 동시에 사용
 * 기존 코드를 점진적으로 마이그레이션할 때 사용
 *
 * const { user, login, logout } = useAuth();           // 기존
 * const { permissions, roles } = useIdentityAdapter();  // 3계층 추가
 */
export function useIdentityAdapter() {
    const auth = useAuth();
    let identity: IdentityContextType | null = null;

    try {
        identity = useContext(IdentityContext) || null;
    } catch {
        // IdentityProvider 없이 사용 시 graceful fallback
    }

    return {
        // auth-context 원본
        ...auth,
        // 3계층 오버레이 (있으면 3계층 우선, 없으면 auth-context fallback)
        isSuperAdmin: identity?.isSuperAdmin ?? false,
        isStaffV2: identity?.isStaff ?? auth.isStaff,
        canAccessIntraV2: identity?.canAccessIntra ?? auth.canAccessIntra,
        accessibleModules: identity?.accessibleModules ?? [],
        accessibleBrands: identity?.accessibleBrands ?? [],
        roles: identity?.roles ?? [],
        permissions: identity?.permissions ?? null,
        siteProfile: identity?.siteProfile ?? null,
        identityLoaded: identity?.isLoaded ?? false,
    };
}
