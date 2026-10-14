import type { Metadata } from "next";
import Link from "next/link";
import { FileGroup } from "@/features/planners/FileList";
import { groupByCategory, listPlannersFiles, TEMPLATE_CATEGORIES } from "@/lib/planners/library";

export const metadata: Metadata = {
    title: "템플릿",
    description: "노트·스케줄·프레임워크·스터디·플레이 서식과 스타트업 질문지. 플래너에 더해 쓰거나 한 장씩 따로 쓰는 기획 양식.",
};

const CATEGORY_DESC: Record<string, string> = {
    "노트": "무지·라인·그리드·점·스토리보드 — 회의·메모·스케치용 속지",
    "스케줄": "연간·월간·주간·일간 일정과 습관 기록",
    "프레임워크": "SWOT·3C·STP·OKR·만다라트·비즈니스 캔버스 등 생각을 구조화하는 틀",
    "스터디": "원고지·외국어 쓰기·단어·지도·시간표",
    "스타트업": "시작하는 스타트업이 스스로 해 보는 질문 — 전략·마케팅·브랜딩·브리프·RFP·진단 (Word 문서)",
    "아이디어 샤워": "발상을 돕는 아이디어 모음",
    "플레이": "경기장·보드게임·사다리 타기 — 함께 노는 양식",
};

export default async function PlannersTemplatesPage() {
    const files = await listPlannersFiles("template");
    const groups = groupByCategory(files, TEMPLATE_CATEGORIES);

    return (
        <>
            <section className="bg-[#134E4A] text-white">
                <div className="mx-auto max-w-[980px] px-4 py-20 md:px-[15px] md:py-24">
                    <p className="text-sm font-bold tracking-widest text-teal-300">템플릿</p>
                    <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">생각을 구조화하는 서식</h1>
                    <p className="mt-8 max-w-2xl break-keep text-lg leading-relaxed text-teal-50">
                        필요한 것만 한 장씩 받아 쓰거나, <Link href="/planners/planner" className="underline underline-offset-4">플래너</Link>에 끼워 넣어 쓰세요.
                        경영·마케팅·개발·컨설팅에서 많이 쓰는 틀을 노트 앱용 PDF로 만들었습니다.
                    </p>
                    {groups.length > 0 && (
                        <nav className="mt-10 flex flex-wrap gap-2" aria-label="템플릿 분류">
                            {groups.map(([category, items]) => (
                                <a key={category} href={`#${encodeURIComponent(category)}`} className="border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10">
                                    {category} <span className="text-teal-200">{items.length}</span>
                                </a>
                            ))}
                        </nav>
                    )}
                </div>
            </section>

            <div className="mx-auto max-w-[980px] space-y-14 px-4 py-16 md:px-[15px]">
                {groups.length === 0 ? (
                    <p className="text-neutral-500">아직 올라온 템플릿이 없습니다.</p>
                ) : (
                    groups.map(([category, items]) => (
                        <FileGroup key={category} id={encodeURIComponent(category)} title={category} desc={CATEGORY_DESC[category]} files={items} />
                    ))
                )}
            </div>
        </>
    );
}
