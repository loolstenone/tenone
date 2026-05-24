import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const revalidate = 600;

type GradeKey = 'S' | 'A' | 'B' | 'C' | 'D';

type Stats = {
    total: number;
    scored: number;
    avgIndex: number | null;
    avgFindability: number | null;
    avgTrust: number | null;
    avgCitability: number | null;
    gradeDistribution: Record<GradeKey, number>;
    updatedAt: string;
};

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        return NextResponse.json({ error: 'Supabase 환경변수 누락' }, { status: 500 });
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const { count: total } = await supabase
        .from('smarcomm_scans')
        .select('*', { count: 'exact', head: true });

    const { data: scored } = await supabase
        .from('smarcomm_scans')
        .select('smarcomm_index, findability_score, trust_score, citability_score, grade')
        .not('smarcomm_index', 'is', null);

    const rows = scored ?? [];
    const n = rows.length;

    const avg = (key: keyof typeof rows[0]) => {
        if (n === 0) return null;
        const sum = rows.reduce((acc, r) => acc + ((r[key] as number) ?? 0), 0);
        return Math.round(sum / n);
    };

    const gradeDistribution: Record<GradeKey, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    for (const r of rows) {
        const g = (r.grade as string | null)?.toUpperCase();
        if (g && g in gradeDistribution) gradeDistribution[g as GradeKey]++;
    }

    const stats: Stats = {
        total: total ?? 0,
        scored: n,
        avgIndex: avg('smarcomm_index'),
        avgFindability: avg('findability_score'),
        avgTrust: avg('trust_score'),
        avgCitability: avg('citability_score'),
        gradeDistribution,
        updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(stats, {
        headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300' },
    });
}
