"use client";

import Link from "next/link";
import { Rocket, Target, Heart, Users, Mail, MapPin, Phone, ArrowRight, Sparkles } from "lucide-react";

const values = [
    {
        icon: Rocket,
        title: "실행 중심",
        desc: "이론보다 실전. 아이디어를 내고 끝나는 게 아니라, 직접 만들고 팔아보는 경험을 합니다.",
    },
    {
        icon: Target,
        title: "AI 네이티브",
        desc: "AI 도구를 자연스럽게 활용하는 세대. ChatGPT, 노코드 툴로 혼자서도 MVP를 만들 수 있습니다.",
    },
    {
        icon: Heart,
        title: "따뜻한 투자",
        desc: "수익보다 성장. 부모, 선생님, 이웃이 청소년의 도전을 응원하는 투자 생태계를 만듭니다.",
    },
    {
        icon: Users,
        title: "함께 성장",
        desc: "혼자 하는 창업은 없습니다. 멘토, 동료, 투자자가 함께하는 커뮤니티가 있습니다.",
    },
];

const timeline = [
    { year: "2024", title: "ChangeUp 설립", desc: "AI 시대 청소년 창업 교육의 필요성을 느끼고 프로젝트 시작." },
    { year: "2024", title: "첫 번째 워크숍 개최", desc: "고등학생 20명 대상 AI 비즈니스 워크숍 1기 운영." },
    { year: "2025", title: "Family Fund 론칭", desc: "부모 투자 프로그램 시작. 첫 투자 사례 '에코박스' 탄생." },
    { year: "2025", title: "대학생 부트캠프 시작", desc: "12주 실전 창업 프로그램 1기 운영. 5개 스타트업 배출." },
    { year: "2025", title: "Community Fund 출범", desc: "지역 기업 10곳 참여, 총 5,000만원 규모 펀드 조성." },
    { year: "2026", title: "School Grant 프로그램", desc: "15개 학교 MOU 체결. 교내 창업 동아리 지원 시작." },
];

const team = [
    { name: "전천일", role: "Founder & CEO", desc: "Ten:One Universe 대표. 청소년 교육과 창업 생태계를 연결합니다." },
    { name: "멘토단", role: "Mentors", desc: "현직 스타트업 대표, 투자자, 교수진으로 구성된 멘토 네트워크." },
    { name: "서포터즈", role: "Supporters", desc: "ChangeUp 졸업생이 후배들의 멘토가 되는 선순환 구조." },
];

export default function AboutPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#0F1F2E] to-[#1a3a52] text-white py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
                        <Sparkles className="w-4 h-4 text-[#1AAD64]" />
                        <span>About ChangeUp</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">
                        미래를 만드는 일,<br />
                        <span className="text-[#1AAD64]">창업</span>
                    </h1>
                    <p className="mt-6 text-lg text-neutral-300 max-w-2xl leading-relaxed">
                        ChangeUp은 AI 시대 고등학생·대학생을 위한 창업 교육 플랫폼입니다.
                        아이디어를 현실로 바꾸는 교육과, 부모·학교·지역사회가 함께 투자하는
                        새로운 창업 생태계를 만들어갑니다.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-12">우리의 가치</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v) => (
                            <div key={v.title} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-[#1AAD64]/10 flex items-center justify-center mx-auto mb-4">
                                    <v.icon className="w-7 h-7 text-[#1AAD64]" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 bg-neutral-50">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-12">우리의 여정</h2>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#1AAD64]/20" />
                        <div className="space-y-8">
                            {timeline.map((item, i) => (
                                <div key={i} className="relative pl-12">
                                    <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-[#1AAD64] border-2 border-white" />
                                    <div>
                                        <span className="text-xs font-bold text-[#1AAD64]">{item.year}</span>
                                        <h3 className="text-base font-bold mt-1">{item.title}</h3>
                                        <p className="text-sm text-neutral-500 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-12">팀</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member) => (
                            <div key={member.name} className="text-center border border-neutral-200 rounded-2xl p-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1AAD64] to-[#256EFF] flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-black text-white">{member.name[0]}</span>
                                </div>
                                <h3 className="text-lg font-bold">{member.name}</h3>
                                <p className="text-sm text-[#1AAD64] font-medium mt-1">{member.role}</p>
                                <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{member.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="py-20 bg-[#0F1F2E] text-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-6 md:gap-12">
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold mb-6">문의하기</h2>
                            <p className="text-neutral-400 leading-relaxed mb-8">
                                프로그램 참가, 투자 문의, 학교 협력 등
                                무엇이든 편하게 연락주세요.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-5 h-5 text-[#1AAD64]" />
                                    <span>hello@changeup.company</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-5 h-5 text-[#1AAD64]" />
                                    <span>서울특별시</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-8">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="이름"
                                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#1AAD64]"
                                />
                                <input
                                    type="email"
                                    placeholder="이메일"
                                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#1AAD64]"
                                />
                                <select className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1AAD64]">
                                    <option value="">문의 유형 선택</option>
                                    <option value="program">프로그램 참가</option>
                                    <option value="invest">투자 문의</option>
                                    <option value="school">학교 협력</option>
                                    <option value="mentor">멘토 지원</option>
                                    <option value="etc">기타</option>
                                </select>
                                <textarea
                                    rows={4}
                                    placeholder="문의 내용"
                                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#1AAD64] resize-none"
                                />
                                <button className="w-full bg-[#1AAD64] hover:bg-[#148F52] text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                                    보내기 <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
