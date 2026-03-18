"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { StaffMember } from '@/types/staff';
import { initialStaff } from '@/lib/staff-data';

interface StaffContextType {
    staff: StaffMember[];
    addStaff: (member: StaffMember) => void;
    updateStaff: (id: string, updates: Partial<StaffMember>) => void;
    deleteStaff: (id: string) => void;
    getStaffById: (id: string) => StaffMember | undefined;
    getStaffByEmail: (email: string) => StaffMember | undefined;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: ReactNode }) {
    const [staff, setStaff] = useState<StaffMember[]>(initialStaff);

    const addStaff = useCallback((member: StaffMember) => setStaff(prev => [member, ...prev]), []);
    const updateStaff = useCallback((id: string, updates: Partial<StaffMember>) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : s));
    }, []);
    const deleteStaff = useCallback((id: string) => setStaff(prev => prev.filter(s => s.id !== id)), []);
    const getStaffById = useCallback((id: string) => staff.find(s => s.id === id), [staff]);
    const getStaffByEmail = useCallback((email: string) => staff.find(s => s.email === email), [staff]);

    return (
        <StaffContext.Provider value={{ staff, addStaff, updateStaff, deleteStaff, getStaffById, getStaffByEmail }}>
            {children}
        </StaffContext.Provider>
    );
}

export function useStaff() {
    const context = useContext(StaffContext);
    if (!context) throw new Error('useStaff must be used within StaffProvider');
    return context;
}
