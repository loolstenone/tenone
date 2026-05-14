"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Camera, Calendar, Tag, Moon, Share2, Zap, Link2, Download, Smartphone, Shield, Sparkles, Fingerprint, Star, Instagram, MessageSquare, Heart, Activity, Lock, HardDrive, Trash2, FileJson } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

/* ── fade-in ── */
function useFadeIn() {
    const ref = useRef<HTMLDivElement>(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, className: `transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}` };
}

/* ── Hero rotator ── */
const HERO_SLIDES = [
    { eyebrow: "나를 운영하는",      headline: "Personal OS",          gradient: true  },
    { eyebrow: "나의 디지털 흔적은", headline: "내것이어야 한다.",       gradient: false },
    { eyebrow: "기록이 쌓이면",      headline: "나의 성장이 된다.",      gradient: false },
    { eyebrow: "서비스는 사라져도",   headline: "나의 기록은 남는다.",    gradient: false },
] as const;

// [x, y] offset — 새 텍스트가 들어오는 방향 (enter) / 나가는 방향 (exit)
const DIR_ENTER = [
    { x:   0, y:  44 },   // 위로 올라옴 → 아래에서 진입
    { x: -44, y:   0 },   // 오른쪽으로 밀림 → 왼쪽에서 진입
    { x:   0, y: -44 },   // 아래로 내려옴 → 위에서 진입
    { x:  44, y:   0 },   // 왼쪽으로 밀림 → 오른쪽에서 진입
] as const;
const DIR_EXIT = [
    { x:   0, y: -44 },
    { x:  44, y:   0 },
    { x:   0, y:  44 },
    { x: -44, y:   0 },
] as const;

type HeroPhase = "idle" | "exiting" | "entering";

