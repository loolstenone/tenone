"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, BookOpen, Award, Users, Play, Clock } from "lucide-react";

const courses = [
    { title: "마케팅 기초 부트캠프", category: "Marketing", duration: "4주", level: "입문", students: 128 },
    { title: "데이터 분석 실무", category: "Data", duration: "6주", level: "중급", students: 85 },
    { title: "브랜딩 전략 마스터클래스", category: "Branding", duration: "3주", level: "고급", students: 42 },
    { title: "AI 활용 콘텐츠 제작", category: "AI", duration: "4주", level: "입문", students: 156 },
    { title: "프로젝트 매니지먼트", category: "PM", duration: "5주", level: "중급", students: 67 },
    { title: "기획서 작성법 (Vrief)", category: "Planning", duration: "2주", level: "입문", students: 203 },
];

const levelColor: Record<string, string> = {
    "입문": "bg-emerald-500/10 text-emerald-500",
    "중급": "bg-blue-500/10 text-blue-500",
    "고급": "bg-purple-500/10 text-purple-500",
};

export default function EvoSchoolPage() {
    return (
        <div className="min-h-screen bg-[#0F0F23] text-white">
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                {/* Hero */}
                <section className="mb-20">
                    <p className="text-xs tracking-[0.3em] uppercase text-cyan-400 mb-4">Evolution School</p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
                        진화는<br />배움에서 시작된다
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl leading-relaxed mb-8">
                        현업 전문가가 가르치는 실전 직무 교육. Badak 네트워크의 멘토가 강사로, HeRo를 통해 수료생이 기업과 연결됩니다.
                    </p>
                    <div className="flex gap-3">
                        <Link href="#courses" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black text-sm font-bold rounded-lg hover:bg-cyan-400 transition">
                            과정 둘러보기 <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-700 text-sm rounded-lg hover:border-slate-500 transition">
                            Ten:One Universe
                        </Link>
                    </div>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-4 gap-px bg-white/5 mb-20 rounded-xl overflow-hidden">
                    {[
                        { icon: BookOpen, value: "24", label: "과정" },
                        { icon: Users, value: "680+", label: "수강생" },
                        { icon: Award, value: "92%", label: "수료율" },
                        { icon: GraduationCap, value: "15", label: "현업 강사" },
                    ].map(s => (
                        <div key={s.label} className="bg-[#0F0F23] p-5 text-center">
                            <s.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                            <div className="text-xl font-bold">{s.value}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </section>

                {/* Courses */}
                <section id="courses" className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-6">인기 과정</h2>
                    <div className="space-y-3">
                        {courses.map(c => (
                            <div key={c.title} className="group flex items-center justify-between p-4 border border-slate-800 rounded-xl hover:border-cyan-500/30 transition cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                                        <Play className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium group-hover:text-cyan-400 transition">{c.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-600">{c.category}</span>
                                            <span className="text-[10px] text-slate-700">•</span>
                                            <span className="flex items-center gap-1 text-[10px] text-slate-600"><Clock className="w-2.5 h-2.5" />{c.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${levelColor[c.level]}`}>{c.level}</span>
                                    <span className="text-[10px] text-slate-600">{c.students}명</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pipeline */}
                <section className="p-8 border border-slate-800 rounded-xl text-center">
                    <GraduationCap className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">교육 → 커리어 파이프라인</h3>
                    <p className="text-sm text-slate-400 max-w-lg mx-auto mb-4">
                        Evolution School 수료 → HeRo 인재 등록 → 기업 매칭. 배움이 곧 커리어로 연결됩니다.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <span className="px-3 py-1 border border-cyan-500/30 rounded text-cyan-400">Evo School</span>
                        <span>→</span>
                        <span className="px-3 py-1 border border-slate-700 rounded">HeRo</span>
                        <span>→</span>
                        <span className="px-3 py-1 border border-slate-700 rounded">기업</span>
                    </div>
                </section>
            </div>

            <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-600">
                &copy; Evolution School. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
            </footer>
        </div>
    );
}
