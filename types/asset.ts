export type AssetType = 'Image' | 'Video' | 'Document' | 'Prompt';

export interface Asset {
    id: string;
    title: string;
    type: AssetType;
    brandId: string; // Links to Brand
    url: string;
    thumbnailUrl?: string;
    createdAt: string;
    size?: string; // e.g. "2.4 MB"
    dimensions?: string; // e.g. "1024x1024"
}
