"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, BookOpen, Award, Users, Play, Clock, Star, MessageSquare, Briefcase } from "lucide-react";

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

const instructors = [
    { name: "김현우", role: "마케팅 디렉터", company: "전 네이버", course: "마케팅 기초 부트캠프", rating: 4.9 },
    { name: "이서연", role: "데이터 사이언티스트", company: "전 쿠팡", course: "데이터 분석 실무", rating: 4.8 },
    { name: "박준혁", role: "브랜드 컨설턴트", company: "Brand Gravity", course: "브랜딩 전략 마스터클래스", rating: 4.9 },
];

const reviews = [
    { name: "정수민", course: "AI 활용 콘텐츠 제작", text: "실무에서 바로 쓸 수 있는 AI 도구를 배웠습니다. 업무 효율이 3배는 올랐어요.", rating: 5 },
    { name: "한지윤", course: "기획서 작성법 (Vrief)", text: "Vrief 프레임워크 덕분에 기획서 구조가 확 잡혔습니다. 팀장님이 놀랐어요.", rating: 5 },
    { name: "최도현", course: "프로젝트 매니지먼트", text: "체계적인 PM 방법론을 배울 수 있었습니다. HeRo 통해 이직도 성공했어요.", rating: 5 },
];

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
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 mb-20 rounded-xl overflow-hidden">
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

                {/* Instructors */}
                <section className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-3">Instructors</h2>
                    <p className="text-lg font-bold mb-8">현업 전문가가 직접 가르칩니다</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {instructors.map(i => (
                            <div key={i.name} className="p-5 border border-slate-800 rounded-xl text-center hover:border-cyan-500/30 transition">
                                <div className="w-14 h-14 rounded-full bg-cyan-500/10 mx-auto mb-3 flex items-center justify-center text-xl font-bold text-cyan-400">
                                    {i.name.charAt(0)}
                                </div>
                                <h3 className="text-sm font-bold">{i.name}</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">{i.role} · {i.company}</p>
                                <p className="text-[10px] text-cyan-400 mt-2">{i.course}</p>
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span className="text-xs text-amber-400">{i.rating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
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
                                            <span className="text-[10px] text-slate-700">·</span>
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

                {/* Reviews */}
                <section className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-slate-500 mb-3">Reviews</h2>
                    <p className="text-lg font-bold mb-8">수강생이 말하는 Evolution School</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {reviews.map(r => (
                            <div key={r.name} className="p-5 border border-slate-800 rounded-xl hover:border-cyan-500/30 transition">
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(r.rating)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed mb-3">{r.text}</p>
                                <div className="border-t border-slate-800 pt-3">
                                    <p className="text-[10px] font-medium">{r.name}</p>
                                    <p className="text-[9px] text-slate-600">{r.course}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pipeline */}
                <section className="p-8 border border-slate-800 rounded-xl text-center mb-20">
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

                {/* CTA */}
                <section className="text-center">
                    <h2 className="text-2xl font-bold mb-3">당신의 진화, 여기서 시작됩니다</h2>
                    <p className="text-sm text-slate-400 mb-6">첫 과정은 무료로 체험할 수 있습니다.</p>
                    <Link href="#courses" className="inline-flex items-center gap-2 px-8 py-3.5 bg-cyan-500 text-black text-sm font-bold rounded-lg hover:bg-cyan-400 transition">
                        무료 체험 시작 <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </div>

            <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-600">
                &copy; Evolution School. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
            </footer>
        </div>
    );
}
