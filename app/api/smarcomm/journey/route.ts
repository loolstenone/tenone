// Smart-Loop 사용자 여정 — 진단부터 인용 추적까지 7단계 데이터 흐름 집계
// 단일 응답에 각 단계별 카운트 + 최근 이벤트 피드.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface StageStat { key: string; label: string; emoji: string; table: string; count: number; status: 'ok' | 'empty' | 'error' }

async function safeCount(admin: ReturnType<typeof createAdminClient>, table: string, days: number, tenantFilter?: string): Promise<{ count: number; status: StageStat['status'] }> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = admin.from(table).select('*', { count: 'exact', head: true });
        if (days > 0) {
            const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
            q = q.gte('created_at', cutoff);
        }
        if (tenantFilter) q = q.eq('tenant_id', tenantFilter);
        const { count, error } = await q;
        if (error) return { count: 0, status: 'error' };
        return { count: count ?? 0, status: (count ?? 0) > 0 ? 'ok' : 'empty' };
    } catch { return { count: 0, status: 'error' }; }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') ?? '0', 10);
    const tenantId = searchParams.get('tenant_id') ?? null;

    const admin = createAdminClient();

    const STAGES: Array<{ key: string; label: string; emoji: string; table: string; useTenant: boolean }> = [
        { key: 'scan',         label: '진단 실행',        emoji: '🔍', table: 'smarcomm_scans',              useTenant: false },
        { key: 'probe',        label: 'AI 응답 수집',     emoji: '🤖', table: 'smarcomm_ai_probes',          useTenant: false },
        { key: 'flag',         label: '플래그 발견',      emoji: '🚩', table: 'smarcomm_ai_flags',           useTenant: !!tenantId },
        { key: 'action',       label: '교정 액션',        emoji: '🛠️', table: 'smarcomm_airm_actions',       useTenant: !!tenantId },
        { key: 'asset',        label: 'Entity 자산화',    emoji: '📦', table: 'smarcomm_brand_assets',       useTenant: !!tenantId },
        { key: 'distribution', label: '외부 매체 배포',   emoji: '📡', table: 'smarcomm_asset_distributions', useTenant: !!tenantId },
        { key: 'citation',     label: 'AI 인용 추적',     emoji: '📰', table: 'smarcomm_asset_citations',     useTenant: !!tenantId },
    ];

    const stats: StageStat[] = [];
    for (const s of STAGES) {
        const r = await safeCount(admin, s.table, days, s.useTenant ? tenantId! : undefined);
        stats.push({ key: s.key, label: s.label, emoji: s.emoji, table: s.table, count: r.count, status: r.status });
    }

    // 최근 이벤트 피드 — 4개 주요 테이블에서 최신 5개씩 (있는 것만)
    const recentRaw: Array<{ stage: string; emoji: string; label: string; detail: string; created_at: string }> = [];

    const scansRes = await admin.from('smarcomm_scans').select('domain,smarcomm_index,grade,created_at').order('created_at', { ascending: false }).limit(5);
    for (const r of scansRes.data ?? []) recentRaw.push({ stage: 'scan', emoji: '🔍', label: '진단 실행', detail: `${r.domain} · ${r.smarcomm_index}점 (${r.grade})`, created_at: r.created_at });

    const flagsRes = await admin.from('smarcomm_ai_flags').select('claim,flag_type,severity,created_at').order('created_at', { ascending: false }).limit(5);
    for (const r of flagsRes.data ?? []) recentRaw.push({ stage: 'flag', emoji: '🚩', label: '플래그 발견', detail: `[${r.severity}] ${r.flag_type} · "${(r.claim ?? '').slice(0, 60)}"`, created_at: r.created_at });

    const actionsRes = await admin.from('smarcomm_airm_actions').select('title,action_type,role,status,created_at').order('created_at', { ascending: false }).limit(5);
    for (const r of actionsRes.data ?? []) recentRaw.push({ stage: 'action', emoji: '🛠️', label: '교정 액션', detail: `[${r.status}] ${r.title ?? r.action_type} · ${r.role ?? 'unassigned'}`, created_at: r.created_at });

    const assetsRes = await admin.from('smarcomm_brand_assets').select('entity_type,name,persistence_score,created_at').order('created_at', { ascending: false }).limit(5);
    for (const r of assetsRes.data ?? []) recentRaw.push({ stage: 'asset', emoji: '📦', label: 'Entity 자산화', detail: `${r.entity_type} · ${r.name} (흔적 ${r.persistence_score ?? 0})`, created_at: r.created_at });

    recentRaw.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    const recent = recentRaw.slice(0, 20);

    // 전환율 계산 (단계 간)
    const conversions: Array<{ from: string; to: string; rate: number }> = [];
    for (let i = 0; i < stats.length - 1; i++) {
        const from = stats[i];
        const to = stats[i + 1];
        if (from.count === 0) {
            conversions.push({ from: from.key, to: to.key, rate: 0 });
        } else {
            conversions.push({ from: from.key, to: to.key, rate: Math.round((to.count / from.count) * 100) });
        }
    }

    return NextResponse.json({ stages: stats, conversions, recent, generated_at: new Date().toISOString() });
}
