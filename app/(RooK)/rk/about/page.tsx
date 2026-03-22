"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RooKAboutPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#282828] py-24 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-[#00d255] text-sm font-medium tracking-widest mb-4">ABOUT</p>
                    <h1 className="text-white text-4xl md:text-6xl font-bold mb-6">
                        AI Creator<br />
                        <span className="text-[#00d255]">RooK</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다.
                        하고 싶은 것이라면 무엇이든 도전합니다.
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className="py-20 px-6 bg-white">
                <div className="mx-auto max-w-3xl space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">RooK이란?</h2>
                        <p className="text-neutral-600 leading-relaxed">
                            RooK은 AI 기술을 활용하여 다양한 창작물을 만들어내는 AI 크리에이터 브랜드입니다.
                            AI 아트, AI 영화, 뮤직비디오, 클래식 명화 리메이크 등 장르의 경계 없이 도전합니다.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">우리가 하는 일</h2>
                        <ul className="space-y-3 text-neutral-600">
                            <li className="flex gap-3">
                                <span className="text-[#00d255] font-bold shrink-0">01</span>
                                <span><strong>AI Art</strong> — 인공지능을 활용한 시각 예술 작품 제작</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#00d255] font-bold shrink-0">02</span>
                                <span><strong>AI Film</strong> — AI 기반 단편 영화 및 영상 콘텐츠 제작</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#00d255] font-bold shrink-0">03</span>
                                <span><strong>AI Artist</strong> — 소속 AI 모델 개발 및 운영</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#00d255] font-bold shrink-0">04</span>
                                <span><strong>RooKie</strong> — 신입 AI 크리에이터 양성 프로그램</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">Ten:One™ Universe</h2>
                        <p className="text-neutral-600 leading-relaxed">
                            RooK은 Ten:One™ Universe 소속 브랜드입니다.
                            다양한 분야의 브랜드들이 모여 시너지를 만들어내는 생태계 안에서,
                            RooK은 AI 크리에이티브 영역을 담당합니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-2xl font-bold mb-4">함께 만들어갈 준비가 되셨나요?</h2>
                    <p className="text-neutral-600 mb-8">RooKie 프로그램을 통해 AI 크리에이터로 성장하세요.</p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/rk/rookie"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#282828] text-white hover:bg-[#00d255] hover:text-black transition-colors rounded font-medium"
                        >
                            RooKie 지원하기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/rk/works"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 hover:border-[#00d255] hover:text-[#00d255] transition-colors rounded font-medium"
                        >
                            Works 보기
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
