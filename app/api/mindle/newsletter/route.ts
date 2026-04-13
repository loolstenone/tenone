/**
 * Newsletter Collection API
 * POST /api/mindle/newsletter
 *
 * Gmail에서 뉴스레터 메일을 읽어 AI 요약 후 mindle_trends에 저장.
 * deepdirectdrill@gmail.com 수신 뉴스레터 전용.
 *
 * Body: { emails: Array<{ subject, from, body, date }> }
 * 또는 query: ?action=collect (Gmail API로 직접 수집 — 향후)
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuthOrAdmin } from '@/lib/supabase/api-utils';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

interface NewsletterEmail {
    subject: string;
    from: string;
    body: string;
    date: string;
    messageId?: string;
}

interface TrendFromNewsletter {
    title: string;
    summary: string;
    category: string;
    source_name: string;
    source_urls: string[];
    relevance_score: number;
}

export async function POST(request: NextRequest) {
    const { error: authErr } = await requireAuthOrAdmin(request);
    if (authErr) return authErr;

    try {
        const body = await request.json();
        const emails: NewsletterEmail[] = body.emails;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return errorResponse('emails 배열이 필요합니다', 400);
        }

        const supabase = await createClient();
        const results: { email_subject: string; trends_created: number; error?: string }[] = [];

        for (const email of emails) {
            try {
                // 이미 처리된 메일인지 체크 (제목 기반 중복 방지)
                const { data: existing } = await supabase
                    .from('mindle_trends')
                    .select('id')
                    .contains('source_names', [`newsletter:${email.from}`])
                    .ilike('title', `%${email.subject.slice(0, 50)}%`)
                    .limit(1);

                if (existing && existing.length > 0) {
                    results.push({ email_subject: email.subject, trends_created: 0, error: '이미 수집됨' });
                    continue;
                }

                // AI로 뉴스레터 요약 + 트렌드 추출
                const trends = await extractTrendsFromEmail(email);

                if (trends.length === 0) {
                    results.push({ email_subject: email.subject, trends_created: 0, error: '추출 가능한 트렌드 없음' });
                    continue;
                }

                // mindle_trends에 저장
                const inserts = trends.map(t => ({
                    title: t.title,
                    summary: t.summary,
                    category: t.category,
                    source_names: [`newsletter:${email.from}`],
                    source_urls: t.source_urls,
                    relevance_score: t.relevance_score,
                    agent_name: 'Mindle AI',
                    status: 'collected',
                    published_at: email.date || new Date().toISOString(),
                    tenant_id: 'tenone',
                }));

                const { error: insertErr } = await supabase
                    .from('mindle_trends')
                    .insert(inserts);

                if (insertErr) {
                    results.push({ email_subject: email.subject, trends_created: 0, error: insertErr.message });
                } else {
                    results.push({ email_subject: email.subject, trends_created: trends.length });
                }
            } catch (e) {
                results.push({
                    email_subject: email.subject,
                    trends_created: 0,
                    error: e instanceof Error ? e.message : 'Unknown error',
                });
            }
        }

        const totalCreated = results.reduce((sum, r) => sum + r.trends_created, 0);
        return successResponse({
            processed: emails.length,
            trends_created: totalCreated,
            results,
        });
    } catch (error) {
        console.error('[newsletter] 오류:', error);
        return errorResponse(
            error instanceof Error ? error.message : 'Newsletter 처리 오류',
            500
        );
    }
}

async function extractTrendsFromEmail(email: NewsletterEmail): Promise<TrendFromNewsletter[]> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return [];

    const anthropic = new Anthropic({ apiKey });

    // 본문이 너무 길면 자르기
    const bodyTruncated = email.body.slice(0, 8000);

    const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        temperature: 0.2,
        system: `너는 뉴스레터에서 마케팅/비즈니스/테크 트렌드를 추출하는 AI다.
뉴스레터 본문을 읽고, 핵심 트렌드 기사를 추출해서 JSON 배열로 반환해라.

각 트렌드:
- title: 한국어 제목 (30자 이내, 핵심 키워드 포함)
- summary: 2-3문장 요약
- category: tech | marketing | business_corporate | trend_market | talent_career | creator_trend
- source_urls: 원문 URL 배열 (뉴스레터에서 추출)
- relevance_score: 1-10 (마케터/기획자에게 얼마나 유용한지)

JSON 배열만 반환. 다른 텍스트 없이.
트렌드가 없으면 빈 배열 [].`,
        messages: [{
            role: 'user',
            content: `뉴스레터 제목: ${email.subject}\n발신: ${email.from}\n날짜: ${email.date}\n\n본문:\n${bodyTruncated}`,
        }],
    });

    const text = msg.content
        .filter(b => b.type === 'text')
        .map(b => b.type === 'text' ? b.text : '')
        .join('');

    try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return [];
        return JSON.parse(jsonMatch[0]) as TrendFromNewsletter[];
    } catch {
        return [];
    }
}
