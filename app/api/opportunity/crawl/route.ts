/**
 * 비즈니스 기회 크롤러 API
 * POST /api/opportunity/crawl  { action: "crawl" | "process" }
 *
 * crawl:   공모전/지원사업 RSS 수집 → wio_opportunities(raw) 저장
 * process: raw 항목 → Claude Haiku 관련성 점수 → Sonnet 구조화 → 발굴 완료
 *
 * Vercel Cron 또는 수동 호출 (ADMIN_API_KEY / CRON_SECRET 인증)
 */
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { postAgentMessage } from '@/lib/supabase/chat';

// ── TenOne 관련성 프로파일 ──────────────────────────────────
const TENONE_PROFILE = `
TenOne은 AI 기반 마케팅·콘텐츠·브랜딩 회사다.
주요 역량: 마케팅 컨설팅, 콘텐츠 제작/운영, AI 솔루션, 브랜딩, 지역 활성화, 대학생 대외활동(MADLeague).
관련 키워드: 마케팅, 광고, 콘텐츠, SNS, AI, 디지털, 브랜딩, 디자인, 교육, 청년, 대학생, 지역 활성화, 공모전.
`.trim();

// ── Anthropic 클라이언트 ────────────────────────────────────
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

// ── RSS 소스 정의 ───────────────────────────────────────────
const OPPORTUNITY_SOURCES = [
    // 공모전/대외활동
    { name: '대티즌', url: 'https://www.detizen.com/index_rss.php', type: 'competition', active: true },
    // RSS 미지원 (2026-04 확인): 위비티(wevity.com), 캠퍼스픽, 링커리어, K-스타트업
    // { name: '위비티', url: 'https://www.wevity.com/rss.php', type: 'competition', active: false },

    // 지원사업/창업 — 정부기관 RSS
    { name: '창업진흥원', url: 'https://www.kised.or.kr/rssNotice.es', type: 'government', active: true },
    { name: '중기부-사업공고', url: 'https://mss.go.kr/rss/smba/board/310.do', type: 'government', active: true },
    { name: '중기부-공지사항', url: 'https://mss.go.kr/rss/smba/board/81.do', type: 'government', active: true },
    // 나라장터 (G2B) — 공공데이터 API 키 필요, 현재 비활성
    // { name: '나라장터', url: 'G2B_API', type: 'narjangter', active: false },
];

// ── RSS 파서 ────────────────────────────────────────────────
interface RawOpportunity {
    rawTitle: string;
    url: string;
    description: string;
    pubDate: string | null;
    sourceName: string;
    sourceType: string;
}

function parseRssOpportunities(xml: string, sourceName: string, sourceType: string): RawOpportunity[] {
    const items: RawOpportunity[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        const title = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1]
            || block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
        const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]
            || block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] || '';
        const desc = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1]
            || block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
        const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || null;
        if (title && link) {
            items.push({
                rawTitle: title.replace(/<[^>]*>/g, '').trim(),
                url: link.trim(),
                description: desc.replace(/<[^>]*>/g, '').trim().slice(0, 500),
                pubDate,
                sourceName,
                sourceType,
            });
        }
    }
    return items;
}

