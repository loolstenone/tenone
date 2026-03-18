"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, SystemAccess } from '@/types/auth';
import { validateCredentials, registerMember } from '@/lib/auth-data';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isStaff: boolean;
    hasAccess: (system: SystemAccess) => boolean;
    login: (email: string, password: string) => { success: boolean; error?: string };
    register: (name: string, email: string, password: string) => { success: boolean; error?: string };
    updateProfile: (updates: Partial<User>) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'tenone_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setUser(JSON.parse(stored));
        } catch { localStorage.removeItem(STORAGE_KEY); }
        setIsLoading(false);
    }, []);

    const login = useCallback((email: string, password: string) => {
        const validatedUser = validateCredentials(email, password);
        if (validatedUser) {
            setUser(validatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedUser));
            return { success: true };
        }
        return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }, []);

    const register = useCallback((name: string, email: string, password: string) => {
        const result = registerMember(name, email, password);
        if (result.success && result.user) {
            setUser(result.user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        }
        return { success: result.success, error: result.error };
    }, []);

    const updateProfile = useCallback((updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const isStaff = user?.accountType === 'staff';
    const hasAccess = useCallback((system: SystemAccess) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        return user.systemAccess?.includes(system) ?? false;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isStaff, hasAccess, login, register, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
