'use client';

import { useState } from 'react';
import { ArrowLeft, Crown, Check, Send, Sparkles, Users, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LoginModal } from '@/components/LoginModal';

const SUGGEST_INTERESTS = [
  '마케팅/광고', '데이터/분석', '디자인/UX', '개발/IT',
  '기획/PM', '브랜딩', '콘텐츠', '이직/커리어',
  '리더십', '프리랜서/창업', '네트워킹', '스터디',
];

const BENEFITS = [
  { icon: Crown, title: '공식 바닥장 뱃지', desc: '프로필에 바닥장 뱃지가 부여됩니다' },
  { icon: Users, title: '모임 개설 권한', desc: '원하는 주제로 자유롭게 모임을 만들 수 있습니다' },
  { icon: Shield, title: '운영 지원', desc: '모임 공간, 홍보, 운영 가이드를 지원받습니다' },
  { icon: Sparkles, title: '바닥장 네트워크', desc: '다른 바닥장들과의 전용 네트워킹에 참여합니다' },
];

export default function ApplyPage() {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 폼
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [reason, setReason] = useState('');
  const [plan, setPlan] = useState('');
  const [contact, setContact] = useState('');

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : prev.length < 5 ? [...prev, item] : prev
    );
  };

  const addCustomInterest = (val: string) => {
    const items = val.split(',').map((s) => s.trim()).filter(Boolean);
    for (const item of items) {
      if (!interests.includes(item) && interests.length < 5) {
        setInterests((prev) => [...prev, item]);
      }
    }
    setInterestInput('');
  };

  const removeInterest = (item: string) => {
    setInterests((prev) => prev.filter((i) => i !== item));
  };

  const isCustom = (item: string) => !SUGGEST_INTERESTS.includes(item);

  const canSubmit = name.trim() && industry.trim() && experience.trim()
    && interests.length > 0 && reason.trim().length >= 20 && contact.trim();

  const handleSubmit = async () => {
    if (!isAuthenticated) { setShowLogin(true); return; }
    if (!canSubmit) return;

    // TODO: POST /api/badak/apply
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] pt-14">
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'rgba(74,222,128,0.1)' }}>
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">신청이 접수되었습니다</h1>
          <p className="mb-2 text-sm text-white/50">
            바닥 운영팀이 검토 후 연락드리겠습니다.
          </p>
          <p className="mb-8 text-xs text-white/30">
            보통 3~5일 영업일 이내에 결과를 안내해 드립니다.
          </p>
          <Link href="/badak"
            className="rounded-xl px-6 py-3 text-sm font-bold"
            style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
            바닥으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">

        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/badak" className="mb-4 inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/50">
            <ArrowLeft className="h-3.5 w-3.5" /> 바닥 홈
          </Link>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">바닥장 신청</h1>
          </div>
          <p className="mt-1 text-xs text-white/40">
            바닥장이 되어 같은 니즈를 가진 사람들의 모임을 이끌어 보세요
          </p>
        </div>

        {/* 바닥장이란 */}
        <div className="mb-6 rounded-2xl border border-white/8 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="mb-1 text-sm font-bold text-white/70">바닥장이란?</h2>
          <p className="text-xs leading-relaxed text-white/35">
            바닥장은 특정 니즈를 가진 사람들의 모임을 만들고 이끄는 리더입니다.
            운영팀의 승인을 거쳐 공식 바닥장으로 활동하게 되며,
            모임 개설 권한과 함께 다양한 운영 지원을 받을 수 있습니다.
          </p>
        </div>

        {/* 바닥장 혜택 */}
        <div className="mb-8 grid grid-cols-2 gap-2">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-white/6 p-3.5"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <Icon className="mb-2 h-4 w-4 text-amber-400/50" />
              <h3 className="mb-0.5 text-xs font-bold text-white/60">{title}</h3>
              <p className="text-[10px] text-white/25">{desc}</p>
            </div>
          ))}
        </div>

        {/* 신청 폼 */}
        <div className="space-y-5">
          <h2 className="text-sm font-bold text-white/50">신청서 작성</h2>

          {/* 이름/닉네임 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/40">이름 또는 닉네임 *</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="바닥에서 불릴 이름"
              className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
          </div>

          {/* 산업군/직무 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/40">산업군 *</label>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)}
                placeholder="예: IT, 광고, 제조"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/40">경력 *</label>
              <input value={experience} onChange={(e) => setExperience(e.target.value)}
                placeholder="예: 마케팅 5년차"
                className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            </div>
          </div>

          {/* 이끌고 싶은 분야 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/40">
              이끌고 싶은 분야 * <span className="text-white/20">(최대 5개, 직접 입력 가능)</span>
            </label>

            {/* 선택된 분야 */}
            {interests.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {interests.map((item) => (
                  <span key={item} className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: isCustom(item) ? 'rgba(116,185,255,0.12)' : 'rgba(255,217,61,0.12)',
                      color: isCustom(item) ? '#74b9ff' : '#ffd93d',
                    }}>
                    {isCustom(item) && <Sparkles className="h-2.5 w-2.5" />}
                    {item}
                    <button onClick={() => removeInterest(item)} className="ml-0.5 opacity-50 hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 기본 카테고리 */}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGEST_INTERESTS.filter((item) => !interests.includes(item)).map((item) => (
                <button key={item} onClick={() => toggleInterest(item)}
                  disabled={interests.length >= 5}
                  className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: interests.length >= 5 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: interests.length >= 5 ? 'not-allowed' : 'pointer',
                  }}>
                  {item}
                </button>
              ))}
            </div>

            {/* 직접 입력 */}
            {interests.length < 5 && (
              <input value={interestInput}
                onChange={(e) => {
                  if (e.target.value.includes(',')) {
                    addCustomInterest(e.target.value);
                  } else {
                    setInterestInput(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && interestInput.trim()) {
                    e.preventDefault();
                    addCustomInterest(interestInput);
                  }
                }}
                placeholder="없는 분야는 직접 입력 (Enter 또는 ,)"
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-[#74b9ff]/40" />
            )}
            {interests.some(isCustom) && (
              <p className="mt-1.5 text-[10px] text-blue-400/50">
                <Sparkles className="mr-0.5 inline h-2.5 w-2.5" />
                직접 입력한 분야는 승인 시 바닥 전체 카테고리에 반영됩니다
              </p>
            )}
          </div>

          {/* 바닥장 지원 동기 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/40">
              바닥장 지원 동기 * <span className="text-white/20">(20자 이상)</span>
            </label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="왜 바닥장을 하고 싶은지, 어떤 모임을 만들고 싶은지 자유롭게 적어주세요"
              className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
            <p className="mt-1 text-right text-[10px] text-white/20">{reason.length}자</p>
          </div>

          {/* 운영 계획 (선택) */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/40">
              운영 계획 <span className="text-white/20">(선택)</span>
            </label>
            <textarea value={plan} onChange={(e) => setPlan(e.target.value)}
              rows={3}
              placeholder="모임 주기, 형태, 대상 등 구체적인 계획이 있다면 적어주세요"
              className="w-full resize-none rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
          </div>

          {/* 연락처 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/40">연락처 *</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)}
              placeholder="이메일 또는 전화번호"
              className="w-full rounded-xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ffd93d]/40" />
          </div>

          {/* 안내 */}
          <div className="rounded-xl border border-white/6 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[11px] leading-relaxed text-white/30">
              신청서는 바닥 운영팀이 검토합니다. 승인 시 바닥장 권한이 부여되며,
              모임 개설 및 운영에 필요한 가이드를 안내받으실 수 있습니다.
              심사에는 보통 3~5 영업일이 소요됩니다.
            </p>
          </div>

          {/* 제출 버튼 */}
          <button onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all"
            style={{
              background: canSubmit ? 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)' : 'rgba(255,255,255,0.06)',
              color: canSubmit ? '#1a1a2e' : 'rgba(255,255,255,0.2)',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}>
            <Send className="h-4 w-4" />
            바닥장 신청하기
          </button>
        </div>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
