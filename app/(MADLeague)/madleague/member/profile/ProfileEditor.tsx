'use client';

import { useState } from 'react';
import { CheckCircle2, X, Plus } from 'lucide-react';

interface Initial {
  id: string; name: string; email: string | null; phone: string | null;
  university: string | null; major: string | null; year_in_school: number | null;
  bio: string | null; skill_tags: string[] | null; portfolio_public: boolean;
  avatar_url: string | null;
}

export function ProfileEditor({ initial }: { initial: Initial }) {
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState(initial.phone ?? '');
  const [university, setUniversity] = useState(initial.university ?? '');
  const [major, setMajor] = useState(initial.major ?? '');
  const [yearInSchool, setYearInSchool] = useState<number | null>(initial.year_in_school);
  const [bio, setBio] = useState(initial.bio ?? '');
  const [skillTags, setSkillTags] = useState<string[]>(initial.skill_tags ?? []);
  const [newSkill, setNewSkill] = useState('');
  const [portfolioPublic, setPortfolioPublic] = useState(initial.portfolio_public);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url ?? '');

  function addSkill() {
    const t = newSkill.trim();
    if (!t || skillTags.includes(t) || skillTags.length >= 20) return;
    setSkillTags([...skillTags, t]);
    setNewSkill('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/madleague/member/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone, university, major,
          year_in_school: yearInSchool ?? undefined,
          bio, skill_tags: skillTags,
          portfolio_public: portfolioPublic,
          avatar_url: avatarUrl,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'UNKNOWN');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Read-only */}
      <div className="bg-neutral-950 border border-neutral-900 p-5">
        <div className="text-xs font-bold text-neutral-500 mb-3">운영진 관리 항목 (수정 불가)</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-neutral-500">이름:</span> <span className="text-white font-bold">{initial.name}</span></div>
          <div><span className="text-neutral-500">이메일:</span> <span className="text-white">{initial.email ?? '-'}</span></div>
        </div>
      </div>

      <Field label="프로필 사진 URL">
        <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} type="url" placeholder="https://" className="input" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="연락처">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className="input" />
        </Field>
        <Field label="학년">
          <select value={yearInSchool ?? ''} onChange={(e) => setYearInSchool(e.target.value ? Number(e.target.value) : null)} className="input">
            <option value="">선택 안 함</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}학년{n === 5 ? ' 이상' : ''}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="학교">
          <input value={university} onChange={(e) => setUniversity(e.target.value)} className="input" />
        </Field>
        <Field label="전공">
          <input value={major} onChange={(e) => setMajor(e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="한 줄 소개 / 바이오">
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500} placeholder="본인을 한 줄로 소개해주세요" className="input resize-none" />
        <div className="mt-1 text-xs text-neutral-500 text-right">{bio.length} / 500</div>
      </Field>

      <Field label={`스킬 태그 (${skillTags.length}/20)`}>
        <div className="flex flex-wrap gap-2 mb-3">
          {skillTags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-3 py-1 text-xs text-white">
              {tag}
              <button type="button" onClick={() => setSkillTags(skillTags.filter(t => t !== tag))} className="text-neutral-500 hover:text-red-400">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="예: 브랜딩, 크리에이티브, 퍼포먼스 마케팅"
            maxLength={30}
            className="input flex-1"
          />
          <button type="button" onClick={addSkill} className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white px-4 inline-flex items-center">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </Field>

      <label className="flex items-center gap-3 bg-neutral-950 border border-neutral-900 p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={portfolioPublic}
          onChange={(e) => setPortfolioPublic(e.target.checked)}
          className="h-4 w-4 accent-[#EC1D25]"
        />
        <div>
          <div className="text-sm font-bold">퍼블릭 포트폴리오 공개</div>
          <div className="mt-1 text-xs text-neutral-500">
            내 활동 이력과 포트폴리오를 비로그인 사용자도 볼 수 있게 공개합니다. (Phase 2-E 구현 후 활성화)
          </div>
        </div>
      </label>

      {error && <div className="bg-red-950 border border-red-900 text-red-200 text-sm px-4 py-3">저장 실패: {error}</div>}
      {saved && (
        <div className="bg-emerald-950 border border-emerald-900 text-emerald-200 text-sm px-4 py-3 inline-flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> 저장되었습니다.
        </div>
      )}

      <button type="submit" disabled={submitting} className="bg-[#EC1D25] hover:bg-[#d01820] disabled:bg-neutral-700 text-white font-bold px-8 py-3 transition">
        {submitting ? '저장 중...' : '저장'}
      </button>

      <style>{`
        .input {
          width: 100%;
          background: #000;
          border: 1px solid #262626;
          padding: 10px 14px;
          color: #fff;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: #EC1D25; }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-bold tracking-wider text-neutral-400 mb-2">{label}</div>
      {children}
    </label>
  );
}
