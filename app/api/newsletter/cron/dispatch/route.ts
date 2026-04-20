/**
 * GET /api/newsletter/cron/dispatch
 * Vercel Cron: scheduled 상태의 이슈 중 scheduled_at <= now 인 것을 발송
 * vercel.json에 등록 필요
 *
 * 인증: Vercel Cron은 Authorization: Bearer <CRON_SECRET> 헤더 전송
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

export async function GET(request: NextRequest) {
    // Vercel Cron 인증
    const auth = request.headers.get('authorization');
    if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    const nowIso = new Date().toISOString();

    // 발송 대기 중인 이슈 찾기
    const { data: dueIssues } = await supabase
        .from('newsletter_issues')
        .select('id, title, scheduled_at, from_name, target_site_ids, target_tags')
        .eq('status', 'scheduled')
        .lte('scheduled_at', nowIso)
        .limit(5);  // 한 번에 최대 5건

    if (!dueIssues || dueIssues.length === 0) {
        return NextResponse.json({ ok: true, dispatched: 0 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenone.biz';
    const results: Array<{ id: string; ok: boolean; sent?: number; error?: string }> = [];

    for (const issue of dueIssues) {
        // 중복 발송 방지: scheduled → sending으로 전환
        const { error: lockErr } = await supabase
            .from('newsletter_issues')
            .update({ status: 'sending' })
            .eq('id', issue.id)
            .eq('status', 'scheduled');
        if (lockErr) {
            results.push({ id: issue.id, ok: false, error: 'lock_failed' });
            continue;
        }

        try {
            const res = await fetch(`${siteUrl}/api/newsletter/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.ADMIN_API_KEY}`,
                },
                body: JSON.stringify({
                    issueId: issue.id,
                    fromName: issue.from_name ?? undefined,
                    siteIds: issue.target_site_ids ?? undefined,
                    tags: issue.target_tags ?? undefined,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                results.push({ id: issue.id, ok: true, sent: data.sent ?? 0 });
            } else {
                // 실패 시 scheduled로 되돌림
                await supabase.from('newsletter_issues').update({ status: 'scheduled' }).eq('id', issue.id);
                results.push({ id: issue.id, ok: false, error: data.error });
            }
        } catch (e) {
            await supabase.from('newsletter_issues').update({ status: 'scheduled' }).eq('id', issue.id);
            results.push({ id: issue.id, ok: false, error: e instanceof Error ? e.message : 'unknown' });
        }
    }

    return NextResponse.json({ ok: true, dispatched: results.length, results });
}
