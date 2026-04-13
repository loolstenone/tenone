/**
 * trend-crawl — 매시간 트렌드 크롤링 + 처리
 *
 * 스케줄: cron "0 * * * *" (매시간 정각)
 *
 * 흐름:
 *   1. mindle_sources → RSS 수집 → collected_data upsert
 *   2. collected_data(raw) → Haiku 필터링(≥6) → Sonnet 카드 → mindle_trends insert
 *   3. 결과 agent_messages에 기록
 *
 * ※ 이전 버전은 tenone.biz/api/crawler HTTP 호출 → HTML 응답 오류.
 *    이 버전은 Supabase + Anthropic을 직접 호출하여 HTTP 홉을 제거.
 */

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
});

// ── 카테고리 목록 (mindle-categories.ts 인라인) ──────────────
const CATEGORY_LIST = [
  'trend_market (트렌드·시장: 시장 동향, 소비자 변화, 거시 트렌드)',
  'marketing_branding (마케팅·브랜딩·광고: 캠페인 사례, 퍼포먼스, 브랜딩 전략)',
  'tech (기술: AI, SaaS, 개발, 인프라, 디지털 전환)',
  'community_signal (커뮤니티 시그널·밈: 바닥·MAD 반응, SNS 밈, 여론)',
  'creative_reference (크리에이티브·레퍼런스: 디자인, 카피, 영상, 광고 레퍼런스)',
  'talent_career (인재·커리어: 채용 시장, 직무 트렌드, 역량 개발)',
  'industry_vertical (업계 버티컬: 패션, 관광, 지역, 식품 등 유니버스 연관 업계)',
  'creator_trend (크리에이터 동향: 인플루언서, 크리에이터 이코노미, 플랫폼)',
  'business_corporate (기업: 창업, 투자, 상장, 기업 공시, M&A)',
  'empathy_emotion (공감·감성: 공감 콘텐츠, 감성, 윤리, 인간적 이야기)',
  'growth_network (성장·네트워크: 유니버스 철학 키워드, 연결, 성장 스토리)',
].join('\n');

// ── RSS 파서 ──────────────────────────────────────────────────
interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title =
      block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ||
      block.match(/<title>(.*?)<\/title>/)?.[1] ||
      '';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const desc =
      block.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] ||
      block.match(/<description>(.*?)<\/description>/)?.[1] ||
      '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    if (title && link) {
      items.push({
        title: title.trim(),
        link: link.trim(),
        description: desc.replace(/<[^>]*>/g, '').trim().slice(0, 500),
        pubDate,
      });
    }
  }
  return items;
}

