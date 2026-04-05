/**
 * 히어로 AI 상담 스트리밍 API
 * POST /api/hit/chat/stream
 * SSE 스트리밍 응답 + 대화 히스토리 DB 저장
 */
import { NextRequest } from 'next/server';
import { getHitAResult } from '@/lib/supabase/hit';
import { getHeroSystemPrompt, type HitMode } from '@/lib/hit/hero-agent-system';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { message, resultId, mode, history, sessionId, alertLevel } = await request.json();

    if (!message || !resultId || !mode) {
      return new Response(JSON.stringify({ error: 'message, resultId, mode 필수' }), { status: 400 });
    }

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
    const resultContext = result ? `
내담자 HIT 결과:
- 유형: ${result.type_code} (${result.type_name_ko})
- DISC: D${result.disc_d_score} I${result.disc_i_score} S${result.disc_s_score} C${result.disc_c_score}
- MBTI: ${result.mbti_type}
- S-Power: ${JSON.stringify(result.s_power_scores || {})}
- 기저요인: ${result.base_summary || ''}
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
              const supabase = createClient();
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
