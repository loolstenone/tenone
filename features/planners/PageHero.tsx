import Link from "next/link";

// Planner's 사이트 공통 틀 — 모든 페이지가 같은 폭·같은 여백·같은 제목 모양을 쓴다
// 2026-10-14 사용자 지적 "레이아웃 일관성·공간이 좁다" → 참조 logrog.co.kr: 넓은 폭, 구간 위아래 큰 여백, 가운데 큰 구간 제목, 큰 상품 사진
// ❌ 페이지마다 max-w-[980px]·max-w-5xl·py-10 등 폭·여백을 따로 정하지 않는다 → 아래 상수
// 긴 글(기획이란 본문)만 안쪽에서 max-w-[760px]로 줄여 읽기 폭을 맞춘다

/** 콘텐츠 폭 (1590px) + 좌우 여백 — 2026-10-14 사용자 "여유 있는 구성이 인간적" → 1440에서 150 넓힘 */
export const PLANNERS_CONTAINER = "mx-auto w-full max-w-[1590px] px-6 md:px-16";

/** 구간(섹션) 위아래 여백 — 150px (logrog과 같음) */
export const PLANNERS_SPACE = "py-20 md:py-[150px]";

/** 폭 + 구간 여백 */
export const PLANNERS_SECTION = `${PLANNERS_CONTAINER} ${PLANNERS_SPACE}`;

/** 하위 페이지 머리 — 가운데 정렬, 넉넉한 위아래 여백 */
export function PlannersPageHero({ eyebrow, title, description, children }: {
    eyebrow: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    /** 버튼 등 (설명 아래) */
    children?: React.ReactNode;
}) {
    return (
        <section className="border-b border-neutral-100 bg-neutral-50">
            <div className={`${PLANNERS_CONTAINER} py-24 text-center md:py-[170px]`}>
                <p className="text-sm font-bold tracking-widest text-[#0F766E]">{eyebrow}</p>
                <h1 className="mt-5 break-keep text-4xl font-black leading-tight md:text-6xl">{title}</h1>
                {description && <div className="mx-auto mt-8 max-w-2xl break-keep leading-loose text-neutral-600 md:text-lg">{description}</div>}
                {children && <div className="mt-12 flex flex-wrap justify-center gap-3">{children}</div>}
            </div>
        </section>
    );
}

/** 구간 제목 — 가운데 큰 제목 + 부제 + (선택) 전체 보기 */
export function PlannersSectionTitle({ title, description, href, linkLabel = "전체 보기" }: {
    title: React.ReactNode;
    description?: React.ReactNode;
    href?: string;
    linkLabel?: string;
}) {
    return (
        <div className="mb-14 text-center md:mb-24">
            <h2 className="break-keep text-3xl font-bold md:text-5xl md:leading-tight">{title}</h2>
            {description && <p className="mx-auto mt-5 max-w-2xl break-keep leading-relaxed text-neutral-500 md:text-lg">{description}</p>}
            {href && <Link href={href} className="mt-6 inline-block text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline">{linkLabel} →</Link>}
        </div>
    );
}

/** 제목 띠 안의 버튼 — 주(진한 틸)·보조(테두리) */
export const heroPrimaryBtn = "inline-flex items-center bg-[#0F766E] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#134E4A]";
export const heroSecondaryBtn = "inline-flex items-center border border-neutral-300 bg-white px-7 py-3.5 text-sm font-bold text-neutral-800 hover:border-neutral-900";
