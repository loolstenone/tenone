/**
 * 바당쇠 에이전트 API
 * POST /api/agent/badaksoe
 *
 * Badak 브랜드 코디네이터 에이전트.
 * 모임 개설·초대장·피드백 요약 등 Badak 브랜드 운영 지원.
 *
 * task_type:
 *   meetup_create   — 모임 소개글·일정 초안 작성
 *   invitation      — 초대 메시지/공지 문구 작성
 *   feedback_summary — 모임 피드백 요약 + 인사이트 추출
 *   general          — 일반 질의응답
 *
 * Auth: Bearer ADMIN_API_KEY
 */
import { NextRequest, NextResponse } from 'next/server';
import { invokeAgent } from '@/lib/agent/claude';

type TaskType = 'meetup_create' | 'invitation' | 'feedback_summary' | 'general';

const TASK_CONTEXT: Record<TaskType, string> = {
  meetup_create:
    '바당쇠 모임 개설 지원: 모임 제목, 목적, 대상, 일시·장소 제안, 소개글 초안을 작성한다. ' +
    'Badak 특유의 따뜻하고 전문적인 톤을 유지한다.',
  invitation:
    '바당쇠 초대 메시지 작성: 참석 독려 문구, 카카오 공지용 짧은 버전과 이메일 긴 버전 모두 제공한다.',
  feedback_summary:
    '바당쇠 피드백 요약: 참석자 후기·의견을 받아 핵심 인사이트, 개선점, 하이라이트를 정리한다. ' +
    '다음 모임 기획에 활용할 수 있는 제언도 포함한다.',
  general:
    'Badak 브랜드 운영 전반에 대한 질의응답. 네트워킹·커리어 관련 조언, 바닥장 운영 노하우 등.',
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      message: string;
      task_type?: TaskType;
      meetup_context?: {
        title?: string;
        date?: string;
        location?: string;
        target?: string;
        description?: string;
      };
      user_id?: string;
    };

    const { message, task_type = 'general', meetup_context, user_id } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message 필드가 필요합니다.' }, { status: 400 });
    }

    const taskDesc = TASK_CONTEXT[task_type] ?? TASK_CONTEXT.general;

    // 모임 컨텍스트가 있으면 구조화해서 전달
    const contextBlock = meetup_context
      ? `\n[모임 정보]\n` +
        Object.entries(meetup_context)
          .filter(([, v]) => v)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n') + '\n'
      : '';

    const contextualMessage =
      `[작업 유형: ${task_type}]\n` +
      `[작업 설명: ${taskDesc}]` +
      contextBlock +
      `\n${message}`;

    const result = await invokeAgent({
      agentName: 'badaksoe',
      userMessage: contextualMessage,
      userId: user_id,
      correlationId: crypto.randomUUID(),
    });

    return NextResponse.json({
      response: result.response,
      task_type,
      agent: 'badaksoe',
      message_id: result.messageId,
      confidence: result.confidence,
    });

  } catch (error) {
    console.error('[바당쇠] 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '에이전트 오류' },
      { status: 500 },
    );
  }
}
