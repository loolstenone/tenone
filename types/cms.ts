export type CmsChannel = 'works' | 'newsroom';
export type CmsCategory = '브랜드' | '프로젝트' | '네트워크' | '교육' | '콘텐츠' | '공지';
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
