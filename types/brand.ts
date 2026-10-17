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
    /** 이 사건을 기록한 TenOne Works 글 (ums_posts.id) - About › History가 이 글로 연결한다 */
    postId?: string;
    date: string;
    year: string;
    title: string;
    description: string;
    brandId?: string;
    link?: string;
}
