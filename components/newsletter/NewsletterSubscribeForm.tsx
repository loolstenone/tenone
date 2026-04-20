'use client';

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

interface NewsletterSubscribeFormProps {
  /** 신청 출처 (DB 저장 + 태그). 예: 'jakka', 'badak', 'madleague' */
  source: string;
  /** 브랜드명 (제목 자동 생성). 예: 'JAKKA', 'Badak', 'MAD League' */
  brandName?: string;
  dark?: boolean;
  accentColor?: string;
  /** 제목 오버라이드 (기본: `${brandName} 뉴스레터`) */
  title?: string;
  /** 부제 오버라이드 (기본: 표준 문구) */
  subtitle?: string;
}

const STANDARD_SUBTITLE = 'Ten:One™ Universe의 다양한 소식을 받아 보세요';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function NewsletterSubscribeForm({
  source,
  brandName,
  dark = false,
  accentColor = '#171717',
  title,
  subtitle,
}: NewsletterSubscribeFormProps) {
  const resolvedTitle = title ?? `${brandName ?? '뉴스레터'} 뉴스레터`;
  const resolvedSubtitle = subtitle ?? STANDARD_SUBTITLE;
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!nickname.trim()) { setNicknameError('닉네임을 입력해주세요.'); valid = false; }
    else setNicknameError('');
    if (!email.trim() || !isValidEmail(email)) { setEmailError('유효한 이메일 주소를 입력해주세요.'); valid = false; }
    else setEmailError('');
    if (!agree || !valid) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), nickname: nickname.trim(), source }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError('구독에 실패했습니다. 다시 시도해주세요.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const text = dark ? 'text-white' : 'text-neutral-900';
  const subText = dark ? 'text-neutral-400' : 'text-neutral-500';
  const inputBg = dark ? 'bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400';
  const checkText = dark ? 'text-neutral-400' : 'text-neutral-500';

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className="h-10 w-10" style={{ color: accentColor }} />
        <p className={`text-sm font-medium ${text}`}>구독 신청이 완료되었습니다!</p>
        <p className={`text-xs ${subText}`}>확인 메일을 보내드렸습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto w-full">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Mail className="h-4 w-4" style={{ color: accentColor }} />
        <p className={`text-xs tracking-[0.2em] uppercase font-medium ${subText}`}>Newsletter</p>
      </div>
      <h3 className={`text-lg font-bold text-center mb-1 ${text}`}>{resolvedTitle}</h3>
      <p className={`text-xs text-center mb-5 ${subText}`}>{resolvedSubtitle}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <input
            type="text"
            value={nickname}
            onChange={e => { setNickname(e.target.value); setNicknameError(''); }}
            placeholder="닉네임 (필수)"
            className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none ${inputBg}`}
          />
          {nicknameError && <p className="text-[10px] text-red-400 mt-1">{nicknameError}</p>}
        </div>
        <div>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            placeholder="이메일 주소 (필수)"
            className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none ${inputBg}`}
          />
          {emailError && <p className="text-[10px] text-red-400 mt-1">{emailError}</p>}
        </div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          <span className={`text-[10px] ${checkText}`}>
            <b>뉴스레터 수신 동의</b> · 발송을 위한 이메일 수집·이용에 동의합니다.
          </span>
        </label>
        {error && <p className="text-[10px] text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !agree}
          className="w-full px-6 py-3 rounded-lg text-sm font-bold text-white disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: accentColor }}
        >
          {loading ? '처리 중...' : '구독하기'}
        </button>
      </form>
    </div>
  );
}
