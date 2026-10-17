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
import { PAIN_SCENES, SceneRow } from "@/features/planners/home/Scenes";
import { createAdminClient } from "@/lib/supabase/admin";

// 첫 화면 (2026-10-18 핸드오프 "10초 안에 플래너 앱임을 알게") - 메시지 하나
// ① 히어로 한 장 = 고통 하나(밀린 일 다시 쓰기)와 그 장면 → ② 나머지 두 장면 → ③ 플래너'스 PAD 소개 한 칸 → ④ 기획자 과정(부수, 맨 아래)
// 모집 중인 과정이 없으면 그 칸은 그리지 않는다
// ❌ 첫 장에 앱 열기 버튼을 두지 않는다 (앱 입구 = 유틸리티바 '내 플래너', 2026-10-18 사용자 재확인 "지금 규칙 유지")
export const metadata: Metadata = {
    title: { absolute: "플래너'스 AI · 내 손으로, 내 뜻대로" },
    description: "밀린 일은 빈 시간에 다시 놓고, 손글씨는 사진 한 장으로 옮기고, 하루와 한 주는 함께 돌아보는 인공지능 플래너 플래너'스 AI. 손으로 쓰는 플래너 플래너'스 PAD도 함께.",
};

async function hasOpenRounds(): Promise<boolean> {
    const { count } = await createAdminClient().from("program_rounds")
        .select("id", { count: "exact", head: true })
        .contains("channels", ["planners"]).in("status", ["upcoming", "ongoing"]).eq("brand_id", "planners");
    return (count ?? 0) > 0;
}

export default async function PlannersHome() {
    const [files, banners, openRounds] = await Promise.all([listPlannersFiles(), listActiveBanners(), hasOpenRounds()]);
    const popular = sortFiles(files.filter((f) => f.kind === "template"), "popular").slice(0, 4);
    const t = { ...PROGRAM_THEMES.planners, accent: "#0F766E" };

    // 버튼은 두 개 - 플래너'스 AI(강조) · 플래너'스 PAD (2026-10-14 사용자 지정 전체 이름) · 본문은 줄바꿈 없이
    const slides: HeroSlide[] = [
        {
            key: "ai-carry",
            title: "밀린 일, 다시 옮겨 적지 마세요",
            subtitle: "플래너'스 AI가 끝까지 챙깁니다",
            body: "종이 플래너를 그만두게 되는 가장 큰 이유, 밀린 일 옮겨 적기. 플래너'스 AI는 일정 사이 빈 시간을 찾아 알아서 다시 배치합니다.",
            visual: <AiAtWork scene="carry" />,
            primary: { label: "플래너'스 AI", href: "/planners/ai" },
            secondary: { label: "플래너'스 PAD", href: "/planners/pad" },
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

            {/* ② 나머지 두 장면 (첫 장면은 히어로) */}
            <section className={PLANNERS_SECTION}>
                <PlannersSectionTitle
                    title="기록은 자유롭게, 관리는 똑똑하게, 회고는 따뜻하게"
                    description="플래너를 쓰다 그만두게 되는 이유를 플래너'스 AI가 덜어 줍니다."
                    href="/planners/ai"
                />
                <div className="space-y-20 md:space-y-32">
                    {PAIN_SCENES.filter((s) => s.key !== "carry").map((s, k) => <SceneRow key={s.key} scene={s} reverse={k % 2 === 1} />)}
                </div>
                <div className="mt-16 text-center">
                    <Link href="/planners/ai" className="inline-flex items-center gap-1 font-bold text-[#0F766E] hover:underline">플래너'스 AI 더 알아보기 <ArrowRight className="h-4 w-4" /></Link>
                </div>
            </section>

            {/* ③ 플래너'스 PAD */}
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
                        {popular.map((f) => f.thumbnail_url && (
                            <Link key={f.id} href={padPath(f.id)} className="block bg-white p-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={f.thumbnail_url} alt={f.title} className="aspect-square w-full object-contain" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ④ 기획자 과정 (부수) */}
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

            {openRounds && (
                <section className={PLANNERS_SECTION}>
                    <PlannersSectionTitle title="모집 중인 과정" href="/planners/projects" />
                    <ProgramBoard theme={t} brands={["planners"]} dark={false} hideWhenEmpty />
                </section>
            )}
        </>
    );
}
