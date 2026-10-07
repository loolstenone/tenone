import Link from "next/link";
import clsx from "clsx";
import type { RookBoard, RookPost } from "@/lib/supabase/rook";

/**
 * RooK 공통 UI — 원본 www.rook.co.kr(아임웹) 레이아웃을 그대로 옮김 (2026-10-07 원본 대조)
 * 본문 폭 950px · 매스너리 3열(카드 여백 15px) · 섹션 제목 36px · 본문 16px · 흰 바탕 검정 글씨
 */
export const ROOK_GREEN = "#00d255";

/** 카테고리 색 (원본과 동일) */
export const ROOK_CATEGORY_COLOR: Record<RookBoard | "freeboard", string> = {
    works: "#FF635D",
    artist: "#F9A746",
    freeboard: "#FF635D",
};
const FREEBOARD_CATEGORY_COLOR: Record<string, string> = { "망했어요 ㅋ": "#00B8FF" };
export function rookCategoryColor(board: RookBoard | "freeboard", category: string | null): string {
    if (board === "freeboard" && category && FREEBOARD_CATEGORY_COLOR[category]) return FREEBOARD_CATEGORY_COLOR[category];
    return ROOK_CATEGORY_COLOR[board];
}

const ASSET_BASE = "https://ziotlxkdctlhiwkgmmsh.supabase.co/storage/v1/object/public/board-assets/rook/site";
/** 사이트 이미지 (2026-10-07 www.rook.co.kr에서 Storage로 이전) */
export const ROOK_ASSETS = {
    logo: `${ASSET_BASE}/logo2.png`,
    aboutTitle: `${ASSET_BASE}/about_hero.png`,
    aboutRook: `${ASSET_BASE}/about_rook.png`,
    rookieTitle: `${ASSET_BASE}/rookie_hero.png`,
    rookieRecruit: `${ASSET_BASE}/rookie_recruit.png`,
    homeRookie: `${ASSET_BASE}/home_rookie1.png`,
    homeRookieLogo: `${ASSET_BASE}/home_rookie2.png`,
};

/** 홈 상단·AI 모델 섹션 배경 영상 (원본과 동일) */
export const ROOK_HERO_VIDEO = "_xly_E2iphk";
export const ROOK_MODEL_VIDEO = "NXdOyBWZkvw";

