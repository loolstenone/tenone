"use client";

import Link from "next/link";
import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";

const upcomingEvents = [
    { date: "2026.04.12 (토)", time: "18:30", title: "시니어 비즈니스 네트워킹 디너", location: "서울 강남 르메르디앙", type: "네트워킹", capacity: "30명", remaining: 12, desc: "분기별 대규모 네트워킹 디너. 다양한 업계의 시니어 비즈니스맨들과 교류하세요." },
    { date: "2026.04.19 (토)", time: "10:00", title: "은퇴 후 자산관리 세미나", location: "온라인 Zoom", type: "세미나", capacity: "100명", remaining: 45, desc: "전직 증권사 임원이 전하는 은퇴 후 자산관리 전략. 포트폴리오 리밸런싱부터 세금 절감까지." },
    { date: "2026.04.26 (토)", time: "07:00", title: "Domo 골프 라운딩", location: "경기도 용인 레이크사이드CC", type: "친목", capacity: "16명", remaining: 4, desc: "멤버 전용 월례 골프 모임. 라운딩 후 점심 식사와 담소의 시간." },
    { date: "2026.05.03 (토)", time: "14:00", title: "스타트업 투자 설명회", location: "서울 여의도 IFC", type: "투자", capacity: "50명", remaining: 28, desc: "유망 스타트업 3개사의 투자 설명회. 엔젤 투자에 관심 있는 멤버를 위한 자리." },
    { date: "2026.05.10 (토)", time: "15:00", title: "시니어 퍼스널 브랜딩 워크숍", location: "서울 강남 위워크", type: "워크숍", capacity: "20명", remaining: 8, desc: "30년 경력을 브랜드로. 개인 브랜딩 전문가와 함께하는 실전 워크숍." },
    { date: "2026.05.17 (토)", time: "11:00", title: "와인 & 비즈니스 토크", location: "서울 이태원 와인바", type: "친목", capacity: "24명", remaining: 16, desc: "좋은 와인과 함께하는 비즈니스 이야기. 소믈리에의 와인 강연도 함께." },
];

const pastEvents = [
    { date: "2026.03.15", title: "창업 멘토링 세션", location: "서울 강남", attendees: 22 },
    { date: "2026.03.08", title: "부동산 투자 세미나", location: "온라인", attendees: 78 },
    { date: "2026.03.01", title: "Domo 골프 라운딩", location: "경기도 이천", attendees: 16 },
    { date: "2026.02.22", title: "시니어 비즈니스 네트워킹", location: "서울 여의도", attendees: 34 },
];

const typeColors: Record<string, string> = {
    "네트워킹": "bg-blue-50 text-blue-700 border-blue-200",
    "세미나": "bg-green-50 text-green-700 border-green-200",
    "친목": "bg-amber-50 text-amber-700 border-amber-200",
    "투자": "bg-purple-50 text-purple-700 border-purple-200",
    "워크숍": "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DomoEvents() {
    return (
        <div>
            {/* Hero */}
            <section className="py-24 px-6 bg-gradient-to-br from-[#2D1B2E] to-[#1E1220] text-white">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-5xl md:text-6xl font-black mb-6">이벤트</h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        함께하는 시간이 기회가 됩니다.<br />
                        네트워킹, 세미나, 골프, 투자 설명회까지.
                    </p>
                </div>
            </section>

            {/* 다가오는 이벤트 */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-10">다가오는 이벤트</h2>
                    <div className="space-y-5">
                        {upcomingEvents.map((ev, i) => (
                            <div key={i} className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* 날짜 */}
                                    <div className="shrink-0 lg:w-28 lg:text-center">
                                        <p className="text-sm font-bold text-[#7F1146]">{ev.date}</p>
                                        <p className="text-xs text-neutral-500">{ev.time}</p>
                                    </div>

                                    {/* 내용 */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${typeColors[ev.type] || "bg-neutral-100 text-neutral-600"}`}>{ev.type}</span>
                                            {ev.remaining <= 5 && <span className="text-[10px] text-red-500 font-bold">마감 임박!</span>}
                                        </div>
                                        <h3 className="font-bold text-neutral-900 mb-1">{ev.title}</h3>
                                        <p className="text-sm text-neutral-600 mb-2">{ev.desc}</p>
                                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {ev.location}</span>
                                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ev.capacity} (잔여 {ev.remaining}석)</span>
                                        </div>
                                    </div>

                                    {/* 버튼 */}
                                    <div className="shrink-0">
                                        <button className="bg-[#7F1146] hover:bg-[#5C0C33] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                                            신청하기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 구분선 */}
            <div className="mx-auto max-w-5xl border-t border-neutral-200" />

            {/* 지난 이벤트 */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-8">지난 이벤트</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {pastEvents.map((ev, i) => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-neutral-200">
                                <p className="text-xs text-neutral-500 mb-1">{ev.date}</p>
                                <h3 className="font-bold text-sm text-neutral-900 mb-2">{ev.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-neutral-500">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {ev.location}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ev.attendees}명</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-[#2D1B2E] text-white text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4">이벤트 참여는 멤버 전용입니다</h2>
                    <p className="text-white/60 mb-6">가입 후 다양한 네트워킹 이벤트에 참여하세요.</p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 bg-[#7F1146] hover:bg-[#A3194F] text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                        멤버 가입하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
