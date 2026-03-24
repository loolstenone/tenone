"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { validatePassword } from '@/lib/auth-data';
import { UserPlus, Eye, EyeOff, User, Building2, Mail } from 'lucide-react';
import { useSite } from '@/lib/site-context';
import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';

type AccountKind = 'personal' | 'business';

const quotes = [
    "본질에 집중하라. 나머지는 따라온다.",
    "어설픈 완벽주의는 일을 출발시키지 못한다.",
    "실현되지 않으면 아이디어가 아니다.",
    "길바닥 동전은 먼저 줍는 사람이 임자다.",
    "빠르게 실패하고, 더 빠르게 배워라.",
    "약한 연결고리가 강력한 기회를 만든다.",
    "먼저 움직이는 사람이 판을 바꾼다.",
    "끝까지 해내는 사람이 결국 이긴다.",
];

const specialties = [
    { id: 'planning', label: '기획/전략' },
    { id: 'design', label: '디자인' },
    { id: 'development', label: '개발' },
    { id: 'marketing', label: '마케팅/광고' },
    { id: 'content', label: '콘텐츠/미디어' },
    { id: 'communication', label: '커뮤니케이션/PR' },
    { id: 'business', label: '경영/비즈니스' },
    { id: 'hr', label: 'HR/조직관리' },
    { id: 'data', label: '데이터/AI' },
    { id: 'other', label: '기타' },
];

const wantToDo = [
    { id: 'project', label: '프로젝트 참여', desc: '텐원의 프로젝트에 함께하고 싶어요' },
    { id: 'brand', label: '브랜드 운영', desc: '유니버스 안에서 브랜드를 만들거나 합류' },
    { id: 'networking', label: '네트워킹', desc: '다양한 분야의 사람들과 연결' },
    { id: 'learning', label: '방법론 학습', desc: 'VRIEF, GPR 등 텐원의 프레임워크 배우기' },
    { id: 'mentoring', label: '멘토링/코칭', desc: '경험을 공유하거나 배우고 싶어요' },
    { id: 'investing', label: '투자/후원', desc: '텐원의 비전에 투자하고 싶어요' },
];

const inputClass = "w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-400 bg-white";
const labelClass = "block text-sm font-medium text-neutral-700 mb-1.5";

