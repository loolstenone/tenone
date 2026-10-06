/**
 * 문의 상세·응대 기록 — 직원 전용
 * GET   : 문의 전체 내용 + 응대 기록(처리자 이름 포함)
 * PATCH : { status, channel, note } → handling_log에 한 줄 추가 + status 변경
 *         이메일·전화 등 인트라 밖에서 응대한 경우도 여기에 기록 = 답변/미답변의 근거
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import {
    INQUIRY_STATUSES, REPLY_CHANNELS, type HandlingLogEntry, type InquiryStatus, type ReplyChannel,
} from '@/lib/contact-inquiry';

async function withNames(log: HandlingLogEntry[]) {
    const ids = Array.from(new Set(log.map(l => l.by).filter(Boolean)));
    if (ids.length === 0) return log;
    const { data } = await createAdminClient().from('members').select('id, name').in('id', ids);
    const names = new Map((data ?? []).map((m: { id: string; name: string | null }) => [m.id, m.name ?? '']));
    return log.map(l => ({ ...l, by_name: names.get(l.by) || '직원' }));
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;

    const { data, error } = await createAdminClient().from('contact_submissions').select('*').eq('id', id).maybeSingle();
    if (error) return NextResponse.json({ error: '문의를 불러오지 못했습니다.' }, { status: 500 });
    if (!data) return NextResponse.json({ error: '문의가 없습니다.' }, { status: 404 });

    return NextResponse.json({ inquiry: { ...data, handling_log: await withNames(data.handling_log ?? []) } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== 'user' || !auth.memberId) {
        return NextResponse.json({ error: '처리자 계정을 확인할 수 없습니다.' }, { status: 403 });
    }
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const status = body.status as InquiryStatus;
    const channel = (body.channel ?? 'other') as ReplyChannel;
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : '';
    if (!INQUIRY_STATUSES.includes(status)) return NextResponse.json({ error: '상태 값이 올바르지 않습니다.' }, { status: 400 });
    if (!REPLY_CHANNELS.includes(channel)) return NextResponse.json({ error: '응대 방법이 올바르지 않습니다.' }, { status: 400 });
    if (status === 'resolved' && !note) {
        return NextResponse.json({ error: '답변 완료는 어떻게 답했는지 메모가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: row } = await supabase.from('contact_submissions').select('handling_log').eq('id', id).maybeSingle();
    if (!row) return NextResponse.json({ error: '문의가 없습니다.' }, { status: 404 });

    const entry: HandlingLogEntry = { at: new Date().toISOString(), by: auth.memberId, channel, status, note };
    const handling_log = [...(row.handling_log ?? []), entry];
    const { error } = await supabase.from('contact_submissions').update({ status, handling_log }).eq('id', id);
    if (error) return NextResponse.json({ error: '저장하지 못했습니다.' }, { status: 500 });

    return NextResponse.json({ status, handling_log: await withNames(handling_log) });
}
