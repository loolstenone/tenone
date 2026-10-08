import { NextRequest, NextResponse } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { hasServiceLink } from '@/lib/service-links-server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const SCOPE = 'madleague.certificates>hero.profile';

// GET — HeRo 커리어 프로필에 보이는 MADLeague 인증서 (본인 것만)
// 서비스 간 연계 동의(lib/service-links.ts SCOPE)가 없으면 데이터를 읽지 않는다 — 데이터 계약 3·4조, 개인정보보호법 제18조
// 레지스트리 고지 항목(구분·프로그램·결과·발급일·코드)만 내보낸다 — 생년월일·대학·전공 스냅샷은 조회하지 않음
export async function GET(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;
  if (!(await hasServiceLink(auth.memberId, SCOPE))) return NextResponse.json({ linked: false, certificates: [] });

  const { data, error } = await createAdminClient().from('program_certificates')
    .select('code, type, result, issued_at, label:snapshot->>label, title:snapshot->>title, round_title:snapshot->>round_title, year:snapshot->>year')
    .eq('brand_id', 'madleague').eq('member_id', auth.memberId).is('revoked_at', null)
    .order('issued_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ linked: true, certificates: data ?? [] });
}
