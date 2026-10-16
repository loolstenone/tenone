import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/api-guard';

/**
 * 프로필 신고 처리 (직원 전용)
 * GET  /api/intra/profile-reports?status=pending|hidden|dismissed|all
 * POST /api/intra/profile-reports { id, action: 'hide' | 'dismiss' | 'unhide', note? }
 *   hide    = 운영 숨김 (members.profile_blocked_at) → DB 트리거가 비공개 전환·검색 제외·공유 링크 회수·브랜드 공개 내림
 *             같은 대상의 대기 신고는 함께 처리
 *   dismiss = 문제 없음
 *   unhide  = 숨김 해제 (공개는 본인이 다시 켜야 한다)
 * 운영 숨김 컬럼은 service_role만 바꿀 수 있다 (protect_member_privileged_columns).
 */

const REASON_LABEL: Record<string, string> = {
    impersonation: '사칭', privacy: '개인정보 노출', abuse: '욕설·혐오·괴롭힘', spam: '광고·스팸', other: '기타',
};

export async function GET(request: NextRequest) {
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;

    const status = new URL(request.url).searchParams.get('status') ?? 'pending';
    const admin = createAdminClient();
    let q = admin.from('profile_reports')
        .select('id, target_member_id, scope, brand_id, reason, detail, reporter_member_id, status, handled_at, handled_note, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
    if (status !== 'all') q = q.eq('status', status);
    const { data: reports, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const ids = [...new Set((reports ?? []).flatMap(r => [r.target_member_id, r.reporter_member_id]))];
    const { data: people } = ids.length
        ? await admin.from('members').select('id, name, handle, profile_visibility, profile_blocked_at').in('id', ids)
        : { data: [] };
    const byId = new Map((people ?? []).map(p => [p.id, p]));

    return NextResponse.json({
        reports: (reports ?? []).map(r => ({
            ...r,
            reason_label: REASON_LABEL[r.reason] ?? r.reason,
            target: byId.get(r.target_member_id) ?? null,
            reporter: (() => { const p = byId.get(r.reporter_member_id); return p ? { name: p.name, handle: p.handle } : null; })(),
        })),
    });
}

export async function POST(request: NextRequest) {
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;
    const handledBy = auth.kind === 'user' ? auth.memberId : null;

    const body = await request.json().catch(() => ({})) as { id?: unknown; action?: unknown; note?: unknown };
    const id = typeof body.id === 'string' ? body.id : '';
    const action = body.action;
    const note = typeof body.note === 'string' ? body.note.slice(0, 500) : null;
    if (!id || !['hide', 'dismiss', 'unhide'].includes(action as string)) {
        return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: report } = await admin.from('profile_reports').select('id, target_member_id, status').eq('id', id).maybeSingle();
    if (!report) return NextResponse.json({ error: '신고를 찾을 수 없습니다.' }, { status: 404 });
    const now = new Date().toISOString();
    const handled = { handled_by: handledBy, handled_at: now, handled_note: note };

    if (action === 'hide') {
        const { error } = await admin.from('members').update({ profile_blocked_at: now }).eq('id', report.target_member_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await admin.from('profile_reports').update({ status: 'hidden', ...handled })
            .eq('target_member_id', report.target_member_id).eq('status', 'pending');
        await admin.from('profile_reports').update({ status: 'hidden', ...handled }).eq('id', id);
    } else if (action === 'dismiss') {
        if (report.status !== 'pending') return NextResponse.json({ error: '이미 처리된 신고입니다.' }, { status: 409 });
        await admin.from('profile_reports').update({ status: 'dismissed', ...handled }).eq('id', id);
    } else {
        const { error } = await admin.from('members').update({ profile_blocked_at: null }).eq('id', report.target_member_id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await admin.from('profile_reports').update({ handled_note: note ?? '숨김 해제', handled_by: handledBy, handled_at: now }).eq('id', id);
    }
    return NextResponse.json({ ok: true });
}
