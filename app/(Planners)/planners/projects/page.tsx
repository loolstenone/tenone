import type { Metadata } from "next";
import Link from "next/link";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";
import { PlannersPageHero, PLANNERS_SECTION, heroSecondaryBtn } from "@/features/planners/PageHero";

export const metadata: Metadata = {
    title: "훈련 프로젝트",
    description: "Planner's 실전 전략 기획 훈련·실전 프로젝트 — 신청하고, 팀을 꾸려 기획하고, 참여 이력을 확인서로 남깁니다.",
};

/** Planner's 훈련·프로젝트 — 코어 프로그램 모듈(주인 brand planners) 회차 목록·신청. MADLeague 창구에도 같은 회차가 보일 수 있다 */
export default function PlannersProjectsPage() {
    const t = { ...PROGRAM_THEMES.planners, accent: "#0F766E" }; // 흰 배경용 진한 틸
    return (
        <>
            <PlannersPageHero
                eyebrow="프로젝트"
                title="훈련 프로젝트"
                description="실전 과제로 기획을 훈련하고, 프로젝트에 참여해 참여 이력을 확인서로 남기세요. 신청하면 운영진이 검토 후 선발하고, 팀을 꾸려 진행합니다."
            >
                <Link href={t.certificateHref} className={heroSecondaryBtn}>내 참여 확인서</Link>
                <Link href={t.verifyBase} className={heroSecondaryBtn}>확인서 진위 확인</Link>
            </PlannersPageHero>
            <section className={PLANNERS_SECTION}>
                <ProgramBoard theme={t} brands={["planners"]} dark={false} emptyText="지금 모집 중인 프로젝트가 없습니다. 새 프로젝트가 열리면 이곳에 안내합니다." />
            </section>
        </>
    );
}
