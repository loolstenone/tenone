/**
 * Newsletter Crawl Cron
 * POST /api/cron/newsletter-crawl
 *
 * gmail_oauth_tokens에 등록된 모든 Gmail 계정에서
 * 최근 24시간 뉴스레터를 읽어 AI 요약 → mindle_trends에 저장.
 *
 * Vercel Cron: 매일 AM 9:30 KST (trend-crawl 이후)
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { searchMessages, readMessage, refreshAccessToken } from '@/lib/gmail/client';

function getServiceClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}

export async function POST(request: NextRequest) {
    // Cron 인증 (Admin API Key 또는 Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-vercel-cron');
    const adminKey = process.env.ADMIN_API_KEY;

    if (!cronSecret && authHeader !== `Bearer ${adminKey}`) {
        return errorResponse('Unauthorized', 401);
    }

    const supabase = getServiceClient();
    const results: { email: string; found: number; created: number; error?: string }[] = [];

    try {
        // 활성 Gmail 토큰 목록
        const { data: tokens } = await supabase
            .from('gmail_oauth_tokens')
            .select('*')
            .eq('is_active', true);

        if (!tokens || tokens.length === 0) {
            return successResponse({ message: '등록된 Gmail 계정 없음', results: [] });
        }

        for (const tokenRow of tokens) {
            try {
                // 토큰 갱신
                let accessToken = tokenRow.access_token;
                if (tokenRow.expiry_date < Date.now() + 60000) {
                    const refreshed = await refreshAccessToken(tokenRow.refresh_token);
                    accessToken = refreshed.access_token;
                    // DB 업데이트
                    await supabase.from('gmail_oauth_tokens').update({
                        access_token: refreshed.access_token,
                        expiry_date: refreshed.expiry_date,
                        updated_at: new Date().toISOString(),
                    }).eq('id', tokenRow.id);
                }

                const gmailTokens = {
                    access_token: accessToken,
                    refresh_token: tokenRow.refresh_token,
                    expiry_date: tokenRow.expiry_date,
                };

                // 최근 7일 뉴스레터 검색 (첫 실행 시 누적 수집, 이후 중복 방지로 안전)
                const yesterday = new Date(Date.now() - 7 * 86400000);
                const dateStr = `${yesterday.getFullYear()}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${String(yesterday.getDate()).padStart(2, '0')}`;
                const query = `after:${dateStr} category:updates -in:sent`;

                const messages = await searchMessages(gmailTokens, query, 20);

                if (messages.length === 0) {
                    results.push({ email: tokenRow.email, found: 0, created: 0 });
                    continue;
                }

                // 각 메시지 읽기 + newsletter API로 전송
                const emails: { subject: string; from: string; body: string; date: string }[] = [];

                for (const msg of messages.slice(0, 10)) {
                    try {
                        const detail = await readMessage(gmailTokens, msg.id);
                        // category:updates로 이미 필터링됨 — 본문 길이만 체크
                        if (detail.body.length > 100) {
                            emails.push({
                                subject: detail.subject,
                                from: detail.from,
                                body: detail.body.slice(0, 8000),
                                date: detail.date,
                            });
                        }
                    } catch {
                        // 개별 메시지 오류 무시
                    }
                }

                if (emails.length === 0) {
                    results.push({ email: tokenRow.email, found: messages.length, created: 0 });
                    continue;
                }

                // newsletter API 호출
                const origin = request.nextUrl.origin;
                const res = await fetch(`${origin}/api/mindle/newsletter`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminKey}`,
                    },
                    body: JSON.stringify({ emails }),
                });

                if (res.ok) {
                    const data = await res.json();
                    results.push({
                        email: tokenRow.email,
                        found: emails.length,
                        created: data.trends_created || 0,
                    });
                } else {
                    results.push({
                        email: tokenRow.email,
                        found: emails.length,
                        created: 0,
                        error: `API ${res.status}`,
                    });
                }

                // mindle_sources 마지막 크롤링 시간 갱신
                await supabase.from('mindle_sources').update({
                    last_crawled_at: new Date().toISOString(),
                    crawl_count: (tokenRow as Record<string, unknown>).crawl_count
                        ? Number((tokenRow as Record<string, unknown>).crawl_count) + 1
                        : 1,
                }).eq('url', `mailto:${tokenRow.email}`);

            } catch (e) {
                results.push({
                    email: tokenRow.email,
                    found: 0,
                    created: 0,
                    error: e instanceof Error ? e.message : 'Unknown error',
                });
            }
        }

        const totalCreated = results.reduce((s, r) => s + r.created, 0);
        return successResponse({
            accounts_processed: tokens.length,
            total_trends_created: totalCreated,
            results,
        });
    } catch (e) {
        console.error('[newsletter-crawl] 오류:', e);
        return errorResponse(e instanceof Error ? e.message : 'Cron 오류', 500);
    }
}
