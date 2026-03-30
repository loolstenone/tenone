"use client";

import NewsTicker from "@/components/newsroom/NewsTicker";
import NewsroomFeed from "@/components/newsroom/NewsroomFeed";

export default function NewsroomPage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--tn-bg, #0a0a0a)", color: "var(--tn-text, #fafafa)" }}>
            {/* Hero */}
            <div className="px-6 md:px-12 pt-12 pb-8">
                <p className="text-xs tracking-[0.3em] text-neutral-500 mb-3">NEWSROOM</p>
                <h1 className="text-3xl md:text-4xl font-black mb-2">
                    Universe <span className="text-neutral-500">소식</span>
                </h1>
                <p className="text-sm text-neutral-500 max-w-xl">
                    Ten:One™ Universe 전체에서 진행 중인 프로젝트, 콘텐츠, 프로그램의 최신 소식을 한곳에서 확인하세요.
                </p>
            </div>

            {/* 티커 바 */}
            <NewsTicker />

            {/* 피드 */}
            <div className="px-6 md:px-12 py-10">
                <NewsroomFeed />
            </div>
        </div>
    );
}
