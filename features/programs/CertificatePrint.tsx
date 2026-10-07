import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { isStaffMember } from '@/lib/api-guard';
import { sessionMemberId } from '@/lib/programs/access';
import { getCertificateByCode } from '@/lib/programs/certificates';
import { CERT_TYPE_EN } from '@/lib/programs/certificate-labels';
import { ProgramLoginButton } from '@/features/programs/ProgramLoginButton';
import type { ProgramTheme } from '@/features/programs/ProgramTheme';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
const fmtBirth = (d: string | null) => d ? new Date(`${d}T00:00:00+09:00`).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' }) : null;

/** 인증서 인쇄 (서버 컴포넌트, 창구 공용) — 본인·직원만 (생년월일 등 표기). 다른 사람은 진위 확인 페이지로 */
export async function CertificatePrint({ code, theme }: { code: string; theme: ProgramTheme }) {
  const memberId = await sessionMemberId();
  if (!memberId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-neutral-600">인증서는 발급받은 본인만 열 수 있습니다. 로그인해 주세요.</p>
        <ProgramLoginButton accentColor={theme.accent} className="mt-8 inline-block px-8 py-4 font-bold text-white">로그인</ProgramLoginButton>
      </div>
    );
  }
  const cert = await getCertificateByCode(code);
  if (!cert) notFound();
  if (cert.member_id !== memberId && !(await isStaffMember(createAdminClient(), memberId))) notFound();

  const s = cert.snapshot;
  const rows: [string, string | null][] = [
    ['성명', s.name],
    ['생년월일', fmtBirth(s.birthdate)],
    ['출신 대학', [s.university, s.major].filter(Boolean).join(' · ') || null],
    [s.group_label ?? '소속', [s.group_name, s.cohort].filter(Boolean).join(' ') || null],
    ['프로그램', s.round_title],
    ['출전 팀', s.team_name],
    ['클라이언트', s.client_name],
    ['결과', cert.result],
  ];
  const sentence = cert.type === 'activity'
    ? `위 사람은 ${s.year ?? ''}년 ${s.brand_name}${s.group_name ? ` ${s.group_name}` : ''}에서 활동하였음을 확인합니다.`
    : cert.type === 'award'
      ? `위 사람은 ${s.brand_name} ${s.round_title ?? ''}에서 위와 같이 수상하였음을 확인합니다.`
      : cert.type === 'completion'
        ? `위 사람은 ${s.brand_name} ${s.round_title ?? ''} 과정을 수료하였음을 확인합니다.`
        : `위 사람은 ${s.brand_name} ${s.round_title ?? ''}에 ${s.kind === 'competition' ? '참가' : '참여'}하였음을 확인합니다.`;

  return (
    <div className="min-h-screen bg-white text-neutral-900 print:min-h-0">
      <style dangerouslySetInnerHTML={{ __html: '@page { size: A4 portrait; margin: 14mm; } @media print { body { background: white !important; } .no-print { display: none !important; } header, footer, nav { display: none !important; } }' }} />
      <div className="no-print flex items-center justify-center bg-neutral-900 px-6 py-3 text-xs font-bold tracking-widest text-white">
        인쇄 미리보기 — Ctrl+P (Mac은 Cmd+P) → &quot;PDF로 저장&quot;
      </div>

      <div className="mx-auto max-w-3xl p-8 print:p-0">
        <div className="relative border-8 px-12 py-14" style={{ borderColor: theme.accent }}>
          <div className="absolute left-0 top-0 h-14 w-14 border-l-4 border-t-4 border-[#FFC000]" />
          <div className="absolute right-0 top-0 h-14 w-14 border-r-4 border-t-4 border-[#FFC000]" />
          <div className="absolute bottom-0 left-0 h-14 w-14 border-b-4 border-l-4 border-[#FFC000]" />
          <div className="absolute bottom-0 right-0 h-14 w-14 border-b-4 border-r-4 border-[#FFC000]" />

          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-3">
              <span className="inline-block h-4 w-4" style={{ background: theme.accent }} />
              <span className="text-2xl font-extrabold tracking-tight">{s.brand_name}</span>
            </div>
            <div className="text-[11px] font-bold tracking-[0.4em] text-neutral-500">{CERT_TYPE_EN[cert.type] ?? ''}</div>
            <h1 className="mt-10 text-5xl font-black tracking-[0.3em]">{s.label}</h1>
            <div className="mt-3 text-sm text-neutral-500">제 {cert.code} 호</div>
          </div>

          <table className="mx-auto mt-12 w-full max-w-md text-[15px]">
            <tbody>
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <tr key={k} className="border-b border-neutral-200">
                  <th className="w-28 py-2.5 text-left font-medium text-neutral-500">{k}</th>
                  <td className="py-2.5 font-bold">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mx-auto mt-12 max-w-md text-center text-lg leading-relaxed">{sentence}</p>

          <div className="mt-14 text-center">
            <div className="text-base">{fmtDate(cert.issued_at)}</div>
            <div className="mt-6 text-2xl font-black">{s.brand_name}</div>
            <div className="mt-1 text-xs tracking-widest text-neutral-500">운영 · Ten:One™ Universe</div>
          </div>

          <div className="mt-12 border-t border-neutral-300 pt-4 text-center text-xs text-neutral-500">
            진위 확인: {theme.verifyHost}/{cert.code}
            {cert.revoked_at && <div className="mt-2 font-bold text-red-600">취소된 인증서입니다{cert.revoked_reason ? ` — ${cert.revoked_reason}` : ''}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
