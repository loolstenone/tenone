export type CmsChannel = 'works' | 'newsroom' | 'history';
export type CmsCategory = 'Brand' | 'Project' | 'Event' | 'Media';
export type CmsStatus = 'Draft' | 'Published' | 'Archived';

export interface CmsPost {
    id: string;
    title: string;
    summary: string;
    body: string;
    category: CmsCategory;
    channels: CmsChannel[];
    status: CmsStatus;
    date: string;
    brandId?: string;
    image?: string;
    externalLink?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}
