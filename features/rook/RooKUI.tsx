import Link from "next/link";
import clsx from "clsx";
import { Play } from "lucide-react";
import type { RookPost } from "@/lib/supabase/rook";

/** RooK 공통 — 검정 헤더·흰 본문·초록 포인트 (www.rook.co.kr 원본 톤 유지) */
export const ROOK_GREEN = "#00d255";

const ASSET_BASE = "https://ziotlxkdctlhiwkgmmsh.supabase.co/storage/v1/object/public/board-assets/rook/site";
/** 사이트 이미지 (2026-10-07 www.rook.co.kr에서 Storage로 이전) */
export const ROOK_ASSETS = {
    logo: `${ASSET_BASE}/logo.png`,
    aboutHero: `${ASSET_BASE}/about_hero.png`,
    aboutRook: `${ASSET_BASE}/about_rook.png`,
    rookieHero: `${ASSET_BASE}/rookie_hero.png`,
    rookieRecruit: `${ASSET_BASE}/rookie_recruit.png`,
    modelBg: `${ASSET_BASE}/model_bg.jpg`,
    homeRookie: `${ASSET_BASE}/home_rookie1.png`,
};

/** 홈 상단·AI 모델 섹션 배경 영상 (원본 사이트와 동일) */
export const ROOK_HERO_VIDEO = "_xly_E2iphk";
export const ROOK_MODEL_VIDEO = "NXdOyBWZkvw";
export const ROOK_YOUTUBE_CHANNEL = "https://www.youtube.com/@RooK_AI_Creator";

export function RooKSectionTitle({ title, desc, sub }: { title: string; desc?: string; sub?: string }) {
    return (
        <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {title}
                {desc && <span className="mt-1 block text-sm font-normal text-neutral-500 md:ml-3 md:mt-0 md:inline md:align-middle md:text-base">{desc}</span>}
            </h2>
            {sub && <p className="mt-2 text-sm md:text-base text-neutral-600 break-keep">{sub}</p>}
        </div>
    );
}

/** 카테고리 탭 — ?category= 링크 (서버 페이지에서 필터) */
export function RooKCategoryTabs({ basePath, categories, active }: { basePath: string; categories: string[]; active?: string }) {
    const items = [{ label: "전체", value: undefined as string | undefined }, ...categories.map(c => ({ label: c, value: c }))];
    return (
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {items.map(it => {
                const on = (it.value ?? "") === (active ?? "");
                return (
                    <Link
                        key={it.label}
                        href={it.value ? `${basePath}?category=${encodeURIComponent(it.value)}` : basePath}
                        className={clsx(
                            "shrink-0 px-4 py-1.5 text-sm border transition-colors",
                            on ? "bg-black text-white border-black" : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black",
                        )}
                    >
                        {it.label}
                    </Link>
                );
            })}
        </div>
    );
}

/** Works 카드 — 16:9 썸네일 (영상 작품은 재생 표시) */
export function RooKWorkCard({ post }: { post: RookPost }) {
    return (
        <Link href={`/rook/works/${post.slug}`} className="group block">
            <div className="relative aspect-video overflow-hidden bg-black">
                {post.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image} alt={post.title} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
                {post.youtubeId && (
                    <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center bg-black/70 text-white">
                        <Play className="h-4 w-4 fill-current" />
                    </span>
                )}
            </div>
            <div className="mt-3">
                {post.category && <p className="text-xs font-semibold tracking-wide" style={{ color: ROOK_GREEN }}>{post.category}</p>}
                <p className="mt-1 font-semibold leading-snug break-keep group-hover:underline">{post.title}</p>
            </div>
        </Link>
    );
}

/** AI Artist 카드 — 3:4 세로 */
export function RooKArtistCard({ post }: { post: RookPost }) {
    return (
        <Link href={`/rook/artist/${post.slug}`} className="group block">
            <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                {post.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image} alt={post.title} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
            </div>
            <div className="mt-2">
                {post.category && <p className="text-[11px] font-semibold tracking-wide text-neutral-500">{post.category}</p>}
                <p className="text-sm font-semibold leading-snug break-keep">{post.title}</p>
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

export function formatRookDate(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
