import type { Metadata } from "next";
import Link from "next/link";
import { PLANNERS_SECTION, PlannersSectionTitle } from "@/features/planners/PageHero";
import { ArrowRight } from "lucide-react";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";
import { listPlannersFiles, padPath, sortFiles } from "@/lib/planners/library";
import { listActiveBanners } from "@/lib/planners/home";
import { HeroCarousel, type HeroSlide } from "@/features/planners/home/HeroCarousel";
import { AiAtWork } from "@/features/planners/home/AiAtWork";

// 첫 화면 (2026-10-14 AI 중심 개편, 사용자 "기획자를 전면에 내세우면 재미가 없다")
// 순서 = ① 플래너'스 AI(주인공) → ② 플래너'스 PAD(소개 한 칸만 — 진열대·분류는 PAD 화면에, 2026-10-17 사용자 "AI 7 : PAD 3") → ③ 기획자 과정(부수, "우리는 모두 기획자다 / 자기 인생에서만큼은")
// ❌ 첫 장에 앱 열기 버튼을 두지 않는다 (앱 입구 = 유틸리티바 '내 플래너')
export const metadata: Metadata = {
    title: { absolute: "플래너'스 AI · 내 손으로, 내 뜻대로" },
    description: "생각하고, 기록하고, 계획하고, 꾸려 가는 사람을 돕는 인공지능 플래너 플래너'스 AI. 손으로 쓰는 플래너 플래너'스 PAD도 함께.",
};

// 실제 기능 이름 그대로 (app/(Planners)/CLAUDE.md 플래너'스 AI 1~3단계)
const AI_VERBS = [
    { verb: "생각하다", title: "생각 쏟아내기", desc: "머릿속을 그냥 적거나 말하듯 쓰면, AI가 할 일과 일정으로 나눠 제안합니다. 캔버스와 마인드맵으로 펼쳐 볼 수도 있습니다." },
    { verb: "기록하다", title: "손글씨도 그대로", desc: "펜슬로 쓴 노트, 종이 플래너 사진을 글자로 옮깁니다. 지난 기록은 일상어로 물어 찾습니다." },
    { verb: "계획하다", title: "목표를 오늘로", desc: "연간·월간·주간·오늘이 한 흐름으로 이어집니다. 큰 목표는 AI가 할 일과 날짜로 나눠 줍니다." },
    { verb: "꾸려 가다", title: "밀려도 다시", desc: "못 끝낸 일은 빈 시간에 다시 놓고, 아침엔 오늘의 세 가지, 저녁과 주말엔 함께 돌아봅니다." },
];

