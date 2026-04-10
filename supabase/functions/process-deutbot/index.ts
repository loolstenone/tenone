/**
 * process-deutbot — 듣봇 로그 → Mindle 파이프라인
 *
 * 스케줄: cron "0-23/3 * * * *" (3시간마다)
 *
 * 흐름:
 *   1. deutbot_logs(processed=false, is_spam=false) 최근 3시간치 읽기
 *   2. 방별로 묶어서 Haiku로 주제·키워드 추출
 *   3. collected_data에 source_type='kakao'로 insert
 *   4. processed=true 업데이트
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

interface DeutbotLog {
  id: string;
  room: string;
  sender: string;
  message: string;
  created_at: string;
}

Deno.serve(async () => {
  try {
    const since = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    // 1. 미처리 로그 읽기
    const { data: logs, error: fetchErr } = await supabase
      .from('deutbot_logs')
      .select('id, room, sender, message, created_at')
      .eq('processed', false)
      .eq('is_spam', false)
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (fetchErr) throw fetchErr;
    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }));
    }

    // 2. 방별로 묶기
    const byRoom: Record<string, DeutbotLog[]> = {};
    for (const log of logs as DeutbotLog[]) {
      if (!byRoom[log.room]) byRoom[log.room] = [];
      byRoom[log.room].push(log);
    }

    const inserted: string[] = [];
    const processedIds: string[] = [];

    // 3. 방별 분석
    for (const [room, roomLogs] of Object.entries(byRoom)) {
      if (roomLogs.length < 3) {
        // 3개 미만은 패스 (노이즈)
        roomLogs.forEach(l => processedIds.push(l.id));
        continue;
      }

      const conversation = roomLogs
        .map(l => `[${l.sender}] ${l.message}`)
        .join('\n');

      const aiRes = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `다음은 카카오 오픈채팅방 "${room}"의 대화 내용이다.
마케팅·비즈니스·트렌드 관점에서 핵심 주제와 인사이트를 추출하라.

형식 (JSON만 출력):
{
  "title": "15자 이내 핵심 주제",
  "summary": "2문장 요약",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "relevance_score": 1~10 (마케팅 인사이트 가치),
  "category": "marketing_branding | trend_market | digital_media | career_growth | community"
}

대화:
${conversation}`,
        }],
      });

      const content = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '';

      let parsed: {
        title: string;
        summary: string;
        keywords: string[];
        relevance_score: number;
        category: string;
      } | null = null;

      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {
        // 파싱 실패 시 스킵
      }

      if (parsed && parsed.relevance_score >= 5) {
        // 4. collected_data에 insert
        const { error: insertErr } = await supabase
          .from('collected_data')
          .insert({
            source_id: null,
            source_type: 'kakao',
            title: parsed.title,
            content: parsed.summary,
            url: `kakao://room/${encodeURIComponent(room)}`,
            keywords: parsed.keywords,
            category: parsed.category,
            relevance_score: parsed.relevance_score,
            raw_data: { room, message_count: roomLogs.length, conversation },
          });

        if (!insertErr) inserted.push(room);
      }

      roomLogs.forEach(l => processedIds.push(l.id));
    }

    // 5. processed 업데이트
    if (processedIds.length > 0) {
      await supabase
        .from('deutbot_logs')
        .update({ processed: true })
        .in('id', processedIds);
    }

    return new Response(JSON.stringify({
      ok: true,
      total_logs: logs.length,
      rooms_analyzed: Object.keys(byRoom).length,
      inserted_to_mindle: inserted.length,
      rooms: inserted,
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[process-deutbot]', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
