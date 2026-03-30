"use client";

import Link from "next/link";
import { Camera, Calendar, Tag, Moon, Smartphone, ArrowRight, Shield, Sparkles, Bot, Share2 as Share, Zap, Fingerprint, Link2, Download, Star } from "lucide-react";

export default function MyVersePage() {
    return (
        <div className="bg-white text-neutral-900">

            {/* ═══ Hero ═══ */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white" />
                <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-36 text-center">
                    <p className="text-sm mb-8">
                        <span className="bg-gradient-to-r from-neutral-500 via-neutral-400 to-neutral-300 bg-clip-text text-transparent">
                            안녕! 싸이월드, 카카오스토리 ㅠㅠ
                        </span>
                    </p>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15]">
                        나의 디지털 흔적은
                        <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                            내 것이어야 한다
                        </span>
                    </h1>

                    <p className="mt-6 text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
                        사진이나 메모를 AI가 정리해준다.
                        <br />
                        서비스는 사라져도 내 기록은 남는다.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/myverse/contact"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-indigo-500/25">
                            Personal Blackbox 신청 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <p className="mt-5 text-sm text-neutral-400 flex items-center justify-center gap-2">
                        <Smartphone className="h-4 w-4" /> iOS + Android &middot; 곧 출시
                    </p>
                </div>
            </section>

            {/* ═══ HOW IT WORKS — 3단계 플로우 ═══ */}
            <section className="py-20 lg:py-28 bg-neutral-50">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="text-center mb-16">
                        <p className="text-indigo-600 font-semibold text-sm mb-2">HOW IT WORKS</p>
                        <h2 className="text-3xl sm:text-4xl font-bold">나의 흔적이 기록이 된다</h2>
                    </div>

                    {/* Flow 1: 기록 */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold">1</span>
                            <h3 className="text-xl font-bold">기록한다</h3>
                        </div>
                        <div className="grid sm:grid-cols-4 gap-4">
                            {[
                                { icon: Camera, title: "사진을 찍는다", desc: "사진이나 메모를 남긴다" },
                                { icon: Calendar, title: "AI가 캘린더와 대조", desc: "일정과 기록을 자동 매칭" },
                                { icon: Tag, title: "자동 태그 + LOG 저장", desc: "장소, 사람, 감정 태그" },
                                { icon: Moon, title: "하루 요약", desc: "AI가 오늘을 한 줄로 정리" },
                            ].map(s => (
                                <div key={s.title} className="bg-white rounded-xl p-5 border border-neutral-100">
                                    <s.icon className="h-5 w-5 text-indigo-600 mb-3" />
                                    <h4 className="text-sm font-bold mb-1">{s.title}</h4>
                                    <p className="text-xs text-neutral-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flow 2: 공유 */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white text-sm font-bold">2</span>
                            <h3 className="text-xl font-bold">공유한다</h3>
                        </div>
                        <div className="grid sm:grid-cols-4 gap-4">
                            {[
                                { icon: Camera, title: "사진이나 메모를 남긴다", desc: "나의 기록에서 시작" },
                                { icon: Share, title: "공유할 콘텐츠 선택", desc: "내가 공유하고 싶은 것만" },
                                { icon: Zap, title: "AI가 한번에 공유", desc: "인스타그램, 스레드, X" },
                                { icon: Fingerprint, title: "나의 정체성이 된다", desc: "흔적이 모여 나를 만든다" },
                            ].map(s => (
                                <div key={s.title} className="bg-white rounded-xl p-5 border border-neutral-100">
                                    <s.icon className="h-5 w-5 text-purple-600 mb-3" />
                                    <h4 className="text-sm font-bold mb-1">{s.title}</h4>
                                    <p className="text-xs text-neutral-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flow 3: 수집 */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-600 text-white text-sm font-bold">3</span>
                            <h3 className="text-xl font-bold">모은다</h3>
                        </div>
                        <div className="grid sm:grid-cols-4 gap-4">
                            {[
                                { icon: Link2, title: "나의 계정을 연결", desc: "소셜, 클라우드 계정 연동" },
                                { icon: Download, title: "과거 흔적을 모은다", desc: "디지털 흔적을 한 곳에" },
                                { icon: Bot, title: "AI가 관리해준다", desc: "자동 분류, 정리, 보관" },
                                { icon: Star, title: "기록이 역사가 된다", desc: "나의 인생 타임라인" },
                            ].map(s => (
                                <div key={s.title} className="bg-white rounded-xl p-5 border border-neutral-100">
                                    <s.icon className="h-5 w-5 text-pink-600 mb-3" />
                                    <h4 className="text-sm font-bold mb-1">{s.title}</h4>
                                    <p className="text-xs text-neutral-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 앱 미리보기 (폰 목업) ═══ */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* 텍스트 */}
                        <div>
                            <p className="text-indigo-600 font-semibold text-sm mb-2">PERSONAL BLACKBOX</p>
                            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                                나의 디지털 흔적이
                                <br />
                                <span className="text-indigo-600">여기에 모인다</span>
                            </h2>
                            <p className="mt-4 text-neutral-500 leading-relaxed">
                                인스타, 페이스북, X에 올린 기록은 플랫폼 것입니다.
                                <br />
                                Myverse는 나의 것입니다. 서비스가 사라져도 내 기록은 남습니다.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {[
                                    "사진 찍으면 AI가 자동 분류",
                                    "캘린더 대조로 맥락 태깅",
                                    "매일 저녁 하루 요약",
                                ].map(t => (
                                    <li key={t} className="flex items-center gap-3 text-sm">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shrink-0">
                                            <Sparkles className="h-3 w-3" />
                                        </span>
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 폰 목업 */}
                        <div className="flex justify-center">
                            <div className="w-[280px] rounded-[2.5rem] bg-neutral-900 p-3 shadow-2xl shadow-neutral-300">
                                <div className="rounded-[2rem] bg-white overflow-hidden">
                                    {/* 상단바 */}
                                    <div className="bg-indigo-600 px-5 pt-10 pb-6 text-white">
                                        <p className="text-xs opacity-70">2026년 3월 30일 월요일</p>
                                        <p className="text-lg font-bold mt-1">오늘의 기록</p>
                                        <p className="text-sm opacity-80 mt-0.5">3건의 기록 &middot; 기분 좋음</p>
                                    </div>
                                    {/* 기록 카드들 */}
                                    <div className="p-4 space-y-3">
                                        <div className="rounded-xl bg-neutral-50 p-3">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">카페</span>
                                                <span className="text-[10px] text-neutral-400">오후 2:15</span>
                                            </div>
                                            <p className="text-xs text-neutral-700">서울숲 카페에서 수진이랑 점심</p>
                                        </div>
                                        <div className="rounded-xl bg-neutral-50 p-3">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">업무</span>
                                                <span className="text-[10px] text-neutral-400">오후 4:30</span>
                                            </div>
                                            <p className="text-xs text-neutral-700">프로젝트 중간 발표 준비 완료</p>
                                        </div>
                                        <div className="rounded-xl bg-neutral-50 p-3">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">운동</span>
                                                <span className="text-[10px] text-neutral-400">오후 7:00</span>
                                            </div>
                                            <p className="text-xs text-neutral-700">한강 러닝 5km 완주</p>
                                        </div>
                                        {/* 하루 요약 */}
                                        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-3 border border-indigo-100">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Bot className="h-3 w-3 text-indigo-500" />
                                                <span className="text-[10px] font-semibold text-indigo-600">AI 하루 요약</span>
                                            </div>
                                            <p className="text-xs text-neutral-600">&ldquo;친구와 여유로운 점심, 발표 준비 마무리, 저녁엔 러닝으로 리프레시. 알찬 하루!&rdquo;</p>
                                        </div>
                                    </div>
                                    {/* 하단 탭바 */}
                                    <div className="flex items-center justify-around py-3 border-t border-neutral-100">
                                        <span className="text-[10px] text-neutral-400">ME</span>
                                        <span className="text-[10px] text-indigo-600 font-bold">LOG</span>
                                        <span className="text-[10px] text-neutral-400">PLAN</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ AI 섹션 ═══ */}
            <section className="py-20 lg:py-28 bg-neutral-50">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* AI 대화 예시 */}
                        <div className="order-2 lg:order-1">
                            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Myverse AI</p>
                                        <p className="text-[10px] text-emerald-500">Active</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-neutral-50 rounded-xl p-3 text-sm text-neutral-700 max-w-[80%] ml-auto">
                                        요즘 왜 이렇게 돈을 많이 쓰지?
                                    </div>
                                    <div className="bg-indigo-50 rounded-xl p-3 text-sm text-neutral-700 max-w-[85%] space-y-1.5">
                                        <p>이번 달 외식이 23회야. 지난달보다 8번 많아.</p>
                                        <p>주로 목~금요일에 몰려 있어.</p>
                                        <p className="text-neutral-400 text-xs">네 패턴상 마감 전후에 외식이 느는 편이야.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 텍스트 */}
                        <div className="order-1 lg:order-2">
                            <p className="text-indigo-600 font-semibold text-sm mb-2">SOUL MATE AI</p>
                            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                                비서가 아닌
                                <br />
                                <span className="text-indigo-600">영혼의 단짝</span>
                            </h2>
                            <p className="mt-4 text-neutral-500 leading-relaxed">
                                Myverse AI는 참견하지 않습니다.
                                <br />
                                오래 사귄 친구처럼 나를 깊이 알되, 조심스럽습니다.
                            </p>
                            <div className="mt-6 space-y-2">
                                <div className="flex items-start gap-3 text-sm">
                                    <span className="text-rose-500 font-bold mt-0.5">X</span>
                                    <span className="text-neutral-500">&ldquo;커피를 너무 많이 드시네요. 줄이세요.&rdquo;</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <span className="text-emerald-500 font-bold mt-0.5">O</span>
                                    <span className="text-neutral-700">&ldquo;이번 주 커피 7잔째야.&rdquo;</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 왜 필요한가 ═══ */}
            <section className="py-20 lg:py-28">
                <div className="mx-auto max-w-5xl px-6 text-center">
                    <p className="text-indigo-600 font-semibold text-sm mb-2">WHY MYVERSE</p>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-12">
                        나의 디지털 흔적은
                        <br />
                        <span className="text-indigo-600">나의 것이어야 한다</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Camera, title: "정리 안 되는 사진", desc: "수만 장이 쌓여 있지만 정리할 엄두가 안 난다. 누구와, 어디서, 왜 찍었는지 시간이 지나면 잊어버린다." },
                            { icon: Shield, title: "사라지는 기록", desc: "싸이월드, 바인, 구글플러스 — 서비스가 죽으면 내 기록도 증발한다. 소유권은 플랫폼에 있다." },
                            { icon: Sparkles, title: "소셜의 피로", desc: "인스타그램은 남에게 보여주는 공간. 진짜 나의 일상을 솔직하게 기록할 공간이 없다." },
                        ].map(p => (
                            <div key={p.title} className="bg-neutral-50 rounded-2xl p-6 text-left border border-neutral-100">
                                <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                                    <p.icon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h3 className="font-bold mb-2">{p.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="py-20 lg:py-28 bg-gradient-to-b from-indigo-50 to-white">
                <div className="mx-auto max-w-2xl px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        나의 블랙박스를
                        <br />
                        시작하세요
                    </h2>
                    <p className="text-neutral-500 mb-8 leading-relaxed">
                        처음엔 사진 한 장. 매일 쌓으면 나의 우주.
                    </p>
                    <Link href="/myverse/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-indigo-500/25 text-lg">
                        Personal Blackbox 신청 <ArrowRight className="h-5 w-5" />
                    </Link>
                    <p className="mt-5 text-sm text-neutral-400">
                        iOS + Android &middot; 곧 출시 &middot; WIO by Ten:One&#8482;
                    </p>
                </div>
            </section>
        </div>
    );
}
