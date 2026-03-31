"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { StaffMember, StaffRole, StaffStatus, Division } from '@/types/staff';
import { initialStaff } from '@/lib/staff-data';
import { isMockAllowed } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';

interface StaffContextType {
    staff: StaffMember[];
    loading: boolean;
    addStaff: (member: StaffMember) => void;
    updateStaff: (id: string, updates: Partial<StaffMember>) => void;
    deleteStaff: (id: string) => void;
    getStaffById: (id: string) => StaffMember | undefined;
    getStaffByEmail: (email: string) => StaffMember | undefined;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

/** members row → StaffMember 변환 */
function memberToStaff(r: Record<string, unknown>): StaffMember {
    const accountType = r.account_type as string;
    const isActive = r.is_active as boolean;

    return {
        id: r.id as string,
        employeeId: (r.employee_id as string) || '',
        name: (r.name as string) || '',
        email: (r.email as string) || '',
        role: ((r.role as StaffRole) || 'Viewer'),
        accessLevel: (r.system_access as string[]) || [],
        division: (r.department as string)?.includes('경영') ? 'Management' as Division
            : (r.department as string)?.includes('사업') ? 'Business' as Division
            : (r.department as string)?.includes('제작') ? 'Production' as Division
            : 'Support' as Division,
        department: (r.department as string) || '',
        position: (r.position as string) || '',
        brandAssociation: (r.brand_access as string[]) || (r.affiliations as string[]) || [],
        startDate: ((r.created_at as string) || '').split('T')[0],
        status: !isActive ? 'Resigned' as StaffStatus
            : accountType === 'staff' ? 'Active' as StaffStatus
            : 'Active' as StaffStatus,
        phone: r.phone as string | undefined,
        avatarUrl: r.avatar_url as string | undefined,
        avatarInitials: (r.avatar_initials as string) || ((r.name as string) || '').slice(0, 2),
        bio: r.bio as string | undefined,
        createdAt: ((r.created_at as string) || '').split('T')[0],
        updatedAt: ((r.updated_at as string) || '').split('T')[0],
    };
}

export function StaffProvider({ children }: { children: ReactNode }) {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('members')
                    .select('*')
                    .eq('account_type', 'staff')
                    .order('name');

                if (error) throw error;
                if (!cancelled) {
                    setStaff((data || []).map(memberToStaff));
                }
            } catch {
                // DB 실패 시 Mock 허용 환경이면 Mock 사용
                if (!cancelled && isMockAllowed()) {
                    setStaff(initialStaff);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    const addStaff = useCallback((member: StaffMember) => setStaff(prev => [member, ...prev]), []);
    const updateStaff = useCallback((id: string, updates: Partial<StaffMember>) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : s));
    }, []);
    const deleteStaff = useCallback((id: string) => setStaff(prev => prev.filter(s => s.id !== id)), []);
    const getStaffById = useCallback((id: string) => staff.find(s => s.id === id), [staff]);
    const getStaffByEmail = useCallback((email: string) => staff.find(s => s.email === email), [staff]);

    return (
        <StaffContext.Provider value={{ staff, loading, addStaff, updateStaff, deleteStaff, getStaffById, getStaffByEmail }}>
            {children}
        </StaffContext.Provider>
    );
}

export function useStaff() {
    const context = useContext(StaffContext);
    if (!context) throw new Error('useStaff must be used within StaffProvider');
    return context;
}
