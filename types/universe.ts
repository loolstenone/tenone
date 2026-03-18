export interface UniverseTimelineItem {
    id: string;
    year: string;
    title: string;
    description: string;
    category: 'Origin' | 'Expansion' | 'Conflict' | 'Resolution';
    relatedBrands: string[]; // Brand IDs
}

export interface UniverseNode {
    id: string; // Brand ID
    label: string;
    group: 'Core' | 'Branch' | 'External';
    x: number; // For simple SVG mapping
    y: number;
}

export interface UniverseLink {
    source: string;
    target: string;
    label?: string;
    type: 'Parent' | 'Collaboration' | 'Rivals' | 'Support';
}