export default function SignupPage() {
    const router = useRouter();
    const { register, loginWithGoogle, loginWithKakao, isAuthenticated, isLoading } = useAuth();
    const { site } = useSite();
    const [step, setStep] = useState(1);
    const [accountKind, setAccountKind] = useState<AccountKind>('personal');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedWantToDo, setSelectedWantToDo] = useState<string[]>([]);
    const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passedStep1, setPassedStep1] = useState(false);
    const randomQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

    useEffect(() => {
        if (!isLoading && isAuthenticated) router.replace('/');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || isAuthenticated) {
        return <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>;
    }

    const toggleList = (list: string[], id: string, setter: (v: string[]) => void) => {
        setter(list.includes(id) ? list.filter(i => i !== id) : [...list, id]);
    };

    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return; }
        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) { setError(pwCheck.error!); return; }
        setPassedStep1(true);
        setStep(2);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await register(name, email, password, subscribeNewsletter);
            if (result.success) { router.push('/'); }
            else { setError(result.error || '회원가입에 실패했습니다.'); setIsSubmitting(false); setStep(1); }
        } catch { setError('회원가입 중 오류가 발생했습니다.'); setIsSubmitting(false); setStep(1); }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <PublicHeader />
            <div className="flex-1 flex items-center justify-center px-4 py-16 mt-16">
            <div className="w-full max-w-lg">
                <div className="text-center mb-10">
                    <Link href="/" className="text-xl md:text-3xl font-bold tracking-wider hover:opacity-80 transition-opacity">Ten:One™</Link>
                    <p className="text-sm text-neutral-500 mt-2 italic">&ldquo;{randomQuote}&rdquo;</p>
                </div>

                <div className="border border-neutral-200 p-8">
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 flex-1 cursor-pointer">
                            <div className={`h-1 flex-1 ${step >= 1 ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                            <span className={`text-[10px] ${step >= 1 ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>기본 정보</span>
                        </button>
                        <button type="button" onClick={() => passedStep1 && setStep(2)} className={`flex items-center gap-1.5 flex-1 ${passedStep1 ? 'cursor-pointer' : 'cursor-default'}`}>
                            <div className={`h-1 flex-1 ${step >= 2 ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                            <span className={`text-[10px] ${step >= 2 ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>프로필</span>
                        </button>
                    </div>

                    {/* ===== Step 1: 기본 정보 ===== */}
                    {step === 1 && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold">가입하기</h2>
                                <p className="text-sm text-neutral-500 mt-1">기본 정보를 입력해주세요</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button type="button" onClick={() => setAccountKind('personal')}
                                    className={`flex items-center justify-center gap-2 border px-4 py-3 text-sm font-medium transition-colors ${
                                        accountKind === 'personal' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                                    }`}><User className="h-4 w-4" /> 개인</button>
                                <button type="button" onClick={() => setAccountKind('business')}
                                    className={`flex items-center justify-center gap-2 border px-4 py-3 text-sm font-medium transition-colors ${
                                        accountKind === 'business' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                                    }`}><Building2 className="h-4 w-4" /> 기업</button>
                            </div>

                            <form onSubmit={handleStep1} className="space-y-4">
                                {accountKind === 'business' && (
                                    <div><label className={labelClass}>회사명</label>
                                        <input value={company} onChange={e => setCompany(e.target.value)} required placeholder="주식회사 텐원" className={inputClass} /></div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>{accountKind === 'business' ? '담당자명' : '이름'}</label>
                                        <input value={name} onChange={e => setName(e.target.value)} required placeholder="홍길동" className={inputClass} /></div>
                                    <div><label className={labelClass}>연락처</label>
                                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputClass} /></div>
                                </div>
                                <div><label className={labelClass}>{accountKind === 'business' ? '업무용 이메일' : '이메일'}</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        placeholder={accountKind === 'business' ? 'name@company.com' : 'you@example.com'} className={inputClass} /></div>
                                <div><label className={labelClass}>비밀번호</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                            placeholder="영문+숫자+특수문자 8자 이상" className={inputClass + " pr-12"} />
                                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(prev => !prev); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900">
                                            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div><label className={labelClass}>비밀번호 확인</label>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                        placeholder="비밀번호 재입력" className={inputClass} /></div>

                                {error && <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

                                <button type="submit"
                                    className="w-full bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                                    다음
                                </button>
                            </form>
                        </>
                    )}

                    {/* ===== Step 2: 프로필 ===== */}
                    {step === 2 && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold">거의 다 왔어요!</h2>
                                <p className="text-sm text-neutral-500 mt-1">가입 후 프로필에서 더 자세히 완성할 수 있어요 (선택사항)</p>
                            </div>

                            <div className="space-y-8">
                                {/* 전문 분야 */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-3">전문 분야 <span className="text-neutral-400 font-normal">(복수 선택)</span></label>
                                    <div className="flex flex-wrap gap-2">
                                        {specialties.map(item => (
                                            <button key={item.id} type="button" onClick={() => toggleList(selectedSpecialties, item.id, setSelectedSpecialties)}
                                                className={`border px-3 py-1.5 text-sm transition-colors ${
                                                    selectedSpecialties.includes(item.id)
                                                        ? 'border-neutral-900 bg-neutral-900 text-white'
                                                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                                                }`}>
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 함께 하고 싶은 일 */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-3">함께 하고 싶은 일 <span className="text-neutral-400 font-normal">(복수 선택)</span></label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {wantToDo.map(item => (
                                            <button key={item.id} type="button" onClick={() => toggleList(selectedWantToDo, item.id, setSelectedWantToDo)}
                                                className={`text-left border px-4 py-3 transition-colors ${
                                                    selectedWantToDo.includes(item.id)
                                                        ? 'border-neutral-900 bg-neutral-900 text-white'
                                                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                                                }`}>
                                                <span className="text-sm font-medium block">{item.label}</span>
                                                <span className={`text-xs mt-0.5 block ${selectedWantToDo.includes(item.id) ? 'text-neutral-400' : 'text-neutral-400'}`}>{item.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 뉴스레터 구독 */}
                                <div className="border border-neutral-200 bg-neutral-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <button type="button" onClick={() => setSubscribeNewsletter(!subscribeNewsletter)}
                                            className={`mt-0.5 w-5 h-5 border-2 rounded flex items-center justify-center shrink-0 transition-colors ${
                                                subscribeNewsletter ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300 bg-white'
                                            }`}>
                                            {subscribeNewsletter && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Mail className="h-3.5 w-3.5 text-neutral-500" />
                                                <span className="text-sm font-medium text-neutral-800">뉴스레터 구독</span>
                                            </div>
                                            <p className="text-xs text-neutral-500 leading-relaxed">
                                                Ten:One™ Universe의 새로운 소식, 프로젝트 업데이트, 이벤트 초대를 이메일로 받아보세요.
                                                <br />월 1~2회 발송되며, 언제든 구독 해지할 수 있습니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => setStep(1)}
                                    className="flex-1 border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-500 hover:border-neutral-400 transition-colors">
                                    이전
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {isSubmitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><UserPlus className="h-4 w-4" /> 가입 완료</>}
                                </button>
                            </div>

                            <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                                className="w-full mt-3 text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                                건너뛰기
                            </button>
                        </>
                    )}

                    {(site?.authMethods?.google || site?.authMethods?.kakao) && (
                    <div className="mt-6 pt-6 border-t border-neutral-100 space-y-3">
                        <p className="text-xs text-neutral-400 text-center">또는 소셜 계정으로 가입</p>
                        {site?.authMethods?.google && (
                        <button onClick={loginWithGoogle} type="button"
                            className="w-full flex items-center justify-center gap-3 border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Google로 가입
                        </button>
                        )}
                        {site?.authMethods?.kakao && (
                        <button onClick={loginWithKakao} type="button"
                            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#191919] hover:bg-[#F5DC00] transition-colors">
                            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.794 5.11 4.504 6.46-.163.6-.593 2.178-.68 2.514-.107.42.155.414.326.301.134-.089 2.13-1.45 3.003-2.042.27.038.546.058.826.076h.042C15.523 18 20 14.537 20 10.309 20 6.081 15.523 3 12 3z" fill="#191919"/></svg>
                            카카오로 가입
                        </button>
                        )}
                    </div>
                    )}

                    <div className="mt-4 text-center">
                        <p className="text-sm text-neutral-500">이미 계정이 있으신가요? <Link href="/login" className="text-neutral-900 font-medium hover:underline">로그인</Link></p>
                    </div>
                </div>
            </div>
            </div>
            <PublicFooter />
        </div>
    );
}
