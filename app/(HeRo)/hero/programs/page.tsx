import type { Metadata } from "next";
import Link from "next/link";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";

export const metadata: Metadata = {
    title: "프로그램",
    description: "HeRo 커리어 프로그램 — 모집 중인 프로그램에 신청하세요.",
};

/** HeRo 프로그램 — 코어 프로그램 모듈(주인 brand hero) 회차 목록·신청. 유료 결제는 통신판매업 신고 전까지 열지 않는다 */
export default function HeroProgramsPage() {
    const t = PROGRAM_THEMES.hero;
    return (
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="text-xs font-bold tracking-widest text-[#E53935]">PROGRAMS</div>
            <h1 className="mt-2 text-3xl font-black text-neutral-900 sm:text-4xl">HeRo 프로그램</h1>
            <p className="mt-3 max-w-2xl break-keep text-neutral-600">
                커리어 성장을 위한 HeRo 프로그램에 신청하세요. 운영진이 검토 후 참가자를 선발하고 회차 방에서 안내합니다.
            </p>
            <div className="mt-10">
                <ProgramBoard theme={t} brands={["hero"]} dark={false} emptyText="지금 모집 중인 프로그램이 없습니다. 새 프로그램이 열리면 이곳에 안내합니다." />
            </div>
            <div className="mt-10 flex flex-wrap gap-4 text-sm text-neutral-500">
                <Link href={t.certificateHref} className="underline">내 인증서</Link>
                <Link href={t.verifyBase} className="underline">인증서 진위 확인</Link>
            </div>
        </div>
    );
}
