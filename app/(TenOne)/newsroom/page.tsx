"use client";

import NewsTicker from "@/components/newsroom/NewsTicker";
import NewsroomFeed from "@/components/newsroom/NewsroomFeed";

export default function NewsroomPage() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--tn-bg)", color: "var(--tn-text)" }}>
            {/* Hero */}
            <section className="pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] mb-3" style={{ color: "var(--tn-text-sub)" }}>NEWSROOM</p>
                    <h1 className="text-3xl md:text-4xl font-black mb-3">
                        Universe <span style={{ color: "var(--tn-text-sub)" }}>소식</span>
                    </h1>
                    <p className="text-sm max-w-xl" style={{ color: "var(--tn-text-sub)" }}>
                        Ten:One™ Universe 전체에서 진행 중인 프로젝트, 콘텐츠, 프로그램의 최신 소식을 한곳에서 확인하세요.
                    </p>
                </div>
            </section>

            {/* 티커 바 */}
            <div className="px-6">
                <div className="max-w-7xl mx-auto">
                    <NewsTicker />
                </div>
            </div>

            {/* 피드 */}
            <section className="py-10 px-6">
                <div className="max-w-7xl mx-auto">
                    <NewsroomFeed />
                </div>
            </section>
        </div>
    );
}
