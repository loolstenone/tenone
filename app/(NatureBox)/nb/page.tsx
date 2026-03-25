"use client";

import { Leaf, Mountain, Sun, Package, MapPin, Mail, Phone, MessageCircle, Sprout, Heart, Truck } from "lucide-react";

const products = [
    {
        name: "산나물 모둠",
        desc: "정선 고산지대에서 자연 채취한 곤드레, 취나물, 참나물 등 제철 산나물 모둠.",
        tag: "제철 한정",
    },
    {
        name: "곤드레 나물밥 세트",
        desc: "정선의 대표 먹거리. 직접 수확한 곤드레와 정선 쌀로 간편하게 즐기는 곤드레밥 세트.",
        tag: "인기",
    },
    {
        name: "메밀 가루",
        desc: "강원도 메밀의 고소한 풍미를 그대로. 전통 방식으로 빻은 100% 국내산 메밀 가루.",
        tag: "전통",
    },
    {
        name: "산양삼",
        desc: "해발 700m 한소농장에서 자연 방식으로 키운 산양삼. 최소 7년 이상 재배.",
        tag: "프리미엄",
    },
    {
        name: "잡곡 세트",
        desc: "정선 고랭지에서 재배한 수수, 기장, 조, 팥 등 건강한 잡곡 모둠.",
        tag: "건강",
    },
    {
        name: "들기름·참기름",
        desc: "저온 압착 방식으로 짠 고소한 들기름과 참기름. 정선 로컬 원료 100%.",
        tag: "전통",
    },
];

const jeongseonFeatures = [
    {
        icon: Mountain,
        title: "해발 700m 고산지대",
        desc: "깨끗한 공기와 일교차가 큰 기후가 만드는 건강한 작물. 오염 없는 자연 환경에서 자랍니다.",
    },
    {
        icon: Sun,
        title: "사계절의 선물",
        desc: "봄에는 산나물, 여름에는 고랭지 채소, 가을에는 곡물, 겨울에는 약초. 계절마다 자연의 선물을 담습니다.",
    },
    {
        icon: Sprout,
        title: "전통 농법",
        desc: "화학 비료와 농약을 최소화하고, 자연이 키우는 방식을 고집합니다. 느리지만 건강한 먹거리.",
    },
];

const values = [
    {
        icon: Leaf,
        title: "자연 그대로",
        desc: "자연이 키운 것을 자연 그대로 전합니다. 최소한의 가공, 최대한의 정성.",
    },
    {
        icon: Heart,
        title: "정직한 먹거리",
        desc: "우리 가족이 먹는 것처럼 정직하게 만듭니다. 원산지, 재배 방법 모두 투명하게 공개합니다.",
    },
    {
        icon: Truck,
        title: "산지 직송",
        desc: "중간 유통 없이 농장에서 식탁까지. 가장 신선한 상태로 전달합니다.",
    },
];

