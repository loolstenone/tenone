"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const coreValues = [
    { num: "01", title: "네트워킹", desc: "신뢰를 바탕으로 사람과 사람을 잇고, 사업과 사업을 잇습니다." },
    { num: "02", title: "질문하는 인간", desc: "본질에 다가가는 질문을 던지고, 빛나는 아이디어를 찾습니다." },
    { num: "03", title: "빠른 실행", desc: "아이디어는 실행하지 않으면 가치가 없습니다. 빠르게 실행하고 빠르게 배웁니다." },
    { num: "04", title: "실패에 두려움 없는", desc: "실패는 성공의 과정입니다. 두려움 없이 도전하고 실패에서 배웁니다." },
];

const behaviors = [
    "만나면 먼저 신뢰부터 주고 시작합니다",
    "사람 만나는 것을 두려워하지 않습니다",
    "카톡보다 전화, 전화보다 대면을 합니다",
    "1만 명의 유인원 가족이 되는 날까지",
    "리더십은 팔로워십에서 온다",
];

export default function YouInOneAboutPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] text-sm font-medium tracking-widest mb-4">ABOUT</p>
                    <h1 className="text-white text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Project Group of<br />
                        Thinking Apes.<br />
                        <span className="text-[#E53935]">We Ask Why?</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        사회, 경제, 창업, 마케팅, 광고, 디자인, 영상 등<br />
                        사회와 기업의 문제를 해결하는 프로젝트 그룹
                    </p>
                </div>
            </section>

            {/* What is YouInOne */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto space-y-16">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">우리는 프로젝트 그룹입니다</h2>
                        <p className="text-neutral-600 leading-relaxed">
                            고령화, 인구감소, 지방소멸 등 다양한 문제가 산재한 이 시대,
                            기업과 사회의 문제를 해결하기 위해 관심 있는 분야에서 함께 프로젝트를 진행합니다.
                            네트워킹을 통해 사람과 사업을 잇고, 아이디어와 전략으로 문제를 해결합니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">우리는 디지털 노마드입니다</h2>
                        <p className="text-neutral-600 leading-relaxed">
                            코로나 이후 온라인 중심의 업무 환경이 일상이 되었습니다.
                            유인원은 온라인으로 소통하고, 필요할 때 오프라인에서 만납니다.
                            장소에 구애받지 않고 프로젝트를 진행합니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">프로젝트 멤버스</h2>
                        <p className="text-neutral-600 leading-relaxed">
                            학생부터 30년차 현업 전문가까지, 다양한 배경의 멤버들이 참여합니다.
                            학생은 실전 프로젝트 경험을, 현업인은 사이드 프로젝트를,
                            시니어는 새로운 도전을, 중소기업은 새로운 사업 방법을 얻습니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">얼라이언스</h2>
                        <p className="text-neutral-600 leading-relaxed">
                            소규모 기업들이 연합하여 서로의 강점을 활용하는 네트워크입니다.
                            서울에서 기획하고, 제주도에서 영상을 만들고, 부산에서 디자인하고.
                            혼자서는 어려운 프로젝트도 함께라면 가능합니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">1만 명의 유인원</h2>
                        <p className="text-neutral-600 leading-relaxed">
                            전 세계 1만 명의 유인원이 함께하는 공생 경제를 만들어갑니다.
                            서로의 일감을 나누고, 서로의 성장을 돕는 생태계.
                            그것이 유인원이 꿈꾸는 미래입니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Brand Story */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-center">왜라고 질문하는 유인원</h2>
                    <div className="bg-white p-8 rounded-xl border border-neutral-200 mb-10">
                        <p className="text-neutral-600 leading-relaxed mb-6">
                            유인원(類人猿) — 사람과 닮은 동물. 진화론에서 인간으로 진화하기 직전의 존재.
                        </p>
                        <p className="text-neutral-600 leading-relaxed mb-6">
                            <strong>유인원(YouInOne)</strong> — You(당신) + In One(하나 되어)
                        </p>
                        <ol className="space-y-3 text-neutral-600">
                            <li><strong>1.</strong> 하나가 되어 함께한다 (Together as One)</li>
                            <li><strong>2.</strong> 당신을 한 마디로 설명한다 (Describe You in One Word)</li>
                        </ol>
                    </div>

                    <div className="space-y-8">
                        <div className="p-6 bg-white rounded-xl border border-neutral-200">
                            <h3 className="text-lg font-bold text-[#E53935] mb-2">Vision</h3>
                            <p className="text-neutral-700 font-medium">
                                우리의 아이디어로 세상의 고민을 긍정적인 방법으로 해결한다
                            </p>
                        </div>
                        <div className="p-6 bg-white rounded-xl border border-neutral-200">
                            <h3 className="text-lg font-bold text-[#E53935] mb-2">Mission</h3>
                            <p className="text-neutral-700 font-medium">
                                신뢰 기반의 네트워킹, 질문하는 인간, 빠른 실행, 실패에 대한 두려움 없이
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Core Value</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coreValues.map((v) => (
                            <div key={v.num} className="p-6 bg-neutral-50 rounded-xl">
                                <span className="text-[#E53935] font-bold text-sm">{v.num}</span>
                                <h3 className="text-xl font-bold mt-2 mb-3">{v.title}</h3>
                                <p className="text-neutral-600 text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Behavior */}
            <section className="py-20 px-6 bg-[#171717]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Behavior</h2>
                    <div className="space-y-4">
                        {behaviors.map((b, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 border border-neutral-700 rounded-lg">
                                <span className="shrink-0 w-8 h-8 bg-[#E53935] text-white font-bold text-sm rounded-full flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <p className="text-neutral-300 font-medium">{b}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-neutral-50 text-center">
                <h2 className="text-2xl font-bold mb-4">함께 하시겠습니까?</h2>
                <p className="text-neutral-600 mb-8">멤버십 또는 얼라이언스로 유인원과 함께하세요.</p>
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="/yi/alliance"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#171717] text-white hover:bg-[#E53935] transition-colors rounded font-medium"
                    >
                        멤버십 & 얼라이언스 <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/yi/contact"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 hover:border-[#E53935] hover:text-[#E53935] transition-colors rounded font-medium"
                    >
                        문의하기
                    </Link>
                </div>
            </section>
        </div>
    );
}
