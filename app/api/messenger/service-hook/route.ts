/**
 * Service Hook API
 * POST /api/messenger/service-hook
 *
 * 서비스(Mindle, Gravity, SmarComm 등)가 메신저로 알림을 보내는 엔드포인트.
 * Action Card 메시지를 생성하여 사용자에게 실시간 전달.
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse, isAdminRequest } from '@/lib/supabase/api-utils';
import { createClient } from '@/lib/supabase/server';
import type { ServiceHookPayload, ServiceHookResponse, ActionPayload } from '@/types/messenger';

export async function POST(request: NextRequest) {
  // 서비스 간 호출 — Admin API Key 필수
  if (!isAdminRequest(request)) {
    return errorResponse('Unauthorized: Admin API Key required', 401);
  }

  try {
    const body: ServiceHookPayload = await request.json();
    const { service, event, title, body: msgBody, actions, recipients, thread_id, correlation_id, priority, expires_at, metadata } = body;

    if (!service || !event || !title || !msgBody) {
      return errorResponse('service, event, title, body 필수', 400);
    }

    const supabase = await createClient();

    // 1. 서비스 훅 등록 확인
    const { data: hook } = await supabase
      .from('messenger_service_hooks')
      .select('*')
      .eq('service_name', service)
      .eq('is_active', true)
      .single();

    if (!hook) {
      return errorResponse(`등록되지 않은 서비스: ${service}`, 404);
    }

    // 이벤트 유효성 (등록된 이벤트인지)
    if (!hook.events.includes(event)) {
      return errorResponse(`미등록 이벤트: ${event} (허용: ${hook.events.join(', ')})`, 400);
    }

    // 2. 스레드 결정 (기존 thread_id 또는 서비스 전용 스레드)
    let threadId = thread_id;

    if (!threadId) {
      // 서비스 전용 스레드 찾거나 생성
      const { data: existing } = await supabase
        .from('wio_chat_threads')
        .select('id')
        .eq('thread_type', 'service')
        .eq('service_name', service)
        .limit(1);

      if (existing && existing.length > 0) {
        threadId = existing[0].id;
      } else {
        const { data: newThread } = await supabase
          .from('wio_chat_threads')
          .insert({
            name: hook.display_name,
            is_group: false,
            thread_type: 'service',
            service_name: service,
            description: `${hook.display_name} 서비스 알림`,
            participants: recipients || [],
            tenant_id: 'tenone',
          })
          .select('id')
          .single();

        threadId = newThread?.id;
      }
    }

    if (!threadId) {
      return errorResponse('스레드 생성 실패', 500);
    }

    // 3. Action Card 메시지 생성
    const actionPayload: ActionPayload | null = actions && actions.length > 0
      ? {
          title,
          body: msgBody,
          actions,
          status: 'pending',
          acted_action_id: null,
          acted_at: null,
          acted_by: null,
        }
      : null;

    const messageData = {
      thread_id: threadId,
      sender_id: '00000000-0000-0000-0000-000000000000',
      sender_name: hook.display_name,
      sender_type: 'service',
      content: `${title}\n${msgBody}`,
      type: priority === 'urgent' ? 'urgent' : 'notification',
      message_format: actionPayload ? 'action_card' : 'text',
      action_payload: actionPayload,
      correlation_id: correlation_id || null,
      metadata: {
        ...metadata,
        service,
        event,
        priority: priority || 'normal',
        expires_at: expires_at || null,
        icon: hook.icon,
        color: hook.color,
      },
      read_by: [],
    };

    const { data: message, error: msgError } = await supabase
      .from('wio_chat_messages')
      .insert(messageData)
      .select('id')
      .single();

    if (msgError) {
      console.error('[Service Hook] 메시지 생성 실패:', msgError);
      return errorResponse('메시지 생성 실패', 500);
    }

    // 4. 스레드 updated_at 갱신
    await supabase
      .from('wio_chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    const response: ServiceHookResponse = {
      success: true,
      message_id: message.id,
      thread_id: threadId,
    };

    return successResponse(response, 201);
  } catch (error) {
    console.error('[Service Hook] 오류:', error);
    const msg = error instanceof Error ? error.message : 'Service Hook 오류';
    return errorResponse(msg, 500);
  }
}
