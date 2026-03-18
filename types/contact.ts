export type ContactStatus = 'Active' | 'Lead' | 'Inactive';
export type ContactRole = 'Partner' | 'Client' | 'Vendor' | 'Team' | 'Influencer';

export interface Contact {
    id: string;
    name: string;
    role: ContactRole;
    company?: string;
    email: string;
    phone?: string;
    status: ContactStatus;
    avatarUrl?: string;
    brandAssociation?: string[]; // IDs of brands they work with
    lastContacted?: string;
    notes?: string;
}