export default function NatureBoxHome() {
    return (
        <div>
            {/* ── 히어로 섹션 ── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6B8E23]/8 via-white to-amber-50/20" />
                <div className="relative mx-auto max-w-4xl px-6 py-20 md:py-32 text-center">
                    <p className="text-[#6B8E23] text-sm font-semibold tracking-widest uppercase mb-4">
                        NatureBox from Jeongseon
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight mb-6">
                        정선의 자연을<br className="hidden md:block" /> 담다
                    </h1>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        강원도 정선군 화암면, 해발 700m 한소농장.
                        <br />
                        <strong className="text-[#6B8E23]">자연함(NatureBox)</strong>은
                        자연이 키운 건강한 먹거리를 정직하게 전하는 자연식품 브랜드입니다.
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-neutral-500">
                        <Mountain className="h-4 w-4 text-[#6B8E23]" />
                        <span>강원도 정선군 화암면 용소길 258 · 한소농장</span>
                    </div>
                </div>
            </section>

            {/* ── 자연함 이야기 (About) ── */}
            <section id="about" className="py-20 px-6 bg-neutral-50 scroll-mt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-10 md:mb-16">
                        <span className="text-sm font-semibold tracking-widest uppercase text-[#6B8E23] mb-4 block">Our Story</span>
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                            자연함 이야기
                        </h2>
                        <p className="text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                            &lsquo;자연함&rsquo;은 &lsquo;자연&rsquo;과 &lsquo;함(箱, 상자)&rsquo;의 합성어입니다.
                            정선의 산과 들에서 자란 건강한 먹거리를 한 상자에 정성껏 담아 전합니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {values.map((item) => (
                            <div key={item.title} className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-[#6B8E23]/30 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 rounded-xl bg-[#6B8E23]/10 flex items-center justify-center mb-4">
                                    <item.icon className="h-6 w-6 text-[#6B8E23]" />
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

            {/* ── 우리 먹거리 (Products) ── */}
            <section id="products" className="py-20 px-6 scroll-mt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-10 md:mb-16">
                        <span className="text-sm font-semibold tracking-widest uppercase text-[#6B8E23] mb-4 block">Products</span>
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                            우리 먹거리
                        </h2>
                        <p className="text-neutral-600 max-w-xl mx-auto">
                            한소농장에서 정성껏 키우고 수확한 자연식품들입니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((item) => (
                            <div key={item.name} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                                <div className="h-44 bg-gradient-to-br from-[#6B8E23]/15 to-[#8FBC8F]/20 flex items-center justify-center">
                                    <Package className="h-12 w-12 text-[#6B8E23]/30" />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-lg group-hover:text-[#6B8E23] transition-colors">{item.name}</h3>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#6B8E23]/10 text-[#6B8E23] font-medium">
                                            {item.tag}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-600 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-neutral-400 mt-8">
                        * 상품 이미지 및 상세 정보는 준비 중입니다
                    </p>
                </div>
            </section>

            {/* ── 정선 이야기 (Jeongseon) ── */}
            <section id="jeongseon" className="py-20 px-6 bg-[#6B8E23]/5 scroll-mt-16">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-10 md:mb-16">
                        <span className="text-sm font-semibold tracking-widest uppercase text-[#6B8E23] mb-4 block">Jeongseon</span>
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                            정선 이야기
                        </h2>
                        <p className="text-neutral-600 max-w-xl mx-auto">
                            태백산맥 자락, 깨끗한 자연이 살아 숨 쉬는 강원도 정선.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {jeongseonFeatures.map((item) => (
                            <div key={item.title} className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <item.icon className="h-8 w-8 text-[#6B8E23]" />
                                </div>
                                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                                <p className="text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 오시는 길 (Visit) ── */}
            <section id="visit" className="py-20 px-6 scroll-mt-16">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <span className="text-sm font-semibold tracking-widest uppercase text-[#6B8E23] mb-4 block">Visit Us</span>
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                            오시는 길
                        </h2>
                    </div>

                    <div className="bg-neutral-50 rounded-2xl p-8 md:p-12 border border-neutral-200">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-[#6B8E23]/10 flex items-center justify-center shrink-0">
                                <MapPin className="h-5 w-5 text-[#6B8E23]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">한소농장</h3>
                                <p className="text-neutral-600">강원도 정선군 화암면 용소길 258</p>
                            </div>
                        </div>

                        <div className="aspect-[16/9] bg-neutral-200 rounded-xl flex items-center justify-center mb-6">
                            <div className="text-center text-neutral-400">
                                <MapPin className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">지도 준비 중</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-neutral-200">
                                <Mail className="h-4 w-4 text-[#6B8E23]" />
                                <a href="https://tenone.biz/contact" className="hover:text-[#6B8E23] transition-colors">
                                    tenone.biz/contact
                                </a>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-neutral-200">
                                <Phone className="h-4 w-4 text-[#6B8E23]" />
                                <span>+82 10 2795 1001</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-neutral-200">
                                <MessageCircle className="h-4 w-4 text-[#6B8E23]" />
                                <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="hover:text-[#6B8E23] transition-colors">
                                    카카오톡 오픈채팅
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
