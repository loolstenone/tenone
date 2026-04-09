import { createClient } from '@/lib/supabase/client';
import { Brand, HistoryEvent } from '@/types/brand';

function rowToBrand(r: Record<string, unknown>): Brand {
    return {
        id: r.id as string,
        name: r.name as string,
        category: (r.category as Brand['category']) || 'Corporate',
        description: (r.description as string) || '',
        tagline: (r.tagline as string) || undefined,
        domain: (r.domain as string) || undefined,
        logoUrl: (r.logo_url as string) || undefined,
        thumbnailUrl: (r.thumbnail_url as string) || undefined,
        websiteUrl: (r.website_url as string) || undefined,
        foundedDate: (r.founded_date as string) || undefined,
        status: ((r.display_status || r.status) as Brand['status']) || 'Active',
        tags: (r.tags as string[]) || [],
    };
}

function rowToHistory(r: Record<string, unknown>): HistoryEvent {
    return {
        id: r.id as string,
        date: r.date as string,
        year: r.year as string,
        title: r.title as string,
        description: (r.description as string) || '',
        brandId: (r.brand_id as string) || undefined,
    };
}

export async function fetchPortalBrands(): Promise<Brand[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('brands')
        .select('id, name, category, description, tagline, domain, logo_url, thumbnail_url, website_url, founded_date, display_status, tags')
        .order('name');
    if (error || !data) return [];
    return data.map((r: Record<string, unknown>) => rowToBrand(r));
}

export async function fetchHistoryEvents(): Promise<HistoryEvent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('history_events')
        .select('id, date, year, title, description, brand_id')
        .order('date', { ascending: false });
    if (error || !data) return [];
    return data.map((r: Record<string, unknown>) => rowToHistory(r));
}
