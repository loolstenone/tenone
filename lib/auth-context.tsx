"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, SystemAccess, IntraModule, accountTypeAccess } from '@/types/auth';
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
    updateProfile: (updates: Partial<User>) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'tenone_auth_user';

// Supabase members → User 변환
function memberToUser(member: Record<string, unknown>): User {
    return {
        id: member.id as string,
        name: member.name as string,
        email: member.email as string,
        role: (member.role as string) || 'Viewer',
        accountType: (member.account_type as User['accountType']) || 'member',
        avatarInitials: (member.avatar_initials as string) || ((member.name as string) || '').substring(0, 2).toUpperCase(),
        brandAccess: (member.brand_access as string[]) || [],
        systemAccess: (member.system_access as SystemAccess[]) || [],
        department: member.department as string | undefined,
        employeeId: member.employee_id as string | undefined,
        phone: member.phone as string | undefined,
        bio: member.bio as string | undefined,
        company: member.company as string | undefined,
        createdAt: member.created_at as string,
        newsletterSubscribed: member.newsletter_subscribed as boolean | undefined,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // 초기화: Supabase 세션 체크 → members 테이블 조회 → fallback localStorage
    useEffect(() => {
        let finished = false;

        // localStorage 먼저 체크 → 즉시 UI 표시 (로그인 버튼 or 프로필)
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
            setIsLoading(false); // 즉시 로딩 해제
        } catch {
            setIsLoading(false);
        }

        async function init() {
            try {
                // 1. Supabase Auth 세션 확인
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // members 테이블에서 프로필 조회
                    const { data: member } = await supabase
                        .from('members')
                        .select('*')
                        .eq('auth_id', session.user.id)
                        .single();

                    if (member) {
                        const u = memberToUser(member);
                        setUser(u);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
                        return;
                    }
                }
            } catch {
                // Supabase 실패 시 무시 (localStorage에서 이미 복원됨)
            }
            finished = true;
        }
        init();

        // Auth 상태 변경 리스너
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: member } = await supabase
                    .from('members')
                    .select('*')
                    .eq('auth_id', session.user.id)
                    .single();
                if (member) {
                    const u = memberToUser(member);
                    setUser(u);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
                }
            } else if (_event === 'SIGNED_OUT') {
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
            // 1. Supabase Auth 시도
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error && data.user) {
                // members 테이블에서 프로필 조회
                const { data: member } = await supabase
                    .from('members')
                    .select('*')
                    .eq('auth_id', data.user.id)
                    .single();

                if (member) {
                    const u = memberToUser(member);
                    setUser(u);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
                    // last_login_at 업데이트
                    await supabase.from('members').update({ last_login_at: new Date().toISOString() }).eq('id', member.id);
                    return { success: true, user: u };
                }
            }
        } catch {
            // Supabase 실패 시 Mock fallback
        }

        // 2. Fallback: Mock 인증 (개발 중 호환)
        const validatedUser = validateCredentials(email, password);
        if (validatedUser) {
            setUser(validatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedUser));
            return { success: true, user: validatedUser };
        }
        return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }, [supabase]);

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
                // members 테이블에 프로필 생성
                const initials = name.substring(0, 2).toUpperCase();
                const { data: member, error: memberError } = await supabase
                    .from('members')
                    .insert({
                        auth_id: data.user.id,
                        email,
                        name,
                        account_type: 'member',
                        avatar_initials: initials,
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

    // 로그아웃
    const logout = useCallback(async () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }, [supabase]);

    const isStaff = user?.accountType === 'staff';
    const isInternal = user?.accountType === 'staff' || user?.accountType === 'partner' || user?.accountType === 'junior-partner';
    const canAccessIntra = !!user && user.accountType !== 'member';

    const hasAccess = useCallback((system: SystemAccess) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        return user.systemAccess?.includes(system) ?? false;
    }, [user]);

    const hasModuleAccess = useCallback((module: IntraModule) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        const allowed = accountTypeAccess[user.accountType] || [];
        if (module === 'myverse' && allowed.includes('myverse-full')) return true;
        if (module === 'comm' && allowed.includes('comm-full')) return true;
        if (module === 'wiki' && allowed.includes('wiki-full')) return true;
        return allowed.includes(module);
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user, isAuthenticated: !!user, isLoading,
            isStaff, isInternal, canAccessIntra,
            hasAccess, hasModuleAccess,
            login, register, updateProfile, logout,
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
