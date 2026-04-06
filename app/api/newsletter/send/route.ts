/**
 * POST /api/newsletter/send
 * 뉴스레터 이슈를 구독자에게 발송
 *
 * body: {
 *   issueId: string;
 *   fromName?: string;    // 브랜드별 From 이름 (기본: Ten:One™ Universe)
 *   siteIds?: string[];   // 타겟: 구독 사이트 필터
 *   tags?: string[];      // 타겟: 태그 필터
 * }
 * auth: ADMIN_API_KEY 또는 로그인 Staff
 */
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { renderNewsletterHtml, renderNewsletterText } from '@/lib/email/newsletter-template';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenone.biz';
const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL || 'noreply@tenone.biz';
const FROM_NAME  = process.env.NEWSLETTER_FROM_NAME  || 'Ten:One™ Universe';

/** 수신거부 URL — subscriber id를 base64로 인코딩 */
function unsubscribeUrl(subscriberId: string): string {
  const token = Buffer.from(subscriberId).toString('base64url');
  return `${SITE_URL}/unsubscribe?token=${token}`;
}

interface SendBody {
  issueId?: string;
  fromName?: string;
  siteIds?: string[];
  tags?: string[];
}

export async function POST(request: NextRequest) {
  // 인증
  const auth = request.headers.get('authorization');
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = auth === `Bearer ${process.env.ADMIN_API_KEY}`;
  if (!user && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RESEND_API_KEY 체크
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY가 설정되지 않았습니다. Vercel 환경변수에 추가해주세요.' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({})) as SendBody;
  const { issueId, fromName, siteIds, tags } = body;
  if (!issueId) {
    return NextResponse.json({ error: 'issueId가 필요합니다.' }, { status: 400 });
  }

  // 이슈 조회
  const { data: issue, error: issueErr } = await supabase
    .from('newsletter_issues')
    .select('*')
    .eq('id', issueId)
    .single();

  if (issueErr || !issue) {
    return NextResponse.json({ error: '이슈를 찾을 수 없습니다.' }, { status: 404 });
  }
  if (issue.status === 'sent') {
    return NextResponse.json({ error: '이미 발송된 뉴스레터입니다.' }, { status: 400 });
  }
  if (!issue.title || !issue.content) {
    return NextResponse.json({ error: '제목과 본문을 먼저 작성해주세요.' }, { status: 400 });
  }

  // 활성 구독자 조회 (타겟 필터 적용)
  let query = supabase
    .from('newsletter_subscribers')
    .select('id, email, name')
    .eq('status', 'active');

  // 사이트 필터
  if (siteIds && siteIds.length > 0) {
    query = query.in('site_id', siteIds);
  }

  const { data: subscribers, error: subErr } = await query;

  if (subErr) {
    return NextResponse.json({ error: `구독자 조회 실패: ${subErr.message}` }, { status: 500 });
  }

  let filtered = subscribers || [];

  // 태그 필터: subscriber_tags에서 해당 태그를 가진 구독자만
  if (tags && tags.length > 0 && filtered.length > 0) {
    const { data: taggedRows } = await supabase
      .from('subscriber_tags')
      .select('subscriber_id')
      .in('tag', tags);

    if (taggedRows && taggedRows.length > 0) {
      const taggedIds = new Set(taggedRows.map((r: { subscriber_id: string }) => r.subscriber_id));
      filtered = filtered.filter((s: { id: string }) => taggedIds.has(s.id));
    } else {
      filtered = [];
    }
  }

  if (filtered.length === 0) {
    return NextResponse.json({ error: '대상 구독자가 없습니다.' }, { status: 400 });
  }

  // From 이름 결정
  const senderName = fromName || FROM_NAME;

  const resend = new Resend(resendKey);
  let sent = 0;
  const errors: string[] = [];

  // 배치 발송 (Resend 무료: 100건/일 제한, 최대 50명씩 배치)
  const BATCH_SIZE = 50;
  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batch = filtered.slice(i, i + BATCH_SIZE);

    const emailBatch = batch.map((sub: { id: string; email: string; name?: string }) => ({
      from: `${senderName} <${FROM_EMAIL}>`,
      to: sub.email,
      subject: issue.title,
      html: renderNewsletterHtml({
        title: issue.title,
        content: issue.content,
        issueNumber: issue.id,
        unsubscribeUrl: unsubscribeUrl(sub.id),
        siteUrl: SITE_URL,
      }),
      text: renderNewsletterText({
        title: issue.title,
        content: issue.content,
        unsubscribeUrl: unsubscribeUrl(sub.id),
        siteUrl: SITE_URL,
      }),
      replyTo: 'lools@tenone.biz',
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl(sub.id)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }));

    try {
      const { data: batchResult, error: batchErr } = await resend.batch.send(emailBatch);
      if (batchErr) {
        errors.push(`배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${batchErr.message}`);
      } else {
        sent += batchResult?.data?.length ?? batch.length;
      }
    } catch (e) {
      errors.push(`배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
    }
  }

  // 발송 완료 상태 업데이트
  if (sent > 0) {
    await supabase.from('newsletter_issues').update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipient_count: sent,
      from_name: senderName !== FROM_NAME ? senderName : null,
      target_site_ids: siteIds && siteIds.length > 0 ? siteIds : null,
      target_tags: tags && tags.length > 0 ? tags : null,
    }).eq('id', issueId);
  }

  return NextResponse.json({
    ok: sent > 0,
    sent,
    total: filtered.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
