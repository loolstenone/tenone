/**
 * Agent Hub API
 * POST /api/agent/hub
 *
 * 에이전트 허브: 사용자 메시지를 적절한 에이전트로 라우팅
 * - agentName 지정 시 해당 에이전트 직접 호출
 * - 미지정 시 compass 에이전트가 라우팅 판단
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { invokeAgent, getAgentProfile } from '@/lib/agent/claude';
import type { AgentHubRequest, AgentHubResponse } from '@/types/agent';

export async function POST(request: NextRequest) {
  try {
    const body: AgentHubRequest = await request.json();
    const { message, agentName, userId, correlationId } = body;

    if (!message || typeof message !== 'string') {
      return errorResponse('message 필드가 필요합니다.', 400);
    }

    // correlation ID 생성 (추적용)
    const corrId = correlationId || crypto.randomUUID();

    // 에이전트 이름 결정
    let targetAgent = agentName || 'compass';

    // compass 라우팅: agentName 미지정 시 compass에게 먼저 물어본다
    if (!agentName) {
      const compassProfile = await getAgentProfile('compass');
      if (compassProfile) {
        // compass에게 라우팅 질의
        const routingPrompt =
          `다음 사용자 요청을 분석하고, 가장 적합한 에이전트 이름을 JSON으로 응답하세요.\n` +
          `사용 가능한 에이전트: ${compassProfile.can_invoke.join(', ')}\n` +
          `만약 특정 에이전트가 명확하지 않으면 "compass"를 반환하세요.\n\n` +
          `응답 형식: {"agent": "에이전트이름", "reason": "이유"}\n\n` +
          `사용자 요청: ${message}`;

        const routingResult = await invokeAgent({
          agentName: 'compass',
          userMessage: routingPrompt,
          userId,
          correlationId: corrId,
        });

        // JSON 파싱 시도
        try {
          const jsonMatch = routingResult.response.match(/\{[^}]+\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.agent && parsed.agent !== 'compass') {
              // 라우팅된 에이전트가 존재하는지 확인
              const targetProfile = await getAgentProfile(parsed.agent);
              if (targetProfile) {
                targetAgent = parsed.agent;
              }
            }
          }
        } catch {
          // JSON 파싱 실패 시 compass가 직접 응답
        }
      }
    }

    // 대상 에이전트 호출
    const result = await invokeAgent({
      agentName: targetAgent,
      userMessage: message,
      userId,
      correlationId: corrId,
    });

    const response: AgentHubResponse = {
      response: result.response,
      agentName: targetAgent,
      messageId: result.messageId || '',
      correlationId: corrId,
      confidence: result.confidence,
    };

    return successResponse(response);
  } catch (error) {
    console.error('[Agent Hub] 오류:', error);
    const message = error instanceof Error ? error.message : 'Agent Hub 오류';
    return errorResponse(message, 500);
  }
}
