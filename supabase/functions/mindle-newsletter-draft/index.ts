/**
 * mindle-newsletter-draft — Mindle 주간 뉴스레터 초안 자동 생성
 *
 * 스케줄 (KST 기준, UTC -9):
 *   - 메인 호: cron "0 0 * * 1" (KST 월 09:00) — persona 없음, target_tags=['mindle']
 *   - 페르소나 호 (Phase 2-C):
 *       founder:  cron "0 0 * * 2" (KST 화 09:00) — ?persona=founder
 *       planner:  cron "0 0 * * 3" (KST 수 09:00) — ?persona=planner
 *       reporter: cron "0 0 * * 4" (KST 목 09:00) — ?persona=reporter
 *       marketer: cron "0 0 * * 5" (KST 금 09:00) — ?persona=marketer
 *
 * 정직성 원칙:
 *   - mindle_trends published 카드만 사용 (검수 통과한 것)
 *   - 카드 출처(source_urls) 그대로 매거진 카드에 노출 — 표절·재가공 X, 큐레이션만
 *   - LLM은 매거진 인트로(편집팀 한 마디)만 생성. 카드 본문은 그대로 인용
 *   - 발송은 자동 X — newsletter_issues status='draft'로 저장하고 운영자 검수·발송
 *
 * 흐름 (메인 vs 페르소나 공통):
 *   1. 이번 주(지난 7일) published 트렌드 fetch
 *      - 메인: 전 카테고리
 *      - 페르소나: mindle_personas.default_categories 필터링
 *   2. 점수 최상위 1건 → HeroBlock
 *   3. 점수 8+ 다음 3건 → CardRowBlock ("이번 주 신호" / 페르소나는 "{페르소나명} 추천")
 *   4. signal_score='weak'·'rising' 3건 → CardRowBlock ("약신호 — 부상 중")
 *   5. Haiku 1회 호출 → 편집팀 인트로 한 마디 (TextBlock) — 페르소나 컨텍스트 반영
 *   6. UniverseFeedBlock — Universe CTA (정직성 라벨 명시)
 *   7. newsletter_issues UPSERT (status='draft', target_tags=['mindle'] 또는 ['mindle','persona:KEY'])
 *   8. agent_messages 보고
 *
 * 멱등성: 같은 weekStart + persona 조합에 draft 이미 있으면 update, sent/scheduled면 skip (운영자 작업 보호)
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

const SITE_URL = Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://tenone.biz';
const MINDLE_HOME = `${SITE_URL}/mindle`;

interface TrendRow {
  id: string;
  title: string;
  summary: string;
  category: string;
  source_urls: string[];
  source_names: string[];
  relevance_score: number;
  signal_score: string | null; // 'strong' | 'rising' | 'weak' | null
  published_at: string | null;
}

interface CardItem {
  title: string;
  summary: string;
  imageUrl?: string;
  linkUrl?: string;
}

type NewsletterBlock =
  | { type: 'hero'; brand: string; brandColor: string; title: string; summary: string; linkUrl?: string; linkLabel?: string }
  | { type: 'card_row'; heading?: string; items: CardItem[] }
  | { type: 'text'; content: string }
  | { type: 'universe_feed'; items: Array<{ brand: string; title: string; linkUrl?: string }> };

const CATEGORY_LABEL: Record<string, string> = {
  tech: '테크',
  trend_market: '트렌드/시장',
  business_corporate: '비즈니스',
  marketing_branding: '마케팅',
  creator_trend: '크리에이터',
  talent_career: '커리어',
  industry_vertical: '산업',
  creative_reference: '크리에이티브',
  community_signal: '커뮤니티',
  empathy_emotion: '공감/감정',
  marketing: '마케팅',
  growth_network: '네트워크',
  general: '일반',
  ai: 'AI',
  startup: '스타트업',
  ad: '광고',
  design: '디자인',
};

function categoryLabel(key: string): string {
  return CATEGORY_LABEL[key] ?? key;
}

function trendLink(id: string): string {
  return `${SITE_URL}/mindle/trends/${id}`;
}

/** ISO week start (Monday 00:00:00 KST 기준 — UTC로는 일요일 15:00) */
function weekStartKST(date = new Date()): string {
  // KST = UTC + 9. Monday = 1.
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday → Mon 전, 그 외 → 이번 주 월
  const monday = new Date(kst);
  monday.setUTCDate(kst.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  // YYYY-MM-DD
  return monday.toISOString().slice(0, 10);
}

interface PersonaRow {
  key: string;
  name_ko: string;
  tagline: string | null;
  accent_color: string | null;
  default_categories: string[];
}

/** mindle_personas fetch (key 지정 시 단건) */
async function fetchPersona(key: string): Promise<PersonaRow | null> {
  const { data } = await supabase
    .from('mindle_personas')
    .select('key, name_ko, tagline, accent_color, default_categories')
    .eq('key', key)
    .eq('is_active', true)
    .maybeSingle();
  return (data as PersonaRow | null) ?? null;
}

/** 편집팀 인트로 한 마디 (LLM) — 정직성: AI 생성 라벨 포함, 페르소나 컨텍스트 반영 */
async function generateIntro(trends: TrendRow[], persona: PersonaRow | null): Promise<string | null> {
  if (trends.length === 0) return null;

  const titles = trends.slice(0, 5).map((t, i) => `${i + 1}. ${t.title}`).join('\n');
  const personaContext = persona
    ? `대상 독자: ${persona.name_ko}${persona.tagline ? ` (${persona.tagline})` : ''}. 이 독자 관점에서 의미를 짚어라.\n\n`
    : '';
  const prompt =
    `${personaContext}다음은 이번 주 Mindle이 큐레이션한 트렌드 카드 제목들이다.\n${titles}\n\n` +
    `이 카드들을 관통하는 한 가지 신호를 80~120자 한국어 문장으로 요약. ` +
    `과장 금지, 마케팅 톤 금지, 인사이트 한 줄. 결과만 응답 — 따옴표·라벨 X.`;

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content[0]?.type === 'text' ? res.content[0].text.trim() : '';
    return text || null;
  } catch {
    return null;
  }
}

