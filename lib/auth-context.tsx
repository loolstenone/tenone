"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, SystemAccess, IntraModule } from '@/types/auth';
import { validateCredentials, registerMember } from '@/lib/auth-data';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isStaff: boolean;
    isInternal: boolean;
    canAccessIntra: boolean;
    hasAccess: (system: SystemAccess) => boolean;
    hasModuleAccess: (module: IntraModule) => boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
    register: (name: string, email: string, password: string, newsletterSubscribed?: boolean) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => Promise<void>;
    loginWithKakao: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'tenone_auth_user';

// Supabase members → User 변환 (v2)
function memberToUser(member: Record<string, unknown>): User {
    const accountType = (member.account_type as User['accountType']) || 'member';
    return {
        id: member.id as string,
        name: member.name as string,
        email: member.email as string,
        role: (member.role as string) || 'Viewer',
        accountType,
        primaryType: (member.primary_type as string) || accountType,
        avatarInitials: (member.avatar_initials as string) || ((member.name as string) || '').substring(0, 2).toUpperCase(),

        // 역할 & 소속
        roles: (member.roles as string[]) || [accountType],
        affiliations: (member.affiliations as string[]) || [],
        originSite: (member.origin_site as string) || 'tenone.biz',

        // 접근 권한
        intraAccess: (member.intra_access as boolean) ?? accountType !== 'member',
        moduleAccess: (member.module_access as User['moduleAccess']) || [],
        systemAccess: (member.system_access as SystemAccess[]) || [],
        brandAccess: (member.brand_access as string[]) || [],

        // 프로필
        department: member.department as string | undefined,
        employeeId: member.employee_id as string | undefined,
        position: member.position as string | undefined,
        phone: member.phone as string | undefined,
        bio: member.bio as string | undefined,
        company: member.company as string | undefined,
        createdAt: member.created_at as string,
        newsletterSubscribed: member.newsletter_subscribed as boolean | undefined,

        // 포인트
        totalPoints: member.total_points as number | undefined,
        grade: member.grade as string | undefined,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // Supabase 세션에서 members 조회 → User 설정
    const syncUserFromSession = useCallback(async (sessionUser: { id: string; email?: string; user_metadata?: any }) => {
        try {
            let { data: member } = await supabase
                .from('members')
                .select('*')
                .eq('auth_id', sessionUser.id)
                .single();

            // 소셜 로그인 첫 가입 → 자동 프로필 생성
            if (!member) {
                const userName = sessionUser.user_metadata?.full_name
                    || sessionUser.user_metadata?.name
                    || sessionUser.email?.split('@')[0]
                    || '사용자';
                const originSite = typeof window !== 'undefined' ? window.location.hostname : 'tenone.biz';
                const { defaultModuleAccess } = await import('@/types/auth');
                const initialType = 'member' as const;

                const { data: newMember } = await supabase
                    .from('members')
                    .insert({
                        auth_id: sessionUser.id,
                        email: sessionUser.email || '',
                        name: userName,
                        account_type: initialType,
                        primary_type: initialType,
                        roles: [initialType],
                        avatar_initials: userName.substring(0, 2).toUpperCase(),
                        role: 'Member',
                        origin_site: originSite,
                        intra_access: false,
                        module_access: defaultModuleAccess[initialType] || [],
                        affiliations: [],
                    })
                    .select()
                    .single();
                member = newMember;
            }

            if (member) {
                const u = memberToUser(member);
                setUser(u);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
                return u;
            }

            // members 조회/생성 실패 → 최소 로그인 처리
            const fallbackUser: User = {
                id: sessionUser.id,
                name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || '사용자',
                email: sessionUser.email || '',
                role: 'Member' as const,
                accountType: 'member' as const,
                avatarInitials: (sessionUser.email?.substring(0, 2) || 'U').toUpperCase(),
                brandAccess: [],
                systemAccess: [],
            };
            setUser(fallbackUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
            return fallbackUser;
        } catch {
            return null;
        }
    }, [supabase]);

    // 초기화: localStorage 즉시 표시 → Supabase 세션 검증 → 불일치 시 정리
    useEffect(() => {
        // 1단계: localStorage 즉시 복원 (깜박임 방지)
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setUser(JSON.parse(stored));
        } catch { /* ignore */ }
        setIsLoading(false);

        // 2단계: Supabase 세션 검증 (비동기)
        async function validateSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // 유효한 세션 → 최신 프로필 동기화
                    await syncUserFromSession(session.user);
                } else {
                    // 세션 없음 → localStorage에 남은 stale 데이터 정리
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        console.log('[Auth] Supabase session expired, clearing stale localStorage');
                        setUser(null);
                        localStorage.removeItem(STORAGE_KEY);
                    }
                }
            } catch {
                // Supabase 접속 실패 → localStorage 유지 (오프라인 대응)
            }
        }
        validateSession();

        // 3단계: Auth 상태 변경 리스너 (로그인/로그아웃/토큰갱신)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[Auth] onAuthStateChange:', event, session?.user?.email || 'no user');

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    await syncUserFromSession(session.user);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem(STORAGE_KEY);
            }
        });

        return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 로그인: Supabase Auth → fallback Mock
    const login = useCallback(async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error && data.user) {
                const u = await syncUserFromSession(data.user);
                if (u) {
                    // last_login_at 업데이트
                    supabase.from('members').update({ last_login_at: new Date().toISOString() }).eq('auth_id', data.user.id).then(() => {});
                    return { success: true, user: u };
                }
            }
            if (error) console.error('[Auth] Supabase login error:', error.message);
        } catch {
            // Supabase 실패 시 Mock fallback
        }

        // Fallback: Mock 인증 (개발 중 호환)
        const validatedUser = validateCredentials(email, password);
        if (validatedUser) {
            setUser(validatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedUser));
            return { success: true, user: validatedUser };
        }
        return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }, [supabase, syncUserFromSession]);

    // 회원가입: Supabase Auth + members 테이블
    const register = useCallback(async (name: string, email: string, password: string, newsletterSubscribed?: boolean) => {
        try {
            // 1. Supabase Auth 가입
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } }
            });

            if (!error && data.user) {
                // members 테이블에 프로필 생성 (origin_site 기반)
                const originSite = typeof window !== 'undefined' ? window.location.hostname : 'tenone.biz';
                const { defaultModuleAccess } = await import('@/types/auth');
                const initialType = 'member' as const;
                const initialModules = defaultModuleAccess[initialType] || [];
                const initials = name.substring(0, 2).toUpperCase();
                const { data: member, error: memberError } = await supabase
                    .from('members')
                    .insert({
                        auth_id: data.user.id,
                        email,
                        name,
                        account_type: initialType,
                        primary_type: initialType,
                        roles: [initialType],
                        avatar_initials: initials,
                        origin_site: originSite,
                        intra_access: false,
                        module_access: initialModules,
                        affiliations: [],
                        newsletter_subscribed: newsletterSubscribed || false,
                        role: 'Viewer',
                    })
                    .select()
                    .single();

                if (!memberError && member) {
                    const u = memberToUser(member);
                    setUser(u);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
                    return { success: true };
                }
                return { success: false, error: memberError?.message || '프로필 생성 실패' };
            }

            if (error) {
                if (error.message.includes('already registered')) {
                    return { success: false, error: '이미 가입된 이메일입니다.' };
                }
                return { success: false, error: error.message };
            }
        } catch {
            // Supabase 실패 시 Mock fallback
        }

        // 2. Fallback: Mock 가입
        const result = registerMember(name, email, password, undefined, newsletterSubscribed);
        if (result.success && result.user) {
            setUser(result.user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        }
        return { success: result.success, error: result.error };
    }, [supabase]);

    // 프로필 업데이트
    const updateProfile = useCallback((updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            // Supabase members 테이블도 업데이트 (비동기, 에러 무시)
            supabase.from('members')
                .update({
                    name: updated.name,
                    phone: updates.phone,
                    bio: updates.bio,
                    company: updates.company,
                    avatar_initials: updates.avatarInitials,
                    newsletter_subscribed: updates.newsletterSubscribed,
                    updated_at: new Date().toISOString(),
                })
                .eq('email', updated.email)
                .then(() => {});

            return updated;
        });
    }, [supabase]);

    // Google 소셜 로그인 — 도메인별 직접 Supabase OAuth
    const loginWithGoogle = useCallback(async () => {
        const returnPath = window.location.pathname;
        if (returnPath !== '/login' && returnPath !== '/signup' && returnPath !== '/') {
            document.cookie = `auth_redirect=${encodeURIComponent(returnPath)};path=/;max-age=300;SameSite=Lax`;
        }
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo },
        });
        if (data?.url) window.location.href = data.url;
        if (error) console.error('Google OAuth error:', error);
    }, [supabase]);

    // Kakao 소셜 로그인 — 도메인별 직접 Supabase OAuth
    const loginWithKakao = useCallback(async () => {
        const returnPath = window.location.pathname;
        if (returnPath !== '/login' && returnPath !== '/signup' && returnPath !== '/') {
            document.cookie = `auth_redirect=${encodeURIComponent(returnPath)};path=/;max-age=300;SameSite=Lax`;
        }
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: { redirectTo },
        });
        if (data?.url) window.location.href = data.url;
        if (error) console.error('Kakao OAuth error:', error);
    }, [supabase]);

    // 로그아웃 — Supabase 세션 + localStorage + 쿠키 모두 클리어
    const logout = useCallback(async () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        try {
            await supabase.auth.signOut({ scope: 'local' });
        } catch { /* ignore */ }
        // Supabase SSR 쿠키 강제 제거
        document.cookie.split(';').forEach(c => {
            const name = c.split('=')[0].trim();
            if (name.startsWith('sb-')) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            }
        });
    }, [supabase]);

    const isStaff = user?.accountType === 'staff';
    const isInternal = user?.accountType === 'staff' || user?.accountType === 'partner' || user?.accountType === 'alliance';
    const canAccessIntra = !!user && (user.intraAccess ?? user.accountType !== 'member');

    const hasAccess = useCallback((system: SystemAccess) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        return user.systemAccess?.includes(system) ?? false;
    }, [user]);

    const hasModuleAccess = useCallback((module: IntraModule) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        // v2: DB module_access 우선
        if (user.moduleAccess && user.moduleAccess.length > 0) {
            return user.moduleAccess.includes(module);
        }
        // fallback: accountType 기반 기본값
        const { defaultModuleAccess } = require('@/types/auth');
        const defaults = defaultModuleAccess[user.accountType] || [];
        return defaults.includes(module);
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated: !!user, isLoading,
            isStaff, isInternal, canAccessIntra,
            hasAccess, hasModuleAccess,
            login, register, loginWithGoogle, loginWithKakao, updateProfile, logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