// ── Step 1: RSS 수집 ──────────────────────────────────────────
async function crawl(): Promise<{ sources: number; collected: number; errors: string[] }> {
  const { data: sources, error: srcErr } = await supabase
    .from('mindle_sources')
    .select('*')
    .eq('is_active', true);

  if (srcErr || !sources || sources.length === 0) {
    return { sources: 0, collected: 0, errors: srcErr ? [srcErr.message] : [] };
  }

  let totalCollected = 0;
  const errors: string[] = [];

  for (const src of sources) {
    try {
      const res = await fetch(src.url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const items = parseRssItems(xml);

      for (const item of items.slice(0, 10)) {
        const { error: upsertErr } = await supabase.from('collected_data').upsert(
          {
            url: item.link,
            title: item.title,
            content: item.description,
            source_name: src.name,
            category: src.category,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
            status: 'raw',
            tenant_id: 'tenone',
          },
          { onConflict: 'url' },
        );
        if (!upsertErr) totalCollected++;
      }

      await supabase.from('mindle_sources').update({
        last_crawled_at: new Date().toISOString(),
        crawl_count: (src.crawl_count || 0) + 1,
      }).eq('id', src.id);
    } catch (err) {
      const msg = `${src.name}: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      await supabase.from('mindle_sources').update({
        error_count: (src.error_count || 0) + 1,
      }).eq('id', src.id);
    }
  }

  return { sources: sources.length, collected: totalCollected, errors };
}

// ── Step 2: Claude 필터링 + 카드 생성 ────────────────────────
async function process(): Promise<{ total: number; processed: number; skipped: number; errors: string[] }> {
  const { data: rawItems } = await supabase
    .from('collected_data')
    .select('*')
    .eq('status', 'raw')
    .eq('tenant_id', 'tenone')
    .order('collected_at', { ascending: false })
    .limit(5);

  if (!rawItems || rawItems.length === 0) {
    return { total: 0, processed: 0, skipped: 0, errors: [] };
  }

  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const item of rawItems) {
    try {
      // Haiku — 관련성 점수 + 카테고리
      const filterRes = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content:
            `기사를 평가하고 카테고리를 분류하세요.\n` +
            `제목: ${item.title}\n내용: ${(item.content || '').slice(0, 400)}\n\n` +
            `아래 11개 카테고리 중 가장 적합한 1개를 선택하세요:\n${CATEGORY_LIST}\n\n` +
            `JSON으로 응답:\n{"relevance_score":0~10,"summary":"한줄요약50자","category":"카테고리_id"}\nJSON만 응답.`,
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

      // Sonnet — 트렌드 카드
      const cardRes = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content:
            `Mindle 트렌드 카드를 작성하세요.\n` +
            `제목: ${item.title}\n내용: ${(item.content || '').slice(0, 600)}\n카테고리: ${filter.category}\n\n` +
            `마케팅·광고업계 종사자(바닥 커뮤니티 9000명+)가 읽는다. 실무 인사이트 중심으로 작성.\n\n` +
            `JSON으로 응답:\n{"title":"클릭하고싶은제목40자","full_content":"트렌드분석200-400자인사이트포함"}\nJSON만 응답.`,
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

      // mindle_trends 저장
      const { error: insertErr } = await supabase.from('mindle_trends').insert({
        title: card.title || item.title,
        summary: filter.summary,
        full_content: card.full_content,
        category: filter.category,
        relevance_score: filter.relevance_score,
        source_urls: item.url ? [item.url] : [],
        source_names: item.source_name ? [item.source_name] : [],
        agent_name: 'Whole See',
        status: 'collected',
        published_at: new Date().toISOString(),
        tenant_id: 'tenone',
        is_featured: false,
        view_count: 0,
      });

      if (insertErr) throw new Error(`mindle_trends insert: ${insertErr.message}`);

      await supabase.from('collected_data').update({ status: 'processed' }).eq('id', item.id);
      processed++;
    } catch (err) {
      const label = (item.title || '').slice(0, 30);
      errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
      await supabase.from('collected_data').update({ status: 'error' }).eq('id', item.id);
    }
  }

  return { total: rawItems.length, processed, skipped, errors };
}

// ── 메인 ─────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  const startAt = Date.now();

  try {
    const crawlResult = await crawl();
    const processResult = await process();
    const elapsed = Date.now() - startAt;

    await supabase.from('agent_messages').insert({
      from_agent: 'mindle',
      to_agent: '1001',
      message_type: 'vrief',
      payload: {
        type: 'trend_crawl',
        crawl: crawlResult,
        process: processResult,
        elapsedMs: elapsed,
        executedAt: new Date().toISOString(),
      },
      risk_level: processResult.errors.length > 0 ? 'yellow' : 'green',
      correlation_id: crypto.randomUUID(),
    });

    return new Response(
      JSON.stringify({ ok: true, elapsedMs: elapsed, crawl: crawlResult, process: processResult }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[trend-crawl] 오류:', err);

    await supabase.from('agent_messages').insert({
      from_agent: 'mindle',
      to_agent: '1001',
      message_type: 'error',
      payload: { type: 'trend_crawl_error', error: String(err) },
      risk_level: 'yellow',
      correlation_id: crypto.randomUUID(),
    });

    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
