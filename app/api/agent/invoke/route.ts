/**
 * Agent Invoke API — Phase 2 체이닝 엔진
 * POST /api/agent/invoke
 *
 * 흐름:
 *   1. 1001(오케스트레이터)가 사용자 메시지를 분석 → 타겟 에이전트 결정
 *   2. 타겟 에이전트 실행 (L1/L2)
 *   3. 1001이 타겟 결과를 취합 → 최종 응답 생성
 *   4. 전체 체인 트레이스 반환
 *
 * Auth: 로그인 또는 Admin API Key
 */
import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  requireAuthOrAdmin,
} from '@/lib/supabase/api-utils';
import { invokeAgent, getAgentProfile } from '@/lib/agent/claude';
import type {
  AgentInvokeRequest,
  AgentInvokeResponse,
  ChainStep,
} from '@/types/agent';

// ── 라우팅 프롬프트 ────────────────────────────────────────────────
function buildRoutingPrompt(message: string, availableAgents: string[]): string {
  return (
    `[ROUTING TASK]\n` +
    `사용자 메시지를 분석하고 최적 에이전트를 결정하라.\n\n` +
    `사용 가능한 에이전트: ${availableAgents.join(', ')}\n\n` +
    `규칙:\n` +
    `- 마케팅/캠페인/광고 → smarcomm\n` +
    `- 트렌드/크롤링/데이터 → mindle\n` +
    `- IT/인프라/솔루션 → wio\n` +
    `- 커리어/채용/HIT → hero\n` +
    `- 바닥/커뮤니티/멤버 → badangsoe\n` +
    `- MADLeague/리그/대학 → madleague\n` +
    `- MADLeap/지역/클럽 → madleap\n` +
    `- 정보수집/라우팅 불명확 → deutbot\n` +
    `- 복합/전략/대표 직접 지시 → 1001\n\n` +
    `반드시 JSON만 응답: {"agent":"에이전트명","reason":"한줄이유","subMessage":"에이전트에게 전달할 정제된 메시지"}\n\n` +
    `사용자 메시지: ${message}`
  );
}

// ── 취합 프롬프트 ──────────────────────────────────────────────────
function buildSynthesisPrompt(
  originalMessage: string,
  agentName: string,
  agentResponse: string,
  context?: Record<string, unknown>
): string {
  const contextStr = context ? `\n\n추가 컨텍스트:\n${JSON.stringify(context, null, 2)}` : '';
  return (
    `[SYNTHESIS TASK]\n` +
    `사용자 요청에 대해 ${agentName} 에이전트의 응답을 취합하여 최종 답변을 작성하라.\n\n` +
    `원본 요청: ${originalMessage}\n\n` +
    `${agentName} 응답:\n${agentResponse}${contextStr}\n\n` +
    `지시: 에이전트 응답을 바탕으로 사용자에게 전달할 최종 답변을 작성하라. ` +
    `에이전트 이름을 직접 언급하지 말고, 자연스럽게 답변하라.`
  );
}

// ── 메인 핸들러 ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { error: authErr, user } = await requireAuthOrAdmin(request);
  if (authErr) return authErr;

  const startTotal = Date.now();

  try {
    const body: AgentInvokeRequest = await request.json();
    const { message, context, maxDepth = 2 } = body;

    if (!message || typeof message !== 'string') {
      return errorResponse('message 필드가 필요합니다.', 400);
    }

    const corrId = crypto.randomUUID();
    const userId = user?.id ?? undefined;
    const chain: ChainStep[] = [];
    const agentPath: string[] = ['1001'];

    // ── Step 1: 1001 라우팅 결정 ──────────────────────────────────
    const orchestratorProfile = await getAgentProfile('1001');
    if (!orchestratorProfile) {
      return errorResponse('1001 에이전트를 찾을 수 없습니다.', 500);
    }

    const availableAgents = orchestratorProfile.can_invoke?.length
      ? orchestratorProfile.can_invoke
      : ['smarcomm', 'mindle', 'wio', 'hero', 'badangsoe', 'madleague', 'madleap', 'deutbot'];

    const t1 = Date.now();
    const routingResult = await invokeAgent({
      agentName: '1001',
      userMessage: buildRoutingPrompt(message, availableAgents),
      userId,
      correlationId: corrId,
    });

    chain.push({
      agent: '1001',
      role: 'orchestrate',
      input: message,
      output: routingResult.response,
      ms: Date.now() - t1,
    });

    // 라우팅 JSON 파싱
    let targetAgent = '1001';
    let subMessage = message;

    try {
      const jsonMatch = routingResult.response.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.agent && typeof parsed.agent === 'string') {
          const profile = await getAgentProfile(parsed.agent);
          if (profile) {
            targetAgent = parsed.agent;
            subMessage = parsed.subMessage || message;
          }
        }
      }
    } catch {
      // 파싱 실패 → 1001이 직접 처리
    }

    agentPath.push(targetAgent);

    // ── Step 2: 타겟 에이전트 실행 (1001 제외 시) ─────────────────
    let finalResponse: string;

    if (targetAgent === '1001' || maxDepth < 2) {
      // 1001이 직접 처리 — 체이닝 불필요
      const t2 = Date.now();
      const directResult = await invokeAgent({
        agentName: '1001',
        userMessage: message,
        userId,
        correlationId: corrId,
      });

      chain.push({
        agent: '1001',
        role: 'execute',
        input: message,
        output: directResult.response,
        ms: Date.now() - t2,
      });

      finalResponse = directResult.response;
    } else {
      // L1/L2 에이전트 실행
      const t2 = Date.now();
      const agentResult = await invokeAgent({
        agentName: targetAgent,
        userMessage: subMessage,
        userId,
        correlationId: corrId,
      });

      chain.push({
        agent: targetAgent,
        role: 'execute',
        input: subMessage,
        output: agentResult.response,
        ms: Date.now() - t2,
      });

      // ── Step 3: 1001 취합 ───────────────────────────────────────
      const t3 = Date.now();
      const synthesisResult = await invokeAgent({
        agentName: '1001',
        userMessage: buildSynthesisPrompt(message, targetAgent, agentResult.response, context),
        userId,
        correlationId: corrId,
      });

      chain.push({
        agent: '1001',
        role: 'synthesize',
        input: agentResult.response,
        output: synthesisResult.response,
        ms: Date.now() - t3,
      });

      agentPath.push('1001');
      finalResponse = synthesisResult.response;
    }

    const response: AgentInvokeResponse = {
      response: finalResponse,
      chain,
      agentPath,
      correlationId: corrId,
      totalMs: Date.now() - startTotal,
    };

    return successResponse(response);
  } catch (error) {
    console.error('[Agent Invoke] 오류:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'invoke 오류',
      500,
    );
  }
}
