"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, SystemAccess, IntraModule } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';
import { permissionsFromJWT } from '@/lib/supabase/identity';
import type { JWTAppMetadata } from '@/types/identity';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

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
    register: (name: string, email: string, password: string, newsletterSubscribed?: boolean) => Promise<{ success: boolean; error?: string; memberId?: string }>;
    loginWithGoogle: () => Promise<void>;
    loginWithKakao: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => void;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'tenone_auth_user';
const STORAGE_TTL_MS = 30 * 60 * 1000; // 30분 — 이후엔 Supabase 세션 재검증 강제

function saveUserToStorage(user: User) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, cached_at: Date.now() }));
    } catch { /* ignore */ }
}

function loadUserFromStorage(): User | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        // 구형 포맷(user 객체 직접 저장) 호환
        const user: User = parsed.user ?? parsed;
        const cached_at: number = parsed.cached_at ?? 0;
        if (Date.now() - cached_at > STORAGE_TTL_MS) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return user;
    } catch {
        return null;
    }
}

// Supabase members → User 변환 (v2)
function memberToUser(member: Record<string, unknown>): User {
    const accountType = (member.account_type as User['accountType']) || 'member';
    return {
        id: member.id as string,
        name: member.name as string,
        email: member.email as string,
        role: (member.role as User['role']) || 'Viewer',
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
        hireDate: member.hire_date as string | undefined,
        employmentType: member.employment_type as string | undefined,
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
    const syncUserFromSession = useCallback(async (sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
        try {
            let { data: member } = await supabase
                .from('members')
                .select('*')
                .eq('auth_id', sessionUser.id)
                .single();

            // 소셜 로그인 첫 가입 → 자동 프로필 생성
            if (!member) {
                const userName = (sessionUser.user_metadata?.full_name as string)
                    || (sessionUser.user_metadata?.name as string)
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

                // 3계층: member_roles에도 기본 역할 추가 (트리거가 JWT 갱신)
                if (newMember) {
                    supabase.from('member_roles').insert({
                        member_id: newMember.id,
                        role: 'member',
                        context: 'universe',
                    }).then(() => {});
                }
            }

            if (member) {
                const u = memberToUser(member);
                setUser(u);
                saveUserToStorage(u);
                return u;
            }

            // members 조회/생성 실패 → 최소 로그인 처리
            const fallbackUser: User = {
                id: sessionUser.id,
                name: (sessionUser.user_metadata?.full_name as string) || sessionUser.email?.split('@')[0] || '사용자',
                email: sessionUser.email || '',
                role: 'Member' as const,
                accountType: 'member' as const,
                avatarInitials: (sessionUser.email?.substring(0, 2) || 'U').toUpperCase(),
                brandAccess: [],
                systemAccess: [],
            };
            setUser(fallbackUser);
            saveUserToStorage(fallbackUser);
            return fallbackUser;
        } catch {
            return null;
        }
    }, [supabase]);

    // 초기화: localStorage 즉시 표시 → Supabase 세션 검증 → 불일치 시 정리
    useEffect(() => {
        // 1단계: localStorage 즉시 복원 (깜박임 방지, 30분 이내 캐시만)
        let hasLocalData = false;
        const cachedUser = loadUserFromStorage();
        if (cachedUser) {
            setUser(cachedUser);
            hasLocalData = true;
            setIsLoading(false); // localStorage 있으면 즉시 표시
        }

        // 2단계: Supabase 세션 검증 (비동기, 5초 타임아웃)
        async function validateSession() {
            try {
                const sessionResult = await Promise.race([
                    supabase.auth.getSession(),
                    new Promise<null>(r => setTimeout(() => r(null), 5000))
                ]);
                const session = sessionResult && 'data' in (sessionResult as any) ? (sessionResult as any).data.session : null;
                if (session?.user) {
                    // 유효한 세션 → 최신 프로필 동기화 (3초 타임아웃)
                    await Promise.race([
                        syncUserFromSession(session.user),
                        new Promise(r => setTimeout(r, 3000))
                    ]);
                } else {
                    // 세션 없음 or 타임아웃 → localStorage에 남은 stale 데이터 정리
                    if (localStorage.getItem(STORAGE_KEY)) {
                        setUser(null);
                        localStorage.removeItem(STORAGE_KEY);
                    }
                }
            } catch {
                // Supabase 접속 실패 → localStorage 유지 (오프라인 대응)
            } finally {
                setIsLoading(false); // 항상 로딩 해제
            }
        }
        validateSession();

        // 3단계: Auth 상태 변경 리스너 (로그인/로그아웃/토큰갱신)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    await syncUserFromSession(session.user);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem(STORAGE_KEY);
            }
        });

        // 4단계: 크로스탭 세션 동기화 (다른 탭에서 로그인/로그아웃 시 반영)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                if (e.newValue) {
                    try {
                        const parsed = JSON.parse(e.newValue);
                        const user: User = parsed.user ?? parsed;
                        setUser(user);
                    } catch { /* ignore */ }
                } else {
                    setUser(null);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('storage', handleStorageChange);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 로그인: Supabase Auth → fallback Mock
    const login = useCallback(async (email: string, password: string) => {
        try {
            // 20초 타임아웃 (cold start 대응)
            const authResult = await Promise.race([
                supabase.auth.signInWithPassword({ email, password }),
                new Promise<{ data: null; error: { message: string } }>((resolve) =>
                    setTimeout(() => resolve({ data: null, error: { message: 'timeout' } }), 20000)
                ),
            ]);
            const { data, error } = authResult as { data: { user: { id: string; email?: string } } | null; error: { message: string } | null };
            if (error) {
                console.error('[Auth] Supabase login error:', error.message);
                if (error.message === 'timeout') {
                    return { success: false, error: '서버 연결에 시간이 걸리고 있습니다. 다시 시도해 주세요.' };
                }
                if (error.message?.includes('Email not confirmed')) {
                    return { success: false, error: '이메일 인증이 필요합니다. 가입 시 받은 인증 메일을 확인해주세요.' };
                }
                if (error.message?.includes('Invalid login credentials')) {
                    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
                }
                return { success: false, error: error.message || '로그인에 실패했습니다.' };
            }
            if (data && data.user) {
                // Supabase 인증 성공 — members 동기화 시도 (실패해도 성공으로 처리)
                const u = await syncUserFromSession(data.user);
                if (u) {
                    supabase.from('members').update({ last_login_at: new Date().toISOString() }).eq('auth_id', data.user.id).then(() => {});
                }
                // onAuthStateChange가 SIGNED_IN을 발행하므로 u가 null이어도 인증은 성공
                return { success: true, user: u ?? undefined };
            }
        } catch (e) {
            console.error('[Auth] login exception:', e);
        }

        return { success: false, error: '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.' };
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
                    saveUserToStorage(u);
                    return { success: true, memberId: member.id };
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
            // Supabase 접속 실패
        }

        return { success: false, error: '회원가입에 실패했습니다. 다시 시도해주세요.' };
    }, [supabase]);

    // 프로필 업데이트
    const updateProfile = useCallback((updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            saveUserToStorage(updated);

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

    // 비밀번호 재설정 이메일 발송
    const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch {
            return { success: false, error: '비밀번호 재설정 요청에 실패했습니다' };
        }
    }, [supabase]);

    // 새 비밀번호 설정 (재설정 링크 클릭 후)
    const updatePassword = useCallback(async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch {
            return { success: false, error: '비밀번호 변경에 실패했습니다' };
        }
    }, [supabase]);

    // 로그아웃 — Supabase 세션 + localStorage + 쿠키 모두 클리어
    // scope:'global' = Supabase 서버에서 refresh_token 즉시 무효화
    // → 외부 독립 도메인(madleague.net 등)의 쿠키는 JS로 삭제 불가하지만,
    //   refresh_token이 서버에서 무효화되므로 다음 갱신 시 자동 만료됨
    const logout = useCallback(async () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        try {
            await supabase.auth.signOut({ scope: 'global' });
        } catch { /* ignore */ }
        // Supabase SSR 쿠키 + tenone-auth 쿠키 강제 제거
        document.cookie.split(';').forEach(c => {
            const name = c.split('=')[0].trim();
            if (name.startsWith('sb-') || name.startsWith('tenone-auth')) {
                // 현재 도메인 + .tenone.biz 양쪽 모두 삭제 시도
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.tenone.biz`;
            }
        });
        // 인트라 검증 캐시도 클리어
        try { sessionStorage.removeItem('tenone_intra_verified'); } catch { /* ignore */ }
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
            login, register, loginWithGoogle, loginWithKakao, updateProfile, logout, resetPassword, updatePassword,
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
