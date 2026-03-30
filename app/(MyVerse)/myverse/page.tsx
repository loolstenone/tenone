"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Camera, Calendar, Tag, Moon, Share2, Zap, Link2, Download, Smartphone, Shield, Sparkles, Mail, MessageCircle } from "lucide-react";

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
    const s5 = useFadeIn(), s6 = useFadeIn(), s7 = useFadeIn();

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
                    <h1 className="text-[clamp(2.2rem,6vw,4.5rem)] font-black leading-[1.1] tracking-tight">
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
                        플랫폼이 닫히면, 알려주지도 않는다.
                        <br />
                        <span className="text-neutral-400">서비스가 사라지면, 나의 추억도.</span>
                    </p>
                </div>
            </section>

            {/* ═══ 3. HOW IT WORKS ═══ */}
            <section className="py-24 lg:py-32 px-5">
                <div ref={s3.ref} className={`${s3.className} max-w-5xl mx-auto`}>
                    <p className="text-indigo-600 text-xs font-semibold tracking-widest uppercase mb-3">HOW IT WORKS</p>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-14">나의 흔적이 기록이 된다</h2>

                    {[
                        { n: '1', title: '기록한다', tag: '사진 한 장이면 된다. 나머지는 AI가.', cols: 4, cards: [
                            { icon: Camera, t: '사진이나 메모를 남긴다', s: '찍는 순간, 기록이 시작된다' },
                            { icon: Calendar, t: 'AI가 캘린더와 대조', s: '일정과 기록을 자동 매칭' },
                            { icon: Tag, t: '자동 태그 + LOG 저장', s: '장소, 사람, 감정 태그' },
                            { icon: Moon, t: '하루 요약', s: 'AI가 오늘을 한 줄로 정리' },
                        ]},
                        { n: '2', title: '공유한다', tag: '내가 원하는 것만, 원하는 사람에게만.', cols: 3, cards: [
                            { icon: Share2, t: '공유할 콘텐츠 선택', s: '원하는 것만 골라서' },
                            { icon: Zap, t: 'AI가 한번에 공유', s: '인스타그램, 스레드, X' },
                            { icon: Link2, t: 'URL로 어디든', s: '링크 하나로 공유' },
                        ]},
                        { n: '3', title: '모은다', tag: '흩어진 10년을 한 곳에. 다시는 잃지 않는다.', cols: 3, cards: [
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
                            <div className={`grid sm:grid-cols-${step.cols} gap-3 mt-4`}>
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

            {/* ═══ 4. BRIDGE ═══ */}
            <section className="py-28 lg:py-36 px-5">
                <div ref={s4.ref} className={`${s4.className} max-w-3xl mx-auto text-center`}>
                    <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
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
                                Myverse는 나의 것입니다. 서비스가 사라져도 내 기록은 남습니다.
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
                        나의 디지털 흔적은<br /><span className="text-indigo-600">나의 것이어야 한다</span>
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

            {/* ═══ Contact ═══ */}
            <section className="py-16 px-5 border-t border-neutral-100">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-bold mb-2">Myverse</h3>
                        <p className="text-sm text-neutral-500">디지털 속 나의 기록</p>
                        <p className="text-xs text-neutral-400">Personal Blackbox</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Contact</h3>
                        <div className="flex flex-col gap-2 text-sm text-neutral-500">
                            <a href="https://tenone.biz/contact" className="hover:text-neutral-700 transition flex items-center gap-2"><Mail className="h-3.5 w-3.5" />tenone.biz/contact</a>
                            <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 transition flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5" />Kakao Open Chat</a>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Community</h3>
                        <p className="text-sm text-neutral-500 mb-3">Myverse에 바라는 점, 아이디어를 나눠주세요.</p>
                        <Link href="/myverse/contact" className="text-sm text-indigo-600 hover:text-indigo-500 transition">의견 남기기 &rarr;</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
