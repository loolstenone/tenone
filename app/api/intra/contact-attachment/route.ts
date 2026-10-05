/**
 * 문의 첨부파일 열람 — 직원 전용. 비공개 버킷의 5분짜리 서명 다운로드 URL로 리다이렉트
 * GET /api/intra/contact-attachment?id={submission id}&i={index}
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { CONTACT_ATTACHMENT_BUCKET, type ContactAttachment } from '@/lib/contact-attachments';

export async function GET(request: NextRequest) {
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;

    const id = request.nextUrl.searchParams.get('id');
    const index = Number(request.nextUrl.searchParams.get('i'));
    if (!id || !Number.isInteger(index) || index < 0) {
        return NextResponse.json({ error: 'id와 i가 필요합니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: row } = await supabase.from('contact_submissions').select('attachments').eq('id', id).maybeSingle();
    const file = ((row?.attachments ?? []) as ContactAttachment[])[index];
    if (!file) return NextResponse.json({ error: '첨부파일이 없습니다.' }, { status: 404 });

    const { data, error } = await supabase.storage.from(CONTACT_ATTACHMENT_BUCKET)
        .createSignedUrl(file.path, 300, { download: file.name });
    if (error || !data) return NextResponse.json({ error: '파일을 찾을 수 없습니다. 업로드가 끝나지 않았을 수 있습니다.' }, { status: 404 });

    return NextResponse.redirect(data.signedUrl);
}