export default async function PlannersHome() {
    const files = await listPlannersFiles();
    const popular = sortFiles(files.filter((f) => f.kind === "template"), "popular").slice(0, 8);
    const t = { ...PROGRAM_THEMES.planners, accent: "#0F766E" };
    const banners = await listActiveBanners();

    // 첫 화면 슬라이드 (2026-10-14 사용자): 첫 장 = "우리는 모두 기획자다 / 자기 인생에서만큼은" → 플래너'스 AI 후킹 카피 4장 → 인트라 › Planner's › 배너
    // 버튼은 전 장 같은 두 개 — 플래너'스 AI(강조) · 플래너'스 PAD (사용자 지정 전체 이름)
    // 본문은 줄바꿈 없이 (모바일에서 한 단어만 떨어지는 문제)
    const planners = files.filter((f) => f.category === "연간 플래너").sort((a, b) => b.sort_order - a.sort_order);
    const padHero = planners.find((f) => f.legacy_badak_no === 182) ?? planners[0];
    const buttons = {
        primary: { label: "플래너'스 AI", href: "/planners/ai" },
        secondary: { label: "플래너'스 PAD", href: "/planners/pad" },
    };
    const slides: HeroSlide[] = [
        {
            key: "brand",
            title: "우리는 모두 기획자다",
            subtitle: "자기 인생에서만큼은",
            body: "인공지능 시대, 더욱 기획자가 되어야 한다. AI가 실행을 대신할수록 방향을 정하는 힘이 곧 경쟁력이다.",
            imageUrl: padHero?.thumbnail_url ?? null,
            imageHref: padHero ? padPath(padHero.id) : null,
            ...buttons,
            note: "종이? 패드? AI? 중요한 것은 기획하는 나",
        },
        {
            key: "ai-dump",
            title: "생각을 쏟아 내세요",
            subtitle: "정리는 플래너'스 AI가 할게요",
            body: "머릿속을 떠오르는 대로 적으면 할 일과 일정으로 나눠 제안합니다. 확인한 것만 플래너에 들어갑니다.",
            visual: <AiAtWork scene="dump" />,
            ...buttons,
        },
        {
            key: "ai-carry",
            title: "밀린 일, 다시 옮겨 적지 마세요",
            subtitle: "플래너'스 AI가 끝까지 챙깁니다",
            body: "종이 플래너를 그만두게 되는 가장 큰 이유, 밀린 일 옮겨 적기. 플래너'스 AI는 일정 사이 빈 시간을 찾아 알아서 다시 배치합니다.",
            visual: <AiAtWork scene="carry" />,
            ...buttons,
        },
        {
            key: "ai-handwriting",
            title: "손으로 쓰고, 말로 하면",
            subtitle: "플래너'스 AI가 정리합니다",
            body: "펜슬로 쓴 노트, 종이 플래너 페이지는 사진 한 장으로 글자가 되고, 말로 한 메모는 그대로 받아 적습니다. 할 일 상태까지 알아봅니다.",
            visual: <AiAtWork scene="handwriting" />,
            ...buttons,
        },
        {
            key: "ai-focus",
            title: "내 손으로, 내 뜻대로",
            subtitle: "정하는 것은 나, 플래너'스 AI는 곁에서 돕습니다",
            body: "아침엔 오늘 꼭 할 세 가지를, 저녁과 주말엔 하루와 한 주를 함께 돌아봅니다. 플래너'스 AI는 대신 살아 주지 않습니다.",
            visual: <AiAtWork scene="focus" />,
            ...buttons,
        },
        ...banners.map((b) => ({
            key: b.id,
            title: b.title,
            body: b.subtitle,
            imageUrl: b.image_url,
            imageHref: b.link_url,
            primary: b.link_url ? { label: b.button_label || "자세히 보기", href: b.link_url } : null,
        })),
    ];

    return (
        <>
            <HeroCarousel slides={slides} />

            {/* ① 플래너'스 AI */}
            <section className={PLANNERS_SECTION}>
                <PlannersSectionTitle
                    title="기록은 자유롭게, 관리는 똑똑하게, 회고는 따뜻하게"
                    description="종이 플래너를 쓰다 그만두게 되는 이유, 밀린 일 다시 쓰기·지난 기록 찾기·혼자 돌아보기를 AI가 덜어 줍니다."
                    href="/planners/ai"
                />
                <div className="grid gap-px bg-neutral-200 md:grid-cols-2 lg:grid-cols-4">
                    {AI_VERBS.map((v) => (
                        <div key={v.verb} className="bg-white p-8 md:p-10">
                            <p className="text-sm font-bold text-[#0F766E]">{v.verb}</p>
                            <h3 className="mt-4 text-xl font-bold md:text-2xl">{v.title}</h3>
                            <p className="mt-3 break-keep leading-relaxed text-neutral-600">{v.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <Link href="/planners/ai" className="inline-flex items-center gap-1 font-bold text-[#0F766E] hover:underline">플래너'스 AI 더 알아보기 <ArrowRight className="h-4 w-4" /></Link>
                </div>
            </section>

            {/* ② 플래너'스 PAD */}
            <section className="bg-neutral-50">
                <div className={`${PLANNERS_SECTION} grid gap-10 md:grid-cols-2 md:items-center md:gap-24`}>
                    <div>
                        <p className="text-sm font-bold text-[#0F766E]">플래너'스 PAD</p>
                        <h2 className="mt-3 break-keep text-3xl font-bold md:text-5xl">감성을 담아내는 손글씨 플래너</h2>
                        <p className="mt-6 break-keep leading-relaxed text-neutral-600 md:text-lg">
                            굿노트·삼성노트·XODO에서 손으로 쓰는 PDF 플래너와 서식 {files.length}종. 플래너'스 AI와 같은 연간·월간·주간·오늘 구조라 함께 써도 어긋나지 않습니다.
                        </p>
                        <Link href="/planners/pad" className="mt-10 inline-flex items-center gap-1 font-bold text-[#0F766E] hover:underline">플래너'스 PAD 둘러보기 <ArrowRight className="h-4 w-4" /></Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {popular.slice(0, 4).map((f) => f.thumbnail_url && (
                            <Link key={f.id} href={padPath(f.id)} className="block bg-white p-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={f.thumbnail_url} alt={f.title} className="aspect-square w-full object-contain" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ③ 기획자 과정 (부수) */}
            <section className="bg-[#134E4A] text-white">
                <div className={`${PLANNERS_SECTION} grid gap-10 md:grid-cols-[1fr_auto] md:items-end`}>
                    <div>
                        <p className="text-sm font-bold text-teal-200">기획자 과정</p>
                        <h2 className="mt-4 break-keep text-3xl font-black md:text-5xl">우리는 모두 기획자다</h2>
                        <p className="mt-3 break-keep text-xl font-bold text-teal-200 md:text-2xl">자기 인생에서만큼은</p>
                        <p className="mt-8 max-w-2xl break-keep leading-relaxed text-teal-50 md:text-lg">
                            도구만으로 모자랄 때, 실제 과제를 팀으로 기획하고 끝까지 해 보는 과정을 엽니다. 해 낸 기록은 참여 확인서로 남습니다.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/planners/projects" className="inline-flex items-center gap-2 bg-[#14B8A6] px-7 py-3.5 font-bold text-[#042F2E] hover:bg-teal-300">기획자 과정 보기 <ArrowRight className="h-4 w-4" /></Link>
                        <Link href="/planners/planning" className="inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 font-bold hover:bg-white/10">기획이란</Link>
                    </div>
                </div>
            </section>

            <Shelf title="모집 중인 과정" href="/planners/projects">
                <ProgramBoard theme={t} brands={["planners"]} dark={false} emptyText="지금 모집 중인 과정이 없습니다. 새 과정이 열리면 이곳과 '이야기 › 공지'에 안내합니다." />
            </Shelf>
        </>
    );
}

function Shelf({ title, description, href, children }: { title: string; description?: string | null; href: string; children: React.ReactNode }) {
    return (
        <section className={PLANNERS_SECTION}>
            <PlannersSectionTitle title={title} description={description} href={href} />
            {children}
        </section>
    );
}
