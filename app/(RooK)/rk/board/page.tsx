"use client";

import { MessageCircle, Eye, ThumbsUp } from "lucide-react";

const posts = [
    { id: 1, title: "사이버펑크 느와르 - 비 오는 거리", author: "루키1호", date: "2026.03.20", views: 234, likes: 45, comments: 12, emoji: "🌧️" },
    { id: 2, title: "이소룡 피규어 AI 생성해봤습니다", author: "RooK", date: "2026.03.18", views: 189, likes: 38, comments: 8, emoji: "🥋" },
    { id: 3, title: "오피스 액션 피규어 시리즈", author: "루키2호", date: "2026.03.15", views: 156, likes: 29, comments: 5, emoji: "💪" },
    { id: 4, title: "고양이 사무라이 - 일본풍 AI 아트", author: "루키3호", date: "2026.03.12", views: 312, likes: 67, comments: 21, emoji: "🐱" },
    { id: 5, title: "레트로 게임 캐릭터 리메이크", author: "RooK", date: "2026.03.10", views: 198, likes: 42, comments: 9, emoji: "🎮" },
    { id: 6, title: "K-POP 앨범 커버 AI로 만들어봄", author: "루키4호", date: "2026.03.08", views: 276, likes: 53, comments: 15, emoji: "💿" },
];

export default function RooKBoardPage() {
    return (
        <div className="py-12 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Free Board</h1>
                        <p className="text-neutral-600">
                            누구나 작성할 수 있는 자랑게시판입니다. 성공작도 망작도 괜찮습니다.
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-[#282828] text-white text-sm rounded hover:bg-[#00d255] hover:text-black transition-colors">
                        글쓰기
                    </button>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-[#00d255] transition-all cursor-pointer"
                        >
                            <div className="aspect-video bg-neutral-900 flex items-center justify-center">
                                <span className="text-6xl">{post.emoji}</span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium group-hover:text-[#00d255] transition-colors line-clamp-2">{post.title}</h3>
                                <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
                                    <span>{post.author} · {post.date}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                                        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.likes}</span>
                                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
