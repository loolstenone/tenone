/**
 * 듣봇 청취 API
 * POST /api/agent/deutbot/listen
 *
 * MessengerBotR(카카오 봇 스크립트)에서 호출.
 * 응답 없이 대화 내용만 DB에 저장. 스팸 자동 필터링.
 *
 * Auth: Bearer ADMIN_API_KEY
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// 스팸 키워드 — 포함 시 is_spam = true
const SPAM_KEYWORDS = [
  'http', 'https',           // URL
  '010-', '010 ',            // 전화번호
  '홍보', '광고', '문의',      // 광고성
  '카카오아이디', '카톡아이디', 'open.kakao.com',
  '무료체험', '할인', '특가', '이벤트',
  '공지', '강퇴',             // 운영 메시지
];

function detectSpam(msg: string): boolean {
  const lower = msg.toLowerCase();
  // 너무 짧은 메시지 (5자 미만)
  if (msg.trim().length < 5) return true;
  // 스팸 키워드
  for (const kw of SPAM_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) return true;
  }
  return false;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      room: string;
      sender: string;
      message: string;
      platform?: string;
    };

    const { room, sender, message, platform = 'kakao' } = body;

    if (!room || !sender || !message) {
      return NextResponse.json(
        { error: 'room, sender, message 필드가 필요합니다.' },
        { status: 400 },
      );
    }

    const is_spam = detectSpam(message);

    const supabase = getServiceClient();
    const { error } = await supabase
      .from('deutbot_logs')
      .insert({ room, sender, message, platform, is_spam });

    if (error) throw error;

    return NextResponse.json({ ok: true, is_spam });

  } catch (error) {
    console.error('[듣봇] 저장 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '저장 오류' },
      { status: 500 },
    );
  }
}
