"use client";

import Link from "next/link";
import {
    Orbit, User, Shield, Zap, Bot, ArrowRight, Sparkles,
    Camera, Calendar, Tag, Moon, Repeat, ChevronRight,
    Smartphone, Lock, CloudOff, Heart, MessageCircle,
    BookOpen, Target, Briefcase, Brain, Star,
} from "lucide-react";

/* ── Hero ── */
function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/8 blur-[120px]" />
                <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-purple-500/8 blur-[80px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-28 lg:py-40">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400 mb-8">
                        <Orbit className="h-4 w-4 text-indigo-400" />
                        Personal Blackbox
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                        사진 찍으면
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI가 정리한다
                        </span>
                    </h1>

                    <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                        나의 디지털 흔적은 나의 것이다.
                        <br className="hidden sm:block" />
                        소셜에 한 번에 공유하고, 서비스가 죽어도 내 기록은 남는다.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/myverse/contact"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors">
                            Early Access 신청 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/myverse/philosophy"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/15 text-neutral-300 font-medium hover:bg-white/5 transition-colors">
                            왜 Myverse인가
                        </Link>
                    </div>

                    {/* App Store 뱃지 (Coming Soon) */}
                    <div className="mt-6 flex items-center justify-center gap-3 text-xs text-neutral-600">
                        <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> iOS + Android</span>
                        <span>|</span>
                        <span>Coming Soon</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── 문제 정의 ── */
function ProblemSection() {
    const problems = [
        { icon: CloudOff, title: "흩어진 기록", desc: "수만 장의 사진이 구글 포토, 아이폰, 인스타에 분산. 어디에 뭘 올렸는지 기억이 안 난다." },
        { icon: Lock, title: "사라지는 기록", desc: "싸이월드, 바인, 구글플러스 — 서비스가 죽으면 내 기록도 증발. 소유권은 플랫폼에 있다." },
        { icon: Heart, title: "소셜의 피로", desc: "인스타그램은 남에게 보여주는 공간. 진짜 나의 일상을 솔직하게 기록할 공간이 없다." },
    ];

    return (
        <section className="py-20 lg:py-28 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-14">
                    <p className="text-rose-400 font-medium text-sm mb-3">THE PROBLEM</p>
                    <h2 className="text-2xl sm:text-3xl font-bold">나의 디지털 흔적은 내 것이 아니다</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {problems.map(p => (
                        <div key={p.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                            <p.icon className="h-8 w-8 text-rose-400/60 mb-4" />
                            <h3 className="text-white font-semibold mb-2">{p.title}</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── 핵심 플로우 ── */
function FlowSection() {
    const steps = [
        { icon: Camera, label: "사진을 찍는다", color: "text-indigo-400" },
        { icon: Calendar, label: "AI가 캘린더와 대조한다", color: "text-purple-400", detail: '"서울숲 카페, 오후 2시, 수진이랑 점심"' },
        { icon: Tag, label: "태그가 자동으로 붙은 채 LOG에 쌓인다", color: "text-pink-400" },
        { icon: MessageCircle, label: "기분과 한 줄 메모를 덧붙인다", color: "text-amber-400", detail: "(선택)" },
        { icon: Moon, label: "저녁에 AI가 하루를 한 줄로 정리해준다", color: "text-cyan-400" },
        { icon: Repeat, label: "매일 반복 → 쌓이면 나의 우주", color: "text-emerald-400" },
    ];

    return (
        <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-14">
                    <p className="text-indigo-400 font-medium text-sm mb-3">HOW IT WORKS</p>
                    <h2 className="text-2xl sm:text-3xl font-bold">사진 한 장이 기록이 된다</h2>
                    <p className="mt-3 text-neutral-500 text-sm">입력을 없앤다. AI가 80%를 채운다. 사람은 20%의 판단.</p>
                </div>
                <div className="max-w-xl mx-auto space-y-1">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.03] transition-colors">
                            <div className="flex flex-col items-center shrink-0">
                                <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${s.color}`}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                                {i < steps.length - 1 && <div className="w-px h-6 bg-white/10 mt-1" />}
                            </div>
                            <div className="pt-2">
                                <p className="text-sm font-medium text-white">{s.label}</p>
                                {s.detail && <p className="text-xs text-neutral-500 mt-0.5">{s.detail}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── 7탭 앱 미리보기 ── */
function AppPreviewSection() {
    const tabs = [
        { icon: User, name: "ME", label: "나는 누구인가", desc: "홈 — 오늘 기분, 최근 기록, 이번 주 요약", phase: "MVP", active: true },
        { icon: BookOpen, name: "LOG", label: "나의 일상", desc: "사진·글·감정·창작 기록", phase: "MVP", active: true },
        { icon: Calendar, name: "PLAN", label: "내 하루", desc: "캘린더 동기화, AI 분류 인프라", phase: "MVP", active: true },
        { icon: Target, name: "DREAM", label: "내가 꿈꾸는 것", desc: "인생 목표, 버킷리스트", phase: "Phase 5", active: false },
        { icon: Briefcase, name: "WORK", label: "내가 하는 일", desc: "프로젝트, 이력, 성과", phase: "Phase 5", active: false },
        { icon: Bot, name: "AI", label: "나를 아는 AI", desc: "대화·분석·인사이트", phase: "Phase 3", active: false },
        { icon: Star, name: "VERSE", label: "내 우주", desc: "인생 타임라인, 패턴 시각화", phase: "Phase 6", active: false },
    ];

    return (
        <section className="py-20 lg:py-28 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-14">
                    <p className="text-indigo-400 font-medium text-sm mb-3">APP STRUCTURE</p>
                    <h2 className="text-2xl sm:text-3xl font-bold">7개의 탭, 하나의 우주</h2>
                    <p className="mt-3 text-neutral-500 text-sm">처음엔 3개 탭으로 시작. 기록이 쌓이면 우주가 펼쳐집니다.</p>
                </div>

                {/* 앱 프레임 */}
                <div className="max-w-sm mx-auto">
                    <div className="rounded-[2rem] border border-white/10 bg-neutral-900 p-4 shadow-2xl">
                        {/* 상단 노치 */}
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-5 rounded-full bg-neutral-800" />
                        </div>

                        {/* 탭 목록 */}
                        <div className="space-y-2 mb-6">
                            {tabs.map(t => (
                                <div key={t.name} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${t.active ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/[0.02] border border-transparent'}`}>
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-neutral-600'}`}>
                                        <t.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${t.active ? 'text-white' : 'text-neutral-500'}`}>{t.name}</span>
                                            <span className="text-[10px] text-neutral-600">{t.label}</span>
                                        </div>
                                        <p className="text-[11px] text-neutral-600 truncate">{t.desc}</p>
                                    </div>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${t.active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-neutral-600'}`}>
                                        {t.phase}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* 하단 홈 바 */}
                        <div className="flex justify-center">
                            <div className="w-32 h-1 rounded-full bg-neutral-700" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── AI 영혼의 단짝 ── */
function AISection() {
    return (
        <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-indigo-400 font-medium text-sm mb-3">SOUL MATE AI</p>
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            비서가 아닌
                            <br />
                            <span className="text-indigo-400">영혼의 단짝</span>
                        </h2>
                        <p className="mt-6 text-neutral-400 leading-relaxed">
                            Myverse의 AI는 참견하지 않습니다. 오래 사귄 친구처럼 나를 깊이 알되,
                            조심스럽습니다. 필요할 때만, 적절한 만큼만.
                        </p>
                        <div className="mt-8 space-y-3 text-sm text-neutral-400">
                            <div className="flex items-start gap-3">
                                <span className="text-rose-400 mt-0.5 shrink-0">X</span>
                                <span>&ldquo;커피를 너무 많이 드시네요. 줄이세요.&rdquo; — 훈계</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-emerald-400 mt-0.5 shrink-0">O</span>
                                <span>&ldquo;이번 주 커피 7잔째야.&rdquo; — 관찰</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-white font-medium">Myverse AI</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="p-3 rounded-lg bg-white/5 text-neutral-300">
                                    요즘 왜 이렇게 돈을 많이 쓰지?
                                </div>
                                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-neutral-300 space-y-2">
                                    <p>이번 달 외식이 23회야. 지난달보다 8번 많아.</p>
                                    <p>주로 목~금요일에 몰려 있어. 이번 달 마감이 3건 겹쳤거든.</p>
                                    <p className="text-neutral-500 text-xs">네 패턴상 마감 전후에 외식이 느는 편이야.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Pricing Teaser ── */
function PricingSection() {
    const plans = [
        { name: "Free", price: "0", desc: "기록 시작하기", features: ["사진/글 기록 무제한", "AI 자동 분류 (월 100건)", "캘린더 동기화 1개", "5GB 스토리지"] },
        { name: "Pro", price: "9,900", desc: "AI가 나를 안다", features: ["AI 분류 무제한", "하루 요약 + 주간 리포트", "캘린더 3개 동기화", "50GB 스토리지", "소셜 일괄 공유"], highlight: true },
        { name: "Vault", price: "9,900", desc: "영원히 보관", features: ["종단간 암호화", "500GB 스토리지", "소셜 백업 가져오기", "디지털 유산 설정"] },
    ];

    return (
        <section className="py-20 lg:py-28 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-14">
                    <p className="text-indigo-400 font-medium text-sm mb-3">PRICING</p>
                    <h2 className="text-2xl sm:text-3xl font-bold">기록은 무료, 인사이트는 Pro</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    {plans.map(p => (
                        <div key={p.name} className={`p-6 rounded-2xl border ${p.highlight ? 'border-indigo-500/30 bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'border-white/5 bg-white/[0.03]'}`}>
                            <h3 className="text-lg font-bold text-white">{p.name}</h3>
                            <p className="text-xs text-neutral-500 mt-0.5">{p.desc}</p>
                            <div className="mt-4 mb-5">
                                <span className="text-3xl font-bold text-white">{p.price}</span>
                                <span className="text-sm text-neutral-500">원/월</span>
                            </div>
                            <ul className="space-y-2">
                                {p.features.map(f => (
                                    <li key={f} className="flex items-start gap-2 text-xs text-neutral-400">
                                        <Sparkles className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── CTA ── */
function CTASection() {
    return (
        <section className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="relative max-w-2xl mx-auto text-center">
                    <div className="absolute -inset-x-20 -inset-y-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
                    <div className="relative p-10 rounded-3xl bg-white/[0.03] border border-white/10">
                        <Orbit className="h-10 w-10 text-indigo-400 mx-auto mb-6" />
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                            여기에 내가 있다.
                        </h2>
                        <p className="text-neutral-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                            처음엔 어둠 속 점 하나. 하나씩 모아서, 매일 쌓아서, 조금씩 키워서.
                            <br />
                            디지털 속의 내가 형태를 갖습니다.
                        </p>
                        <Link href="/myverse/contact"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors">
                            Early Access 신청 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <p className="text-xs text-neutral-600 mt-4">iOS + Android | 2026 출시 예정</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Main ── */
export default function MyVersePage() {
    return (
        <>
            <HeroSection />
            <ProblemSection />
            <FlowSection />
            <AppPreviewSection />
            <AISection />
            <PricingSection />
            <CTASection />
        </>
    );
}
