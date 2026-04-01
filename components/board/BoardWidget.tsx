"use client";

/**
 * BoardWidget — 퍼블릭 페이지 어디서나 삽입 가능한 게시판 위젯
 *
 * 사용 예:
 *   <BoardWidget site="badak" board="community" limit={5} moreHref="/badak/community" />
 *   <BoardWidget site="tenone" board="works" layout="card" columns={3} accentColor="#171717" />
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Eye, ThumbsUp, MessageCircle, Loader2 } from "lucide-react";
import type { SiteCode } from "@/types/board";

interface WidgetPost {
    id: string;
    title: string;
    excerpt: string;
    category: string | null;
    representImage: string | null;
    createdAt: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
}

interface BoardWidgetProps {
    site: SiteCode;
    board: string;
    /** 위젯 제목 (없으면 표시 안 함) */
    title?: string;
    /** "더보기" 링크 */
    moreHref?: string;
    /** 표시 개수 (기본 5) */
    limit?: number;
    /** 레이아웃: 'list' | 'card' */
    layout?: "list" | "card";
    /** card 레이아웃 컬럼 수 (기본 3) */
    columns?: 2 | 3 | 4;
    /** 강조 색상 */
    accentColor?: string;
    /** 포스트 클릭 시 이동할 경로 prefix (기본: /${site}/${board}) */
    postPathPrefix?: string;
}

function formatDate(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return "오늘";
    if (d === 1) return "어제";
    if (d < 7) return `${d}일 전`;
    return new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

// 리스트형 아이템
function ListItem({ post, href, accentColor }: { post: WidgetPost; href: string; accentColor: string }) {
    return (
        <Link href={href} className="group flex items-start gap-3 py-3 border-b last:border-b-0 hover:opacity-70 transition-opacity" style={{ borderColor: "var(--tn-border)" }}>
            {post.representImage && (
                <div className="shrink-0 w-14 h-10 overflow-hidden" style={{ backgroundColor: "var(--tn-surface)" }}>
                    <img src={post.representImage} alt="" className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                {post.category && (
                    <span className="text-[9px] font-bold mr-1.5" style={{ color: accentColor }}>{post.category}</span>
                )}
                <span className="text-sm font-medium line-clamp-1" style={{ color: "var(--tn-text)" }}>{post.title}</span>
                <div className="flex items-center gap-2 mt-0.5 text-[10px]" style={{ color: "var(--tn-text-sub)" }}>
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{post.viewCount}</span>
                    {post.commentCount > 0 && <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" />{post.commentCount}</span>}
                </div>
            </div>
        </Link>
    );
}

// 카드형 아이템
function CardItem({ post, href, accentColor }: { post: WidgetPost; href: string; accentColor: string }) {
    return (
        <Link href={href} className="group block" >
            <div className="aspect-[4/3] overflow-hidden mb-2" style={{ backgroundColor: "var(--tn-surface)" }}>
                {post.representImage ? (
                    <img src={post.representImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-black opacity-10" style={{ color: "var(--tn-text)" }}>{post.title?.charAt(0)}</span>
                    </div>
                )}
            </div>
            {post.category && (
                <span className="text-[9px] font-bold" style={{ color: accentColor }}>{post.category}</span>
            )}
            <h3 className="text-sm font-semibold line-clamp-2 mt-0.5 group-hover:opacity-70 transition-opacity" style={{ color: "var(--tn-text)" }}>
                {post.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: "var(--tn-text-sub)" }}>
                <span>{formatDate(post.createdAt)}</span>
                <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{post.viewCount}</span>
                <span className="flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5" />{post.likeCount}</span>
            </div>
        </Link>
    );
}

export default function BoardWidget({
    site,
    board,
    title,
    moreHref,
    limit = 5,
    layout = "list",
    columns = 3,
    accentColor = "#171717",
    postPathPrefix,
}: BoardWidgetProps) {
    const [posts, setPosts] = useState<WidgetPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/board/posts?site=${site}&board=${board}&limit=${limit}&status=published`)
            .then(r => r.json())
            .then(d => {
                setPosts((d.posts || []).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    excerpt: p.excerpt || "",
                    category: p.category || null,
                    representImage: p.represent_image || null,
                    createdAt: p.created_at,
                    viewCount: p.view_count || 0,
                    likeCount: p.like_count || 0,
                    commentCount: p.comment_count || 0,
                })));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [site, board, limit]);

    const getPostHref = (post: WidgetPost) => {
        const prefix = postPathPrefix ?? `/${site}/${board}`;
        return `${prefix}/${post.id}`;
    };

    const colClass = { 2: "grid-cols-2", 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" }[columns];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--tn-text-sub)" }} />
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <div>
            {/* 헤더 */}
            {(title || moreHref) && (
                <div className="flex items-center justify-between mb-4">
                    {title && (
                        <div className="flex items-center gap-2">
                            <span className="w-0.5 h-4 shrink-0" style={{ backgroundColor: accentColor }} />
                            <h3 className="text-sm font-black tracking-wide" style={{ color: "var(--tn-text)" }}>{title}</h3>
                        </div>
                    )}
                    {moreHref && (
                        <Link href={moreHref} className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity" style={{ color: "var(--tn-text-sub)" }}>
                            더보기 <ArrowRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            )}

            {/* 콘텐츠 */}
            {layout === "list" ? (
                <div>
                    {posts.map(post => (
                        <ListItem key={post.id} post={post} href={getPostHref(post)} accentColor={accentColor} />
                    ))}
                </div>
            ) : (
                <div className={`grid ${colClass} gap-4`}>
                    {posts.map(post => (
                        <CardItem key={post.id} post={post} href={getPostHref(post)} accentColor={accentColor} />
                    ))}
                </div>
            )}
        </div>
    );
}
