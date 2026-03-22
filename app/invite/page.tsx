"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// 초대 코드별 설정
const inviteCodes: Record<string, { type: string; label: string; group?: string; clubId?: string; generation?: number }> = {
    'YIO-2026': { type: 'youinone', label: 'YouInOne 멤버', group: 'YouInOne' },
    'YIA-2026': { type: 'youinone-alliance', label: 'YouInOne Alliance', group: 'YouInOne Alliance' },
    'ML-LEADER-2026': { type: 'madleague-leader', label: 'MADLeague 회장단', group: 'MADLeague' },
    'MADLEAP-5': { type: 'madleague-member', label: 'MADLeap 5기', clubId: 'madleap', generation: 5 },
    'PAM-3': { type: 'madleague-member', label: 'PAM 3기', clubId: 'pam', generation: 3 },
    'ADLLE-3': { type: 'madleague-member', label: 'ADlle 3기', clubId: 'adlle', generation: 3 },
    'ABC-3': { type: 'madleague-member', label: 'ABC 3기', clubId: 'abc', generation: 3 },
    'SUZAK-3': { type: 'madleague-member', label: 'SUZAK 3기', clubId: 'suzak', generation: 3 },
    'PAD-2': { type: 'madleague-member', label: 'P:ad 2기', clubId: 'pad', generation: 2 },
    'ADZONE-2': { type: 'madleague-member', label: 'AD Zone 2기', clubId: 'adzone', generation: 2 },
    'PARTNER-2026': { type: 'partner', label: 'Partner 초대' },
};

function InviteForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code') || '';
    const { isAuthenticated, isLoading } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState<'form' | 'verify' | 'done'>('form');
    const [verifyCode, setVerifyCode] = useState('');
    const [sentCode] = useState(() => String(Math.floor(100000 + Math.random() * 900000))); // Mock 6자리

    const invite = inviteCodes[code];

    useEffect(() => {
        if (!isLoading && isAuthenticated) router.replace('/intra/myverse');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
    );

    // 유효하지 않은 초대 코드
    if (!invite) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h1 className="text-lg font-bold mb-2">유효하지 않은 초대장입니다</h1>
                    <p className="text-sm text-neutral-500 mb-6">초대 링크를 다시 확인해주세요. 문의: hr@tenone.biz</p>
                    <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">홈으로 돌아가기</Link>
                </div>
            </div>
        );
    }

    // Step 3: 가입 완료
    if (step === 'done') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h1 className="text-lg font-bold mb-2">가입이 완료되었습니다</h1>
                    <p className="text-sm text-neutral-500 mb-2">이메일 인증이 확인되었습니다.</p>
                    <p className="text-xs text-neutral-400 mb-6">지금 바로 로그인하여 Intra에 접속할 수 있습니다.</p>
                    <Link href="/login" className="px-6 py-2.5 bg-neutral-900 text-sm text-white hover:bg-neutral-800 transition-colors inline-block">
                        로그인하기
                    </Link>
                </div>
            </div>
        );
    }

    const handleVerify = () => {
        if (verifyCode !== sentCode) {
            setError(`인증 코드가 일치하지 않습니다. (테스트용: ${sentCode})`);
            return;
        }
        // 인증 완료 → 가입 완료
        setStep('done');
        setError('');
    };

    // Step 2: 이메일 인증
    if (step === 'verify') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <Link href="/">
                            <Image src="/logo-horizontal.png" alt="TEN ONE" width={120} height={40} className="mx-auto mb-4" />
                        </Link>
                        <h1 className="text-lg font-bold mb-2">이메일 인증</h1>
                        <p className="text-sm text-neutral-500">
                            <span className="font-medium text-neutral-700">{email}</span>으로<br />
                            6자리 인증 코드를 발송했습니다.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2.5 rounded mb-4">{error}</div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">인증 코드 *</label>
                            <input
                                value={verifyCode}
                                onChange={e => setVerifyCode(e.target.value)}
                                placeholder="6자리 숫자"
                                maxLength={6}
                                className="w-full px-4 py-3 text-center text-lg tracking-[0.5em] font-mono border border-neutral-200 rounded focus:outline-none focus:border-neutral-400"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={verifyCode.length !== 6}
                            className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors disabled:opacity-30"
                        >
                            인증 확인
                        </button>

                        <div className="text-center space-y-2">
                            <button onClick={() => { setError(''); alert(`인증 코드가 재발송되었습니다. (테스트: ${sentCode})`); }}
                                className="text-xs text-neutral-400 hover:text-neutral-700">
                                인증 코드 재발송
                            </button>
                            <p className="text-[10px] text-neutral-300">
                                테스트용 인증 코드: <span className="font-mono text-neutral-500">{sentCode}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('이름, 이메일, 비밀번호는 필수입니다.');
            return;
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
            setError('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.');
            return;
        }
        if (password.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        // Step 1 → Step 2: 인증 코드 발송 (Mock)
        setStep('verify');
        setError('');
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* 로고 */}
                <div className="text-center mb-8">
                    <Link href="/">
                        <Image src="/logo-horizontal.png" alt="TEN ONE" width={120} height={40} className="mx-auto mb-4" />
                    </Link>
                    <h1 className="text-lg font-bold">Crew 가입</h1>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded">
                        <span className="text-xs font-medium text-violet-700">{invite.label}</span>
                    </div>
                    {invite.group && (
                        <p className="text-[10px] text-neutral-400 mt-1.5">{invite.group} 초대로 가입합니다</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2.5 rounded">{error}</div>
                    )}

                    {/* 이름 */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">이름 *</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동"
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                    </div>

                    {/* 이메일 */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">이메일 *</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">비밀번호 *</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="영문 + 숫자 + 특수문자 8자 이상"
                                className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400 pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* 연락처 */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">연락처</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000"
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                    </div>

                    {/* 자기소개 */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">자기소개</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="간단한 소개를 적어주세요" rows={2}
                            className="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded resize-none focus:outline-none focus:border-neutral-400" />
                    </div>

                    {/* 초대 정보 표시 */}
                    <div className="bg-neutral-50 border border-neutral-200 rounded p-3 space-y-1">
                        <p className="text-[10px] text-neutral-400">초대 코드: <span className="font-mono text-neutral-600">{code}</span></p>
                        <p className="text-[10px] text-neutral-400">유형: <span className="text-neutral-600">{invite.label}</span></p>
                        {invite.clubId && <p className="text-[10px] text-neutral-400">동아리: <span className="text-neutral-600">{invite.clubId.toUpperCase()}</span> {invite.generation}기</p>}
                        <p className="text-[10px] text-neutral-300 mt-1">* 가입 후 관리자 승인이 필요합니다</p>
                    </div>

                    <button type="submit"
                        className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors">
                        가입 신청
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-xs text-neutral-400">이미 계정이 있으신가요?{' '}
                        <Link href="/login" className="text-neutral-700 hover:underline">로그인</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function InvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        }>
            <InviteForm />
        </Suspense>
    );
}
