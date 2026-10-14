// Planner's 사이트 공통 틀 — 모든 하위 페이지가 같은 폭·같은 제목 띠를 쓴다 (2026-10-14 사용자 지적 "레이아웃 일관성·공간이 좁다")
// ❌ 페이지마다 max-w-[980px]·max-w-5xl 등 폭을 따로 정하지 않는다 → PLANNERS_CONTAINER
// 긴 글(기획이란 본문)만 안쪽에서 max-w-[760px]로 줄여 읽기 폭을 맞춘다

/** 첫 화면·PAD 몰과 같은 폭 (1200px) + 좌우 여백 */
export const PLANNERS_CONTAINER = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

/** 본문 영역 위아래 여백 */
export const PLANNERS_SECTION = `${PLANNERS_CONTAINER} py-10 md:py-14`;

export function PlannersPageHero({ eyebrow, title, description, children }: {
    eyebrow: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    /** 버튼 등 (설명 아래) */
    children?: React.ReactNode;
}) {
    return (
        <section className="border-b border-neutral-200 bg-neutral-50">
            <div className={`${PLANNERS_CONTAINER} py-10 md:py-14`}>
                <p className="text-sm font-bold text-[#0F766E]">{eyebrow}</p>
                <h1 className="mt-2 break-keep text-3xl font-black leading-tight md:text-4xl">{title}</h1>
                {description && <div className="mt-3 max-w-2xl break-keep leading-relaxed text-neutral-600">{description}</div>}
                {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
            </div>
        </section>
    );
}

/** 제목 띠 안의 버튼 — 주(진한 틸)·보조(테두리) */
export const heroPrimaryBtn = "inline-flex items-center bg-[#0F766E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#134E4A]";
export const heroSecondaryBtn = "inline-flex items-center border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-neutral-800 hover:border-neutral-900";
