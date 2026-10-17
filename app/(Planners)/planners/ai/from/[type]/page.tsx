import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera, ArrowRight } from "lucide-react";
import { PlannersPageHero, PLANNERS_SECTION } from "@/features/planners/PageHero";
import { PAD_FROM, PAD_FROM_KEYS, isPadFromKey } from "@/lib/planners/pad-landing";
import { StartFromPad } from "@/features/planners/StartFromPad";

// PAD(PDF) 페이지 버튼이 오는 곳 (2026-10-18 핸드오프 5번) - /planners/ai/from/{daily|weekly|monthly|yearly|project|pi}
// 로그인 전에도 그 페이지에 맞는 글과 '사진 올리기' 안내가 보이고, 시작하면 (로그인·처음 설정을 거쳐도) 앱 생각 쏟아내기 칸에 그 글이 들어가 있다
// PDF에서 오는 주소라 앱 입구 버튼을 둔다 (첫 화면·소개 화면의 '열기 버튼 금지' 규칙과 다른 자리)

export function generateStaticParams() {
    return PAD_FROM_KEYS.map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params;
    if (!isPadFromKey(type)) return {};
    const p = PAD_FROM[type];
    return { title: `${p.page} 페이지에서 플래너'스 AI로`, description: p.lead };
}

export default async function FromPadPage({ params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    if (!isPadFromKey(type)) notFound();
    const p = PAD_FROM[type];

    return (
        <>
            <PlannersPageHero eyebrow={`플래너'스 PAD · ${p.page}`} title={p.title} description={p.lead} />

            <section className={`${PLANNERS_SECTION} !pt-0`}>
                <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                    <div className="bg-neutral-50 p-8 md:p-10">
                        <p className="flex items-center gap-2 text-sm font-bold text-[#0F766E]"><Camera className="h-4 w-4" /> 사진으로 옮기기</p>
                        <p className="mt-4 break-keep leading-relaxed text-neutral-700">{p.photo}</p>
                        <p className="mt-4 break-keep text-sm text-neutral-500">사진은 글자로 옮긴 뒤 저장하지 않습니다. 옮긴 내용은 확인한 것만 플래너에 들어갑니다.</p>
                    </div>
                    <div className="bg-neutral-50 p-8 md:p-10">
                        <p className="text-sm font-bold text-[#0F766E]">{p.prompt ? "글로 적기" : "옮겨 적기"}</p>
                        {p.prompt ? (
                            <>
                                <p className="mt-4 break-keep text-neutral-700">시작하면 생각 쏟아내기 칸에 이 글이 들어가 있습니다. 이어서 적으세요.</p>
                                <pre className="mt-4 whitespace-pre-wrap border border-neutral-200 bg-white p-4 font-sans text-neutral-800">{p.prompt}…</pre>
                            </>
                        ) : (
                            <p className="mt-4 break-keep leading-relaxed text-neutral-700">시작하면 정체성 화면이 열립니다. 비전·미션·가치를 PAD에 쓴 그대로 옮겨 두세요.</p>
                        )}
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <StartFromPad fromKey={p.key} href={p.appPath} />
                    <p className="text-sm text-neutral-500">로그인하면 플래너는 바로 쓸 수 있습니다. 인공지능 기능은 지금 베타 테스터에게 먼저 열고 있습니다.</p>
                    {type === "pi" && (
                        <Link href="/planners/stories" className="inline-flex items-center gap-1 text-sm font-bold text-[#0F766E] hover:underline">P.I 쓰는 법 보기 <ArrowRight className="h-4 w-4" /></Link>
                    )}
                </div>
            </section>
        </>
    );
}
