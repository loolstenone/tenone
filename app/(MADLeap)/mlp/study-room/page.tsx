"use client";

import { BookOpen, Brain, BarChart3, PenTool, Monitor, Megaphone } from "lucide-react";

const studies = [
    {
        icon: Brain,
        title: "AI 마케팅 스터디",
        desc: "ChatGPT, MidJourney 등 AI 툴을 활용한 마케팅 전략 수립",
        tags: ["AI", "프롬프팅", "자동화"],
        members: 12,
        schedule: "매주 토요일 14:00",
    },
    {
        icon: BarChart3,
        title: "데이터 분석 스터디",
        desc: "GA4, SQL, Python을 활용한 마케팅 데이터 분석",
        tags: ["GA4", "SQL", "Python"],
        members: 8,
        schedule: "매주 수요일 19:00",
    },
    {
        icon: PenTool,
        title: "브랜딩 스터디",
        desc: "브랜드 전략 수립부터 아이덴티티 디자인까지",
        tags: ["브랜딩", "디자인", "전략"],
        members: 10,
        schedule: "격주 일요일 13:00",
    },
    {
        icon: Monitor,
        title: "콘텐츠 마케팅 스터디",
        desc: "SNS 콘텐츠 기획·제작·분석 실전 워크숍",
        tags: ["인스타그램", "유튜브", "틱톡"],
        members: 15,
        schedule: "매주 목요일 20:00",
    },
    {
        icon: Megaphone,
        title: "퍼포먼스 마케팅 스터디",
        desc: "Meta Ads, Google Ads 광고 운영 및 최적화",
        tags: ["Meta Ads", "Google Ads", "ROAS"],
        members: 6,
        schedule: "매주 화요일 19:30",
    },
    {
        icon: BookOpen,
        title: "마케팅 북클럽",
        desc: "마케팅·광고·경영 관련 필독서 읽고 토론",
        tags: ["독서", "토론", "인사이트"],
        members: 20,
        schedule: "월 1회 일요일",
    },
];

export default function MadLeapStudyRoomPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-black text-white py-20 md:py-24">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">스터디 룸</h1>
                    <p className="text-neutral-400">함께 공부하고, 함께 성장합니다</p>
                </div>
            </section>

            {/* Study List */}
            <section className="py-16 md:py-24">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studies.map((s) => (
                            <div key={s.title} className="border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <s.icon className="h-8 w-8 text-[#00B8FF] mb-4" />
                                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                                <p className="text-neutral-600 text-sm mb-4">{s.desc}</p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {s.tags.map((tag) => (
                                        <span key={tag} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-xs text-neutral-400 pt-4 border-t border-neutral-100">
                                    <span>{s.members}명 참여</span>
                                    <span>{s.schedule}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Info */}
            <section className="bg-neutral-50 py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-xl font-bold mb-4">스터디 참여 방법</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white p-6 rounded-xl border border-neutral-200">
                            <div className="text-2xl font-bold text-[#00B8FF] mb-2">01</div>
                            <h3 className="font-semibold mb-1">매드립 가입</h3>
                            <p className="text-sm text-neutral-500">정규 기수 모집을 통해 리퍼가 됩니다</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-neutral-200">
                            <div className="text-2xl font-bold text-[#00B8FF] mb-2">02</div>
                            <h3 className="font-semibold mb-1">스터디 선택</h3>
                            <p className="text-sm text-neutral-500">관심 분야 스터디를 선택하고 신청합니다</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-neutral-200">
                            <div className="text-2xl font-bold text-[#00B8FF] mb-2">03</div>
                            <h3 className="font-semibold mb-1">함께 성장</h3>
                            <p className="text-sm text-neutral-500">정기 모임에 참여하며 실력을 키웁니다</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
