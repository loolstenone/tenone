import { createClient } from '@/lib/supabase/client';
import { Brand, HistoryEvent } from '@/types/brand';

function rowToBrand(r: any): Brand {
    return {
        id: r.id,
        name: r.name,
        category: r.category || 'Corporate',
        description: r.description || '',
        tagline: r.tagline || undefined,
        domain: r.domain || undefined,
        logoUrl: r.logo_url || undefined,
        thumbnailUrl: r.thumbnail_url || undefined,
        websiteUrl: r.website_url || undefined,
        foundedDate: r.founded_date || undefined,
        status: r.display_status || r.status || 'Active',
        tags: r.tags || [],
    };
}

function rowToHistory(r: any): HistoryEvent {
    return {
        id: r.id,
        date: r.date,
        year: r.year,
        title: r.title,
        description: r.description || '',
        brandId: r.brand_id || undefined,
    };
}

export async function fetchPortalBrands(): Promise<Brand[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('brands')
        .select('id, name, category, description, tagline, domain, logo_url, thumbnail_url, website_url, founded_date, display_status, tags')
        .order('name');
    if (error || !data) return [];
    return data.map((r: any) => rowToBrand(r));
}

export async function fetchHistoryEvents(): Promise<HistoryEvent[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('history_events')
        .select('id, date, year, title, description, brand_id')
        .order('date', { ascending: false });
    if (error || !data) return [];
    return data.map((r: any) => rowToHistory(r));
}