const VALID_PERSONA_KEYS = ['founder', 'planner', 'reporter', 'marketer'] as const;

Deno.serve(async (req) => {
  const startAt = Date.now();

  try {
    // persona query param 검증 (?persona=KEY)
    const url = new URL(req.url);
    const personaKey = url.searchParams.get('persona');
    let persona: PersonaRow | null = null;

    if (personaKey) {
      if (!(VALID_PERSONA_KEYS as readonly string[]).includes(personaKey)) {
        return new Response(
          JSON.stringify({ ok: false, error: `잘못된 persona: ${personaKey}. 가능: ${VALID_PERSONA_KEYS.join('|')}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }
      persona = await fetchPersona(personaKey);
      if (!persona) {
        return new Response(
          JSON.stringify({ ok: false, error: `mindle_personas에 '${personaKey}' row 없음. 시드 확인` }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }

    const weekStart = weekStartKST();
    const weekStartDate = new Date(weekStart + 'T00:00:00+09:00');
    const sevenDaysAgo = new Date(weekStartDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. 이번 주 published 트렌드 fetch (지난 7일) — 페르소나 있으면 카테고리 필터
    let trendQuery = supabase
      .from('mindle_trends')
      .select('id, title, summary, category, source_urls, source_names, relevance_score, signal_score, published_at')
      .eq('status', 'published')
      .gte('published_at', sevenDaysAgo)
      .order('relevance_score', { ascending: false })
      .limit(50);

    if (persona && persona.default_categories.length > 0) {
      trendQuery = trendQuery.in('category', persona.default_categories);
    }

    const { data: trends, error: trendErr } = await trendQuery;

    if (trendErr) {
      throw new Error(`mindle_trends fetch: ${trendErr.message}`);
    }
    const rows = (trends ?? []) as TrendRow[];
    if (rows.length === 0) {
      // 아무 카드도 없으면 초안 생성 skip — 정직성
      const skipReason = persona
        ? `이번 주 ${persona.name_ko}용 카테고리(${persona.default_categories.join(',')}) published 카드 0건`
        : '이번 주 published 카드 0건';
      await supabase.from('agent_messages').insert({
        from_agent: 'mindle',
        to_agent: '1001',
        message_type: 'vrief',
        payload: {
          type: 'mindle_newsletter_draft',
          weekStart,
          persona: personaKey,
          skipped: true,
          reason: skipReason,
          executedAt: new Date().toISOString(),
        },
        risk_level: 'yellow',
        correlation_id: crypto.randomUUID(),
      });
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: skipReason, weekStart, persona: personaKey }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // 2. HeroBlock — 점수 9+ 최상위 1건 (페르소나면 그 카테고리 내에서 최상위)
    const heroTrend = rows.find(r => r.relevance_score >= 9) ?? rows[0];
    const heroBrand = persona ? `Mindle · ${persona.name_ko}` : 'Mindle';
    const heroColor = persona?.accent_color ?? '#F5C518';
    const heroBlock: NewsletterBlock = {
      type: 'hero',
      brand: heroBrand,
      brandColor: heroColor,
      title: heroTrend.title,
      summary: heroTrend.summary,
      linkUrl: trendLink(heroTrend.id),
      linkLabel: '자세히 보기',
    };

    // 3. 페르소나 추천 또는 "이번 주 신호" 카드 — hero 제외 점수 8+ 다음 3건
    const signalsHeading = persona ? `🎯 ${persona.name_ko} 추천` : '🔔 이번 주 신호';
    const signalsItems: CardItem[] = rows
      .filter(r => r.id !== heroTrend.id && r.relevance_score >= 8)
      .slice(0, 3)
      .map(r => ({
        title: r.title,
        summary: r.summary,
        linkUrl: trendLink(r.id),
      }));

    // 4. "약신호 — 부상 중" 카드 — signal_score IN ('weak','rising') 3건
    const weakItems: CardItem[] = rows
      .filter(r => r.id !== heroTrend.id && (r.signal_score === 'weak' || r.signal_score === 'rising'))
      .filter(r => !signalsItems.some(s => s.linkUrl === trendLink(r.id)))
      .slice(0, 3)
      .map(r => ({
        title: r.title,
        summary: r.summary,
        linkUrl: trendLink(r.id),
      }));

    // 5. 편집팀 인트로 (LLM 1회) — 페르소나 컨텍스트 반영
    const intro = await generateIntro(rows, persona);
    const introLabel = persona
      ? `🧭 ${persona.name_ko}을(를) 위한 한 마디 (AI 생성)`
      : '🧭 편집팀의 한 마디 (AI 생성)';
    const introBlock: NewsletterBlock | null = intro
      ? { type: 'text', content: `${introLabel}\n\n${intro}` }
      : null;

    // 6. Universe CTA (정직 — 광고 X, 자연 링크만)
    const universeBlock: NewsletterBlock = {
      type: 'universe_feed',
      items: [
        { brand: 'Mindle', title: '트렌드 아카이브 전체 보기', linkUrl: `${SITE_URL}/mindle/trends` },
        { brand: 'Badak', title: '기획자 네트워킹 모임', linkUrl: `${SITE_URL}/badak` },
        { brand: 'SmarComm', title: '마케팅 자동화 진단', linkUrl: `${SITE_URL}/smarcomm` },
      ],
    };

    // 7. 블록 조립
    const blocks: NewsletterBlock[] = [heroBlock];
    if (introBlock) blocks.push(introBlock);
    if (signalsItems.length > 0) blocks.push({ type: 'card_row', heading: signalsHeading, items: signalsItems });
    if (weakItems.length > 0) blocks.push({ type: 'card_row', heading: '🌱 약신호 — 부상 중', items: weakItems });
    blocks.push(universeBlock);

    // 본문 텍스트 폴백 (blocks 없는 클라이언트용)
    const contentParts: string[] = [
      `${heroTrend.title}\n\n${heroTrend.summary}\n${trendLink(heroTrend.id)}\n`,
    ];
    if (intro) contentParts.push(`\n— ${introLabel.replace(/^🧭\s*/, '')} —\n${intro}\n`);
    if (signalsItems.length > 0) {
      contentParts.push(`\n${signalsHeading}\n` + signalsItems.map(s => `- ${s.title}\n  ${s.linkUrl}`).join('\n'));
    }
    if (weakItems.length > 0) {
      contentParts.push('\n🌱 약신호 — 부상 중\n' + weakItems.map(s => `- ${s.title}\n  ${s.linkUrl}`).join('\n'));
    }
    const content = contentParts.join('\n');

    const monthDay = weekStart.slice(5).replace('-', '/');
    const titlePrefix = persona ? `[Mindle · ${persona.name_ko}]` : '[Mindle 주간]';
    const title = `${titlePrefix} ${monthDay} — ${categoryLabel(heroTrend.category)}: ${heroTrend.title.slice(0, 28)}${heroTrend.title.length > 28 ? '…' : ''}`;
    const excerpt = intro ?? heroTrend.summary.slice(0, 120);
    const targetTags = persona ? ['mindle', `persona:${persona.key}`] : ['mindle'];
    const issueCategory = persona ? `mindle-weekly-${persona.key}` : 'mindle-weekly';

    // 8. newsletter_issues 멱등 INSERT — 같은 weekStart + 같은 target_tags 조합에 draft 있으면 갱신, sent/scheduled면 skip
    const { data: existing } = await supabase
      .from('newsletter_issues')
      .select('id, status')
      .eq('date', weekStart)
      .contains('target_tags', targetTags)
      .maybeSingle();

    let issueId: string | number | null = null;
    let action: 'inserted' | 'skipped_existing' = 'inserted';

    if (existing) {
      // 이미 있으면: status='draft'이고 sent 아니면 갱신, 그 외 보존
      if (existing.status === 'draft') {
        const { data: updated, error: updErr } = await supabase
          .from('newsletter_issues')
          .update({
            title,
            excerpt,
            content,
            blocks,
            category: issueCategory,
            from_name: persona ? `Mindle · ${persona.name_ko}` : 'Mindle',
            target_tags: targetTags,
            published: false,
          })
          .eq('id', existing.id)
          .select('id')
          .single();
        if (updErr) throw new Error(`issues update: ${updErr.message}`);
        issueId = updated?.id ?? existing.id;
        action = 'inserted'; // 갱신도 inserted로 카운트
      } else {
        issueId = existing.id;
        action = 'skipped_existing';
      }
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from('newsletter_issues')
        .insert({
          title,
          date: weekStart,
          category: issueCategory,
          excerpt,
          content,
          blocks,
          status: 'draft',
          published: false,
          from_name: persona ? `Mindle · ${persona.name_ko}` : 'Mindle',
          target_tags: targetTags,
          tenant_id: 'tenone',
        })
        .select('id')
        .single();
      if (insErr) throw new Error(`issues insert: ${insErr.message}`);
      issueId = inserted?.id ?? null;
    }

    const elapsed = Date.now() - startAt;

    await supabase.from('agent_messages').insert({
      from_agent: 'mindle',
      to_agent: '1001',
      message_type: 'vrief',
      payload: {
        type: 'mindle_newsletter_draft',
        weekStart,
        persona: personaKey,
        action,
        issueId,
        heroTrendId: heroTrend.id,
        signalsCount: signalsItems.length,
        weakCount: weakItems.length,
        introGenerated: intro !== null,
        elapsedMs: elapsed,
        executedAt: new Date().toISOString(),
      },
      risk_level: 'green',
      correlation_id: crypto.randomUUID(),
    });

    return new Response(
      JSON.stringify({
        ok: true,
        action,
        issueId,
        weekStart,
        persona: personaKey,
        heroTrendId: heroTrend.id,
        signalsCount: signalsItems.length,
        weakCount: weakItems.length,
        introGenerated: intro !== null,
        elapsedMs: elapsed,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[mindle-newsletter-draft] 오류:', err);
    await supabase.from('agent_messages').insert({
      from_agent: 'mindle',
      to_agent: '1001',
      message_type: 'vrief',
      payload: {
        type: 'mindle_newsletter_draft',
        error: String(err),
        executedAt: new Date().toISOString(),
      },
      risk_level: 'red',
      correlation_id: crypto.randomUUID(),
    });
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
