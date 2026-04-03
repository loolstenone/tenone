/**
 * Whole See 크롤러 API
 * POST /api/crawler  { action: "crawl" | "process" }
 *
 * crawl: RSS 소스에서 기사 수집 → collected_data에 저장
 * process: collected_data → Claude Haiku 필터링 → Sonnet 트렌드 카드 → mindle_trends 저장
 *
 * Vercel Cron 또는 수동 호출용
 */
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { postAgentMessage } from '@/lib/supabase/chat';

function getAnthropicClient(): Anthropic | null {
    let apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        try {
            const fs = require('fs');
            const path = require('path');
            const envPath = path.join(process.cwd(), '.env.local');
            if (fs.existsSync(envPath)) {
                for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
                    if (line.startsWith('ANTHROPIC_API_KEY=')) {
                        apiKey = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                        break;
                    }
                }
            }
        } catch {}
    }
    if (!apiKey) return null;
    return new Anthropic({ apiKey });
}

interface RssItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    source: string;
    category: string;
}

/** RSS XML에서 아이템 추출 (간이 파서) */
function parseRssItems(xml: string, sourceName: string, category: string): RssItem[] {
    const items: RssItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || '';
        const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
        const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/)?.[1] || '';
        const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
        if (title && link) {
            items.push({ title: title.trim(), link: link.trim(), description: desc.replace(/<[^>]*>/g, '').trim().slice(0, 500), pubDate, source: sourceName, category });
        }
    }
    return items;
}

