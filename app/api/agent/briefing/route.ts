/**
 * 브리핑 자동 발행 API
 * POST /api/agent/briefing
 *
 * 1001 에이전트가 오늘의 전사 현황을 수집 → Claude API 브리핑 생성 → 메신저 #브리핑 채널 자동 발행
 * Supabase pg_cron 에서 매일 10:01 KST 호출 (01:01 UTC)
 *
 * Auth: Bearer ADMIN_API_KEY
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { invokeAgent } from '@/lib/agent/claude';

const BRIEFING_THREAD_ID = '468a2734-1819-4eb5-8137-c5a3465a4412';
const AGENT_NAME = '1001';
const AGENT_DISPLAY = '열시일분';

function getServiceClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}

// ── 전사 현황 수집 ─────────────────────────────────────────────────

async function collectDailyContext(): Promise<string> {
    const supabase = getServiceClient();
    const today = new Date().toISOString().split('T')[0];
    const lines: string[] = [];

    // GPR 평균 진행률
    try {
        const { data: gprData } = await supabase
            .from('gpr_goals')
            .select('progress')
            .eq('tenant_id', 'tenone')
            .not('progress', 'is', null);
        if (gprData && gprData.length > 0) {
            const avg = Math.round(
                gprData.reduce((s: number, g: { progress: number }) => s + (g.progress || 0), 0) / gprData.length
            );
            lines.push(`GPR 전사 평균 달성률: ${avg}%`);
        }
    } catch {}

    // 결재 대기 건수
    try {
        const { count } = await supabase
            .from('approval_requests')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', 'tenone')
            .eq('status', 'pending');
        if (count !== null) lines.push(`결재 대기: ${count}건`);
    } catch {}

    // 진행 중 프로젝트
    try {
        const { count } = await supabase
            .from('projects')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', 'tenone')
            .eq('status', 'active');
        if (count !== null) lines.push(`진행 중 프로젝트: ${count}개`);
    } catch {}

    // 오늘 캠페인 수
    try {
        const { count } = await supabase
            .from('campaigns')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', 'tenone')
            .eq('status', 'active');
        if (count !== null) lines.push(`활성 캠페인: ${count}개`);
    } catch {}

    // Analytics 어제 스냅샷 (있는 경우)
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yd = yesterday.toISOString().split('T')[0];
        const { data: snap } = await supabase
            .from('analytics_snapshots')
            .select('total_sessions, total_users')
            .gte('recorded_at', yd)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (snap) {
            lines.push(`어제 전체 트래픽: ${snap.total_sessions?.toLocaleString() ?? '-'} 세션, ${snap.total_users?.toLocaleString() ?? '-'} 사용자`);
        }
    } catch {}

    return lines.length > 0
        ? lines.join('\n')
        : '현황 데이터 없음 (DB 연동 준비 중)';
}

// ── 메신저 발행 ────────────────────────────────────────────────────

async function publishToChannel(content: string): Promise<boolean> {
    const supabase = getServiceClient();
    const { error } = await supabase.from('wio_chat_messages').insert({
        thread_id: BRIEFING_THREAD_ID,
        sender_name: AGENT_DISPLAY,
        content,
        type: 'text',
        tenant_id: 'tenone',
        sender_type: 'agent',
        message_format: 'markdown',
        metadata: {
            agent: AGENT_NAME,
            source: 'briefing_cron',
            generated_at: new Date().toISOString(),
        },
    });

    if (error) {
        console.error('[Briefing] 채널 발행 실패:', error.message);
        return false;
    }
    return true;
}

// ── 핸들러 ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    // 인증 (ADMIN_API_KEY)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const korTime = new Intl.DateTimeFormat('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: 'long', day: 'numeric',
            weekday: 'long',
        }).format(new Date());

        // 1. 전사 현황 수집
        const context = await collectDailyContext();

        // 2. 브리핑 프롬프트
        const prompt = `오늘은 ${korTime}입니다.

[전사 현황]
${context}

위 데이터를 바탕으로 Ten:One Universe의 오늘 AM 브리핑을 작성해주세요.
형식:
- 첫 줄: 날짜와 간결한 오늘의 한 줄 방향
- 현황 요약 (2~3줄)
- 오늘 집중할 핵심 1가지
- 마지막에 署名: — 열시일분 (10:01)

전체 200자 이내로 간결하게.`;

        // 3. 1001 에이전트 호출
        const result = await invokeAgent({
            agentName: AGENT_NAME,
            userMessage: prompt,
            correlationId: crypto.randomUUID(),
        });

        // 4. #브리핑 채널 발행
        const published = await publishToChannel(result.response);

        return NextResponse.json({
            success: true,
            published,
            agentName: AGENT_NAME,
            preview: result.response.slice(0, 100) + (result.response.length > 100 ? '...' : ''),
        });
    } catch (error) {
        console.error('[Briefing] 오류:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '브리핑 생성 실패' },
            { status: 500 }
        );
    }
}

// GET: 수동 트리거용 (브라우저에서 바로 테스트)
export async function GET(request: NextRequest) {
    return POST(request);
}
