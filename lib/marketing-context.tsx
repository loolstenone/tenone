"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Campaign, Lead, ContentPost, CampaignStatus, LeadStage } from '@/types/marketing';
import { initialCampaigns, initialLeads, initialContentPosts } from '@/lib/marketing-data';

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
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

export function MarketingProvider({ children }: { children: ReactNode }) {
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [contentPosts, setContentPosts] = useState<ContentPost[]>(initialContentPosts);

    const addCampaign = useCallback((c: Campaign) => setCampaigns(prev => [c, ...prev]), []);
    const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)), []);

    const addLead = useCallback((l: Lead) => setLeads(prev => [l, ...prev]), []);
    const updateLead = useCallback((id: string, updates: Partial<Lead>) => setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : l)), []);
    const moveLead = useCallback((id: string, stage: LeadStage) => setLeads(prev => prev.map(l => l.id === id ? { ...l, stage, updatedAt: new Date().toISOString().split('T')[0] } : l)), []);

    const addContentPost = useCallback((p: ContentPost) => setContentPosts(prev => [p, ...prev]), []);
    const updateContentPost = useCallback((id: string, updates: Partial<ContentPost>) => setContentPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)), []);

    return (
        <MarketingContext.Provider value={{ campaigns, addCampaign, updateCampaign, leads, addLead, updateLead, moveLead, contentPosts, addContentPost, updateContentPost }}>
            {children}
        </MarketingContext.Provider>
    );
}

export function useMarketing() {
    const context = useContext(MarketingContext);
    if (!context) throw new Error('useMarketing must be used within MarketingProvider');
    return context;
}
