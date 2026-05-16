// SmarComm AIRM ④ 검증 Cron — V2.0 § 3-C
// Schedule: 매일 04:00 UTC (vercel.json)
//
// 동작:
//   1. status='in_action' + 모든 액션이 done 상태 + 액션 완료 30일 경과한 플래그 조회
//   2. 해당 플래그의 원 진단(probe_scan_id) → 같은 사이트 재진단 실행
//   3. 재진단 결과의 같은 platform·query 응답을 원 응답(response_excerpt)과 비교
//   4. diff_type 판정 → smarcomm_ai_diff_events INSERT
//   5. 개선 시 flag.status='verified_fixed', 악화/유지 시 status='in_action' 유지 + notes 갱신
//
// 정직성: 비교는 가능한 한 LLM 분류기로 판정. ANTHROPIC_API_KEY 없으면 텍스트 동일성만 비교 → 'unchanged'/'changed' 단순 라벨.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runFullScan } from '@/lib/smarcomm/run-scan';

export const maxDuration = 300;

function isAuthorized(request: NextRequest): boolean {
    const auth = request.headers.get('authorization');
    return auth === `Bearer ${process.env.CRON_SECRET}`;
}

interface FlagRow {
    id: string;
    tenant_id: string;
    probe_scan_id: string | null;
    platform: string;
    query: string;
    response_excerpt: string;
    flag_type: string;
    status: string;
    detected_at: string;
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // 검증 대상: in_action 상태 + detected_at이 30일 이상 경과
    // (액션 완료 시점 추적은 ②단계 — 우선 detected_at 기준으로 단순화)
    const { data: flags, error } = await admin
        .from('smarcomm_ai_flags')
        .select('id, tenant_id, probe_scan_id, platform, query, response_excerpt, flag_type, status, detected_at')
        .eq('status', 'in_action')
        .lte('detected_at', thirtyDaysAgo)
        .limit(5);  // 1회 cron당 최대 5 — 외부 LLM 호출 비용 방어

    if (error) {
        console.error('[cron/smarcomm-airm-verify] flags query failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!flags || flags.length === 0) {
        return NextResponse.json({ processed: 0, message: '검증 대상 없음' });
    }

    const results: Array<{ flag_id: string; success: boolean; diff_type?: string; error?: string }> = [];

    for (const flag of flags as FlagRow[]) {
        try {
            if (!flag.probe_scan_id) {
                results.push({ flag_id: flag.id, success: false, error: 'probe_scan_id 없음' });
                continue;
            }

            // 원 진단 정보 조회
            const { data: origScan } = await admin
                .from('smarcomm_scans')
                .select('url, domain, requester_email, industry')
                .eq('id', flag.probe_scan_id)
                .maybeSingle();

            if (!origScan) {
                results.push({ flag_id: flag.id, success: false, error: '원 진단 없음' });
                continue;
            }

            // 재진단 실행
            const scanResult = await runFullScan({
                url: origScan.url,
                requester_email: origScan.requester_email,
                industry: origScan.industry,
                tenant_id: flag.tenant_id,
            });

            // 재진단의 같은 platform·query probe 조회 — shortId → scan_id 변환
            let newScanId: string | null = null;
            if (scanResult.shortId) {
                const { data: row } = await admin
                    .from('smarcomm_scans')
                    .select('id')
                    .eq('short_id', scanResult.shortId)
                    .maybeSingle();
                newScanId = row?.id ?? null;
            }

            let newProbe: { id: string; raw_response: string; mentioned: boolean; accuracy: string } | null = null;
            if (newScanId) {
                const { data } = await admin
                    .from('smarcomm_ai_probes')
                    .select('id, raw_response, mentioned, accuracy')
                    .eq('scan_id', newScanId)
                    .eq('platform', flag.platform)
                    .eq('query', flag.query)
                    .order('measured_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                newProbe = data;
            }

            const afterExcerpt = newProbe?.raw_response?.slice(0, 500) ?? '';
            const beforeExcerpt = flag.response_excerpt;

            // diff_type 판정 — 단순 휴리스틱 (LLM 비교는 Phase 6)
            const diffType = classifyDiff(flag.flag_type, beforeExcerpt, afterExcerpt, newProbe);

            await admin.from('smarcomm_ai_diff_events').insert({
                tenant_id: flag.tenant_id,
                flag_id: flag.id,
                before_scan_id: flag.probe_scan_id,
                after_scan_id: newScanId,
                platform: flag.platform,
                query: flag.query,
                diff_type: diffType,
                before_excerpt: beforeExcerpt,
                after_excerpt: afterExcerpt,
                summary: `자동 검증 (30일 경과) · ${flag.flag_type} → ${diffType}`,
            });

            // 개선 시 flag 종결
            if (diffType === 'improved' || diffType === 'fact_corrected' || (diffType === 'sentiment_flip' && newProbe?.mentioned)) {
                await admin
                    .from('smarcomm_ai_flags')
                    .update({ status: 'verified_fixed', resolved_at: now.toISOString() })
                    .eq('id', flag.id);
            }

            results.push({ flag_id: flag.id, success: true, diff_type: diffType });
        } catch (e) {
            console.error(`[cron/smarcomm-airm-verify] verify failed for flag ${flag.id}:`, e);
            results.push({ flag_id: flag.id, success: false, error: String(e) });
        }
    }

    console.log(`[cron/smarcomm-airm-verify] processed ${results.length} flags`);
    return NextResponse.json({ processed: results.length, results });
}

function classifyDiff(
    flagType: string,
    before: string,
    after: string,
    newProbe: { mentioned: boolean; accuracy: string } | null,
): string {
    if (!after) return 'unchanged';
    if (before === after) return 'unchanged';

    if (flagType === 'missing_brand') {
        if (newProbe?.mentioned) return 'improved';
        return 'unchanged';
    }
    if (flagType === 'wrong_fact') {
        if (newProbe?.accuracy === 'exact' || newProbe?.accuracy === 'partial') return 'fact_corrected';
        if (newProbe?.accuracy === 'wrong') return 'unchanged';
        return 'unchanged';
    }
    if (flagType === 'negative_sentiment') {
        // sentiment 재분류 정보가 probe에 직접 없음 — Phase 6 LLM 분류기 도입 전까지 unchanged
        return 'unchanged';
    }
    if (flagType === 'outdated_info') {
        if (newProbe?.accuracy === 'exact') return 'fact_corrected';
        return 'unchanged';
    }
    return 'unchanged';
}
