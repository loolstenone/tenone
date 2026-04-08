/**
 * 히어로 AI 상담 채팅 API
 * POST /api/hit/chat
 * Body: { message, resultId, mode: 'A_ONLY'|'B_ONLY'|'AB_FULL', history: [{role,content}] }
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitAResult } from '@/lib/supabase/hit';
import { getHeroSystemPrompt, type HitMode } from '@/lib/hit/hero-agent-system';
import { gateApi, getMembershipTier } from '@/lib/hit/membership-server';
import { canAccess } from '@/lib/hit/membership';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

/** 무료 회원 AI 채팅 최대 횟수 */
const FREE_CHAT_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const { message, resultId, mode, history, memberId } = await request.json();

    if (!message || !resultId || !mode) {
      return errorResponse('message, resultId, mode는 필수입니다.', 400);
    }

    // 멤버십 게이트 — AI 채팅은 무료 회원 이상
    const gateResult = await gateApi(memberId ?? null, 'HIT_AI_CHAT_BASIC');
    if (gateResult) return gateResult;

    // 무료 회원 3회 사용 제한 확인
    const tier = await getMembershipTier(memberId ?? null);
    if (!canAccess(tier, 'HIT_AI_CHAT_UNLIMITED') && memberId) {
      const supabase = await createClient();
      const { count } = await supabase
        .from('hit_chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', memberId)
        .eq('role', 'user');
      if ((count ?? 0) >= FREE_CHAT_LIMIT) {
        return new Response(
          JSON.stringify({
            error: 'chat_limit_reached',
            tier,
            message: `무료 회원은 AI 상담을 ${FREE_CHAT_LIMIT}회까지 이용할 수 있습니다. 더 많이 이용하려면 Premium으로 업그레이드하세요.`,
            usageCount: count,
            limit: FREE_CHAT_LIMIT,
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

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
    const replyText = text?.type === 'text' ? text.text : '응답을 생성하지 못했습니다.';

    // 메시지 저장 (사용량 추적 + 대화 기록)
    if (memberId || resultId) {
      try {
        const supabaseWrite = await createClient();
        await supabaseWrite.from('hit_chat_messages').insert([
          {
            result_id: resultId,
            member_id: memberId ?? null,
            role: 'user',
            content: message,
          },
          {
            result_id: resultId,
            member_id: memberId ?? null,
            role: 'assistant',
            content: replyText,
          },
        ]);
      } catch (saveErr) {
        console.warn('[HIT Chat] 메시지 저장 실패 (응답은 정상):', saveErr);
      }
    }

    // 무료 회원의 남은 횟수 계산
    let usageInfo: { usageCount: number; limit: number; remaining: number } | null = null;
    if (!canAccess(tier, 'HIT_AI_CHAT_UNLIMITED') && memberId) {
      const supabase = await createClient();
      const { count } = await supabase
        .from('hit_chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', memberId)
        .eq('role', 'user');
      const usageCount = count ?? 0;
      usageInfo = {
        usageCount,
        limit: FREE_CHAT_LIMIT,
        remaining: Math.max(0, FREE_CHAT_LIMIT - usageCount),
      };
    }

    return successResponse({
      reply: replyText,
      ...(usageInfo && { usage: usageInfo }),
    });
  } catch (error) {
    console.error('[HIT Chat]:', error);
    return errorResponse('AI 상담 중 오류가 발생했습니다.', 500);
  }
}
