export type PersonType = 'Student' | 'Professional' | 'Mentor' | 'Partner' | 'Client' | 'Vendor' | 'Other';
export type PersonStatus = 'Active' | 'Lead' | 'Inactive' | 'Alumni';
export type DealStage = 'Lead' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type ActivityType = 'Meeting' | 'Call' | 'Email' | 'Note' | 'Event';
export type OrgType = 'Partner' | 'Client' | 'Vendor' | 'Sponsor';

export interface Person {
    id: string;
    name: string;
    email: string;
    phone?: string;
    type: PersonType;
    status: PersonStatus;
    company?: string;
    position?: string;
    avatarInitials: string;
    brandAssociation: string[];
    tags: string[];
    source: string;
    cohort?: string;
    lastContacted?: string;
    createdAt: string;
    notes?: string;
}

export interface Organization {
    id: string;
    name: string;
    type: OrgType;
    industry?: string;
    website?: string;
    contactIds: string[];
    brandAssociation: string[];
    status: 'Active' | 'Inactive';
    notes?: string;
    createdAt: string;
}

export interface Deal {
    id: string;
    title: string;
    organizationId: string;
    contactId: string;
    stage: DealStage;
    value: number;
    currency: string;
    brandId: string;
    expectedCloseDate?: string;
    createdAt: string;
    updatedAt: string;
    notes?: string;
}

export interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    description?: string;
    personId?: string;
    organizationId?: string;
    dealId?: string;
    date: string;
    createdAt: string;
}
