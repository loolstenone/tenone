/**
 * 히어로 AI 상담 채팅 API
 * POST /api/hit/chat
 * Body: { message, resultId, mode: 'A_ONLY'|'B_ONLY'|'AB_FULL', history: [{role,content}] }
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitAResult } from '@/lib/supabase/hit';
import { getHeroSystemPrompt, type HitMode } from '@/lib/hit/hero-agent-system';
import { gateApi } from '@/lib/hit/membership';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { message, resultId, mode, history, memberId } = await request.json();

    if (!message || !resultId || !mode) {
      return errorResponse('message, resultId, mode는 필수입니다.', 400);
    }

    // 멤버십 게이트 — AI 채팅은 무료 회원 이상
    const gateResult = await gateApi(memberId ?? null, 'HIT_AI_CHAT_BASIC');
    if (gateResult) return gateResult;

    // API 키 로드
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
    if (!apiKey) return errorResponse('AI 서비스를 사용할 수 없습니다.', 500);

    // 결과 데이터 로드
    const result = await getHitAResult(resultId);
    const resultContext = result ? `
내담자 HIT 결과:
- 유형: ${result.type_code} (${result.type_name_ko})
- DISC: D${result.disc_d_score} I${result.disc_i_score} S${result.disc_s_score} C${result.disc_c_score} (주특성: ${result.disc_primary})
- MBTI: ${result.mbti_type} (E${result.mbti_e_score} S${result.mbti_s_score} T${result.mbti_t_score} J${result.mbti_j_score})
- S-Power: ${JSON.stringify(result.s_power_scores || {})}
- 기저요인: ${result.base_summary || ''}
` : '';

    const systemPrompt = getHeroSystemPrompt(mode as HitMode) + '\n\n' + resultContext;

    // 대화 히스토리 구성
    const messages = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    });

    const text = response.content.find(b => b.type === 'text');

    return successResponse({
      reply: text?.type === 'text' ? text.text : '응답을 생성하지 못했습니다.',
    });
  } catch (error) {
    console.error('[HIT Chat]:', error);
    return errorResponse('AI 상담 중 오류가 발생했습니다.', 500);
  }
}
