import type { Metadata } from "next";
import Link from "next/link";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";

export const metadata: Metadata = {
    title: "훈련 프로젝트",
    description: "Planner's 실전 전략 기획 훈련·실전 프로젝트 — 신청하고, 팀을 꾸려 기획하고, 참여 이력을 확인서로 남깁니다.",
};

/** Planner's 훈련·프로젝트 — 코어 프로그램 모듈(주인 brand planners) 회차 목록·신청. MADLeague 창구에도 같은 회차가 보일 수 있다 */
export default function PlannersProjectsPage() {
    const t = { ...PROGRAM_THEMES.planners, accent: "#0F766E" }; // 흰 배경용 진한 틸
    return (
        <div className="mx-auto w-full max-w-[980px] px-4 py-12 text-black md:px-[15px] md:py-16">
            <h1 className="text-[36px] font-bold">훈련 프로젝트</h1>
            <p className="mt-3 max-w-2xl break-keep text-[16px] leading-[1.6] text-neutral-600">
                실전 과제로 기획을 훈련하고, 프로젝트에 참여해 참여 이력을 확인서로 남기세요.
                신청하면 운영진이 검토 후 선발하고, 팀을 꾸려 진행합니다.
            </p>
            <div className="mt-10">
                <ProgramBoard theme={t} brands={["planners"]} dark={false} emptyText="지금 모집 중인 프로젝트가 없습니다. 새 프로젝트가 열리면 이곳에 안내합니다." />
            </div>
            <div className="mt-10 flex flex-wrap gap-4 text-sm text-neutral-500">
                <Link href={t.certificateHref} className="underline">내 참여 확인서</Link>
                <Link href={t.verifyBase} className="underline">확인서 진위 확인</Link>
            </div>
        </div>
    );
}
