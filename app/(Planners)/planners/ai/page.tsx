import type { Metadata } from "next";
import Link from "next/link";

// AI 플래너 소개 — 앱 본체 /planners/app (MyVerse에서 옮겨 온 핵심 화면, app/(Planners)/CLAUDE.md '이전 계획' 4단계)
// ❌ 가격·요금 표기 금지 (통신판매업 신고 전)
export const metadata: Metadata = {
    title: "플래너스 AI",
    description: "PAD 플래너와 같은 구조(연간·월간·주간·일간·프로젝트)를 디지털로. 할 일·프로젝트·캔버스·마인드맵·템플릿을 한곳에서, AI가 하루를 정리해 줍니다.",
};

const VIEWS = [
    { title: "오늘 · 주간 · 월간 · 연간", desc: "PAD 플래너와 같은 단위로 계획하고 돌아봅니다. 끝내지 못한 일은 다음 날로 넘어갑니다." },
    { title: "프로젝트", desc: "목표·마일스톤·할 일을 리스트·칸반·간트로. 프로젝트 북의 Frame + Work + Book을 디지털로 옮겼습니다." },
    { title: "캔버스 · 마인드맵", desc: "생각을 펼쳐 놓고 구조화한 뒤, 필요한 가지를 바로 할 일로 보냅니다." },
    { title: "템플릿", desc: "기획 서식을 불러와 프로젝트 노트나 마일스톤으로 바로 씁니다." },
    { title: "정체성", desc: "비전·미션·핵심 결과 지표를 세우고, 모든 계획의 기준으로 삼습니다." },
    { title: "AI 브리핑", desc: "오늘의 일정과 할 일을 AI가 정리해 알려 줍니다. Claude·ChatGPT·Gemini로 바로 복사해 이어 물을 수도 있습니다." },
];

export default function PlannersAiPage() {
    return (
        <>
            <section className="bg-[#134E4A] text-white">
                <div className="mx-auto max-w-[980px] px-4 py-20 md:px-[15px] md:py-24">
                    <p className="text-sm font-bold tracking-widest text-teal-300">플래너스 AI · 인공지능 플래너</p>
                    <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">종이에서 디지털로,<br />디지털에서 AI로</h1>
                    <p className="mt-8 max-w-2xl break-keep text-lg leading-relaxed text-teal-50">
                        PAD 플래너의 구조를 그대로 옮긴 디지털 플래너입니다. AI가 실행을 대신할수록 무엇을 할지 정하는 일은 사람의 몫으로 남습니다.
                        AI 플래너는 그 결정을 돕는 도구입니다.
                    </p>
                    <div className="mt-10">
                        <Link href="/planners/app" className="inline-flex items-center bg-[#14B8A6] px-6 py-3 font-bold text-[#042F2E] hover:bg-teal-300">
                            AI 플래너 열기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[980px] px-4 py-16 md:px-[15px] md:py-20">
                <div className="grid gap-px border border-neutral-200 bg-neutral-200 md:grid-cols-2">
                    {VIEWS.map((v) => (
                        <div key={v.title} className="bg-white p-6">
                            <h2 className="text-lg font-bold">{v.title}</h2>
                            <p className="mt-2 break-keep text-sm leading-relaxed text-neutral-600">{v.desc}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-10 break-keep text-neutral-600">
                    손으로 쓰는 쪽이 편하다면 <Link href="/planners/pad" className="font-bold text-[#0F766E] hover:underline">플래너스 PAD</Link>를 받아 쓰세요. 두 가지는 같은 구조라 함께 써도 어긋나지 않습니다.
                </p>
            </section>
        </>
    );
}
