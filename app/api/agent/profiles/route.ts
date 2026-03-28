/**
 * Agent Profiles API
 * GET  /api/agent/profiles — 전체 에이전트 프로필 목록
 * POST /api/agent/profiles — 새 에이전트 프로필 생성 (관리자 전용)
 */
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import type { CreateAgentProfileRequest } from '@/types/agent';

// GET /api/agent/profiles
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agent_profiles')
    .select('*')
    .order('layer', { ascending: true })
    .order('name', { ascending: true });

  if (error) return errorResponse(error.message);
  return successResponse({ data, total: data?.length ?? 0 });
}

// POST /api/agent/profiles
export async function POST(request: NextRequest) {
  // 관리자 인증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    const body: CreateAgentProfileRequest = await request.json();

    // 필수 필드 검증
    if (!body.name || !body.display_name || !body.system_prompt) {
      return errorResponse('name, display_name, system_prompt는 필수입니다.', 400);
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('agent_profiles')
      .insert({
        name: body.name,
        display_name: body.display_name,
        layer: body.layer ?? 2,
        agent_type: body.agent_type ?? 'brand',
        model_id: body.model_id ?? 'claude-sonnet-4-6',
        system_prompt: body.system_prompt,
        temperature: body.temperature ?? 0.3,
        max_tokens: body.max_tokens ?? 4096,
        knowledge_refs: body.knowledge_refs ?? [],
        tools: body.tools ?? [],
        risk_level: body.risk_level ?? 'green',
        can_invoke: body.can_invoke ?? [],
      })
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(data, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : '프로필 생성 실패';
    return errorResponse(message, 500);
  }
}
