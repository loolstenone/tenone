import Link from 'next/link';
import { FileCheck, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

export const metadata = { title: '활동인증서', description: 'MADLeague 활동 인증서 발급 안내' };

// 발급 기준·절차 = 코어 program_certificates 실제 동작 (2026-10-08) — 로그인 후 본인이 직접 발급
const criteria = [
    { label: '활동 인증서', desc: '동아리 현역으로 활동한 연도가 끝나면 그 연도의 활동 인증서' },
    { label: '참가 확인서', desc: '경쟁 PT·프로젝트에 팀원으로 참가하고 결과가 발표된 회차' },
    { label: '수상 확인서', desc: '참가한 회차에서 순위·상을 받은 경우 (참가 확인서 대신)' },
    { label: '진위 확인', desc: '인증서마다 고유 코드 — 누구나 진위 확인 페이지에서 확인' },
];

const steps = [
    { step: 1, title: '로그인', desc: '활동할 때 쓴 Ten:One ID로 로그인합니다. 활동이 끝난 뒤에도 언제든 가능합니다.' },
    { step: 2, title: '확인', desc: '매드리거 › 인증서에서 발급할 수 있는 인증서를 확인합니다.' },
    { step: 3, title: '발급', desc: '처음 한 번만 생년월일·출신 대학·전공을 입력하고 바로 발급합니다.' },
    { step: 4, title: '저장', desc: '인증서 화면에서 인쇄 또는 PDF로 저장합니다. 다시 받아도 같은 코드입니다.' },
];

export default function CertificatePage() {
    return (
        <div className="bg-[var(--mad-black,#000)] text-white">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-neutral-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.12),transparent_60%)]" aria-hidden />
                <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25]">CERTIFICATE</div>
                    <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">활동인증서</h1>
                    <p className="mt-8 max-w-2xl text-xl text-neutral-300 leading-relaxed">
                        MADLeague 활동을 공식적으로 인증하는 활동인증서를 발급받으세요.
                    </p>
                </div>
            </section>

            {/* 인증서 소개 */}
            <section className="mx-auto max-w-7xl px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* 샘플 */}
                    <div className="bg-neutral-950 border border-neutral-900 p-10 flex flex-col items-center justify-center aspect-[3/4]">
                        <FileCheck className="h-16 w-16 text-[#EC1D25]/40 mb-6" />
                        <div className="text-center space-y-2">
                            <p className="text-2xl font-black tracking-tight">활 동 인 증 서</p>
                            <p className="text-xs text-neutral-500 tracking-widest">MAD League 제 8기</p>
                            <div className="mt-6 pt-6 border-t border-neutral-800 space-y-1 text-sm text-neutral-400">
                                <p>성명: 홍길동</p>
                                <p>소속: OO대학교</p>
                                <p>활동기간: 2026.03 ~ 2026.08</p>
                            </div>
                            <div className="mt-6">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EC1D25] text-white text-xs font-bold tracking-widest">
                                    MAD LEAGUE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 설명 */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black tracking-tight">활동인증서란?</h2>
                        <p className="text-neutral-400 leading-relaxed">
                            MADLeague 인증서는 동아리 활동·경쟁 PT 참가·수상을 공식적으로 확인하는 문서입니다.
                            MADLeague에서의 경험을
                            취업이나 대외활동 증빙에 활용할 수 있습니다.
                        </p>
                        <div className="flex items-start gap-3 p-4 bg-neutral-950 border border-neutral-800">
                            <AlertCircle className="h-4 w-4 text-[#FFC000] shrink-0 mt-0.5" />
                            <span className="text-sm text-neutral-400">
                                인증서는 디지털(PDF) 형태로 발급되며, 고유번호로 진위 확인이 가능합니다.
                            </span>
                        </div>
                        <div>
                            <Link
                                href="/madleague/certificate/verify"
                                className="inline-flex items-center gap-2 border border-neutral-700 hover:border-white px-6 py-3 text-sm font-bold tracking-wide text-neutral-300 hover:text-white transition"
                            >
                                인증서 진위 확인 →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 발급 기준 */}
            <section className="border-t border-neutral-900 py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">CRITERIA</div>
                    <h2 className="text-4xl font-black tracking-tight mb-12">발급 기준</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {criteria.map((c) => (
                            <div key={c.label} className="flex items-start gap-4 bg-neutral-950 border border-neutral-900 p-6">
                                <CheckCircle className="h-5 w-5 text-[#EC1D25] shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-black text-white text-sm mb-1">{c.label}</h3>
                                    <p className="text-xs text-neutral-500">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 발급 절차 */}
            <section className="border-t border-neutral-900 py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">PROCESS</div>
                    <h2 className="text-4xl font-black tracking-tight mb-12">발급 절차</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {steps.map((s) => (
                            <div key={s.step} className="bg-neutral-950 border border-neutral-900 p-8">
                                <div className="w-10 h-10 bg-[#EC1D25] flex items-center justify-center text-white font-black text-lg mb-6">
                                    {s.step}
                                </div>
                                <h3 className="font-black text-white mb-2">{s.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-sm text-neutral-600">
                        <Clock className="h-4 w-4" />
                        <span>검토 없이 바로 발급 — 결과 발표·활동 연도 종료 후 자동으로 목록에 나타납니다</span>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#EC1D25]">
                <div className="mx-auto max-w-7xl px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="text-sm font-bold tracking-widest text-white/70 mb-3">APPLY</div>
                        <div className="text-3xl sm:text-4xl font-black text-white">활동 기록을 공식 인증서로</div>
                        <p className="mt-3 text-white/80">매드리거라면 지금 바로 발급받을 수 있습니다.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                    <Link href="/madleague/member/certificate" className="inline-flex items-center gap-2 border border-white text-white font-bold px-8 py-5 text-lg transition hover:bg-white hover:text-[#EC1D25]">
                        내 인증서
                    </Link>
                    <Link href="/madleague/apply" className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-10 py-5 text-lg transition">
                        지원하기 <ArrowRight className="h-5 w-5" />
                    </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
