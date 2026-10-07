import Link from 'next/link';
import { ShieldCheck, Ban } from 'lucide-react';
import { getPublicCertificate } from '@/lib/programs/certificates';

export const revalidate = 0;

interface PageProps { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  return { title: `인증서 진위 확인 · ${code.toUpperCase()}`, robots: { index: false, follow: false } };
}

/** 인증서 진위 확인 — 누구나. 이름은 가리고 생년월일·대학·전공은 보이지 않는다 (코드를 가진 사람에게 필요한 만큼만) */
export default async function VerifyCodePage({ params }: PageProps) {
  const { code } = await params;
  const cert = await getPublicCertificate(code);
  const normalized = code.toUpperCase();

  if (!cert) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[70vh]">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <Ban className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="mt-6 text-3xl font-black">인증서를 찾을 수 없습니다</h1>
          <p className="mt-4 text-neutral-400">코드 <span className="font-mono text-white">{normalized}</span>에 해당하는 인증서가 없습니다.</p>
          <Link href="/madleague/certificate/verify" className="mt-8 inline-block border border-neutral-700 hover:border-white px-6 py-3 text-white font-bold">다시 입력</Link>
        </div>
      </div>
    );
  }

  const s = { ...cert, brand_name: cert.brand_name ?? 'MAD League' };
  const rows: [string, string | null][] = [
    ['구분', s.label],
    ['성명', s.masked_name ?? '(탈퇴 회원)'],
    [s.group_label ?? '소속', [s.group_name, s.cohort].filter(Boolean).join(' ') || null],
    ['프로그램', s.round_title ?? (s.year ? `${s.year}년 활동` : null)],
    ['출전 팀', s.team_name],
    ['결과', cert.result],
    ['발급일', new Date(cert.issued_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })],
    ['발급', s.brand_name],
  ];

  return (
    <div className="bg-[var(--mad-black,#000)] text-white min-h-screen">
      <section className="mx-auto max-w-2xl px-6 py-16">
        {cert.revoked_at ? (
          <div className="bg-red-950 border border-red-800 p-6 mb-8 text-center">
            <Ban className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <div className="text-xl font-black text-red-300">취소된 인증서</div>
            {cert.revoked_reason && <div className="mt-2 text-sm text-red-400">{cert.revoked_reason}</div>}
            <div className="mt-2 text-xs text-red-500">{new Date(cert.revoked_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })} 취소</div>
          </div>
        ) : (
          <div className="bg-emerald-950 border border-emerald-800 p-6 mb-8 text-center">
            <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <div className="text-xl font-black text-emerald-300">유효한 인증서</div>
            <div className="mt-2 text-sm text-emerald-400">{s.brand_name}가 발급한 인증서입니다.</div>
          </div>
        )}

        <div className="bg-white text-neutral-900 p-8 sm:p-10">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">{s.brand_name.toUpperCase()}</div>
          <h1 className="mt-4 text-2xl font-black tracking-tight">{s.title}</h1>
          <div className="mt-8 space-y-3 text-sm">
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-4">
                <div className="w-24 shrink-0 text-neutral-500">{k}</div>
                <div className="font-bold">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-neutral-200 pt-6 text-xs text-neutral-500">
            코드 <span className="font-mono text-neutral-800">{cert.code}</span> · 이름 일부와 생년월일 등 개인정보는 보호를 위해 표시하지 않습니다.
          </div>
        </div>

        <div className="mt-8 text-center text-sm">
          <Link href="/madleague/certificate/verify" className="text-neutral-400 hover:text-white">다른 코드 확인</Link>
        </div>
      </section>
    </div>
  );
}
