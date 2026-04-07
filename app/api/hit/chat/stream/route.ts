/**
 * 히어로 AI 상담 스트리밍 API
 * POST /api/hit/chat/stream
 * SSE 스트리밍 응답 + 대화 히스토리 DB 저장
 */
import { NextRequest } from 'next/server';
import { getHitAResult } from '@/lib/supabase/hit';
import { getHeroSystemPrompt, type HitMode } from '@/lib/hit/hero-agent-system';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { gateApi } from '@/lib/hit/membership';

export async function POST(request: NextRequest) {
  try {
    const { message, resultId, mode, history, sessionId, alertLevel, memberId } = await request.json();

    if (!message || !resultId || !mode) {
      return new Response(JSON.stringify({ error: 'message, resultId, mode 필수' }), { status: 400 });
    }

    // 멤버십 게이트 — AI 채팅은 무료 회원 이상
    const gateResult = await gateApi(memberId ?? null, 'HIT_AI_CHAT_BASIC');
    if (gateResult) return gateResult;

    // API 키
    let apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      try {
        const fs = require('fs'), path = require('path');
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
    if (!apiKey) return new Response(JSON.stringify({ error: 'AI 서비스 불가' }), { status: 500 });

    // HIT 결과 로드
    const result = await getHitAResult(resultId);
    const ufContext = result?.uf_sibling != null ? `
- UF 기저요인: 형제관계${result.uf_sibling} 부모관계${result.uf_parent} 가정환경${result.uf_family} 또래관계${result.uf_peer} 자기개념${result.uf_self} 기질${result.uf_temperament} 경제환경${result.uf_economic} 트라우마${result.uf_trauma} 문화세대${result.uf_cultural}` : '';

    const resultContext = result ? `
내담자 HIT 결과:
- 유형: ${result.type_code} (${result.type_name_ko})
- DISC: D${result.disc_d_score} I${result.disc_i_score} S${result.disc_s_score} C${result.disc_c_score} (주: ${result.disc_primary}, 보조: ${result.disc_subtype})
- MBTI: ${result.mbti_type} (E${result.mbti_e_score} S${result.mbti_s_score} T${result.mbti_t_score} J${result.mbti_j_score})
- S-Power: ${JSON.stringify(result.s_power_scores || {})}${ufContext}
- 기저요인 요약: ${result.base_summary || ''}
` : '';

    const systemPrompt = getHeroSystemPrompt(mode as HitMode, alertLevel || 0) + '\n\n' + resultContext;

    const messages = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const anthropic = new Anthropic({ apiKey });

    // 스트리밍
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    });

    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // 스트리밍 완료 후 대화 DB 저장
          if (sessionId) {
            try {
              const supabase = await createClient();
              // 사용자 메시지 저장
              await supabase.from('hit_chat_messages').insert({
                session_id: sessionId,
                result_id: resultId,
                role: 'user',
                content: message,
              });
              // AI 응답 저장
              await supabase.from('hit_chat_messages').insert({
                session_id: sessionId,
                result_id: resultId,
                role: 'assistant',
                content: fullResponse,
              });
            } catch {}
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '응답 생성 중 오류' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[HIT Chat Stream]:', error);
    return new Response(JSON.stringify({ error: '스트리밍 실패' }), { status: 500 });
  }
}
