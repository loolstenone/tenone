// MADLeap — About 페이지 (madleap.co.kr 원문 기반 재작성, 2026-05-25)
//
// 정직성 회복:
// - 검증 안 된 mock 제거 (운영진 실명·동문 quote·멤버 수치)
// - madleap.co.kr 원문 인용 (창립 스토리·핵심 철학·인재상)
// - 검증 가능한 정보만 표기 (기수 5·창립 2023 하반기)

import Link from "next/link";
import { Target, Zap, TrendingUp, Award, Quote, ArrowRight, MailOpen, Instagram } from "lucide-react";

/* ── 검증된 콘텐츠 (madleap.co.kr 원문) ── */

const madValues = [
    { letter: "M", title: "Marketing", desc: "전략과 데이터로 시장을 읽는다." },
    { letter: "A", title: "Advertising", desc: "광고와 크리에이티브를 실전으로." },
    { letter: "D", title: "Digital", desc: "디지털·AI 시대의 기획자로 성장." },
];

// 우리가 되고 싶은 인재상 — madleap.co.kr 원문
const personas = [
    "한 명의 전문가로 성장",
    "배우고자 하는 열망과 열정이 있는 사람",
    "적극적으로 소통하고 협력하고자 하는 사람",
];

// 5대 운영 가치 — madleap.co.kr 원문 순서
const operatingValues = [
    { title: "확장하다", desc: "기존 광고 동아리의 '광고·크리에이티브' 틀에서 벗어나 마케팅·커뮤니케이션·데이터로 확장한다." },
    { title: "연결하다", desc: "국내 여러 광고 동아리와 지속적으로 관계를 구축하고, 현업 선배와 소통하며 프로젝트를 진행한다." },
    { title: "발로 뛰다", desc: "주어진 과제에 만족하지 않고 직접 발로 뛰며 본질적 문제 해결책을 발굴한다." },
    { title: "세상을 기획하는 기획자가 된다", desc: "AE·AP가 아닌, 일이 되게끔 만드는 기획. 생각을 세상에 꺼내 결과를 만든다." },
    { title: "결과로 말하다", desc: "큰 혁신을 불러올 잠재력을 실전 프로젝트로 증명한다. 과정도 중요하지만 결과로 말한다." },
];

// 매년 활동 안내 — madleap.co.kr 원문
const recruitmentNote = "매드립은 매년 2~3월, 2년 활동을 기준으로 새로운 기수를 모집합니다.";

