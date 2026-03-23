"use client";

import { useBums } from "@/lib/bums-context";
import { Image as ImageIcon } from "lucide-react";

export default function MadzinePage() {
    const { getPostsByBoard } = useBums();

    const posts = getPostsByBoard("board-mad-gallery")
        .filter((p) => p.status === "published");

    return (
        <div>
            {/* Hero */}
            <section className="bg-[#212121] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#D32F2F] font-bold text-sm tracking-widest uppercase mb-3 block">
                        MADzine
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">매드 진</h1>
                    <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        MAD League의 활동과 이야기를 기록합니다.
                        경쟁 PT, 워크숍, 네트워킹 현장의 생생한 모습을 만나보세요.
                    </p>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <article
                                    key={post.id}
                                    className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="aspect-[4/3] bg-neutral-100 relative">
                                        <div className="w-full h-full bg-gradient-to-br from-[#D32F2F]/10 to-neutral-200 flex items-center justify-center">
                                            <ImageIcon className="h-10 w-10 text-neutral-300" />
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-[#D32F2F] transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">
                                            {post.summary || post.body}
                                        </p>
                                        <div className="flex items-center gap-3 mt-3 text-xs text-neutral-400">
                                            <span>{post.authorName}</span>
                                            <span>&middot;</span>
                                            <span>{post.publishedAt || post.createdAt}</span>
                                            {post.viewCount > 0 && (
                                                <>
                                                    <span>&middot;</span>
                                                    <span>조회 {post.viewCount}</span>
                                                </>
                                            )}
                                        </div>
                                        {post.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {post.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] rounded"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <ImageIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                            <p className="text-neutral-400">아직 등록된 콘텐츠가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
