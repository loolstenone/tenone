"use client";

import { MapPin, Users, Heart, Lightbulb, TreePine, MessageCircle, Mail, Phone, TrendingDown, Brain, HandHeart } from "lucide-react";

const challenges = [
    {
        icon: TrendingDown,
        title: "지역 소멸",
        desc: "전국 228개 시군구 중 절반 이상이 소멸 위험 지역. 젊은이들은 떠나고, 마을은 텅 비어간다.",
    },
    {
        icon: Users,
        title: "초고령화",
        desc: "고령화율 20%를 넘긴 초고령 사회. 홀로 사는 어르신들이 늘어나고 돌봄의 사각지대가 확대되고 있다.",
    },
    {
        icon: Brain,
        title: "AI 시대의 격차",
        desc: "디지털 전환이 가속화되면서 도시와 지역 간 정보 격차는 더욱 벌어지고 있다.",
    },
];

const programs = [
    {
        icon: MapPin,
        title: "동네 지도",
        desc: "우리 동네의 숨은 이야기를 발굴하고 기록합니다. 오래된 가게, 골목, 사람들의 이야기를 지도 위에 담습니다.",
        color: "bg-[#10B981]/10",
        textColor: "text-[#10B981]",
    },
    {
        icon: HandHeart,
        title: "세대 연결",
        desc: "어르신들의 경험과 지혜를 청년들의 기술과 연결합니다. 서로 배우고 가르치는 세대 간 교류 프로그램.",
        color: "bg-amber-500/10",
        textColor: "text-amber-600",
    },
    {
        icon: Lightbulb,
        title: "로컬 크리에이터",
        desc: "지역의 자원과 문화를 활용한 소규모 비즈니스를 지원합니다. 로컬 브랜드, 공방, 체험 프로그램.",
        color: "bg-blue-500/10",
        textColor: "text-blue-600",
    },
    {
        icon: Brain,
        title: "AI 리터러시",
        desc: "AI 시대에 뒤처지지 않도록 지역 주민을 위한 디지털 교육과 AI 활용 프로그램을 운영합니다.",
        color: "bg-purple-500/10",
        textColor: "text-purple-600",
    },
    {
        icon: TreePine,
        title: "귀농·귀촌 네트워크",
        desc: "도시에서 지역으로의 이주를 고민하는 사람들을 위한 정보와 네트워크를 제공합니다.",
        color: "bg-emerald-600/10",
        textColor: "text-emerald-700",
    },
    {
        icon: Heart,
        title: "돌봄 커뮤니티",
        desc: "이웃이 이웃을 돌보는 따뜻한 공동체. 독거 어르신 안부 확인부터 공동 육아까지.",
        color: "bg-rose-500/10",
        textColor: "text-rose-600",
    },
];

const stories = [
    {
        location: "강원도 정선",
        title: "탄광촌의 두 번째 봄",
        excerpt: "석탄산업 합리화 이후 침체된 정선이 자연과 문화로 새로운 활력을 찾고 있다.",
    },
    {
        location: "전남 신안",
        title: "1004개의 섬, 보라빛 꿈",
        excerpt: "퍼플섬 프로젝트로 세계적 관광지가 된 작은 섬마을의 이야기.",
    },
    {
        location: "경북 의성",
        title: "청년이 돌아온 마을",
        excerpt: "소멸 위험 1위에서 청년 유입으로 변화를 만들어가는 의성의 도전.",
    },
];