export default function MadLeapAboutPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-[#1a1a2e] text-white py-20 md:py-28">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-4">About MADLeap</p>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">
                        실전 프로젝트<br />
                        <span className="text-[#4361ee]">대학생 연합동아리</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Marketing · Advertising · Digital — Leap!
                    </p>
                </div>
            </section>

            {/* Origin Story — madleap.co.kr 원문 인용 */}
            <section className="bg-neutral-50 py-20 md:py-28">
                <div className="mx-auto max-w-3xl px-6">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-3 text-center">Our Origin</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">우리의 시작은 기웃거림이었습니다.</h2>

                    {/* 학생들의 목소리 (원문) */}
                    <div className="space-y-3 mb-10">
                        {[
                            "선배님, 저 정말 광고 기획 제대로 배워 보고 싶어요",
                            "선배님, 마케팅 비전공자는 뭐부터 해야 하나요?",
                            "선배님, 이론은 이제 지겨워요. 실무가 너무 궁금해요",
                        ].map((line) => (
                            <div key={line} className="rounded-xl bg-white border border-neutral-200 px-5 py-4">
                                <Quote className="inline h-4 w-4 text-[#4361ee] mr-2 -mt-0.5" />
                                <span className="text-neutral-700 text-[15px]">{line}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-5 text-neutral-700 leading-relaxed text-[15px]">
                        <p>
                            그렇게 마케팅·광고가 하고 싶은 우리 학생들의 열정이 현업의 선배님들에게 닿았습니다.
                            선배님들은 우리의 손을 잡아 주었고, 함께 마케팅·광고 동아리계의 새로운 패러다임을 만들었습니다.
                            그것이 <strong>MADLeap</strong>의 시작입니다.
                        </p>
                        <p>
                            디지털과 인공지능이 모든 경계를 허물었고, 기업은 신입이 아닌 경력을 원합니다.
                            그래서 매드립은 한 번 더 도약을 했습니다 —
                            <strong> 누구보다 AI를 잘 활용하고, 실전 프로젝트로 증명하는 조직</strong>이 되기로.
                        </p>
                    </div>

                    {/* 핵심 철학 — madleap.co.kr 원문 */}
                    <div className="mt-10 rounded-2xl bg-[#1a1a2e] text-white p-6 md:p-8">
                        <Quote className="h-6 w-6 text-[#4361ee] mb-3" />
                        <p className="text-base md:text-lg leading-relaxed">
                            진짜 실력은 대외활동과 트로피의 갯수가 아니라,
                            <br />
                            <strong className="text-[#4361ee]">실제로 성과를 만들어본 경험</strong>으로부터 키워집니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* MAD 의미 */}
            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-3 text-center">What is MAD</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">MAD의 의미</h2>
                    <p className="text-neutral-500 text-center text-sm mb-12">매드립을 구성하는 세 가지 축</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {madValues.map((v) => (
                            <div key={v.letter} className="text-center p-8 rounded-2xl border border-neutral-200 hover:border-[#4361ee]/30 hover:shadow-lg transition-all group">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#4361ee]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#4361ee]/20 transition-colors">
                                    <span className="text-2xl font-black text-[#4361ee]">{v.letter}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{v.title}</h3>
                                <p className="text-neutral-600 text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5대 운영 가치 — madleap.co.kr 원문 순서 */}
            <section className="bg-[#1a1a2e] text-white py-20 md:py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-3 text-center">Our Values</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">5대 운영 가치</h2>
                    <p className="text-neutral-400 text-center text-sm mb-12">매드립이 일하는 다섯 가지 방식</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {operatingValues.map((v, i) => (
                            <div key={v.title} className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 hover:bg-white/[0.06] transition-colors">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-3xl font-extralight text-[#4361ee]/40">0{i + 1}</span>
                                    <h3 className="text-xl font-bold">{v.title}</h3>
                                </div>
                                <p className="text-neutral-400 text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 인재상 — madleap.co.kr 원문 */}
            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-4xl px-6">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-3 text-center">Who We Want</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">되고 싶은 인재상</h2>
                    <p className="text-neutral-500 text-center text-sm mb-12">매드립이 함께하고 싶은 사람</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {personas.map((p, i) => (
                            <div key={p} className="rounded-2xl border border-neutral-200 p-6 hover:border-[#4361ee]/30 hover:shadow-md transition-all">
                                <div className="text-3xl font-extralight text-[#4361ee]/40 mb-3">0{i + 1}</div>
                                <p className="font-semibold text-neutral-800 leading-snug">{p}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recruitment Note + Contact CTA */}
            <section className="bg-neutral-50 py-20 md:py-24">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-3">Join Us</p>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">매드립과 함께하고 싶다면</h2>
                    <p className="text-neutral-600 text-[15px] leading-relaxed mb-8">{recruitmentNote}</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/madleap/apply"
                            className="w-full sm:w-auto px-6 py-3 bg-[#4361ee] text-white text-sm font-bold hover:bg-[#3451de] transition-all rounded-lg inline-flex items-center justify-center gap-2"
                        >
                            지원 정보 보기 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a
                            href="https://instagram.com/madleap.official"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full sm:w-auto px-6 py-3 border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-white transition-all rounded-lg inline-flex items-center justify-center gap-2"
                        >
                            <Instagram className="h-4 w-4" /> @madleap.official
                        </a>
                        <a
                            href="mailto:official@madleap.co.kr"
                            className="w-full sm:w-auto px-6 py-3 border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-white transition-all rounded-lg inline-flex items-center justify-center gap-2"
                        >
                            <MailOpen className="h-4 w-4" /> 문의하기
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
