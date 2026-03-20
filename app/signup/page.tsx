"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { validatePassword } from '@/lib/auth-data';
import { UserPlus, Eye, EyeOff, User, Building2 } from 'lucide-react';
import Link from 'next/link';

type AccountKind = 'personal' | 'business';

const interests = [
    { id: 'methodology', label: '방법론/프레임워크', desc: 'VRIEF, GPR 등' },
    { id: 'networking', label: '네트워킹/이벤트', desc: 'Badak, DAM Party' },
    { id: 'collaboration', label: '프로젝트 협업/의뢰', desc: '함께 일하기' },
    { id: 'join', label: '브랜드 합류', desc: 'MAD League 등' },
    { id: 'content', label: '콘텐츠 구독', desc: 'MADzine, Newsroom' },
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

const sources = [
    { id: 'search', label: '검색' },
    { id: 'sns', label: 'SNS' },
    { id: 'referral', label: '지인 소개' },
    { id: 'madleague', label: 'MAD League' },
    { id: 'badak', label: 'Badak' },
    { id: 'event', label: '행사/이벤트' },
    { id: 'other', label: '기타' },
];

const inputClass = "w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-400 bg-white";
const labelClass = "block text-sm font-medium text-neutral-700 mb-1.5";

export default function SignupPage() {
    const router = useRouter();
    const { register, isAuthenticated, isLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [accountKind, setAccountKind] = useState<AccountKind>('personal');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedWantToDo, setSelectedWantToDo] = useState<string[]>([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [intro, setIntro] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setStep(2);
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const result = register(name, email, password);
            if (result.success) { router.push('/'); }
            else { setError(result.error || '회원가입에 실패했습니다.'); setIsSubmitting(false); setStep(1); }
        }, 500);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg">
                <div className="text-center mb-10">
                    <Link href="/" className="text-3xl font-bold tracking-wider hover:opacity-80 transition-opacity">Ten:One™</Link>
                    <p className="text-sm text-neutral-500 mt-2">Universe의 잠재 파트너가 되어주세요</p>
                </div>

                <div className="border border-neutral-200 p-8">
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex items-center gap-1.5 flex-1">
                            <div className={`h-1 flex-1 ${step >= 1 ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                            <span className={`text-[10px] ${step >= 1 ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>기본 정보</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-1">
                            <div className={`h-1 flex-1 ${step >= 2 ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                            <span className={`text-[10px] ${step >= 2 ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>프로필</span>
                        </div>
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
                                <h2 className="text-xl font-bold">프로필을 완성해주세요</h2>
                                <p className="text-sm text-neutral-500 mt-1">맞춤 정보를 제공해드립니다 (선택사항)</p>
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

                                {/* 관심 분야 */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-3">관심 분야 <span className="text-neutral-400 font-normal">(복수 선택)</span></label>
                                    <div className="space-y-2">
                                        {interests.map(item => (
                                            <button key={item.id} type="button" onClick={() => toggleList(selectedInterests, item.id, setSelectedInterests)}
                                                className={`w-full text-left border px-4 py-3 text-sm transition-colors ${
                                                    selectedInterests.includes(item.id)
                                                        ? 'border-neutral-900 bg-neutral-900 text-white'
                                                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                                                }`}>
                                                <span className="font-medium">{item.label}</span>
                                                <span className={`ml-2 text-xs ${selectedInterests.includes(item.id) ? 'text-neutral-400' : 'text-neutral-400'}`}>{item.desc}</span>
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

                                {/* 자기소개 */}
                                <div>
                                    <label className={labelClass}>한 줄 자기소개</label>
                                    <input value={intro} onChange={e => setIntro(e.target.value)}
                                        className={inputClass} placeholder="본인을 한 줄로 표현해주세요" />
                                </div>

                                {/* 유입 경로 */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-3">어떻게 알게 되셨나요?</label>
                                    <div className="flex flex-wrap gap-2">
                                        {sources.map(item => (
                                            <button key={item.id} type="button" onClick={() => setSelectedSource(item.id)}
                                                className={`border px-3 py-1.5 text-sm transition-colors ${
                                                    selectedSource === item.id
                                                        ? 'border-neutral-900 bg-neutral-900 text-white'
                                                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                                                }`}>
                                                {item.label}
                                            </button>
                                        ))}
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

                    <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
                        <p className="text-sm text-neutral-500">이미 계정이 있으신가요? <Link href="/login" className="text-neutral-900 font-medium hover:underline">로그인</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
