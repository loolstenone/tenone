export type CampaignType = 'Brand' | 'Product' | 'Event' | 'Content' | 'Partnership';
export type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed';

export interface Campaign {
    id: string;
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    brandId: string;
    description: string;
    budget: number;
    spent: number;
    kpi: string;
    assignee: string;
    startDate: string;
    endDate?: string;
    channels: string[];
    createdAt: string;
}

export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type LeadSource = 'Website' | 'Referral' | 'Event' | 'SNS' | 'Badak' | 'MADLeague' | 'Direct';

export interface Lead {
    id: string;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    stage: LeadStage;
    source: LeadSource;
    value: number;
    assignee: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export type ContentType = 'Article' | 'Newsletter' | 'SNS' | 'Video' | 'Shorts';
export type ContentStatus = 'Draft' | 'Scheduled' | 'Published' | 'Archived';

export interface ContentPost {
    id: string;
    title: string;
    type: ContentType;
    status: ContentStatus;
    channel: string;
    brandId: string;
    assignee: string;
    publishDate?: string;
    engagement?: number;
    createdAt: string;
}
