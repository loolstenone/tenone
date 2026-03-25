"use client";

type WidgetDisplayStyle = "list" | "card" | "thumbnail";
type WidgetSortBy = "latest" | "views" | "recommended";
import { Eye, Clock, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";

interface LatestPostsWidgetProps {
    boardId: string;
    count?: number;
    displayStyle?: WidgetDisplayStyle;
    sortBy?: WidgetSortBy;
    showDate?: boolean;
    showAuthor?: boolean;
    showImage?: boolean;
    title?: string;
    className?: string;
}

export function LatestPostsWidget({
    boardId,
    count = 5,
    displayStyle = "list",
    sortBy = "latest",
    showDate = true,
    showAuthor = false,
    showImage = false,
    title,
    className,
}: LatestPostsWidgetProps) {
    const board: any = null;
    const posts: any[] = [];
    const headerTitle = title || board?.name || "최근 게시글";

    if (posts.length === 0) {
        return (
            <div className={clsx("border border-neutral-200 bg-white", className)}>
                <div className="px-4 py-3 border-b border-neutral-100">
                    <h3 className="text-sm font-semibold">{headerTitle}</h3>
                </div>
                <div className="px-4 py-6 text-center text-xs text-neutral-400">
                    게시글이 없습니다
                </div>
            </div>
        );
    }

    return (
        <div className={clsx("border border-neutral-200 bg-white", className)}>
            <div className="px-4 py-3 border-b border-neutral-100">
                <h3 className="text-sm font-semibold">{headerTitle}</h3>
            </div>

            {displayStyle === "list" && (
                <ul className="divide-y divide-neutral-100">
                    {posts.map(post => (
                        <li key={post.id} className="px-4 py-2.5 hover:bg-neutral-50 transition-colors">
                            <p className="text-sm font-medium truncate">{post.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                                {showAuthor && <span>{post.authorName}</span>}
                                {showDate && (
                                    <span className="flex items-center gap-0.5">
                                        <Clock className="h-3 w-3" />
                                        {post.publishedAt ?? post.createdAt}
                                    </span>
                                )}
                                <span className="flex items-center gap-0.5">
                                    <Eye className="h-3 w-3" />{post.viewCount}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {displayStyle === "card" && (
                <div className="p-4 grid gap-3 sm:grid-cols-2">
                    {posts.map(post => (
                        <div key={post.id} className="border border-neutral-100 rounded hover:border-neutral-300 transition-colors">
                            {showImage && (
                                <div className="aspect-video bg-neutral-100 flex items-center justify-center text-neutral-300 rounded-t">
                                    <ImageIcon className="h-6 w-6" />
                                </div>
                            )}
                            <div className="p-3">
                                <h4 className="text-sm font-medium line-clamp-2">{post.title}</h4>
                                <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{post.summary}</p>
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-400">
                                    {showDate && <span>{post.publishedAt ?? post.createdAt}</span>}
                                    {showAuthor && <span>{post.authorName}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {displayStyle === "thumbnail" && (
                <div className="p-4 grid gap-2 grid-cols-2 sm:grid-cols-3">
                    {posts.map(post => (
                        <div key={post.id} className="relative aspect-square bg-neutral-100 rounded overflow-hidden hover:opacity-90 transition-opacity">
                            <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                                <ImageIcon className="h-8 w-8" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                <p className="text-white text-[10px] font-medium line-clamp-2">{post.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
