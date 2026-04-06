/**
 * 바당쇠 API (듣봇 연계)
 * POST /api/agent/deutbot
 *
 * Playwright 스크립트 또는 Badak 앱에서 호출.
 * 방 카테고리/메타데이터 기반으로 페르소나를 선택하고 badangsoe 에이전트를 실행.
 *
 * Auth: Bearer ADMIN_API_KEY
 */
import { NextRequest, NextResponse } from 'next/server';
import { invokeAgent } from '@/lib/agent/claude';
import { createClient } from '@/lib/supabase/server';

/* ── 방 카테고리별 기본 페르소나 ── */
const CATEGORY_PERSONA: Record<string, string> = {
  networking: '친근하고 따뜻하게. 네트워킹을 돕는 커뮤니티 분위기 메이커. 짧고 자연스럽게.',
  marketing:  '디지털 마케팅 전문가 톤. 신뢰감 있게. 출처 있으면 함께 언급.',
  study:      '함께 배우는 스터디 메이트. 공감 먼저, 정보는 구체적으로.',
  project:    '프로젝트 협업 조력자. 실용적이고 간결하게. 행동 유도.',
  general:    '유용하고 친근하게. 바닥 커뮤니티 분위기에 맞게.',
};

/* ── 방 이름 기반 추가 힌트 ── */
const NAME_HINT: Record<string, string> = {
  '수다방':         '가볍고 유머러스하게. 커뮤니티 수다 분위기.',
  '디지털 마케팅방': '전문 지식 중심. 최신 트렌드 언급 환영.',
  '레퍼런스방':     '큐레이터형. 링크·출처 명시. 한 줄 요약 먼저.',
  '취업이직정보방': '공감 먼저. 실용 정보 제공.',
  'CR방':           '간결하고 실용적. 핵심만.',
  '팀장방':         '격식체. 리더십·조직 관점.',
  '자료 공유':      '자료 정리 보조. 파일·링크 공유 중심.',
};

export async function POST(request: NextRequest) {
  // 인증: ADMIN_API_KEY (Playwright 스크립트에서 사용)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      message,
      room_id,
      room_name,
      sender_name,
      platform = 'kakao',
    } = body as {
      message: string;
      room_id?: string;
      room_name?: string;
      sender_name?: string;
      platform?: 'kakao' | 'badak';
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message 필드가 필요합니다.' }, { status: 400 });
    }

    // 방 정보 조회 (room_id 있을 때)
    let roomCategory = 'general';
    let resolvedRoomName = room_name || '알 수 없는 방';

    if (room_id) {
      const supabase = await createClient();
      const { data: room } = await supabase
        .from('badaksoe_rooms')  // 테이블명은 DB 마이그레이션 후 변경 예정
        .select('name, category, metadata')
        .eq('id', room_id)
        .eq('status', 'active')
        .single();

      if (room) {
        roomCategory = room.category || 'general';
        resolvedRoomName = room.name || resolvedRoomName;
        if (room.metadata?.persona_override) {
          roomCategory = room.metadata.persona_override;
        }
      }
    }

    // 페르소나 결정
    const categoryPersona = CATEGORY_PERSONA[roomCategory] || CATEGORY_PERSONA.general;
    const nameHint = NAME_HINT[resolvedRoomName] || '';
    const personaInstruction = nameHint
      ? `${categoryPersona} [${resolvedRoomName} 특성: ${nameHint}]`
      : categoryPersona;

    // badangsoe 에이전트 실행
    const contextualMessage =
      `[방: ${resolvedRoomName} | 플랫폼: ${platform}${sender_name ? ` | 발신자: ${sender_name}` : ''}]\n` +
      `[이 방에서의 응답 스타일: ${personaInstruction}]\n\n` +
      message;

    const result = await invokeAgent({
      agentName: 'badangsoe',
      userMessage: contextualMessage,
      correlationId: crypto.randomUUID(),
    });

    return NextResponse.json({
      response: result.response,
      room_name: resolvedRoomName,
      room_category: roomCategory,
      agent: 'badangsoe',
      message_id: result.messageId,
    });
  } catch (error) {
    console.error('[Badangsoe] 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '바당쇠 오류' },
      { status: 500 }
    );
  }
}
