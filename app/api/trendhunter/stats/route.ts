import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/trendhunter/stats
 * 대시보드용 통계 API
 */
export async function GET(request: NextRequest) {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 오늘 수집량
        const { count: todayCount } = await supabase
            .from('collected_data')
            .select('*', { count: 'exact', head: true })
            .gte('collected_at', `${today}T00:00:00`);

        // 크롤러 상태
        const { data: crawlers } = await supabase
            .from('crawler_status')
            .select('*')
            .order('updated_at', { ascending: false });

        // 최근 기회 감지
        const { data: opportunities } = await supabase
            .from('th_opportunities')
            .select('*')
            .order('detected_at', { ascending: false })
            .limit(10);

        // 최근 인사이트
        const { data: insights } = await supabase
            .from('th_insights')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // 일간 통계
        const { data: dailyStats } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('date', today);

        return NextResponse.json({
            today_count: todayCount || 0,
            crawlers: crawlers || [],
            opportunities: opportunities || [],
            insights: insights || [],
            daily_stats: dailyStats || [],
        });
    } catch (err) {
        console.error('Stats error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
