/**
 * site_configs CRUD — L1 설정 계층
 *
 * Intra에서 WRITE (BUMS > 사이트 관리)
 * 브랜드 사이트에서 READ (layout.tsx generateMetadata)
 */
import { createClient } from './client';
import type { SiteIdentifier } from '@/lib/site-config';

const supabase = createClient();

// ── DB row 타입 ──
export interface SiteConfigRow {
    site_id: string;
    name: string;
    domain: string;
    logo_text: string;
    logo_image_url: string | null;
    logo_style: string;
    favicon_url: string;
    apple_touch_icon: string;
    colors: {
        primary: string;
        primaryDark: string;
        secondary: string;
        headerBg: string;
        headerText: string;
        footerBg: string;
        footerText: string;
        accent: string;
    };
    meta_title: string;
    meta_description: string;
    meta_og_image: string | null;
    meta_keywords: string[] | null;
    home_path: string;
    signup_path: string;
    tagline: string | null;
    universe_label: string;
    show_universe_badge: boolean;
    auth_methods: { email: boolean; google: boolean; kakao: boolean };
    nav: { name: string; href: string }[];
    footer_links: { name: string; href: string }[];
    contact: Record<string, string>;
    features: { board: boolean; newsletter: boolean; commerce: boolean; chat: boolean };
    created_at: string;
    updated_at: string;
}

// ── 단건 조회 ──
export async function getSiteConfig(siteId: SiteIdentifier): Promise<SiteConfigRow | null> {
    const { data, error } = await supabase
        .from('site_configs')
        .select('*')
        .eq('site_id', siteId)
        .single();

    if (error || !data) return null;
    return data as SiteConfigRow;
}

// ── 전체 목록 ──
export async function getAllSiteConfigs(): Promise<SiteConfigRow[]> {
    const { data, error } = await supabase
        .from('site_configs')
        .select('*')
        .order('name');

    if (error || !data) return [];
    return data as SiteConfigRow[];
}

// ── Upsert (Intra BUMS에서 저장) ──
export async function upsertSiteConfig(
    siteId: SiteIdentifier,
    updates: Partial<Omit<SiteConfigRow, 'site_id' | 'created_at'>>
): Promise<SiteConfigRow | null> {
    const { data, error } = await supabase
        .from('site_configs')
        .upsert(
            {
                site_id: siteId,
                ...updates,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'site_id' }
        )
        .select()
        .single();

    if (error) {
        console.error('[upsertSiteConfig]', error.message);
        throw error;
    }
    return data as SiteConfigRow;
}

// ── 서버 컴포넌트용 (layout.tsx에서 사용) ──
// 서버 컴포넌트에서는 createClient 대신 서버 클라이언트 사용
export async function getSiteConfigServer(siteId: SiteIdentifier): Promise<SiteConfigRow | null> {
    // 서버 환경에서는 직접 fetch (ISR 호환)
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/site_configs?site_id=eq.${siteId}&select=*`;
    try {
        const res = await fetch(url, {
            headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
            next: { revalidate: 600 }, // ISR 10분 캐시
        });
        if (!res.ok) return null;
        const rows = await res.json();
        return rows[0] ?? null;
    } catch {
        return null;
    }
}
