"use client";

import Link from "next/link";
import { ArrowRight, Users, Award, Coffee, Globe, MapPin } from "lucide-react";

const networkGroups = [
    { icon: Users, name: "CEO 라운지", desc: "전·현직 CEO들의 월례 모임. 경영 노하우와 기회를 나눕니다.", members: "32명", frequency: "월 1회" },
    { icon: Award, name: "투자 클럽", desc: "자산 운용과 투자 기회를 함께 탐색하는 그룹.", members: "24명", frequency: "격주" },
    { icon: Coffee, name: "골프 & 레저", desc: "골프 라운딩, 와인 모임, 여행 등 취미를 함께합니다.", members: "48명", frequency: "수시" },
    { icon: Globe, name: "글로벌 비즈니스", desc: "해외 사업 경험자 모임. 해외 진출 및 투자 정보 교류.", members: "18명", frequency: "월 1회" },
];

const featuredMembers = [
    { initial: "K", name: "K 전무", field: "광고/마케팅", years: "35년", specialty: "브랜드 전략, 미디어 기획" },
    { initial: "P", name: "P 부사장", field: "금융/투자", years: "30년", specialty: "자산 관리, M&A" },
    { initial: "L", name: "L 대표", field: "IT/테크", years: "28년", specialty: "디지털 전환, AI 활용" },
    { initial: "C", name: "C 상무", field: "유통/물류", years: "25년", specialty: "글로벌 SCM, 이커머스" },
    { initial: "S", name: "S 부장", field: "건설/부동산", years: "32년", specialty: "부동산 개발, 시행" },
    { initial: "H", name: "H 이사", field: "제약/헬스케어", years: "27년", specialty: "바이오 투자, 신약 개발" },
];

const regions = [
    { city: "서울 강남", members: 42, active: true },
    { city: "서울 여의도", members: 28, active: true },
    { city: "분당/판교", members: 18, active: true },
    { city: "부산", members: 12, active: false },
    { city: "제주", members: 8, active: false },
    { city: "대전", members: 6, active: false },
];

export default function DomoNetwork() {
    return (
        <div>
            {/* Hero */}
            <section className="py-24 px-6 bg-gradient-to-br from-[#2D1B2E] to-[#1E1220] text-white">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-5xl md:text-6xl font-black mb-6">네트워크</h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        같은 뜻, 같은 세대.<br />
                        경험과 지혜를 나누는 시니어 비즈니스 네트워크.
                    </p>
                </div>
            </section>

            {/* 네트워크 그룹 */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">네트워크 그룹</h2>
                    <p className="text-neutral-500 mb-10">관심사와 목적에 맞는 그룹에 참여하세요</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {networkGroups.map((group) => (
                            <div key={group.name} className="border border-neutral-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 shrink-0 bg-[#7F1146]/10 rounded-lg flex items-center justify-center">
                                        <group.icon className="h-6 w-6 text-[#7F1146]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-neutral-900 mb-1">{group.name}</h3>
                                        <p className="text-sm text-neutral-600 mb-3">{group.desc}</p>
                                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                                            <span>{group.members} 참여</span>
                                            <span>{group.frequency}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 구분선 */}
            <div className="mx-auto max-w-5xl border-t border-neutral-200" />

            {/* 멤버 프로필 */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">멤버 프로필</h2>
                    <p className="text-neutral-500 mb-10">각 분야 전문가들이 함께합니다 (가명 표시)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {featuredMembers.map((m, i) => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-neutral-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-[#2D1B2E] rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">{m.initial}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-neutral-900">{m.name}</p>
                                        <p className="text-xs text-neutral-500">{m.field} {m.years}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-600">{m.specialty}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 지역 네트워크 */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">지역 네트워크</h2>
                    <p className="text-neutral-500 mb-10">가까운 곳에서 만나는 비즈니스 동료</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {regions.map((r) => (
                            <div
                                key={r.city}
                                className={`rounded-xl p-4 text-center ${r.active ? "bg-[#7F1146]/10 border border-[#7F1146]/20" : "bg-neutral-100 border border-neutral-200"}`}
                            >
                                <MapPin className={`h-5 w-5 mx-auto mb-2 ${r.active ? "text-[#7F1146]" : "text-neutral-400"}`} />
                                <p className={`text-sm font-bold ${r.active ? "text-[#7F1146]" : "text-neutral-500"}`}>{r.city}</p>
                                <p className="text-xs text-neutral-500 mt-1">{r.members}명</p>
                                {!r.active && <p className="text-[10px] text-neutral-400 mt-1">준비 중</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-[#2D1B2E] text-white text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4">네트워크에 합류하세요</h2>
                    <p className="text-white/60 mb-6">검증된 시니어 비즈니스맨들과 의미 있는 관계를 만들어가세요.</p>
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
