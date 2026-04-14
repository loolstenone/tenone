import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
const supabase = createClient(url, key);

// POST: 흔적 저장 (텍스트 입력 → trace + 키워드 추출)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, traceType = 'need' } = await request.json();
  if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 });

  // badak_members 에서 member_id 조회
  const { data: member } = await supabase
    .from('badak_members')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!member) return NextResponse.json({ error: 'Badak member not found' }, { status: 404 });

  // 간단한 키워드 추출 (Phase 3에서 AI로 대체)
  const keywords = text
    .split(/[\s,·.]+/)
    .filter((w: string) => w.length >= 2)
    .slice(0, 5);

  // 흔적 저장
  const { data: trace, error } = await supabase
    .from('badak_traces')
    .insert({
      member_id: member.id,
      trace_type: traceType,
      content: text.trim(),
      keywords,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 관련 니즈 검색 (키워드 매칭 — sanitize input)
  const sanitized = keywords
    .map((k: string) => k.replace(/[%_'"\\]/g, ''))
    .filter((k: string) => k.length >= 2);

  let matchedNeeds = null;
  if (sanitized.length > 0) {
    const { data } = await supabase
      .from('badak_needs')
      .select('id, keyword, display_text, count, status')
      .or(sanitized.map((k: string) => `display_text.ilike.%${k}%`).join(','))
      .limit(5);
    matchedNeeds = data;
  }

  return NextResponse.json({
    trace,
    matchedNeeds: matchedNeeds || [],
    extractedKeywords: keywords,
  });
}
