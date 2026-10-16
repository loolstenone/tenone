import { notFound, permanentRedirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 옛 공개 포트폴리오 주소 (/madleague/portfolio/{mad_members.id}) → 새 공개 프로필 /madleague/@핸들 (2026-10-16 사용자 결정 "새 기준으로")
 * 옛 화면은 대학·전공·옛 대회 테이블을 보여 줬다. 공개 여부·항목은 이제 공개 프로필 설정(마이페이지)이 정한다 — 여기서는 주소만 넘긴다.
 */
export default async function LegacyPortfolioRedirect({ params }: { params: Promise<{ memberId: string }> }) {
    const { memberId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(memberId)) notFound();

    const admin = createAdminClient();
    const { data: mad } = await admin.from('mad_members').select('member_id').eq('id', memberId).maybeSingle();
    if (!mad?.member_id) notFound();
    const { data: m } = await admin.from('members').select('handle').eq('id', mad.member_id).maybeSingle();
    if (!m?.handle) notFound();
    permanentRedirect(`/madleague/@${m.handle}`);
}
