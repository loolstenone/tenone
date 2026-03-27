export type BrandCategory = 'AI Idol' | 'AI Creator' | 'Community' | 'Project Group' | 'Fashion' | 'Character' | 'Corporate' | 'Startup' | 'Content' | 'Marketing' | 'Consulting' | 'Education' | 'Platform' | 'Network' | 'Wellness';

export interface Brand {
    id: string;
    name: string;
    category: BrandCategory;
    description: string;
    tagline?: string;
    domain?: string;
    logoUrl?: string;
    thumbnailUrl?: string;
    websiteUrl?: string;
    foundedDate?: string;
    status: 'Active' | 'Development' | 'Hiatus';
    tags: string[];
}

export interface HistoryEvent {
    id: string;
    date: string;
    year: string;
    title: string;
    description: string;
    brandId?: string;
}
