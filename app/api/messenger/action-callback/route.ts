/**
 * Action Callback API
 * POST /api/messenger/action-callback
 *
 * 사용자가 Action Card의 버튼을 클릭했을 때 처리.
 * - navigate: 프론트에서 직접 이동 (이 API 불필요)
 * - callback: 서비스의 callback_url 호출 → 후속 처리
 * - delegate: 에이전트에게 위임
 * - dismiss: 상태만 업데이트
 */
import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAuthOrAdmin } from '@/lib/supabase/api-utils';
import { createClient } from '@/lib/supabase/server';
import type { ActionCallbackPayload, ActionCallbackResponse, ActionPayload } from '@/types/messenger';

export async function POST(request: NextRequest) {
  const { error: authErr, user } = await requireAuthOrAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { message_id, thread_id, action_id } = body as {
      message_id: string;
      thread_id: string;
      action_id: string;
    };

    if (!message_id || !thread_id || !action_id) {
      return errorResponse('message_id, thread_id, action_id 필수', 400);
    }

    const supabase = await createClient();

    // 1. 원본 메시지 조회
    const { data: message } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', message_id)
      .single();

    if (!message) {
      return errorResponse('메시지를 찾을 수 없습니다', 404);
    }

    const actionPayload = message.action_payload as ActionPayload | null;
    if (!actionPayload || actionPayload.status !== 'pending') {
      return errorResponse('처리할 수 없는 메시지입니다 (이미 처리됨 또는 액션 없음)', 400);
    }

    // 2. 클릭된 액션 찾기
    const action = actionPayload.actions.find(a => a.id === action_id);
    if (!action) {
      return errorResponse(`액션을 찾을 수 없습니다: ${action_id}`, 404);
    }

    const userId = user?.id || 'admin';
    const userName = user?.email || 'Admin';

    // 3. 액션 상태 업데이트
    const updatedPayload: ActionPayload = {
      ...actionPayload,
      status: 'acted',
      acted_action_id: action_id,
      acted_at: new Date().toISOString(),
      acted_by: userId,
    };

    await supabase
      .from('chat_messages')
      .update({ action_payload: updatedPayload })
      .eq('id', message_id);

    // 4. 액션 타입별 처리
    let callbackResult: ActionCallbackResponse = { success: true };

    if (action.type === 'dismiss') {
      // 무시 — 상태만 업데이트하고 끝
      return successResponse({ success: true, action: 'dismissed' });
    }

    if (action.type === 'callback' && action.callback_url) {
      // 서비스 콜백 호출
      const callbackPayload: ActionCallbackPayload = {
        message_id,
        thread_id,
        action_id,
        user_id: userId,
        user_name: userName,
        correlation_id: message.correlation_id || undefined,
        original_payload: message.metadata || {},
      };

      try {
        const adminKey = process.env.ADMIN_API_KEY;
        const callbackUrl = action.callback_url.startsWith('/')
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : 'http://localhost:3000'}${action.callback_url}`
          : action.callback_url;

        const res = await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
          },
          body: JSON.stringify({
            ...callbackPayload,
            ...(action.callback_payload || {}),
          }),
        });

        if (res.ok) {
          callbackResult = await res.json();
        } else {
          console.error('[Action Callback] 서비스 응답 실패:', res.status);
          callbackResult = { success: false };
        }
      } catch (err) {
        console.error('[Action Callback] 서비스 호출 실패:', err);
        callbackResult = { success: false };
      }
    }

    if (action.type === 'delegate' && action.delegate_to) {
      // 에이전트 위임
      callbackResult = {
        success: true,
        delegate: {
          agent_name: action.delegate_to,
          message: `사용자가 "${action.label}" 액션을 선택했습니다. 원본: ${actionPayload.title} - ${actionPayload.body}`,
          context: {
            message_id,
            thread_id,
            action_id,
            original_metadata: message.metadata,
          },
        },
      };
    }

    // 5. 후속 처리: follow_up 메시지 or delegate
    if (callbackResult.follow_up) {
      const followUp = callbackResult.follow_up;
      const followUpPayload = followUp.actions && followUp.actions.length > 0
        ? {
            title: followUp.title,
            body: followUp.body,
            actions: followUp.actions,
            status: 'pending' as const,
            acted_action_id: null,
            acted_at: null,
            acted_by: null,
          }
        : null;

      await supabase.from('chat_messages').insert({
        thread_id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_name: message.sender_name,
        sender_type: message.sender_type,
        content: `${followUp.title}\n${followUp.body}`,
        type: 'notification',
        message_format: followUpPayload ? 'action_card' : 'text',
        action_payload: followUpPayload,
        correlation_id: message.correlation_id,
        read_by: [],
      });
    }

    if (callbackResult.delegate) {
      const { agent_name, message: delegateMsg, context } = callbackResult.delegate;

      // Agent Hub 호출
      const adminKey = process.env.ADMIN_API_KEY;
      const hubUrl = `${request.nextUrl.origin}/api/agent/hub`;

      try {
        const hubRes = await fetch(hubUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
          },
          body: JSON.stringify({
            agentName: agent_name,
            message: delegateMsg,
            userId,
            correlationId: message.correlation_id || undefined,
          }),
        });

        if (hubRes.ok) {
          const hubResult = await hubRes.json();

          // 에이전트 응답을 같은 스레드에 메시지로 추가
          await supabase.from('chat_messages').insert({
            thread_id,
            sender_id: '00000000-0000-0000-0000-000000000000',
            sender_name: agent_name,
            sender_type: 'agent',
            content: hubResult.response,
            type: 'text',
            message_format: 'text',
            correlation_id: message.correlation_id,
            metadata: { delegated_from: message.sender_name, context },
            read_by: [],
          });
        }
      } catch (err) {
        console.error('[Action Callback] Agent Hub 위임 실패:', err);
      }
    }

    // 6. 시스템 메시지: 사용자가 무엇을 선택했는지 기록
    await supabase.from('chat_messages').insert({
      thread_id,
      sender_id: userId,
      sender_name: userName,
      sender_type: 'system',
      content: `"${action.label}" 선택됨`,
      type: 'system',
      message_format: 'text',
      correlation_id: message.correlation_id,
      read_by: [userId],
    });

    return successResponse({
      success: callbackResult.success,
      action: action.type,
      action_label: action.label,
      delegate: callbackResult.delegate ? callbackResult.delegate.agent_name : null,
    });
  } catch (error) {
    console.error('[Action Callback] 오류:', error);
    const msg = error instanceof Error ? error.message : 'Action Callback 오류';
    return errorResponse(msg, 500);
  }
}