function HeroRotator() {
    const [slideIdx, setSlideIdx] = useState(0);
    const [dirIdx,   setDirIdx]   = useState(0);
    const [phase,    setPhase]    = useState<HeroPhase>("idle");

    useEffect(() => {
        const t = setInterval(() => {
            setPhase("exiting");
            setTimeout(() => {
                setSlideIdx(p => (p + 1) % HERO_SLIDES.length);
                setDirIdx(p   => (p + 1) % 4);
                setPhase("entering");
                // double rAF: entering 위치에서 렌더 → transition 시작
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => setPhase("idle"))
                );
            }, 380);
        }, 4200);
        return () => clearInterval(t);
    }, []);

    const slide = HERO_SLIDES[slideIdx];
    const enter = DIR_ENTER[dirIdx];
    const exit  = DIR_EXIT[dirIdx];

    const style: React.CSSProperties =
        phase === "exiting"  ? { transform: `translate(${exit.x}px,${exit.y}px)`,  opacity: 0, transition: "transform 360ms cubic-bezier(0.4,0,1,1), opacity 280ms ease" } :
        phase === "entering" ? { transform: `translate(${enter.x}px,${enter.y}px)`, opacity: 0, transition: "none" } :
        /* idle */             { transform: "translate(0,0)",                        opacity: 1, transition: "transform 480ms cubic-bezier(0.34,1.2,0.64,1), opacity 420ms ease" };

    return (
        <div className="relative text-center select-none">
            {/* 회전 텍스트 */}
            <div className="overflow-hidden" style={{ minHeight: "clamp(120px,22vw,220px)" }}>
                <div style={style}>
                    <p
                        className="text-[clamp(1rem,2.8vw,1.4rem)] font-medium tracking-tight mb-2"
                        style={{ color: "#9CA3AF" }}
                    >
                        {slide.eyebrow}
                    </p>
                    <h1 className="text-[clamp(2.6rem,7.5vw,5.5rem)] font-black leading-[1.05] tracking-tight">
                        {slide.gradient ? (
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                                {slide.headline}
                            </span>
                        ) : (
                            <span className="text-neutral-900">{slide.headline}</span>
                        )}
                    </h1>
                </div>
            </div>

            {/* 슬라이드 도트 */}
            <div className="flex items-center justify-center gap-1.5 mt-7">
                {HERO_SLIDES.map((_, i) => (
                    <span
                        key={i}
                        className={`block rounded-full transition-all duration-300 ${
                            i === slideIdx ? "w-5 h-1.5 bg-indigo-500" : "w-1.5 h-1.5 bg-neutral-200"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── counter ── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) { setStarted(true); obs.disconnect(); } }, { threshold: 0.5 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [started]);
    useEffect(() => {
        if (!started) return;
        const inc = target / 40;
        let cur = 0;
        const t = setInterval(() => { cur += inc; if (cur >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(cur)); }, 37);
        return () => clearInterval(t);
    }, [started, target]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function MyVersePage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [loginOpen, setLoginOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // 로그인 상태면 서비스 페이지로 자동 이동 — 마케팅 랜딩은 비로그인 진입 전용
    // 첫 랜딩은 캡쳐 — 5채집 시작점
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace("/myverse/app/capture");
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSubmit = async () => {
        if (!email.trim() || submitting) return;
        setSubmitting(true);
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            await supabase.from('early_access').insert({ email: email.trim(), source: 'landing_page' });
            setSubmitted(true);
        } catch { setSubmitted(true); }
        setSubmitting(false);
    };

    const s1 = useFadeIn(), s2 = useFadeIn(), s3 = useFadeIn(), s4 = useFadeIn();
    const s5 = useFadeIn(), s6 = useFadeIn(), s7 = useFadeIn();

    return (
        <div>
            {/* ═══ 1. HERO ═══ */}
            <section className="min-h-[90vh] flex items-center justify-center px-5 relative overflow-hidden">
                {/* 배경 글로우 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo-100/50 blur-[180px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-100/40 blur-[120px] pointer-events-none" />

                <div ref={s1.ref} className={`${s1.className} w-full max-w-3xl relative`}>
                    {/* 상단 뱃지 */}
                    <div className="flex justify-center mb-10">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            안녕! 싸이월드, 카카오스토리 ㅠㅠ
                        </span>
                    </div>

                    {/* 회전 헤드라인 */}
                    <HeroRotator />

                    {/* 고정 서브 카피 */}
                    <p className="mt-8 text-base sm:text-lg text-neutral-400 leading-relaxed text-center max-w-xl mx-auto">
                        사진·메모·일정·관계가 자동 정리되는 나만의 OS.
                        <br className="hidden sm:block" />
                        기록·분류·분석·실행을 하나로.
                    </p>

                    {/* CTA */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {!isLoading && isAuthenticated ? (
                            <button onClick={() => router.push('/myverse/app/capture')}
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition shadow-xl shadow-indigo-500/30 text-base">
                                앱으로 이동 <ArrowRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <>
                                <button onClick={() => setLoginOpen(true)}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition shadow-xl shadow-indigo-500/30 text-base">
                                    시작하기 <ArrowRight className="h-4 w-4" />
                                </button>
                                <button onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="text-sm text-neutral-400 hover:text-neutral-700 transition px-4 py-3">
                                    출시 소식 받기
                                </button>
                            </>
                        )}
                    </div>

                    <p className="mt-5 text-xs text-neutral-400 flex items-center justify-center gap-2">
                        <Smartphone className="h-3.5 w-3.5" /> iOS + Android &middot; 곧 출시
                    </p>
                </div>
            </section>

            {/* ═══ 1-B. ATTENTION SHIFT ═══ */}
            <section className="py-24 lg:py-32 px-5">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-indigo-600 text-xs font-semibold tracking-widest uppercase mb-3">your attention</p>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                        SNS에 나를 보여주기 위해
                        <br className="hidden sm:block" />
                        쏟아온 시간들.
                    </h2>
                    <p className="text-lg text-neutral-500 leading-relaxed mb-8">
                        다른 사람의 시선을 위해 다듬은 피드, 좋아요 숫자, 알고리즘이 정한 순서.
                        <br className="hidden sm:block" />
                        그 시간을 이제 <span className="text-neutral-800 font-semibold">나에게</span> 쓸 수 있다면.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3 mt-12 text-sm">
                        {[
                            { icon: "🎭", before: "남에게 보여줄 나", after: "나에게 솔직한 나" },
                            { icon: "📊", before: "남의 알고리즘",   after: "내 흐름" },
                            { icon: "⏳", before: "휘발되는 피드",    after: "쌓이는 기록" },
                        ].map((row, i) => (
                            <div key={i} className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
                                <div className="text-2xl mb-2">{row.icon}</div>
                                <p className="text-xs text-neutral-400 line-through mb-1">{row.before}</p>
                                <p className="text-sm font-semibold text-neutral-900">{row.after}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-10 text-sm text-neutral-400 italic">
                        Myverse는 보여주는 도구가 아니라, 나에게 집중하는 시간입니다.
                    </p>
                </div>
            </section>

            {/* ═══ 2. FEAR ═══ */}
            <section className="py-24 lg:py-32 px-5 bg-neutral-50">
                <div ref={s2.ref} className={`${s2.className} max-w-5xl mx-auto`}>
                    <p className="text-indigo-600 text-xs font-semibold tracking-widest uppercase mb-3">your records</p>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-12">당신의 디지털 기록은 당신의 것입니까?</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { num: 32847, suffix: '장', label: '스마트폰 사진', sub: '정리한 적 없다', hl: false },
                            { num: 6, suffix: '년치', label: '인스타그램', sub: '메타가 소유', hl: false },
                            { num: 0, suffix: '', label: '카톡에서 받은 사진', sub: '너무 많아서 어디 갔는지도 모른다', hl: false, display: '????' },
                            { num: 170, suffix: '억 건', label: '싸이월드', sub: '3,200만 명의 인질 상태', hl: true },
                        ].map((c, i) => (
                            <div key={i} className={`rounded-2xl p-5 border ${c.hl ? 'border-rose-200 bg-rose-50' : 'border-neutral-100 bg-white'} shadow-sm`}>
                                <p className="text-2xl sm:text-3xl font-black mb-3">
                                    {c.display || <Counter target={c.num} suffix={c.suffix} />}
                                </p>
                                <p className="text-sm text-neutral-700">{c.label}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{c.sub}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-neutral-500 mt-10 text-sm font-medium leading-relaxed">
                        <span className="text-neutral-400">서비스가 사라지면, 나의 추억도.</span>
                    </p>
                </div>
            </section>

            {/* ═══ 3. HOW IT WORKS ═══ */}
            <section className="py-24 lg:py-32 px-5">
                <div ref={s3.ref} className={`${s3.className} max-w-5xl mx-auto`}>
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
                                { icon: Camera, title: '사진이나 메모를 남긴다', desc: '찍는 순간, 기록이 시작된다' },
                                { icon: Calendar, title: 'AI가 캘린더와 대조', desc: '일정과 기록을 자동 매칭' },
                                { icon: Tag, title: '자동 태그 + LOG 저장', desc: '장소, 사람, 감정 태그' },
                                { icon: Moon, title: '하루 요약', desc: 'AI가 오늘을 한 줄로 정리' },
                            ].map(s => (
                                <div key={s.title} className="bg-white rounded-xl p-5 border border-neutral-100 shadow-sm">
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
                                { icon: Camera, title: '사진이나 메모를 남긴다', desc: '나의 기록에서 시작' },
                                { icon: Share2, title: '공유할 콘텐츠 선택', desc: '내가 공유하고 싶은 것만' },
                                { icon: Zap, title: 'AI가 한번에 공유', desc: '인스타그램, 스레드, X' },
                                { icon: Fingerprint, title: '나의 정체성이 된다', desc: '흔적이 모여 나를 만든다' },
                            ].map(s => (
                                <div key={s.title} className="bg-white rounded-xl p-5 border border-neutral-100 shadow-sm">
                                    <s.icon className="h-5 w-5 text-purple-600 mb-3" />
                                    <h4 className="text-sm font-bold mb-1">{s.title}</h4>
                                    <p className="text-xs text-neutral-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flow 3: 모은다 */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-600 text-white text-sm font-bold">3</span>
                            <h3 className="text-xl font-bold">모은다</h3>
                        </div>
                        <div className="grid sm:grid-cols-4 gap-4">
                            {[
                                { icon: Link2, title: '나의 계정을 연결', desc: '소셜, 클라우드 계정 연동' },
                                { icon: Download, title: '과거 흔적을 모은다', desc: '디지털 흔적을 한 곳에' },
                                { icon: Bot, title: 'AI가 관리해준다', desc: '자동 분류, 정리, 보관' },
                                { icon: Star, title: '기록이 역사가 된다', desc: '나의 인생 타임라인' },
                            ].map(s => (
                                <div key={s.title} className="bg-white rounded-xl p-5 border border-neutral-100 shadow-sm">
                                    <s.icon className="h-5 w-5 text-pink-600 mb-3" />
                                    <h4 className="text-sm font-bold mb-1">{s.title}</h4>
                                    <p className="text-xs text-neutral-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 3-B. DATA SOURCES ═══ */}
            <section className="py-24 lg:py-32 px-5 bg-neutral-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-indigo-600 font-semibold text-xs tracking-widest uppercase mb-3">DATA SOURCES</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">흩어진 나를 데려오기</h2>
                        <p className="mt-4 text-sm text-neutral-500 max-w-lg mx-auto">
                            각 플랫폼에서 데이터를 내려받거나 연동하면, Myverse가 하나로 모읍니다.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
                        {[
                            { icon: Instagram,       name: "Instagram",       type: "파일 임포트" },
                            { icon: MessageSquare,   name: "KakaoTalk",       type: "파일 임포트" },
                            { icon: Calendar,        name: "Google Calendar", type: "OAuth 연동" },
                            { icon: Smartphone,      name: "Facebook",        type: "파일 임포트" },
                            { icon: Heart,           name: "Apple Health",    type: "시스템 연동" },
                            { icon: Activity,        name: "삼성 헬스",        type: "시스템 연동" },
                        ].map(s => (
                            <div key={s.name} className="p-4 rounded-xl bg-white border border-neutral-200 text-center hover:border-indigo-200 transition-colors">
                                <s.icon className="h-5 w-5 text-indigo-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-neutral-900">{s.name}</p>
                                <p className="text-[10px] text-neutral-400 mt-1">{s.type}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-xs text-neutral-400 mt-6">
                        + Twitter/X · YouTube · 네이버 블로그 · 금융 마이데이터 · 의료 마이데이터 (단계적 도입)
                    </p>
                </div>
            </section>

            {/* ═══ 4. BRIDGE ═══ */}
            <section className="py-28 lg:py-36 px-5">
                <div ref={s4.ref} className={`${s4.className} max-w-3xl mx-auto text-center`}>
                    <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                        나는 나의 세계관을
                        <br />
                        만들기로 했다.
                    </h2>
                    <p className="mt-8 text-xl text-neutral-400 font-light tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        Myverse — Personal OS
                    </p>
                    <p className="mt-8 text-neutral-500 leading-relaxed">
                        사진을 찍는다. AI가 정리한다.
                        <br />
                        쌓이면 나의 인생이 된다.
                    </p>
                </div>
            </section>

            {/* ═══ 5. 앱 미리보기 (폰 목업) ═══ */}
            <section className="py-20 lg:py-28 bg-neutral-50">
                <div ref={s5.ref} className={`${s5.className} max-w-5xl mx-auto px-5`}>
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
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
                                Myverse는 나의 것입니다. 서비스는 사라져도 나의 기록은 남습니다.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {['사진 찍으면 AI가 자동 분류', '캘린더 대조로 맥락 태깅', '매일 저녁 하루 요약'].map(t => (
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
                                    <div className="bg-indigo-600 px-5 pt-10 pb-6 text-white">
                                        <p className="text-xs opacity-70">2026년 3월 30일 월요일</p>
                                        <p className="text-lg font-bold mt-1">오늘의 기록</p>
                                        <p className="text-sm opacity-80 mt-0.5">3건의 기록 &middot; 기분 좋음</p>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="rounded-xl bg-neutral-50 p-3">
                                            <div className="flex items-center gap-2 mb-1"><span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">카페</span><span className="text-[10px] text-neutral-400">오후 2:15</span></div>
                                            <p className="text-xs text-neutral-700">서울숲 카페에서 수진이랑 점심</p>
                                        </div>
                                        <div className="rounded-xl bg-neutral-50 p-3">
                                            <div className="flex items-center gap-2 mb-1"><span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">업무</span><span className="text-[10px] text-neutral-400">오후 4:30</span></div>
                                            <p className="text-xs text-neutral-700">프로젝트 중간 발표 준비 완료</p>
                                        </div>
                                        <div className="rounded-xl bg-neutral-50 p-3">
                                            <div className="flex items-center gap-2 mb-1"><span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">운동</span><span className="text-[10px] text-neutral-400">오후 7:00</span></div>
                                            <p className="text-xs text-neutral-700">한강 러닝 5km 완주</p>
                                        </div>
                                        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-3 border border-indigo-100">
                                            <div className="flex items-center gap-1.5 mb-1"><Bot className="h-3 w-3 text-indigo-500" /><span className="text-[10px] font-semibold text-indigo-600">AI 하루 요약</span></div>
                                            <p className="text-xs text-neutral-600">&ldquo;친구와 여유로운 점심, 발표 준비 마무리, 저녁엔 러닝으로 리프레시. 알찬 하루!&rdquo;</p>
                                        </div>
                                    </div>
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

            {/* ═══ 5-B. DATA SOVEREIGNTY ═══ */}
            <section className="py-24 lg:py-32 px-5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-indigo-600 font-semibold text-xs tracking-widest uppercase mb-3">DATA SOVEREIGNTY</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">데이터 주권 5원칙</h2>
                        <p className="mt-4 text-sm text-neutral-500 max-w-lg mx-auto">
                            서비스는 사라져도, 나의 기록은 남는다.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
                        {[
                            { icon: Lock,      title: "소유",      desc: "사용자 소유. Myverse는 보관 대행." },
                            { icon: HardDrive, title: "로컬 우선", desc: "핵심 데이터는 디바이스. 클라우드는 동기화." },
                            { icon: Trash2,    title: "완전 삭제", desc: "탈퇴 시 즉시 전량 파기. 유예 없음." },
                            { icon: Download,  title: "이식성",    desc: "전체 데이터 원클릭 내보내기. JSON + 원본 미디어." },
                            { icon: FileJson,  title: "생존성",    desc: "Myverse가 사라져도 표준 포맷으로 존속." },
                        ].map(s => (
                            <div key={s.title} className="p-5 rounded-xl bg-white border border-neutral-200 text-center shadow-sm">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                                    <s.icon className="h-5 w-5 text-emerald-600" />
                                </div>
                                <h3 className="font-semibold text-sm text-neutral-900 mb-1">{s.title}</h3>
                                <p className="text-[11px] text-neutral-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 5-C. UNIVERSAL RECORD (Tech) ═══ */}
            <section className="py-24 lg:py-32 px-5 bg-neutral-900 text-neutral-100">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-indigo-400 font-semibold text-xs tracking-widest uppercase mb-3">UNIVERSAL RECORD</p>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                                하나의 포맷으로 정규화
                            </h2>
                            <p className="text-neutral-400 leading-relaxed mb-5">
                                Instagram 사진이든, 카카오톡 대화든, 구글 캘린더 일정이든
                                모든 출처를 하나의 Universal Record 포맷으로 변환합니다.
                                새 서비스 추가 시 파서만 작성하면 됩니다.
                            </p>
                            <div className="space-y-2 text-sm">
                                {[
                                    "사진 — 타입·시간·위치 메타 추출 (제공)",
                                    "Vision 자동 태깅 — 음식·문서·인물 인식 (도입 예정)",
                                    "음성 — STT 텍스트 변환 + 요약 (베타)",
                                    "위치 — Reverse geocoding + 거점 매칭 (제공)",
                                ].map(t => (
                                    <div key={t} className="flex items-start gap-2 text-neutral-400">
                                        <span className="text-indigo-400 mt-0.5">→</span>
                                        <span>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-neutral-800 border border-neutral-700 font-mono text-[12px] text-neutral-400 leading-relaxed">
                            <p className="text-indigo-400 mb-2">Record &#123;</p>
                            <p className="ml-4">id          <span className="text-neutral-500">고유 식별자</span></p>
                            <p className="ml-4">source      <span className="text-neutral-500">instagram | kakaotalk | camera | ...</span></p>
                            <p className="ml-4">type        <span className="text-neutral-500">post | message | event | food_photo | ...</span></p>
                            <p className="ml-4">timestamp   <span className="text-neutral-500">2026-05-11T19:30:00+09:00</span></p>
                            <p className="ml-4">location    <span className="text-neutral-500">&#123; lat, lng, name &#125;</span></p>
                            <p className="ml-4">content     <span className="text-neutral-500">&#123; text, media[], metadata &#125;</span></p>
                            <p className="ml-4">ai_tags     <span className="text-neutral-500">&#123; category, objects[], mood &#125;</span></p>
                            <p className="ml-4">embedding   <span className="text-neutral-500">[ AI 벡터 ]</span></p>
                            <p className="ml-4">privacy     <span className="text-neutral-500">private | shared</span></p>
                            <p className="text-indigo-400">&#125;</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 6. SOUL MATE AI ═══ */}
            <section className="py-20 lg:py-28">
                <div ref={s6.ref} className={`${s6.className} max-w-5xl mx-auto px-5`}>
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div><p className="text-sm font-semibold">Myverse AI</p><p className="text-[10px] text-emerald-500">Active</p></div>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-neutral-50 rounded-xl p-3 text-sm text-neutral-700 max-w-[75%] ml-auto">요즘 왜 이렇게 돈을 많이 쓰지?</div>
                                <div className="bg-indigo-50 rounded-xl p-3 text-sm text-neutral-700 max-w-[85%] space-y-1.5">
                                    <p>이번 달 외식이 23회야. 지난달보다 8번 많아.</p>
                                    <p>주로 목~금요일에 몰려 있어.</p>
                                    <p className="text-neutral-400 text-xs">네 패턴상 마감 전후에 외식이 느는 편이야.</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-indigo-600 font-semibold text-sm mb-2">SOUL MATE AI</p>
                            <h2 className="text-3xl font-bold leading-tight">비서가 아닌<br /><span className="text-indigo-600">영혼의 단짝</span></h2>
                            <p className="mt-4 text-neutral-500 leading-relaxed">Myverse AI는 참견하지 않습니다.<br />오래 사귄 친구처럼 나를 깊이 알되, 조심스럽습니다.</p>
                            <div className="mt-6 space-y-2 text-sm">
                                <div className="flex items-start gap-3"><span className="text-rose-500 font-bold mt-0.5">X</span><span className="text-neutral-500">&ldquo;커피를 너무 많이 드시네요. 줄이세요.&rdquo;</span></div>
                                <div className="flex items-start gap-3"><span className="text-emerald-500 font-bold mt-0.5">O</span><span className="text-neutral-700">&ldquo;이번 주 커피 7잔째야.&rdquo;</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 7. WHY MYVERSE ═══ */}
            <section className="py-20 lg:py-28 bg-neutral-50">
                <div ref={s7.ref} className={`${s7.className} max-w-5xl mx-auto px-5 text-center`}>
                    <p className="text-indigo-600 font-semibold text-sm mb-2">WHY MYVERSE</p>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-12">
                        나의 일상은<br /><span className="text-indigo-600">나만의 OS로 운영된다</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Camera, title: '정리 안 되는 사진', desc: '수만 장이 쌓여 있지만 정리할 엄두가 안 난다. 누구와, 어디서, 왜 찍었는지 시간이 지나면 잊어버린다.' },
                            { icon: Shield, title: '사라지는 기록', desc: '싸이월드, 바인, 구글플러스 — 서비스가 죽으면 내 기록도 증발한다. 소유권은 플랫폼에 있다.' },
                            { icon: Sparkles, title: '소셜의 피로', desc: '인스타그램은 남에게 보여주는 공간. 진짜 나의 일상을 솔직하게 기록할 공간이 없다.' },
                        ].map(p => (
                            <div key={p.title} className="bg-white rounded-2xl p-6 text-left border border-neutral-100 shadow-sm">
                                <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center mb-4"><p.icon className="h-5 w-5 text-indigo-600" /></div>
                                <h3 className="font-bold mb-2">{p.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 8. CTA ═══ */}
            <section id="cta" className="py-28 lg:py-36 px-5 bg-gradient-to-b from-indigo-50 to-white">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        마이버스의 소식을
                        <br />
                        받아보세요
                    </h2>
                    <p className="text-neutral-500 mb-8">처음엔 사진 한 장. 매일 쌓으면 나의 우주.</p>
                    {submitted ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 py-4">
                            <span className="text-lg">&#10003;</span>
                            <span>신청 완료! 출시 소식을 가장 먼저 알려드릴게요.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="이메일 주소"
                                className="flex-1 rounded-full border border-neutral-200 px-5 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-indigo-400 bg-white" />
                            <button onClick={handleSubmit} disabled={!email.trim() || submitting}
                                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 shadow-lg shadow-indigo-500/25">
                                {submitting ? '...' : '신청하기'}
                            </button>
                        </div>
                    )}
                    <p className="mt-6 text-xs text-neutral-400">iOS + Android &middot; 곧 출시 &middot; WIO by Ten:One&trade;</p>
                </div>
            </section>

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#6366F1" defaultTab="signup" />
        </div>
    );
}
