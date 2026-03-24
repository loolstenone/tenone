"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const subNav = [
    { name: "채용 정보", href: "/bk/hero" },
    { name: "자까", href: "/bk/hero/jakka" },
    { name: "돈츠", href: "/bk/hero/donts" },
    { name: "이력서 등록", href: "/bk/hero/resume" },
    { name: "프리워커 등록", href: "/bk/hero/freelancer" },
];

const jobCategories = [
    { name: "마케팅/광고", count: 45 },
    { name: "디자인", count: 23 },
    { name: "개발/데이터", count: 18 },
    { name: "기획/PM", count: 15 },
    { name: "영업/CS", count: 12 },
    { name: "영상/콘텐츠", count: 9 },
];

const jobPostings = [
    { company: "한컴", title: "광고 기획 AE 4년차 이상 경력직 채용", type: "경력", location: "서울" },
    { company: "", title: "CRM 마케터(신입~2년 이하) 모집", type: "신입/경력", location: "서울" },
    { company: "", title: "퍼포먼스/그로스 마케터 구인", type: "경력", location: "서울" },
    { company: "", title: "글로벌 광고대행사 Sr. Account Manager / 광고기획자 시니어", type: "경력", location: "서울" },
    { company: "종합광고대행사", title: "2D 디자이너 채용", type: "경력", location: "서울" },
    { company: "종합광고대행사", title: "디지털 마케팅 AE 신입 및 경력 채용", type: "신입/경력", location: "서울" },
    { company: "하바스코리아", title: "Media Manager", type: "경력", location: "서울" },
    { company: "하바스코리아", title: "Media Planner", type: "경력", location: "서울" },
    { company: "", title: "[채용연계형 인턴] 디지털 마케팅 AE 채용 (6개월)", type: "인턴", location: "서울" },
    { company: "마스몬스터", title: "디지털 마케팅 AE 채용", type: "경력", location: "서울" },
];

export default function HeroPage() {
    return (
        <div>
            {/* Sub Navigation */}
            <div className="border-b border-neutral-200 bg-white">
                <div className="mx-auto max-w-5xl px-6 flex items-center gap-6 py-3">
                    {subNav.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Hero Banner */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-10">
                    <div className="w-48 h-48 flex-shrink-0 bg-neutral-100 rounded-2xl flex items-center justify-center">
                        <span className="text-8xl">🦸</span>
                    </div>
                    <div className="text-center md:text-left">
                        <div className="inline-block bg-neutral-900 text-white text-xs px-3 py-1 rounded mb-4 font-bold">
                            HeRo
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-light text-neutral-900 mb-2">
                            We<br />believe in<br />your talent
                        </h1>
                    </div>
                </div>
            </section>

            {/* Job Categories */}
            <section className="py-8 px-6 bg-neutral-50">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-wrap gap-3">
                        {jobCategories.map((cat) => (
                            <button
                                key={cat.name}
                                className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700 hover:border-neutral-900 transition-colors"
                            >
                                {cat.name} <span className="text-neutral-400 ml-1">{cat.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job Listings */}
            <section className="py-10 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4">채용 공고</h2>
                    <div className="border-t border-neutral-900">
                        {jobPostings.map((job, i) => (
                            <Link
                                key={i}
                                href="/bk/hero"
                                className="flex items-center justify-between py-4 border-b border-neutral-100 group hover:bg-neutral-50 px-2 -mx-2 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-neutral-900 group-hover:text-blue-600 transition-colors">
                                        {job.company && <span className="text-neutral-500">[{job.company}] </span>}
                                        {job.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-neutral-400">{job.type}</span>
                                        <span className="text-xs text-neutral-400">{job.location}</span>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
