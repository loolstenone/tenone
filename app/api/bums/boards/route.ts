import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/bums/boards?site=tenone
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const site = searchParams.get('site'); // brand_id

    const supabase = await createClient();

    let query = supabase
        .from('bums_boards')
        .select(`
            id, name, slug, board_type, skin_type, visibility, description,
            sort_order, created_at,
            bums_sites!inner(brand_id, name)
        `)
        .order('sort_order', { ascending: true });

    if (site) {
        query = query.eq('bums_sites.brand_id', site);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ boards: data || [] });
}