export default function TownityHome() {
    return (
        <div>
            {/* ── 히어로 섹션 ── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/8 via-white to-amber-50/30" />
                <div className="relative mx-auto max-w-4xl px-6 py-20 md:py-32 text-center">
                    <p className="text-[#10B981] text-sm font-semibold tracking-widest uppercase mb-4">
                        Town Community
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight mb-6">
                        지역이 살아야<br className="hidden md:block" /> 우리가 산다
                    </h1>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        인공지능 시대, 지역 소멸과 고령화에 맞서는 지역 기반 커뮤니티.
                        <br />
                        <strong className="text-[#10B981]">타우니티(Townity)</strong>는
                        &lsquo;Town&rsquo;과 &lsquo;Community&rsquo;의 합성어로,
                        사라져가는 마을에 다시 사람의 온기를 불어넣는 프로젝트입니다.
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-neutral-500">
                        <TreePine className="h-4 w-4 text-[#10B981]" />
                        <span>모든 것이 모이는 곳</span>
                    </div>
                </div>
            </section>

            {/* ── 왜 타우니티인가 (About) ── */}
            <section id="about" className="py-20 px-6 bg-neutral-50 scroll-mt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold tracking-widest uppercase text-[#10B981] mb-4 block">Why Townity</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            왜 타우니티인가
                        </h2>
                        <p className="text-neutral-600 max-w-xl mx-auto">
                            대한민국의 지역은 지금, 가장 어려운 시기를 지나고 있습니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {challenges.map((item) => (
                            <div key={item.title} className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-[#10B981]/30 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-4">
                                    <item.icon className="h-6 w-6 text-[#10B981]" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 우리 동네 프로그램 (Town) ── */}
            <section id="town" className="py-20 px-6 scroll-mt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold tracking-widest uppercase text-[#10B981] mb-4 block">Our Programs</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            우리 동네 프로그램
                        </h2>
                        <p className="text-neutral-600 max-w-xl mx-auto">
                            지역을 살리는 것은 거창한 정책이 아니라, 이웃과 이웃이 연결되는 작은 실천입니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((item) => (
                            <div key={item.title} className="bg-white rounded-2xl p-8 border border-neutral-200 hover:shadow-lg transition-all group">
                                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                                    <item.icon className={`h-6 w-6 ${item.textColor}`} />
                                </div>
                                <h3 className="font-bold text-lg mb-2 group-hover:text-[#10B981] transition-colors">{item.title}</h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 함께 해요 (Together) ── */}
            <section id="together" className="py-20 px-6 bg-[#10B981]/5 scroll-mt-16">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="text-sm font-semibold tracking-widest uppercase text-[#10B981] mb-4 block">Join Us</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                        함께 해요
                    </h2>
                    <p className="text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-12">
                        타우니티는 지역을 사랑하는 모든 사람에게 열려 있습니다.
                        로컬 크리에이터, 귀농·귀촌을 꿈꾸는 분, 지역 활성화에 관심 있는 누구나 환영합니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-8 border border-neutral-200">
                            <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-7 w-7 text-[#10B981]" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">주민</h3>
                            <p className="text-sm text-neutral-600">
                                우리 동네를 더 잘 알고 싶은 주민이라면 누구나 참여할 수 있습니다.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-neutral-200">
                            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                                <Lightbulb className="h-7 w-7 text-amber-600" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">크리에이터</h3>
                            <p className="text-sm text-neutral-600">
                                지역의 가치를 발굴하고 콘텐츠로 만들어내는 로컬 크리에이터를 찾습니다.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 border border-neutral-200">
                            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                <HandHeart className="h-7 w-7 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">파트너</h3>
                            <p className="text-sm text-neutral-600">
                                지자체, 사회적 기업, 비영리 단체 등 지역 활성화에 함께할 파트너를 모십니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 이야기 (Stories) ── */}
            <section id="stories" className="py-20 px-6 scroll-mt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold tracking-widest uppercase text-[#10B981] mb-4 block">Stories</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            지역의 이야기
                        </h2>
                        <p className="text-neutral-600 max-w-xl mx-auto">
                            변화를 만들어가는 지역들의 이야기를 소개합니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stories.map((story) => (
                            <article key={story.title} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                                <div className="h-48 bg-gradient-to-br from-[#10B981]/20 to-emerald-100 flex items-center justify-center">
                                    <MapPin className="h-12 w-12 text-[#10B981]/40" />
                                </div>
                                <div className="p-6">
                                    <span className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">
                                        {story.location}
                                    </span>
                                    <h3 className="font-bold text-lg mt-2 mb-3 group-hover:text-[#10B981] transition-colors">
                                        {story.title}
                                    </h3>
                                    <p className="text-sm text-neutral-600 leading-relaxed">
                                        {story.excerpt}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                    <p className="text-center text-sm text-neutral-400 mt-8">
                        * 콘텐츠는 준비 중입니다
                    </p>
                </div>
            </section>

            {/* ── Contact ── */}
            <section className="py-16 px-6 border-t border-neutral-200">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Contact</h2>
                    <p className="text-neutral-600 mb-8">타우니티 프로젝트에 관심이 있으시다면 연락 주세요.</p>
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-neutral-600">
                        <a href="mailto:lools@tenone.biz" className="inline-flex items-center gap-2 hover:text-[#10B981] transition-colors">
                            <Mail className="h-4 w-4" />
                            lools@tenone.biz
                        </a>
                        <span className="inline-flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            +82 10 2795 1001
                        </span>
                        <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[#10B981] transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            카카오톡 오픈채팅
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
