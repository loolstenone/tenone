"use client";

import Link from "next/link";
import { ArrowRight, Target, Users, Briefcase, Heart } from "lucide-react";

const timeline = [
    { year: "2024", title: "Domo 구상", desc: "시니어 비즈니스맨 네트워킹의 필요성 인식" },
    { year: "2025", title: "커뮤니티 시작", desc: "소규모 네트워킹 모임 및 파일럿 서비스 운영" },
    { year: "2026", title: "플랫폼 런칭", desc: "준비서 서비스, 기획 컨설팅, 투자 자문 정식 오픈" },
    { year: "2027~", title: "확장", desc: "전국 네트워크 확대 및 해외 시니어 커뮤니티 연계" },
];

const whyDomo = [
    { icon: Target, title: "명확한 타깃", desc: "정년·은퇴를 앞두거나 이미 새 도전을 시작한 50~65세 비즈니스맨" },
    { icon: Users, title: "검증된 멤버", desc: "각 분야에서 20년 이상 경력의 시니어 전문가들로 구성" },
    { icon: Briefcase, title: "실질적 서비스", desc: "모임만이 아닌, 준비서·기획·투자자문 등 실질적인 비즈니스 지원" },
    { icon: Heart, title: "진정성 있는 관계", desc: "숫자가 아닌 깊이, 양보다 질을 추구하는 네트워킹" },
];

export default function DomoAbout() {
    return (
        <div>
            {/* Hero */}
            <section className="py-24 px-6 bg-gradient-to-br from-[#2D1B2E] to-[#1E1220] text-white">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">도모(Domo)란?</h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                        &lsquo;도모하다&rsquo; — 어떤 일을 이루기 위하여 미리 대책과 방법을 세움.<br />
                        인생 후반전을 함께 기획하고, 준비하고, 실행하는 플랫폼입니다.
                    </p>
                </div>
            </section>

            {/* 우리가 하는 일 */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-xl md:text-3xl font-bold text-neutral-900 mb-4">왜 Domo인가?</h2>
                    <p className="text-neutral-500 mb-10">기존 시니어 모임과 다른 점</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {whyDomo.map((item) => (
                            <div key={item.title} className="flex items-start gap-4 p-6 rounded-xl border border-neutral-200">
                                <div className="w-12 h-12 shrink-0 bg-[#7F1146]/10 rounded-lg flex items-center justify-center">
                                    <item.icon className="h-6 w-6 text-[#7F1146]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 타임라인 */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-xl md:text-3xl font-bold text-neutral-900 mb-10 text-center">로드맵</h2>
                    <div className="space-y-8">
                        {timeline.map((item, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="shrink-0 w-16 text-right">
                                    <span className="text-sm font-bold text-[#7F1146]">{item.year}</span>
                                </div>
                                <div className="relative pb-8">
                                    <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-[#7F1146]" />
                                    {i < timeline.length - 1 && <div className="absolute left-1.5 top-5 w-px h-full bg-neutral-300" />}
                                    <div className="ml-8">
                                        <h3 className="font-bold text-neutral-900">{item.title}</h3>
                                        <p className="text-sm text-neutral-600 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 대상 */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-xl md:text-3xl font-bold text-neutral-900 mb-10 text-center">이런 분들을 위해 만들었습니다</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            "정년을 앞두고 은퇴 후 계획을 세우고 싶은 분",
                            "이미 은퇴했지만 집에만 있기 답답한 분",
                            "돈은 있는데 의미 있게 쓸 곳을 찾는 분",
                            "새로운 사업이나 투자에 관심 있는 분",
                            "같은 세대의 비즈니스맨들과 교류하고 싶은 분",
                            "경험과 노하우를 나누고 싶은 분",
                            "기획이나 컨설팅 도움이 필요한 분",
                            "골프, 여행 등 취미를 함께 할 동료를 찾는 분",
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50">
                                <div className="w-6 h-6 shrink-0 bg-[#7F1146]/10 rounded-full flex items-center justify-center">
                                    <span className="text-[#7F1146] text-xs font-bold">{i + 1}</span>
                                </div>
                                <p className="text-sm text-neutral-700">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-[#2D1B2E] text-white text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4">함께 도모할 준비가 되셨나요?</h2>
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
