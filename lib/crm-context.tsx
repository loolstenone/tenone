"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Person, Organization, Deal, Activity, DealStage } from '@/types/crm';
import { initialPeople, initialOrganizations, initialDeals, initialActivities } from '@/lib/crm-data';
import * as crmDB from '@/lib/supabase/crm';
import { isMockAllowed } from '@/lib/env';

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

    loading: boolean;
    dbConnected: boolean;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: ReactNode }) {
    const mockOk = isMockAllowed();
    const [people, setPeople] = useState<Person[]>(mockOk ? initialPeople : []);
    const [organizations, setOrganizations] = useState<Organization[]>(mockOk ? initialOrganizations : []);
    const [deals, setDeals] = useState<Deal[]>(mockOk ? initialDeals : []);
    const [activities, setActivities] = useState<Activity[]>(mockOk ? initialActivities : []);
    const [loading, setLoading] = useState(true);
    const [dbConnected, setDbConnected] = useState(false);

    // DB 우선 로드, 실패 시 프로덕션=빈 배열 / 개발=Mock
    useEffect(() => {
        async function loadFromDB() {
            try {
                const [dbPeopleResult, dbOrgs, dbDeals, dbActivities] = await Promise.all([
                    crmDB.fetchPeople({ limit: 200 }),
                    crmDB.fetchOrganizations(),
                    crmDB.fetchDeals(),
                    crmDB.fetchActivities({ limit: 200 }),
                ]);
                const dbPeople = dbPeopleResult.people;

                if (dbPeople.length > 0 || dbOrgs.length > 0 || dbDeals.length > 0 || dbActivities.length > 0) {
                    setPeople(dbPeople.length > 0 ? dbPeople : []);
                    setOrganizations(dbOrgs.length > 0 ? dbOrgs : []);
                    setDeals(dbDeals.length > 0 ? dbDeals : []);
                    setActivities(dbActivities.length > 0 ? dbActivities : []);
                    setDbConnected(true);
                }
            } catch {
                // DB 연결 실패 → 프로덕션: 빈 상태, 개발: Mock 유지
            }
            setLoading(false);
        }
        loadFromDB();
    }, []);

    const addPerson = useCallback((p: Person) => {
        setPeople(prev => [p, ...prev]);
        if (dbConnected) crmDB.createPerson(p).catch(() => {});
    }, [dbConnected]);

    const updatePerson = useCallback((id: string, updates: Partial<Person>) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        if (dbConnected) crmDB.updatePerson(id, updates).catch(() => {});
    }, [dbConnected]);

    const deletePerson = useCallback((id: string) => {
        setPeople(prev => prev.filter(p => p.id !== id));
        if (dbConnected) crmDB.deletePerson(id).catch(() => {});
    }, [dbConnected]);

    const addOrganization = useCallback((o: Organization) => {
        setOrganizations(prev => [o, ...prev]);
        if (dbConnected) crmDB.createOrganization(o).catch(() => {});
    }, [dbConnected]);

    const updateOrganization = useCallback((id: string, updates: Partial<Organization>) => {
        setOrganizations(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
        if (dbConnected) crmDB.updateOrganization(id, updates).catch(() => {});
    }, [dbConnected]);

    const addDeal = useCallback((d: Deal) => {
        setDeals(prev => [d, ...prev]);
        if (dbConnected) crmDB.createDeal(d).catch(() => {});
    }, [dbConnected]);

    const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
        setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : d));
        if (dbConnected) crmDB.updateDeal(id, updates).catch(() => {});
    }, [dbConnected]);

    const moveDeal = useCallback((id: string, stage: DealStage) => {
        setDeals(prev => prev.map(d => d.id === id ? { ...d, stage, updatedAt: new Date().toISOString().split('T')[0] } : d));
        if (dbConnected) crmDB.updateDeal(id, { stage }).catch(() => {});
    }, [dbConnected]);

    const addActivity = useCallback((a: Activity) => {
        setActivities(prev => [a, ...prev]);
        if (dbConnected) crmDB.createActivity(a).catch(() => {});
    }, [dbConnected]);

    const getPersonById = useCallback((id: string) => people.find(p => p.id === id), [people]);
    const getOrgById = useCallback((id: string) => organizations.find(o => o.id === id), [organizations]);

    return (
        <CrmContext.Provider value={{
            people, addPerson, updatePerson, deletePerson,
            organizations, addOrganization, updateOrganization,
            deals, addDeal, updateDeal, moveDeal,
            activities, addActivity,
            getPersonById, getOrgById,
            loading, dbConnected,
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
