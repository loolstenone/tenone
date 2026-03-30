"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Bot, Camera, Calendar, Tag, Moon, Share2, Zap, Link2, Download, Smartphone } from "lucide-react";

/* ── Intersection Observer fade-in ── */
function useFadeIn() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, className: `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}` };
}

/* ── Counter animation ── */
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
        const steps = 40;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(current));
        }, 1500 / steps);
        return () => clearInterval(timer);
    }, [started, target]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function MyVersePage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
    const s5 = useFadeIn(), s6 = useFadeIn(), s7 = useFadeIn(), s8 = useFadeIn();

    return (
        <div>
            {/* ═══ 1. HERO ═══ */}
            <section className="min-h-[85vh] flex items-center justify-center px-5 relative">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-100/60 blur-[150px]" />
                <div ref={s1.ref} className={`${s1.className} text-center max-w-3xl relative`}>
                    <p className="text-sm mb-6">
                        <span className="bg-gradient-to-r from-neutral-500 via-neutral-400 to-neutral-300 bg-clip-text text-transparent">
                            안녕! 싸이월드, 카카오스토리 ㅠㅠ
                        </span>
                    </p>
                    <h1 className="text-[clamp(2.2rem,6vw,4.5rem)] font-black leading-[1.1] tracking-tight text-neutral-900">
                        나의 디지털 흔적은
                        <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                            내 것이어야 한다
                        </span>
                    </h1>
                    <p className="mt-6 text-lg text-neutral-500 leading-relaxed">
                        사진이나 메모를 AI가 정리해준다.
                        <br />
                        서비스는 사라져도 내 기록은 남는다.
                    </p>
                    <button onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
                        className="mt-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-indigo-500/25">
                        Personal Blackbox 신청 <ArrowRight className="h-4 w-4" />
                    </button>
                    <p className="mt-4 text-xs text-neutral-400 flex items-center justify-center gap-2">
                        <Smartphone className="h-3.5 w-3.5" /> iOS + Android &middot; 곧 출시
                    </p>
                </div>
            </section>

            {/* ═══ 2. FEAR ═══ */}
            <section className="py-24 lg:py-32 px-5 bg-neutral-50">
                <div ref={s2.ref} className={`${s2.className} max-w-5xl mx-auto`}>
                    <p className="text-indigo-600 text-xs font-semibold tracking-widest uppercase mb-3">your records</p>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-12">당신의 기록은 안전합니까?</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { num: 32847, suffix: '장', label: '스마트폰 사진', sub: '정리한 적 없다', hl: false },
                            { num: 6, suffix: '년치', label: '인스타그램', sub: '메타가 소유', hl: false },
                            { num: 0, suffix: '', label: '카톡에서 받은 사진', sub: '어디 갔는지 모른다', hl: false, display: '????' },
                            { num: 170, suffix: '억 건', label: '싸이월드', sub: '3,200만 명의 인질 상태', hl: true },
                        ].map((c, i) => (
                            <div key={i} className={`rounded-2xl p-5 border ${c.hl ? 'border-rose-200 bg-rose-50' : 'border-neutral-100 bg-white'} shadow-sm`}>
                                <p className="text-2xl sm:text-3xl font-black text-neutral-900 mb-3">
                                    {c.display || <Counter target={c.num} suffix={c.suffix} />}
                                </p>
                                <p className="text-sm text-neutral-700">{c.label}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{c.sub}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-neutral-500 mt-10 text-sm font-medium">
                        플랫폼이 닫히면, 알려주지도 않는다.
                    </p>
                </div>
            </section>

            {/* ═══ 3. BRIDGE ═══ */}
            <section className="py-28 lg:py-36 px-5">
                <div ref={s3.ref} className={`${s3.className} max-w-3xl mx-auto text-center`}>
                    <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-neutral-900">
                        나는 나의 세계관을
                        <br />
                        만들기로 했다.
                    </h2>
                    <p className="mt-8 text-xl text-neutral-400 font-light tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        My Universe — Myverse
                    </p>
                    <p className="mt-8 text-neutral-500 leading-relaxed">
                        사진을 찍는다. AI가 정리한다.
                        <br />
                        쌓이면 나의 인생이 된다.
                    </p>
                </div>
            </section>

            {/* ═══ 4. HOW IT WORKS ═══ */}
            <section className="py-24 lg:py-32 px-5 bg-neutral-50">
                <div ref={s4.ref} className={`${s4.className} max-w-5xl mx-auto`}>
                    <p className="text-indigo-600 text-xs font-semibold tracking-widest uppercase mb-3">HOW IT WORKS</p>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-14">나의 흔적이 기록이 된다</h2>

                    {[
                        { n: '1', title: '기록한다', tag: '사진 한 장이면 된다. 나머지는 AI가.', cards: [
                            { icon: Camera, t: '사진이나 메모를 남긴다', s: '찍는 순간, 기록이 시작된다' },
                            { icon: Calendar, t: 'AI가 캘린더와 대조', s: '일정과 기록을 자동 매칭' },
                            { icon: Tag, t: '자동 태그 + LOG 저장', s: '장소, 사람, 감정 태그' },
                            { icon: Moon, t: '하루 요약', s: 'AI가 오늘을 한 줄로 정리' },
                        ]},
                        { n: '2', title: '공유한다', tag: '내가 원하는 것만, 원하는 사람에게만.', cards: [
                            { icon: Share2, t: '공유할 콘텐츠 선택', s: '원하는 것만 골라서' },
                            { icon: Zap, t: 'AI가 한번에 공유', s: '카톡, 인스타 DM, 어디든' },
                            { icon: Link2, t: 'URL로 어디든', s: '링크 하나로 공유' },
                        ]},
                        { n: '3', title: '모은다', tag: '흩어진 10년을 한 곳에. 다시는 잃지 않는다.', cards: [
                            { icon: Link2, t: '나의 계정을 연결', s: '소셜, 클라우드 연동' },
                            { icon: Download, t: '과거 흔적을 모은다', s: '디지털 흔적을 한 곳에' },
                            { icon: Bot, t: 'AI가 관리해준다', s: '자동 분류, 정리, 보관' },
                        ]},
                    ].map(step => (
                        <div key={step.n} className="mb-14 last:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl font-black text-neutral-200">{step.n}</span>
                                <div>
                                    <h3 className="text-xl font-bold">{step.title}</h3>
                                    <p className="text-sm text-neutral-500">{step.tag}</p>
                                </div>
                            </div>
                            <div className={`grid sm:grid-cols-${step.cards.length} gap-3 mt-4`}>
                                {step.cards.map(c => (
                                    <div key={c.t} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <c.icon className="h-5 w-5 text-indigo-600 mb-3" />
                                        <h4 className="text-sm font-semibold mb-1">{c.t}</h4>
                                        <p className="text-xs text-neutral-500">{c.s}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ 5. DEMO — Before/After ═══ */}
            <section className="py-24 lg:py-32 px-5">
                <div ref={s5.ref} className={`${s5.className} max-w-5xl mx-auto`}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                            <p className="text-xs text-neutral-400 mb-4 font-semibold">Before — 스마트폰 갤러리</p>
                            <div className="space-y-2 font-mono text-sm text-neutral-400">
                                <p className="text-neutral-600 font-semibold">3월 30일</p>
                                <p>IMG_4521.jpg</p><p>IMG_4522.jpg</p><p>IMG_4523.jpg</p>
                                <p className="text-neutral-600 font-semibold mt-3">3월 29일</p>
                                <p>IMG_4518.jpg</p><p>IMG_4519.jpg</p>
                            </div>
                            <p className="mt-6 text-xs text-neutral-400">날짜만 있다. 누구와, 어디서, 왜? 모른다.</p>
                        </div>
                        <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm">
                            <p className="text-xs text-indigo-600 mb-4 font-semibold">After — Myverse LOG</p>
                            <p className="text-neutral-700 font-semibold text-sm mb-4">3월 30일 월요일</p>
                            <div className="space-y-3">
                                <div className="rounded-xl bg-neutral-50 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">카페</span>
                                        <span className="text-[10px] text-neutral-400">14:15</span>
                                    </div>
                                    <p className="text-xs text-neutral-700">서울숲 카페에서 수진이랑 점심</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">#수진 #점심 #카페 &middot; 기분 좋음</p>
                                </div>
                                <div className="rounded-xl bg-neutral-50 p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-medium">운동</span>
                                        <span className="text-[10px] text-neutral-400">19:00</span>
                                    </div>
                                    <p className="text-xs text-neutral-700">한강 러닝 5km 완주</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">#운동 #5km &middot; 성취감</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-3">
                                    <p className="text-[10px] text-indigo-600 font-semibold mb-1">AI 하루 요약</p>
                                    <p className="text-xs text-neutral-600">&ldquo;친구와 여유로운 점심, 저녁엔 러닝으로 리프레시. 알찬 하루!&rdquo;</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 6. SOUL MATE AI ═══ */}
            <section className="py-24 lg:py-32 px-5 bg-neutral-50">
                <div ref={s6.ref} className={`${s6.className} max-w-5xl mx-auto`}>
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold">Myverse AI</span>
                                <span className="text-[10px] text-emerald-500">Active</span>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-neutral-50 rounded-xl p-3 text-sm text-neutral-700 max-w-[75%] ml-auto">
                                    요즘 왜 이렇게 돈을 많이 쓰지?
                                </div>
                                <div className="bg-indigo-50 rounded-xl p-3 text-sm text-neutral-700 max-w-[85%] space-y-1.5">
                                    <p>이번 달 외식이 23회야. 지난달보다 8번 많아.</p>
                                    <p>주로 목~금요일에 몰려 있어.</p>
                                    <p className="text-neutral-400 text-xs">네 패턴상 마감 전후에 외식이 느는 편이야.</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-indigo-600 text-xs font-semibold tracking-widest uppercase mb-3">SOUL MATE AI</p>
                            <h2 className="text-3xl font-bold mb-4">비서가 아닌<br />영혼의 단짝</h2>
                            <p className="text-neutral-500 mb-6 leading-relaxed">
                                Myverse AI는 참견하지 않습니다.
                                <br />오래 사귄 친구처럼 나를 깊이 알되, 조심스럽습니다.
                            </p>
                            <div className="space-y-3 text-sm mb-8">
                                <div className="flex items-start gap-3">
                                    <span className="text-rose-500 font-bold mt-0.5">X</span>
                                    <div>
                                        <span className="text-neutral-500">&ldquo;커피를 너무 많이 드시네요. 줄이세요.&rdquo;</span>
                                        <p className="text-neutral-400 text-xs mt-0.5">지시하지 않는다</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-emerald-500 font-bold mt-0.5">O</span>
                                    <div>
                                        <span className="text-neutral-700">&ldquo;이번 주 커피 7잔째야.&rdquo;</span>
                                        <p className="text-neutral-400 text-xs mt-0.5">사실만 알려준다. 판단은 나의 몫.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
                                <p className="text-xs text-neutral-500 mb-2">3개월 후, AI가 말한다</p>
                                <p className="text-sm text-neutral-600 leading-relaxed italic">
                                    &ldquo;올해 네가 가장 많이 만난 사람은 수진이야.
                                    작년 이맘때는 태호였어.
                                    3월마다 새로운 프로젝트를 시작하는 패턴이 있어.&rdquo;
                                </p>
                                <p className="text-xs text-indigo-600 mt-3 font-semibold">쓸수록 나를 더 깊이 안다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 7. TRUST ═══ */}
            <section className="py-24 lg:py-32 px-5">
                <div ref={s7.ref} className={`${s7.className} max-w-5xl mx-auto`}>
                    <p className="text-indigo-600 text-xs font-semibold tracking-widest uppercase mb-3">BUILT BY</p>
                    <h2 className="text-3xl font-bold mb-12">WIO by Ten:One&trade;</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { num: '20', suf: '년', l1: '마케팅·광고', l2: '업계 경력' },
                            { num: '9,000', suf: '+', l1: '전문가', l2: '네트워크' },
                            { num: '7', suf: '개 거점', l1: '전국 대학생', l2: '연합' },
                            { num: '156,000', suf: '+', l1: '줄의 코드', l2: '이미 작동 중' },
                        ].map(t => (
                            <div key={t.l1}>
                                <p className="text-3xl sm:text-4xl font-black text-neutral-900">{t.num}<span className="text-neutral-400 text-xl">{t.suf}</span></p>
                                <p className="text-sm text-neutral-600 mt-1">{t.l1}</p>
                                <p className="text-xs text-neutral-400">{t.l2}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-neutral-500 mt-10 text-sm">이 모든 것 위에 Myverse를 만듭니다.</p>
                </div>
            </section>

            {/* ═══ 8. CTA ═══ */}
            <section id="cta" className="py-28 lg:py-36 px-5 bg-gradient-to-b from-indigo-50 to-white relative">
                <div ref={s8.ref} className={`${s8.className} max-w-xl mx-auto text-center relative`}>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        나의 블랙박스를
                        <br />
                        시작하세요
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
                                className="flex-1 rounded-full border border-neutral-200 px-5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-indigo-400 bg-white" />
                            <button onClick={handleSubmit} disabled={!email.trim() || submitting}
                                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 shadow-lg shadow-indigo-500/25">
                                {submitting ? '...' : '신청하기'}
                            </button>
                        </div>
                    )}
                    <p className="mt-6 text-xs text-neutral-400">iOS + Android &middot; 곧 출시 &middot; WIO by Ten:One&trade;</p>
                </div>
            </section>
        </div>
    );
}
