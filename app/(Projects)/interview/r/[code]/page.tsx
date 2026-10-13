/**
 * AI 면접 예행연습 — 결과 통지서 (공유 링크 = 이 주소)
 * 코드(질문마다 a~d)만으로 같은 결과를 다시 만든다 — 저장 없음. 미리보기 이미지는 opengraph-image.tsx
 */
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { buildNotice, INTERVIEWER, isValidCode, SITE } from "@/lib/projects/interview";
import { interviewBase } from "@/features/projects/interview/base";
import { ShareBar } from "@/features/projects/interview/ShareBar";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { code } = await params;
    if (!isValidCode(code)) return {};
    const n = buildNotice(code);
    const title = `[${n.verdict.status}] ${n.verdict.title}`;
    return {
        title,
        description: `${n.verdict.summary} · ${SITE.eyebrow}`,
        alternates: { canonical: `/r/${code}` },
        openGraph: { title: `${title} — ${SITE.eyebrow}`, description: n.verdict.summary },
    };
}

export default async function ResultPage({ params }: Props) {
    const { code } = await params;
    if (!isValidCode(code)) notFound();
    const n = buildNotice(code);
    const base = interviewBase((await headers()).get("host"));

    return (
        <main className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-14">
            {/* 통지서 */}
            <article className="relative bg-[#F7F5EF] text-neutral-900 rounded-md shadow-2xl px-5 sm:px-8 py-7 sm:py-9 overflow-hidden">
                <div className="flex items-start justify-between gap-3 border-b-2 border-neutral-900 pb-4 mb-5">
                    <div>
                        <p className="text-[11px] tracking-widest text-neutral-500">{SITE.eyebrow.toUpperCase()}</p>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight">면접 결과 통지서</h1>
                    </div>
                    <p className="font-mono text-[11px] text-neutral-500 text-right">지원번호<br />{n.applicantNo}</p>
                </div>

                {/* 도장 */}
                <div className="absolute right-4 sm:right-8 top-24 rotate-[-14deg] border-[3px] border-[#D7263D] text-[#D7263D] rounded-md px-3 py-1 font-black text-lg sm:text-xl opacity-85 select-none" aria-hidden>
                    {n.verdict.status}
                </div>

                <p className="text-xs text-neutral-500 mb-1">판정</p>
                <p className="text-2xl sm:text-3xl font-black tracking-tight mb-2 pr-24 break-keep">{n.verdict.title}</p>
                <p className="font-semibold mb-6 break-keep">{n.verdict.summary}</p>

                <p className="text-xs text-neutral-500 mb-2">판정 사유</p>
                <ol className="space-y-1.5 mb-6 text-[15px]">
                    {n.reasons.map((r, i) => (
                        <li key={r} className="flex gap-2 break-keep"><span className="font-mono text-neutral-400">{i + 1}.</span><span>{r}</span></li>
                    ))}
                </ol>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Metric label="AI 대체 가능성" value={`${n.replaceable}%`} />
                    <Metric label="인간미 함량" value={`${n.humanity}%`} />
                </div>

                <p className="text-[15px] leading-relaxed text-neutral-700 break-keep mb-6">{n.verdict.closing}</p>

                <p className="text-right text-sm">
                    AI 면접관 <span className="font-mono font-bold">{INTERVIEWER}</span>
                    <span className="block text-[11px] text-neutral-500">(서명 생략 — 손이 없음)</span>
                </p>
            </article>

            <ShareBar code={code} title={`[${n.verdict.status}] ${n.verdict.title}`} />

            <Link href={base || "/"} className="mt-3 block w-full text-center py-4 rounded-lg font-bold text-[#0B0F0C] bg-[#3DDC84] hover:opacity-90 transition-opacity">
                나도 면접 보기
            </Link>

            {/* Presented by — tenone.biz 연결은 여기 한 곳 */}
            <a href="https://www.tenone.biz/works" target="_blank" rel="noopener noreferrer"
                className="mt-10 block border border-neutral-800 rounded-lg p-5 hover:border-neutral-600 transition-colors">
                <p className="text-[11px] text-neutral-500 mb-1">Presented by</p>
                <p className="font-bold mb-2">Ten:One™</p>
                <p className="text-sm text-neutral-400 break-keep">{SITE.presented}</p>
            </a>
            <p className="text-[11px] text-neutral-600 mt-6 break-keep">{SITE.disclaimer}</p>
        </main>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="border border-neutral-300 rounded px-3 py-2">
            <p className="text-[11px] text-neutral-500">{label}</p>
            <p className="font-mono text-xl font-bold">{value}</p>
        </div>
    );
}