/** 원본 본문 폭 950px */
export function RooKContainer({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={clsx("mx-auto w-full max-w-[980px] px-4 md:px-[15px]", className)}>{children}</div>;
}

/** 섹션 제목 — "Works" 36px 굵게 + 옆에 14px 설명, 아래 14px 한 줄 */
export function RooKSectionTitle({ title, desc, sub }: { title: string; desc?: string; sub?: string }) {
    return (
        <div className="mb-6 px-0 md:px-[15px]">
            <h2 className="text-[28px] md:text-[36px] font-bold leading-tight text-black">
                {title}
                {desc && <span className="ml-2 align-baseline text-[14px] font-normal">{desc}</span>}
            </h2>
            {sub && <p className="mt-1 text-[14px] text-black break-keep">{sub}</p>}
        </div>
    );
}

/** 테두리 버튼 (원본 "▶ 스토리 보기"·"상담 / 문의"·"RooKie 지원하기" 등) */
export const ROOK_OUTLINE_BUTTON =
    "inline-flex items-center justify-center gap-2 border border-black bg-white px-6 py-2.5 text-[12px] text-black transition-colors hover:bg-black hover:text-white";

/** 카테고리 탭 — 원본: 13px, 선택된 탭만 검정 테두리 */
export function RooKCategoryTabs({ basePath, categories, active }: { basePath: string; categories: string[]; active?: string }) {
    const items = [{ label: "전체", value: undefined as string | undefined }, ...categories.map(c => ({ label: c, value: c }))];
    return (
        <nav className="mb-8 flex flex-wrap justify-center gap-1">
            {items.map(it => {
                const on = (it.value ?? "") === (active ?? "");
                return (
                    <Link
                        key={it.label}
                        href={it.value ? `${basePath}?category=${encodeURIComponent(it.value)}` : basePath}
                        className={clsx(
                            "px-[15px] py-1 text-[13px] border transition-colors",
                            on ? "border-black text-black" : "border-transparent text-black/70 hover:text-black",
                        )}
                    >
                        {it.label}
                    </Link>
                );
            })}
        </nav>
    );
}

/** 매스너리 — 원본처럼 왼쪽→오른쪽 순서로 열에 나눠 담는다 (모바일 2열 · 데스크톱 3열) */
export function RooKMasonry<T>({ items, render, keyOf }: { items: T[]; render: (item: T) => React.ReactNode; keyOf: (item: T) => string }) {
    const split = (n: number) => Array.from({ length: n }, (_, c) => items.filter((_, i) => i % n === c));
    return (
        <>
            <div className="grid grid-cols-2 md:hidden">
                {split(2).map((col, c) => <div key={c}>{col.map(it => <div key={keyOf(it)} className="p-[6px]">{render(it)}</div>)}</div>)}
            </div>
            <div className="hidden md:grid md:grid-cols-3">
                {split(3).map((col, c) => <div key={c}>{col.map(it => <div key={keyOf(it)} className="p-[15px]">{render(it)}</div>)}</div>)}
            </div>
        </>
    );
}

/** 홈 카드 — 원본 비율 이미지, 마우스를 올리면 제목이 이미지 위에 (원본 overlay 스타일) */
export function RooKOverlayCard({ href, image, title }: { href: string; image: string | null; title: string }) {
    return (
        <Link href={href} className="group relative block overflow-hidden bg-neutral-100">
            {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={title} loading="lazy" className="block h-auto w-full" />
            )}
            <span className="absolute inset-0 flex items-end bg-black/0 p-4 text-[14px] text-white opacity-0 transition-all duration-300 group-hover:bg-black/50 group-hover:opacity-100">
                {title}
            </span>
        </Link>
    );
}

/** 목록 카드 — 원본 비율 이미지 + 아래 카테고리(색)·제목 */
/**
 * Works AD = 실제 브랜드명을 쓴 AI 광고 시안 — 협찬·공식 광고 오인 방지 표기 (2026-10-07 공개 전환 시 결정, RooK 가이드)
 */
export const ROOK_AD_DISCLAIMER = "RooK의 AI 창작 시안이며, 해당 브랜드와 무관합니다.";
export function isRookAdSample(board: RookBoard, category: string | null): boolean {
    return board === "works" && category === "AD";
}

export function RooKListCard({ board, post }: { board: RookBoard; post: RookPost }) {
    return (
        <Link href={`/rook/${board}/${post.slug}`} className="group block">
            <div className="overflow-hidden bg-neutral-100">
                {post.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image} alt={post.title} loading="lazy"
                        className="block h-auto w-full transition-opacity group-hover:opacity-80" />
                )}
            </div>
            <div className="pt-3 pb-2 text-[14px] leading-snug">
                {post.category && <span className="mr-2" style={{ color: rookCategoryColor(board, post.category) }}>{post.category}</span>}
                <span className="text-black break-keep">{post.title}</span>
                {isRookAdSample(board, post.category) && <span className="mt-1 block text-[11px] text-black/45">{ROOK_AD_DISCLAIMER}</span>}
            </div>
        </Link>
    );
}

/** 배경 유튜브 (음소거·반복·컨트롤 없음) — 장식용이라 포인터 이벤트 차단 */
export function RooKBackgroundVideo({ videoId, className }: { videoId: string; className?: string }) {
    const src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&playsinline=1&rel=0`;
    return (
        <div className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
            <iframe
                src={src}
                title="background video"
                allow="autoplay; encrypted-media"
                className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            />
        </div>
    );
}
