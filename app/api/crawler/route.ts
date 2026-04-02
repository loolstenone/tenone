/**
 * Whole See 크롤러 API
 * POST /api/crawler  { action: "crawl" | "process" }
 *
 * crawl: RSS 소스에서 기사 수집 → collected_data에 저장
 * process: collected_data → Claude 요약 → mindle_trends에 저장
 *
 * GCP Scheduler 또는 수동 호출용
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { postAgentMessage } from '@/lib/supabase/chat';

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

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
