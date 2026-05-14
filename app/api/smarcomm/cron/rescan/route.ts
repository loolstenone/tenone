// SmarComm 주간 자동 재진단 Cron
// Vercel Cron: 매주 월요일 04:00 KST (일 19:00 UTC)
// Authorization: Bearer CRON_SECRET

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeUrl } from '@/lib/smarcomm/seo-analyzer';
import { computeIndex } from '@/lib/smarcomm/index-calculator';
import { fetchBacklinkData } from '@/lib/smarcomm/analyzers/backlink-authority';
import { fetchIndustryBenchmark } from '@/lib/smarcomm/analyzers/industry-benchmark';

const BATCH_SIZE = 10;
const SCORE_DELTA_THRESHOLD = 5;

export async function GET(request: NextRequest) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // 재진단 대상 조회 (next_scan_at 초과, 사용자 연결된 것만)
    const { data: targets, error } = await supabase
        .from('smarcomm_scan_results')
        .select('id, user_id, url, domain, industry, index_score')
        .lte('next_scan_at', new Date().toISOString())
        .not('user_id', 'is', null)
        .order('next_scan_at', { ascending: true })
        .limit(BATCH_SIZE);

    if (error) {
        console.error('[smarcomm-rescan] fetch targets:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!targets || targets.length === 0) {
        return NextResponse.json({ scanned: 0, message: 'no targets' });
    }

    const results = await Promise.allSettled(
        targets.map(t => rescandomain(t, supabase))
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({ scanned: succeeded, failed, total: targets.length });
}

async function rescandomain(
    target: { id: string; user_id: string; url: string; domain: string; industry: string; index_score: number },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any
) {
    const result = await analyzeUrl(target.url, {
        pageSpeedApiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    if (result.statusCode === 0) throw new Error(`unreachable: ${target.url}`);

    const backlinkData = await fetchBacklinkData(target.domain).catch(() => undefined);
    const breakdown = computeIndex(result, backlinkData);
    const benchmark = await fetchIndustryBenchmark(
        target.industry,
        { findability: breakdown.findability, trust: breakdown.trust, citability: breakdown.citability, index: breakdown.index }
    ).catch(() => null);

    const delta = breakdown.index - target.index_score;
    const now = new Date();
    const nextScan = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
        .from('smarcomm_scan_results')
        .update({
            findability: breakdown.findability,
            trust: breakdown.trust,
            citability: breakdown.citability,
            index_score: breakdown.index,
            grade: breakdown.grade,
            breakdown,
            benchmark,
            scanned_at: now.toISOString(),
            next_scan_at: nextScan.toISOString(),
            score_delta: delta,
            notified: false,
        })
        .eq('id', target.id);

    if (updateError) throw new Error(updateError.message);

    // 점수 5점 이상 변화 시 알림 게시
    if (Math.abs(delta) >= SCORE_DELTA_THRESHOLD) {
        await postScoreChangeNotification(supabase, target.user_id, target.domain, delta, breakdown.index);
    }
}

async function postScoreChangeNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase: any,
    userId: string,
    domain: string,
    delta: number,
    newScore: number
) {
    const direction = delta > 0 ? '📈 상승' : '📉 하락';
    const sign = delta > 0 ? '+' : '';
    const content = `**${domain}** SmarComm Index ${direction}\n점수: **${newScore}점** (${sign}${delta}점)\n[결과 확인하기](/smarcomm/dashboard)`;

    // user의 smarcomm agent DM 스레드 찾기
    const { data: thread } = await supabase
        .from('wio_chat_threads')
        .select('id')
        .eq('thread_type', 'agent_dm')
        .eq('agent_name', 'SmarComm')
        .contains('participants', [userId])
        .limit(1)
        .single();

    if (!thread) return;

    await supabase.from('wio_chat_messages').insert({
        thread_id: thread.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_name: 'SmarComm',
        sender_type: 'agent',
        content,
        type: 'text',
        message_format: 'markdown',
        read_by: [],
    });

    await supabase
        .from('wio_chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', thread.id);
}
