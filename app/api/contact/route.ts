import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTurnstile, CAPTCHA_REQUIRED_ERROR } from '@/lib/turnstile-server';
import {
    CONTACT_ATTACHMENT_BUCKET, attachmentExt, normalizeLink, validateAttachments,
    type ContactAttachment, type ContactAttachmentMeta,
} from '@/lib/contact-attachments';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { formType, name, email, phone, company, message, portfolioUrl, extra, captchaToken } = body;

        // 봇 차단 (2026-10-05: 파트너 문의 1,479건이 전부 봇) — 시크릿 미설정 시 fail-closed
        if (!(await verifyTurnstile(captchaToken, request))) {
            return NextResponse.json({ error: CAPTCHA_REQUIRED_ERROR }, { status: 400 });
        }

        if (!formType || !name || !email) {
            return NextResponse.json({ error: '이름과 이메일은 필수입니다.' }, { status: 400 });
        }

        // 첨부: 메타데이터만 받고, 파일은 서명 업로드 URL로 브라우저가 Storage에 직접 올림 (Vercel 4.5MB 요청 한도 회피)
        const files: ContactAttachmentMeta[] = Array.isArray(body.attachments)
            ? body.attachments.map((f: Record<string, unknown>) => ({ name: String(f?.name ?? ''), size: Number(f?.size ?? 0), type: String(f?.type ?? '') }))
            : [];
        const invalid = validateAttachments(files);
        if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

        const id = randomUUID();
        const attachments: ContactAttachment[] = files.map((f, i) => ({
            ...f,
            path: `${String(formType).replace(/[^a-z0-9_]/gi, '')}/${id}/${i + 1}.${attachmentExt(f.name)}`,
        }));

        const supabase = createAdminClient();
        const { error } = await supabase.from('contact_submissions').insert({
            id,
            form_type: formType,
            name, email, phone, company, message,
            portfolio_url: normalizeLink(portfolioUrl),
            extra: extra || {},
            attachments,
        });
        if (error) throw error;

        const uploads = [];
        for (const a of attachments) {
            const { data, error: e } = await supabase.storage.from(CONTACT_ATTACHMENT_BUCKET).createSignedUploadUrl(a.path);
            if (e || !data) throw e ?? new Error('signed upload url');
            uploads.push({ path: a.path, token: data.token });
        }

        return NextResponse.json({ success: true, uploads });
    } catch (error) {
        console.error('Contact submit error:', error);
        return NextResponse.json({ error: '제출에 실패했습니다.' }, { status: 500 });
    }
}
