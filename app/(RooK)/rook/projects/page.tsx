import type { Metadata } from "next";
import Link from "next/link";
import { RooKContainer } from "@/features/rook/RooKUI";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";

export const metadata: Metadata = {
    title: "실전 프로젝트",
    description: "RooK 실전 프로젝트 — 프로젝트에 참여하고 참여 이력을 확인서로 남깁니다.",
};

/** RooK 실전 프로젝트 — 코어 프로그램 모듈(주인 brand rook) 회차 목록·신청. MADLeague 창구에도 같은 회차가 보일 수 있다 */
export default function RooKProjectsPage() {
    const t = PROGRAM_THEMES.rook;
    return (
        <RooKContainer className="py-12 md:py-16 text-black">
            <h1 className="text-[36px] font-bold">실전 프로젝트</h1>
            <p className="mt-3 max-w-2xl break-keep text-[16px] leading-[1.6] text-neutral-600">
                취업 전이든 후든, 실제 프로젝트에 참여해 경험을 쌓고 참여 이력을 확인서로 남기세요.
                신청하면 운영진이 검토 후 선발하고, 팀을 꾸려 프로젝트를 진행합니다.
            </p>
            <div className="mt-10">
                <ProgramBoard theme={t} brands={["rook"]} dark={false} emptyText="지금 모집 중인 프로젝트가 없습니다. 새 프로젝트가 열리면 이곳에 안내합니다." />
            </div>
            <div className="mt-10 flex flex-wrap gap-4 text-sm text-neutral-500">
                <Link href={t.certificateHref} className="underline">내 참여 확인서</Link>
                <Link href={t.verifyBase} className="underline">확인서 진위 확인</Link>
            </div>
        </RooKContainer>
    );
}
