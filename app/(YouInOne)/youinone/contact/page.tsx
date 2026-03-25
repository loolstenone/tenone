"use client";

import Link from "next/link";
import { Mail, MessageCircle, ExternalLink, ArrowRight } from "lucide-react";

export default function YouInOneContactPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] text-sm font-medium tracking-widest mb-4">CONTACT</p>
                    <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                        세상을 바꾸는 프로젝트<br />
                        <span className="text-[#E53935]">당신의 고민을 이야기해 주세요</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        사회문제, 사업, 스타트업, 마케팅, 디자인 등<br />
                        프로젝트에 대한 문의를 환영합니다.
                    </p>
                </div>
            </section>

            {/* Contact Info */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 md:mb-16">
                        <div className="p-8 bg-neutral-50 rounded-xl">
                            <Mail className="h-8 w-8 text-[#E53935] mb-4" />
                            <h3 className="text-lg font-bold mb-2">Email</h3>
                            <a
                                href="mailto:YouInOne.com@gmail.com"
                                className="text-neutral-600 hover:text-[#E53935] transition-colors"
                            >
                                YouInOne.com@gmail.com
                            </a>
                        </div>
                        <div className="p-8 bg-neutral-50 rounded-xl">
                            <MessageCircle className="h-8 w-8 text-[#E53935] mb-4" />
                            <h3 className="text-lg font-bold mb-2">KakaoTalk</h3>
                            <a
                                href="https://open.kakao.com/me/youinone"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-600 hover:text-[#E53935] transition-colors flex items-center gap-1"
                            >
                                open.kakao.com/me/youinone
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>

                    {/* Inquiry Types */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-6">이런 고민이 있다면 연락주세요</h2>
                        {[
                            "사회 문제를 해결하는 프로젝트를 하고 싶어요",
                            "우리 기업의 마케팅·브랜딩을 도와줄 파트너가 필요해요",
                            "광고 캠페인을 기획하고 싶어요",
                            "디자인·영상 콘텐츠가 필요해요",
                            "스타트업 사업 전략을 함께 고민하고 싶어요",
                            "멤버십이나 얼라이언스에 참여하고 싶어요",
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg hover:border-[#E53935]/30 transition-colors">
                                <span className="shrink-0 w-8 h-8 bg-[#E53935]/10 text-[#E53935] font-bold text-sm rounded-full flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <p className="text-neutral-700">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-neutral-50 text-center">
                <h2 className="text-2xl font-bold mb-4">유인원과 함께 프로젝트를 시작하세요</h2>
                <p className="text-neutral-600 mb-8">멤버십 또는 얼라이언스로도 참여할 수 있습니다.</p>
                <Link
                    href="/youinone/alliance"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#171717] text-white hover:bg-[#E53935] transition-colors rounded font-medium"
                >
                    멤버십 & 얼라이언스 <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}
