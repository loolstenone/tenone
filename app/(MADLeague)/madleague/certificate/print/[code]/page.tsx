import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  return { title: `인증서 · ${code}` };
}

export default async function PrintCertPage({ params }: PageProps) {
  const { code } = await params;
  const sb = await createClient();
  const { data } = await sb
    .from('mad_certificates')
    .select('*')
    .eq('verification_code', code.toUpperCase())
    .maybeSingle();
  if (!data) notFound();
  const cert = data as { id: string; type: string; title: string; details: Record<string, unknown>; verification_code: string; issued_at: string };

  const memberName = String(cert.details.member_name ?? '—');
  const clubName = cert.details.club_name ? String(cert.details.club_name) : null;
  const year = cert.details.year ? String(cert.details.year) : null;
  const teamName = cert.details.team_name ? String(cert.details.team_name) : null;
  const client = cert.details.client ? String(cert.details.client) : null;
  const award = cert.details.award_name ? String(cert.details.award_name) : null;
  const university = cert.details.university ? String(cert.details.university) : null;

  const typeLabel: Record<string, string> = {
    activity: 'CERTIFICATE OF ACTIVITY',
    competition: 'CERTIFICATE OF PARTICIPATION',
    award: 'CERTIFICATE OF AWARD',
    crown: 'MAD CROWN CERTIFICATE',
  };

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white text-neutral-900 min-h-screen print:min-h-0">
      <style dangerouslySetInnerHTML={{
        __html: `
          @page { size: A4 landscape; margin: 12mm; }
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
          }
        `
      }} />

      {/* Print actions */}
      <div className="no-print bg-neutral-900 text-white px-6 py-3 flex items-center justify-center text-xs font-bold tracking-widest">
        인쇄 미리보기 — Ctrl+P (또는 Cmd+P)로 PDF 저장
      </div>

      <div className="mx-auto max-w-5xl p-12 print:p-0">
        {/* Certificate frame */}
        <div className="border-8 border-[#EC1D25] p-16 relative">
          {/* Gold corners */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#FFC000]" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#FFC000]" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#FFC000]" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#FFC000]" />

          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="inline-block h-4 w-4 rounded-full bg-[#EC1D25]" />
              <span className="text-2xl font-extrabold tracking-tight">MAD League</span>
            </div>
            <div className="text-xs font-bold tracking-[0.4em] text-neutral-500">
              {typeLabel[cert.type] ?? typeLabel.activity}
            </div>
          </div>

          {/* Title */}
          <div className="mt-16 text-center">
            <h1 className="text-5xl font-black tracking-tight">{cert.title}</h1>
          </div>

          {/* Content */}
          <div className="mt-16 text-center space-y-2 text-lg">
            <div className="text-sm text-neutral-500">본 증서는 다음의 사실을 인증합니다.</div>
            <div className="mt-6">
              <span className="text-2xl font-black">{memberName}</span>
              {university && <span className="text-neutral-500 ml-2">({university})</span>}
            </div>
            {clubName && (
              <div>
                MADLeague <strong className="font-bold">{clubName}</strong>
                {year && <span className="ml-2 text-neutral-600">{year}년</span>}
              </div>
            )}
            {teamName && (
              <div>
                팀 <strong className="font-bold">{teamName}</strong>
                {client && <span className="text-neutral-600"> · 과제기업 {client}</span>}
              </div>
            )}
            {award && (
              <div className="mt-4 text-3xl font-black text-[#EC1D25]">{award}</div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t-2 border-neutral-300 flex items-end justify-between">
            <div className="text-sm text-neutral-500">
              <div>발급일: <strong className="text-neutral-900">{issuedDate}</strong></div>
              <div className="mt-1">검증 코드: <strong className="font-mono text-neutral-900">{cert.verification_code}</strong></div>
              <div className="mt-1">검증 URL: <strong className="text-neutral-900">madleague.net/certificate/verify/{cert.verification_code}</strong></div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black">MAD League</div>
              <div className="text-xs text-neutral-500 tracking-widest mt-1">Match · Act · Develop</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