// ── 메인 핸들러 ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    if (
        authHeader !== `Bearer ${process.env.ADMIN_API_KEY}` &&
        cronSecret !== process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = (body as { action?: string }).action || 'crawl';
    const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // ── tenone tenant_id 조회 ──
    const { data: tenant } = await supabase
        .from('wio_tenants').select('id').eq('slug', 'tenone').single();
    if (!tenant) return NextResponse.json({ error: 'tenone tenant not found' }, { status: 500 });
    const tenantId = tenant.id as string;

    // ══════════════════════════════════════════════════════════
    // CRAWL: RSS 수집 → wio_opportunities(status='raw') 저장
    // ══════════════════════════════════════════════════════════
    if (action === 'crawl') {
        const activeSources = OPPORTUNITY_SOURCES.filter(s => s.active);
        let totalCollected = 0;
        const errors: string[] = [];

        for (const src of activeSources) {
            try {
                const res = await fetch(src.url, {
                    signal: AbortSignal.timeout(10000),
                    headers: { 'User-Agent': 'TenOne-OppBot/1.0' },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const xml = await res.text();
                const items = parseRssOpportunities(xml, src.name, src.type);

                for (const item of items.slice(0, 15)) {
                    const { error } = await supabase.from('wio_opportunities').upsert({
                        tenant_id: tenantId,
                        title: item.rawTitle,
                        raw_title: item.rawTitle,
                        url: item.url,
                        description: item.description || null,
                        source: item.sourceType,
                        source_name: item.sourceName,
                        status: 'raw',
                        pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
                        is_auto: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'url,tenant_id', ignoreDuplicates: true });
                    if (!error) totalCollected++;
                }
            } catch (err) {
                errors.push(`${src.name}: ${err instanceof Error ? err.message : 'Unknown'}`);
            }
        }

        if (totalCollected > 0) {
            await postAgentMessage({
                channelName: '브리핑',
                agentName: 'Whole See',
                content: `비즈니스 기회 크롤 완료: ${activeSources.length}개 소스에서 ${totalCollected}건 수집`,
            });
        }

        return NextResponse.json({ action: 'crawl', sources: activeSources.length, collected: totalCollected, errors: errors.length ? errors : undefined });
    }

    // ══════════════════════════════════════════════════════════
    // PROCESS: raw → Haiku 관련성 → Sonnet 구조화 → new 상태
    // ══════════════════════════════════════════════════════════
    if (action === 'process') {
        const anthropic = getAnthropicClient();
        if (!anthropic) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });

        const { data: rawItems } = await supabase
            .from('wio_opportunities')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('status', 'raw')
            .order('created_at', { ascending: false })
            .limit(20);

        if (!rawItems || rawItems.length === 0) {
            return NextResponse.json({ action: 'process', message: 'No raw items' });
        }

        let processed = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const item of rawItems) {
            try {
                // Step 1: Haiku — 관련성 점수 (0~10)
                const filterRes = await anthropic.messages.create({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 200,
                    messages: [{
                        role: 'user',
                        content: `${TENONE_PROFILE}\n\n다음 기회가 TenOne에게 얼마나 관련있나요?\n제목: ${item.raw_title || item.title}\n내용: ${(item.description || '').slice(0, 300)}\n\nJSON으로만 응답: {"score":0~10,"reason":"한줄이유"}\n점수 기준: 10=완벽히 맞음, 7+=관련있음, 5~6=약간관련, 5미만=무관`,
                    }],
                });
                const filterText = filterRes.content[0].type === 'text' ? filterRes.content[0].text : '';
                let filter: { score: number; reason: string };
                try {
                    filter = JSON.parse(filterText.replace(/```json\n?|```\n?/g, '').trim());
                } catch {
                    await supabase.from('wio_opportunities').update({ status: 'rejected' }).eq('id', item.id);
                    skipped++;
                    continue;
                }

                if (filter.score < 6) {
                    await supabase.from('wio_opportunities').update({ status: 'rejected', relevance_score: filter.score }).eq('id', item.id);
                    skipped++;
                    continue;
                }

                // Step 2: Sonnet — 구조화 추출
                const cardRes = await anthropic.messages.create({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 500,
                    messages: [{
                        role: 'user',
                        content: `다음 기회 공고를 분석해서 TenOne 영업팀을 위한 구조화 데이터를 추출하세요.\n제목: ${item.raw_title || item.title}\n내용: ${(item.description || '').slice(0, 600)}\n\nJSON으로만 응답:\n{"title":"명확한제목(60자이내)","category":"마케팅컨설팅|콘텐츠제작|AI솔루션|브랜딩|교육|지역활성화|공모전|지원사업|기타","region":"지역또는null","tags":["태그1","태그2","태그3"],"budget_min":숫자또는null,"budget_max":숫자또는null,"deadline":"YYYY-MM-DD또는null","summary":"한줄요약(80자이내)"}`,
                    }],
                });
                const cardText = cardRes.content[0].type === 'text' ? cardRes.content[0].text : '';
                let card: { title: string; category: string; region: string | null; tags: string[]; budget_min: number | null; budget_max: number | null; deadline: string | null; summary: string };
                try {
                    card = JSON.parse(cardText.replace(/```json\n?|```\n?/g, '').trim());
                } catch {
                    await supabase.from('wio_opportunities').update({ status: 'rejected' }).eq('id', item.id);
                    skipped++;
                    continue;
                }

                // Step 3: wio_opportunities 업데이트
                await supabase.from('wio_opportunities').update({
                    title: card.title || item.raw_title,
                    description: card.summary || item.description,
                    category: card.category,
                    region: card.region,
                    tags: card.tags || [],
                    estimated_value: card.budget_min,
                    budget_max: card.budget_max,
                    deadline: card.deadline,
                    relevance_score: filter.score / 10,
                    status: 'new',
                    updated_at: new Date().toISOString(),
                }).eq('id', item.id);

                processed++;
            } catch (err) {
                errors.push(`${(item.title || '').slice(0, 30)}: ${err instanceof Error ? err.message : 'Unknown'}`);
                await supabase.from('wio_opportunities').update({ status: 'error' }).eq('id', item.id);
            }
        }

        if (processed > 0) {
            await postAgentMessage({
                channelName: '브리핑',
                agentName: 'Whole See',
                content: `비즈니스 기회 ${processed}건 발굴 완료 (관련성 6+ 통과) — Opportunity 파이프라인 확인`,
            });
        }

        return NextResponse.json({ action: 'process', total: rawItems.length, processed, skipped, errors: errors.length ? errors : undefined });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
}
