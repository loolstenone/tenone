"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Campaign, Lead, ContentPost, LeadStage } from '@/types/marketing';
import { initialCampaigns, initialLeads, initialContentPosts } from '@/lib/marketing-data';
import * as marketingDB from '@/lib/supabase/marketing';
import { isMockAllowed } from '@/lib/env';

interface MarketingContextType {
    campaigns: Campaign[];
    addCampaign: (c: Campaign) => void;
    updateCampaign: (id: string, updates: Partial<Campaign>) => void;

    leads: Lead[];
    addLead: (l: Lead) => void;
    updateLead: (id: string, updates: Partial<Lead>) => void;
    moveLead: (id: string, stage: LeadStage) => void;

    contentPosts: ContentPost[];
    addContentPost: (p: ContentPost) => void;
    updateContentPost: (id: string, updates: Partial<ContentPost>) => void;

    loading: boolean;
    dbConnected: boolean;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

export function MarketingProvider({ children }: { children: ReactNode }) {
    const mockOk = isMockAllowed();
    const [campaigns, setCampaigns] = useState<Campaign[]>(mockOk ? initialCampaigns : []);
    const [leads, setLeads] = useState<Lead[]>(mockOk ? initialLeads : []);
    const [contentPosts, setContentPosts] = useState<ContentPost[]>(mockOk ? initialContentPosts : []);
    const [loading, setLoading] = useState(true);
    const [dbConnected, setDbConnected] = useState(false);

    // DB 우선 로드, 실패 시 프로덕션=빈 배열 / 개발=Mock
    useEffect(() => {
        async function loadFromDB() {
            try {
                const [dbCampaigns, dbLeads, dbContent] = await Promise.all([
                    marketingDB.fetchCampaigns(),
                    marketingDB.fetchLeads(),
                    marketingDB.fetchContentPosts(),
                ]);
                if (dbCampaigns.length > 0 || dbLeads.length > 0 || dbContent.length > 0) {
                    setCampaigns(dbCampaigns.length > 0 ? dbCampaigns : []);
                    setLeads(dbLeads.length > 0 ? dbLeads : []);
                    setContentPosts(dbContent.length > 0 ? dbContent : []);
                    setDbConnected(true);
                }
            } catch {
                // DB 연결 실패 → 프로덕션: 빈 상태 유지, 개발: Mock 유지
            }
            setLoading(false);
        }
        loadFromDB();
    }, []);

    const addCampaign = useCallback((c: Campaign) => {
        setCampaigns(prev => [c, ...prev]);
        if (dbConnected) marketingDB.createCampaign(c).catch(() => {});
    }, [dbConnected]);

    const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        if (dbConnected) marketingDB.updateCampaign(id, updates).catch(() => {});
    }, [dbConnected]);

    const addLead = useCallback((l: Lead) => {
        setLeads(prev => [l, ...prev]);
        if (dbConnected) marketingDB.createLead(l).catch(() => {});
    }, [dbConnected]);

    const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : l));
        if (dbConnected) marketingDB.updateLead(id, updates).catch(() => {});
    }, [dbConnected]);

    const moveLead = useCallback((id: string, stage: LeadStage) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, stage, updatedAt: new Date().toISOString().split('T')[0] } : l));
        if (dbConnected) marketingDB.updateLead(id, { stage }).catch(() => {});
    }, [dbConnected]);

    const addContentPost = useCallback((p: ContentPost) => {
        setContentPosts(prev => [p, ...prev]);
        if (dbConnected) marketingDB.createContentPost(p).catch(() => {});
    }, [dbConnected]);

    const updateContentPost = useCallback((id: string, updates: Partial<ContentPost>) => {
        setContentPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        if (dbConnected) marketingDB.updateContentPost(id, updates).catch(() => {});
    }, [dbConnected]);

    return (
        <MarketingContext.Provider value={{ campaigns, addCampaign, updateCampaign, leads, addLead, updateLead, moveLead, contentPosts, addContentPost, updateContentPost, loading, dbConnected }}>
            {children}
        </MarketingContext.Provider>
    );
}

export function useMarketing() {
    const context = useContext(MarketingContext);
    if (!context) throw new Error('useMarketing must be used within MarketingProvider');
    return context;
}
