"use client";

import { Target, Flame, TrendingUp, MapPin, Building2 } from "lucide-react";

const timeline = [
    { year: "2019", title: "MAD League 창립", desc: "서울 권역 3개 대학 연합 마케팅 동아리로 시작" },
    { year: "2020", title: "제1회 경쟁 PT 개최", desc: "온라인 경쟁 PT 최초 개최, 5개 팀 참가" },
    { year: "2021", title: "전국 확대", desc: "수도권 중심에서 전국 5개 권역으로 확장" },
    { year: "2022", title: "HeRo 프로그램 런칭", desc: "인재 발굴 및 성장 지원 프로그램 시작" },
    { year: "2023", title: "파트너 기업 연계", desc: "지평주조, 스타트업 등 기업 파트너십 확대" },
    { year: "2024", title: "프로그램 다각화", desc: "부트캠프, 워크숍 등 다양한 교육 프로그램 추가" },
    { year: "2025", title: "MAD League 7기 활동", desc: "전국 15개 대학, 200명 이상의 리거 활동" },
    { year: "2026", title: "MAD League 8기 모집", desc: "디지털 플랫폼 강화, Ten:One Universe 편입" },
];

const regions = [
    { name: "서울/경기", universities: ["서울대", "연세대", "고려대", "성균관대", "한양대", "중앙대"], count: 8 },
    { name: "경상", universities: ["부산대", "경북대", "영남대"], count: 4 },
    { name: "전라", universities: ["전남대", "전북대", "조선대"], count: 3 },
    { name: "충청", universities: ["충남대", "충북대", "한밭대"], count: 3 },
    { name: "강원/제주", universities: ["강원대", "제주대"], count: 2 },
];

export default function AboutPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#212121] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#D32F2F] font-bold text-sm tracking-widest uppercase mb-3 block">
                        About MAD League
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
                        MAD League
                    </h1>
                    <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        Match, Act, Develop.<br />
                        경쟁을 통한 성장 플랫폼.
                    </p>
                </div>
            </section>

            {/* 비전/미션 */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 border border-neutral-200 rounded-xl text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-[#D32F2F] mb-4">
                                <Target className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">Match</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                전국의 열정 있는 대학생들을 연결합니다. 학교와 지역의 경계를 넘어 최고의 팀을 구성합니다.
                            </p>
                        </div>
                        <div className="p-8 border border-neutral-200 rounded-xl text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-50 text-orange-600 mb-4">
                                <Flame className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">Act</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                실전 과제를 통해 행동합니다. 이론이 아닌 실전, 관찰이 아닌 참여를 통해 성장합니다.
                            </p>
                        </div>
                        <div className="p-8 border border-neutral-200 rounded-xl text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-600 mb-4">
                                <TrendingUp className="h-7 w-7" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">Develop</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                경쟁을 통해 발전합니다. 건전한 경쟁 속에서 역량을 키우고 마케팅 전문가로 성장합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 미션 */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">Our Mission</h2>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                        대학생들에게 실전 마케팅 경험의 장을 제공하여,
                        창의적이고 실행력 있는 차세대 마케터를 양성합니다.
                        전국 네트워크를 기반으로 지역과 학교의 경계를 넘는 협업과 경쟁의 문화를 만들어갑니다.
                    </p>
                </div>
            </section>

            {/* 연혁 */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-12 text-center">연혁</h2>
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-neutral-200 -translate-x-1/2" />

                        <div className="space-y-8">
                            {timeline.map((item, i) => (
                                <div
                                    key={item.year}
                                    className={`relative flex items-start gap-6 ${
                                        i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                    }`}
                                >
                                    {/* Dot */}
                                    <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-[#D32F2F] border-2 border-white -translate-x-1/2 mt-1.5 z-10" />

                                    {/* Content */}
                                    <div className={`ml-10 md:ml-0 md:w-1/2 ${
                                        i % 2 === 0 ? "md:pr-10 md:text-right" : "md:pl-10"
                                    }`}>
                                        <span className="text-[#D32F2F] font-bold text-sm">{item.year}</span>
                                        <h3 className="font-bold text-neutral-900 mt-1">{item.title}</h3>
                                        <p className="text-sm text-neutral-500 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 전국 네트워크 */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4 text-center">전국 5개 권역 네트워크</h2>
                    <p className="text-neutral-500 text-center mb-12">전국 20여 개 대학의 마케팅 동아리와 함께합니다</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {regions.map((region) => (
                            <div key={region.name} className="bg-white p-5 rounded-xl border border-neutral-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="h-4 w-4 text-[#D32F2F]" />
                                    <h3 className="font-bold text-neutral-900">{region.name}</h3>
                                </div>
                                <p className="text-xs text-neutral-400 mb-2">{region.count}개 대학</p>
                                <div className="space-y-1">
                                    {region.universities.map((uni) => (
                                        <p key={uni} className="text-xs text-neutral-500">{uni}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 파트너/후원사 */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4 text-center">파트너 & 후원</h2>
                    <p className="text-neutral-500 text-center mb-12">MAD League와 함께하는 파트너사</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {["지평주조", "Ten:One", "파트너사 A", "파트너사 B", "파트너사 C", "파트너사 D"].map((partner) => (
                            <div
                                key={partner}
                                className="aspect-[3/2] bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <Building2 className="h-6 w-6 text-neutral-300 mx-auto mb-1" />
                                    <span className="text-xs text-neutral-400 font-medium">{partner}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
