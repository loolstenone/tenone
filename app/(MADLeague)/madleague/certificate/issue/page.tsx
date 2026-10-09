import { PtCertificateIssue } from '@/features/madleague/PtCertificateIssue';

export const metadata = { title: '경쟁 PT 인증서 발급', description: 'MADLeague 경쟁 PT 참가 확인서·수상 확인서를 PNG·PDF로 받으세요.' };

export default function PtCertificateIssuePage() {
    return (
        <div className="bg-black text-white min-h-screen">
            <section className="border-b border-neutral-900">
                <div className="mx-auto max-w-6xl px-6 py-20">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25]">CERTIFICATE</div>
                    <h1 className="mt-4 text-4xl sm:text-6xl font-black tracking-tight">경쟁 PT 인증서 발급</h1>
                    <p className="mt-6 max-w-2xl text-lg text-neutral-400 leading-relaxed">
                        경쟁 PT에 참가한 모든 사람은 <b className="text-white">참가 확인서</b>를, 본선에 올라 수상한 팀은 등수에 맞는 <b className="text-white">수상 확인서</b>를 받습니다.
                        Ten:One ID로 로그인해 한 번 본인 확인하면 내 계정에 보관되고, PNG 또는 PDF로 언제든 다시 받을 수 있습니다.
                    </p>
                </div>
            </section>
            <section className="mx-auto max-w-6xl px-6 py-16">
                <PtCertificateIssue />
            </section>
        </div>
    );
}
