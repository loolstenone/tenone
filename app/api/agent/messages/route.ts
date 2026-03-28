/**
 * Agent Messages API
 * GET /api/agent/messages — 에이전트 메시지 로그 조회
 *
 * 필터:
 *   ?agentName=compass     — 특정 에이전트의 송수신 메시지
 *   ?correlationId=uuid    — 특정 대화 흐름 추적
 *   ?messageType=user_input — 메시지 유형 필터
 *   ?limit=50              — 조회 건수 (기본 50, 최대 200)
 *   ?offset=0              — 페이지네이션 오프셋
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const agentName = searchParams.get('agentName');
  const correlationId = searchParams.get('correlationId');
  const messageType = searchParams.get('messageType');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('agent_messages')
    .select('*', { count: 'exact' });

  // 에이전트 이름 필터 (from 또는 to)
  if (agentName) {
    query = query.or(`from_agent.eq.${agentName},to_agent.eq.${agentName}`);
  }

  // correlation ID 필터
  if (correlationId) {
    query = query.eq('correlation_id', correlationId);
  }

  // 메시지 유형 필터
  if (messageType) {
    query = query.eq('message_type', messageType);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return errorResponse(error.message);
  return successResponse({ data, total: count });
}
