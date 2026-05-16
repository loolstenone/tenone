// SmarComm Smart-Data Hub API — V2.0 § 3-B (Phase 5 Item 7)
// 4 소스 통합 KPI: 진단(Audit) · 광고 성과(Campaigns) · AI 답변 변화(Diff) · 유입 로그(Events)
//
// 각 KPI는 status로 정직 응답:
//   - 'ok'             — 실 데이터 정상
//   - 'no_data'        — 테이블 존재하나 row 없음
//   - 'table_missing'  — 테이블 자체 부재 (Phase X 예정)
//   - 'error'          — 쿼리 실패 (외부 원인)
//
// CLAUDE.md § 1.10 정직 원칙 — Mock 폴백 금지. 데이터 없으면 "—" + 사유 표시.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type KpiStatus = 'ok' | 'no_data' | 'table_missing' | 'error';

interface Kpi {
    key: 'audit' | 'campaigns' | 'ai_diff' | 'traffic';
    label: string;
    source: string;          // SSOT 테이블·소스명
    value: number | null;    // 주 지표 (count 또는 score)
    valueLabel: string;      // "건" "점" "원" 등
    sub?: string | null;     // 보조 정보 (예: "지난 7일")
    status: KpiStatus;
    note?: string;           // 사용자 안내 (no_data/phase 사유)
}

async function safeCount(
    admin: ReturnType<typeof createAdminClient>,
    table: string,
    filters: (q: unknown) => unknown,
): Promise<{ count: number | null; status: KpiStatus; note?: string }> {
    try {
        const base = admin.from(table).select('*', { count: 'exact', head: true });
        const query = filters(base) as typeof base;
        const { count, error } = await query;
        if (error) {
            const msg = error.message || '';
            if (msg.includes('does not exist') || msg.includes('not find') || /relation .* does not exist/i.test(msg)) {
                return { count: null, status: 'table_missing', note: `${table} 미생성` };
            }
            return { count: null, status: 'error', note: msg.slice(0, 80) };
        }
        if (count === null || count === 0) {
            return { count: count ?? 0, status: 'no_data' };
        }
        return { count, status: 'ok' };
    } catch (e) {
        return { count: null, status: 'error', note: (e as Error).message.slice(0, 80) };
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id') ?? 'tenone-demo';
    const domain = searchParams.get('domain');

    const admin = createAdminClient();
    const now = new Date();
    const ms7d = 7 * 24 * 60 * 60 * 1000;
    const ms30d = 30 * 24 * 60 * 60 * 1000;
    const last7 = new Date(now.getTime() - ms7d).toISOString();
    const last30 = new Date(now.getTime() - ms30d).toISOString();

    // 1) 진단 (Smart-Audit) — smarcomm_scans 최신 Index + 30일 진단 횟수
    let auditKpi: Kpi;
    try {
        let q = admin
            .from('smarcomm_scans')
            .select('smarcomm_index, created_at, domain', { count: 'exact' })
            .gte('created_at', last30)
            .order('created_at', { ascending: false })
            .limit(1);
        if (domain) q = q.eq('domain', domain);
        const { data, count, error } = await q;
        if (error) {
            auditKpi = {
                key: 'audit', label: '진단 (Smart-Audit)', source: 'smarcomm_scans',
                value: null, valueLabel: '점', status: 'error', note: error.message.slice(0, 80),
            };
        } else if (!data || data.length === 0 || count === 0) {
            auditKpi = {
                key: 'audit', label: '진단 (Smart-Audit)', source: 'smarcomm_scans',
                value: null, valueLabel: '점', sub: '지난 30일 진단 없음', status: 'no_data',
                note: domain ? `${domain} 진단 이력 없음` : '워크스페이스 진단 이력 없음',
            };
        } else {
            const latest = data[0];
            auditKpi = {
                key: 'audit', label: '진단 (Smart-Audit)', source: 'smarcomm_scans',
                value: latest.smarcomm_index, valueLabel: '점',
                sub: `최신 Index · 30일 ${count}회 진단`, status: 'ok',
            };
        }
    } catch (e) {
        auditKpi = {
            key: 'audit', label: '진단 (Smart-Audit)', source: 'smarcomm_scans',
            value: null, valueLabel: '점', status: 'error', note: (e as Error).message.slice(0, 80),
        };
    }

    // 2) 광고 성과 (Performance) — wio_campaigns active count
    const campaignsRes = await safeCount(admin, 'wio_campaigns', (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).eq('tenant_id', tenantId).eq('status', 'active'),
    );
    const campaignsKpi: Kpi = {
        key: 'campaigns', label: '광고 성과 (Performance Plus)', source: 'wio_campaigns',
        value: campaignsRes.count, valueLabel: '건', sub: '진행 중 캠페인',
        status: campaignsRes.status, note: campaignsRes.note,
    };
    if (campaignsKpi.status === 'no_data') campaignsKpi.note = '활성 캠페인 없음';
    if (campaignsKpi.status === 'table_missing') campaignsKpi.note = 'wio_campaigns 미생성 — Phase 5 예정';

    // 3) AI 답변 변화 (Real-time Tracker) — smarcomm_ai_diff_events last 30d
    const diffRes = await safeCount(admin, 'smarcomm_ai_diff_events', (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).eq('tenant_id', tenantId).gte('created_at', last30),
    );
    const diffKpi: Kpi = {
        key: 'ai_diff', label: 'AI 답변 변화 (Tracker)', source: 'smarcomm_ai_diff_events',
        value: diffRes.count, valueLabel: '건', sub: '지난 30일',
        status: diffRes.status, note: diffRes.note,
    };
    if (diffKpi.status === 'no_data') diffKpi.note = '30일간 답변 변화 감지 없음';
    if (diffKpi.status === 'table_missing') diffKpi.note = 'smarcomm_ai_diff_events 미생성';

    // 4) 유입 로그 (Inflow) — wio_events last 7d
    const eventsRes = await safeCount(admin, 'wio_events', (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).eq('tenant_id', tenantId).gte('created_at', last7),
    );
    const trafficKpi: Kpi = {
        key: 'traffic', label: '유입 로그 (Inflow)', source: 'wio_events',
        value: eventsRes.count, valueLabel: '건', sub: '지난 7일',
        status: eventsRes.status, note: eventsRes.note,
    };
    if (trafficKpi.status === 'no_data') trafficKpi.note = '7일간 이벤트 로그 없음';
    if (trafficKpi.status === 'table_missing') trafficKpi.note = 'wio_events 미생성 — Phase 5 예정';

    return NextResponse.json({
        tenant_id: tenantId,
        domain: domain ?? null,
        kpis: [auditKpi, campaignsKpi, diffKpi, trafficKpi],
        generated_at: now.toISOString(),
    });
}
