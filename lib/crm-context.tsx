"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Person, Organization, Deal, Activity, DealStage } from '@/types/crm';
import { initialPeople, initialOrganizations, initialDeals, initialActivities } from '@/lib/crm-data';

interface CrmContextType {
    people: Person[];
    addPerson: (person: Person) => void;
    updatePerson: (id: string, updates: Partial<Person>) => void;
    deletePerson: (id: string) => void;

    organizations: Organization[];
    addOrganization: (org: Organization) => void;
    updateOrganization: (id: string, updates: Partial<Organization>) => void;

    deals: Deal[];
    addDeal: (deal: Deal) => void;
    updateDeal: (id: string, updates: Partial<Deal>) => void;
    moveDeal: (id: string, stage: DealStage) => void;

    activities: Activity[];
    addActivity: (activity: Activity) => void;

    getPersonById: (id: string) => Person | undefined;
    getOrgById: (id: string) => Organization | undefined;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: ReactNode }) {
    const [people, setPeople] = useState<Person[]>(initialPeople);
    const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
    const [deals, setDeals] = useState<Deal[]>(initialDeals);
    const [activities, setActivities] = useState<Activity[]>(initialActivities);

    const addPerson = useCallback((p: Person) => setPeople(prev => [p, ...prev]), []);
    const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);
    const deletePerson = useCallback((id: string) => setPeople(prev => prev.filter(p => p.id !== id)), []);

    const addOrganization = useCallback((o: Organization) => setOrganizations(prev => [o, ...prev]), []);
    const updateOrganization = useCallback((id: string, updates: Partial<Organization>) => {
        setOrganizations(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    }, []);

    const addDeal = useCallback((d: Deal) => setDeals(prev => [d, ...prev]), []);
    const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
        setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : d));
    }, []);
    const moveDeal = useCallback((id: string, stage: DealStage) => {
        setDeals(prev => prev.map(d => d.id === id ? { ...d, stage, updatedAt: new Date().toISOString().split('T')[0] } : d));
    }, []);

    const addActivity = useCallback((a: Activity) => setActivities(prev => [a, ...prev]), []);

    const getPersonById = useCallback((id: string) => people.find(p => p.id === id), [people]);
    const getOrgById = useCallback((id: string) => organizations.find(o => o.id === id), [organizations]);

    return (
        <CrmContext.Provider value={{
            people, addPerson, updatePerson, deletePerson,
            organizations, addOrganization, updateOrganization,
            deals, addDeal, updateDeal, moveDeal,
            activities, addActivity,
            getPersonById, getOrgById,
        }}>
            {children}
        </CrmContext.Provider>
    );
}

export function useCrm() {
    const context = useContext(CrmContext);
    if (!context) throw new Error('useCrm must be used within CrmProvider');
    return context;
}