export async function POST(request: NextRequest) {
    // 인증
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}` && cronSecret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = (body as { action?: string }).action || 'crawl';
    const supabase = await createClient();

    if (action === 'crawl') {
        // 활성 소스에서 RSS 수집
        const { data: sources } = await supabase.from('mindle_sources').select('*').eq('is_active', true);
        if (!sources || sources.length === 0) {
            return NextResponse.json({ message: 'No active sources' });
        }

        let totalCollected = 0;
        const errors: string[] = [];

        for (const src of sources) {
            try {
                const res = await fetch(src.url, { signal: AbortSignal.timeout(10000) });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const xml = await res.text();
                const items = parseRssItems(xml, src.name, src.category);

                // collected_data에 저장 (중복 방지: url 기준)
                for (const item of items.slice(0, 10)) {
                    await supabase.from('collected_data').upsert({
                        url: item.link,
                        title: item.title,
                        content: item.description,
                        source_name: item.source,
                        category: item.category,
                        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
                        status: 'raw',
                        tenant_id: 'tenone',
                    }, { onConflict: 'url' }).select();
                    totalCollected++;
                }

                // 소스 마지막 크롤 시간 업데이트
                await supabase.from('mindle_sources').update({
                    last_crawled_at: new Date().toISOString(),
                    crawl_count: (src.crawl_count || 0) + 1,
                }).eq('id', src.id);
            } catch (err) {
                errors.push(`${src.name}: ${err instanceof Error ? err.message : 'Unknown'}`);
                await supabase.from('mindle_sources').update({
                    error_count: (src.error_count || 0) + 1,
                }).eq('id', src.id);
            }
        }

        // #트렌드 채널에 수집 결과 게시
        if (totalCollected > 0) {
            await postAgentMessage({
                channelName: '트렌드',
                agentName: 'Whole See',
                content: `RSS 크롤 완료: ${sources.length}개 소스에서 ${totalCollected}건 수집${errors.length > 0 ? ` (오류 ${errors.length}건)` : ''}`,
            });
        }

        return NextResponse.json({
            action: 'crawl',
            sources: sources.length,
            collected: totalCollected,
            errors: errors.length > 0 ? errors : undefined,
        });
    }

    if (action === 'process') {
        const anthropic = getAnthropicClient();
        if (!anthropic) {
            return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
        }

        const { data: rawItems } = await supabase
            .from('collected_data')
            .select('*')
            .eq('status', 'raw')
            .eq('tenant_id', 'tenone')
            .order('collected_at', { ascending: false })
            .limit(20);

        if (!rawItems || rawItems.length === 0) {
            return NextResponse.json({ action: 'process', message: 'No raw items to process' });
        }

        let processed = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const item of rawItems) {
            try {
                // Step 1: Haiku — 관련성 점수 + 요약
                const filterRes = await anthropic.messages.create({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 256,
                    messages: [{
                        role: 'user',
                        content: `기사를 평가하세요.\n제목: ${item.title}\n내용: ${(item.content || '').slice(0, 400)}\n\nJSON으로 응답:\n{"relevance_score":0~10,"summary":"한줄요약50자","category":"AI/마케팅/스타트업/커머스/미디어/기타"}\nJSON만 응답.`,
                    }],
                });
                const filterText = filterRes.content[0].type === 'text' ? filterRes.content[0].text : '';
                let filter: { relevance_score: number; summary: string; category: string };
                try {
                    filter = JSON.parse(filterText.replace(/```json\n?|```\n?/g, '').trim());
                } catch {
                    await supabase.from('collected_data').update({ status: 'error' }).eq('id', item.id);
                    skipped++;
                    continue;
                }

                if (filter.relevance_score < 6) {
                    await supabase.from('collected_data').update({ status: 'rejected' }).eq('id', item.id);
                    skipped++;
                    continue;
                }

                // Step 2: Sonnet — 트렌드 카드 본문
                const cardRes = await anthropic.messages.create({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 600,
                    messages: [{
                        role: 'user',
                        content: `Mindle 트렌드 카드를 작성하세요.\n제목: ${item.title}\n내용: ${(item.content || '').slice(0, 600)}\n카테고리: ${filter.category}\n\nJSON으로 응답:\n{"title":"클릭하고싶은제목40자","full_content":"트렌드분석200-400자인사이트포함"}\nJSON만 응답.`,
                    }],
                });
                const cardText = cardRes.content[0].type === 'text' ? cardRes.content[0].text : '';
                let card: { title: string; full_content: string };
                try {
                    card = JSON.parse(cardText.replace(/```json\n?|```\n?/g, '').trim());
                } catch {
                    await supabase.from('collected_data').update({ status: 'error' }).eq('id', item.id);
                    skipped++;
                    continue;
                }

                // Step 3: mindle_trends 저장
                const { error: insertErr } = await supabase.from('mindle_trends').insert({
                    title: card.title || item.title,
                    summary: filter.summary,
                    full_content: card.full_content,
                    category: filter.category,
                    relevance_score: filter.relevance_score,
                    source_urls: item.url ? [item.url] : [],
                    source_names: item.source_name ? [item.source_name] : [],
                    agent_name: 'Whole See',
                    status: 'published',
                    published_at: new Date().toISOString(),
                    tenant_id: 'tenone',
                    is_featured: false,
                    view_count: 0,
                });
                if (insertErr) throw new Error(`mindle_trends insert: ${insertErr.message}`);

                await supabase.from('collected_data').update({ status: 'processed' }).eq('id', item.id);
                processed++;
            } catch (err) {
                errors.push(`${(item.title || '').slice(0, 30)}: ${err instanceof Error ? err.message : 'Unknown'}`);
                await supabase.from('collected_data').update({ status: 'error' }).eq('id', item.id);
            }
        }

        if (processed > 0) {
            await postAgentMessage({
                channelName: '트렌드',
                agentName: 'Whole See',
                content: `트렌드 카드 ${processed}건 생성 → Mindle Trends 발행 완료 (${skipped}건 제외${errors.length > 0 ? `, 오류 ${errors.length}건` : ''})`,
            });
        }

        return NextResponse.json({
            action: 'process',
            total: rawItems.length,
            processed,
            skipped,
            errors: errors.length > 0 ? errors : undefined,
        });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
