"use client";

import Link from "next/link";

const milestones = [
    { year: "2020", event: "바닥 커뮤니티 시작 - 마케팅/광고 업계 네트워킹 채널 개설" },
    { year: "2021", event: "Badak 정식 커뮤니티 출범, 오프라인 네트워킹 시작" },
    { year: "2022", event: "HeRo 채용 플랫폼 런칭, 바카데미 교육 프로그램 시작" },
    { year: "2023", event: "바닥 상회 오픈 - 마케터를 위한 무료 템플릿 제공" },
    { year: "2024", event: "Jakka 작가 추천 서비스 시작, 레퍼런스 창고 오픈" },
    { year: "2025", event: "Ten:One Universe 합류, YouInOne 지원 시작" },
    { year: "2026", event: "플래너'스 플래너 시리즈 출시, 커뮤니티 리뉴얼" },
];

const values = [
    { title: "약한 연결의 힘", description: "가벼운 연결이 만드는 강력한 기회. 우연한 만남에서 시작되는 협업과 성장을 믿습니다." },
    { title: "현장의 목소리", description: "마케팅/광고 업계에서 실제로 일하는 사람들의 생생한 이야기와 인사이트를 나눕니다." },
    { title: "함께 성장", description: "정보 공유, 네트워킹, 교육을 통해 업계 전체가 함께 성장하는 생태계를 만들어갑니다." },
];

export default function AboutPage() {
    return (
        <div>
            {/* Hero */}
            <section className="py-20 px-6 text-center">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-black text-neutral-900 mb-6">Badak</h1>
                    <p className="text-lg text-neutral-500 mb-2">마케팅 광고 네트워킹 커뮤니티</p>
                    <p className="text-neutral-400 text-sm">약한 연결 고리가 만드는 강력한 기회</p>
                </div>
            </section>

            {/* 소개 */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="mx-auto max-w-3xl">
                    <p className="text-neutral-700 leading-relaxed">
                        <strong>Badak</strong>은 마케팅 업계 네트워킹 커뮤니티입니다.
                        R&D, 상품 기획, 서비스 기획, 광고, 홍보, 영업, 유통, CS, 매체, 팹, 디자인,
                        퍼포먼스, 소셜, 데이터, 개발, 영상 제작, 모델, 작가, 컨설턴트 등
                        다양한 업계 분들과 만나고 싶습니다.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((value) => (
                            <div key={value.title} className="text-center">
                                <h3 className="text-lg font-bold text-neutral-900 mb-3">{value.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="mx-auto max-w-3xl">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">History</h2>
                    <div className="space-y-0">
                        {milestones.map((m) => (
                            <div key={m.year} className="flex items-start gap-6 py-4 border-b border-neutral-200">
                                <span className="text-lg font-bold text-neutral-900 w-16 shrink-0">{m.year}</span>
                                <p className="text-sm text-neutral-600">{m.event}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Universe */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">Ten:One Universe</h2>
                    <p className="text-sm text-neutral-500 mb-8">Badak은 Ten:One Universe의 네트워킹 커뮤니티 브랜드입니다.</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        {[
                            { name: "MAD League", href: "https://madleague.net" },
                            { name: "HeRo", href: "https://hero.ne.kr" },
                            { name: "YouInOne", href: "https://youinone.com" },
                            { name: "FWN", href: "https://fwn.co.kr" },
                            { name: "TenOne", href: "https://tenone.biz" },
                        ].map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="py-16 px-6 bg-[#1a1a2e] text-white">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Contact</h2>
                    <p className="text-neutral-400 text-sm mb-6">
                        제휴, 협업, 광고 문의는 아래로 연락주세요.
                    </p>
                    <Link
                        href="mailto:contact@badak.biz"
                        className="inline-block px-6 py-3 border border-white/30 rounded text-sm hover:bg-white/10 transition-colors"
                    >
                        contact@badak.biz
                    </Link>
                </div>
            </section>
        </div>
    );
}
