'use client';

/**
 * 동아리 소개 페이지 편집 — 동아리 운영진·직원 (/madleague/clubs/{slug}/manage)
 * 섹션 구조 = types/madleague-club-profile.ts (CLUB_LIST_SECTIONS). 비운 섹션은 소개 페이지에서 숨겨진다.
 * 경쟁 PT 배지·참가 기록은 자동이라 여기서 입력하지 않는다.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { CLUB_LIST_SECTIONS, type ClubProfile, type ListSectionDef } from '@/types/madleague-club-profile';

const inputCls = 'w-full bg-black border border-neutral-800 px-[14px] py-[10px] text-white outline-none transition focus:border-[#EC1D25] [color-scheme:dark]';
const labelCls = 'block text-xs font-bold text-neutral-400 mb-1.5';

type Row = Record<string, string>;
type Draft = ClubProfile & Record<string, unknown>;

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-neutral-500">{hint}</span>}
    </label>
  );
}

function ListEditor({ def, rows, onChange }: { def: ListSectionDef; rows: Row[]; onChange: (rows: Row[]) => void }) {
  const set = (i: number, key: string, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="border border-neutral-900 bg-neutral-950 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-black">{def.title}</h3>
        <span className="text-xs text-neutral-500">{rows.length}/{def.maxItems}</span>
      </div>
      {def.hint && <p className="mt-1 text-xs text-neutral-500">{def.hint}</p>}
      <div className="mt-4 space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="border border-neutral-900 bg-black p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {def.fields.map(f => (
                <div key={f.key} className={f.long ? 'sm:col-span-2' : ''}>
                  <span className={labelCls}>{f.label}{f.required && <span className="text-[#EC1D25]"> *</span>}</span>
                  {f.long
                    ? <textarea rows={3} maxLength={f.max} value={r[f.key] ?? ''} placeholder={f.placeholder} onChange={e => set(i, f.key, e.target.value)} className={inputCls} />
                    : <input maxLength={f.max} value={r[f.key] ?? ''} placeholder={f.placeholder} onChange={e => set(i, f.key, e.target.value)} className={inputCls} inputMode={f.url ? 'url' : undefined} />}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-end gap-1 text-neutral-500">
              <button type="button" onClick={() => move(i, -1)} className="p-1.5 hover:text-white" aria-label="위로"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} className="p-1.5 hover:text-white" aria-label="아래로"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="p-1.5 hover:text-[#EC1D25]" aria-label="삭제"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {rows.length < def.maxItems && (
        <button type="button" onClick={() => onChange([...rows, {}])} className="mt-3 inline-flex items-center gap-1.5 border border-neutral-800 px-3 py-2 text-xs font-bold text-neutral-300 hover:border-neutral-500">
          <Plus className="h-3.5 w-3.5" /> {def.title} 추가
        </button>
      )}
    </div>
  );
}

export function ClubProfileEditor({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [description, setDescription] = useState('');
  const [established, setEstablished] = useState('');
  const [draft, setDraft] = useState<Draft>({});

  useEffect(() => {
    let alive = true;
    fetch(`/api/madleague/clubs/${slug}/profile`)
      .then(async res => {
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) { setMessage({ ok: false, text: data.error ?? '불러오지 못했습니다.' }); return; }
        setDescription(data.description ?? '');
        setEstablished(data.established_year ? String(data.established_year) : '');
        setDraft((data.profile ?? {}) as Draft);
      })
      .catch(() => alive && setMessage({ ok: false, text: '불러오지 못했습니다.' }))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [slug]);

  const setField = (key: string, v: unknown) => setDraft(d => ({ ...d, [key]: v }));
  const recruit = draft.recruit ?? {};
  const setRecruit = (key: string, v: string) => setDraft(d => ({ ...d, recruit: { ...(d.recruit ?? {}), [key]: v } }));

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/madleague/clubs/${slug}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, established_year: established || null, profile: draft }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ ok: false, text: data.error ?? '저장하지 못했습니다.' }); return; }
      setDraft(data.profile as Draft);
      setMessage({ ok: true, text: '저장했습니다. 소개 페이지에 바로 반영됩니다.' });
    } catch {
      setMessage({ ok: false, text: '저장하지 못했습니다.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-400">
        비워 둔 항목은 소개 페이지에 나오지 않습니다. 동아리명·지역·로고는 MAD League 운영진이 관리합니다.
        <span className="block mt-1 text-neutral-500">공개 페이지입니다 — 개인 휴대폰 번호·개인 이름은 적지 말고 대표 이메일·공식 채널을 써 주세요.</span>
      </p>

      {/* 기본 */}
      <div className="border border-neutral-900 bg-neutral-950 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <h3 className="sm:col-span-2 font-black">기본 정보</h3>
        <Field label="정식 명칭"><input maxLength={80} value={draft.full_name ?? ''} onChange={e => setField('full_name', e.target.value)} className={inputCls} placeholder="부산지역대학생연합광고연구회" /></Field>
        <Field label="창립 연도"><input inputMode="numeric" maxLength={4} value={established} onChange={e => setEstablished(e.target.value.replace(/\D/g, ''))} className={inputCls} placeholder="2010" /></Field>
        <div className="sm:col-span-2"><Field label="슬로건"><input maxLength={120} value={draft.slogan ?? ''} onChange={e => setField('slogan', e.target.value)} className={inputCls} placeholder="Think + Design × Action" /></Field></div>
        <div className="sm:col-span-2"><Field label="한 줄 소개" hint="동아리 목록·검색에도 쓰입니다"><input maxLength={200} value={description} onChange={e => setDescription(e.target.value)} className={inputCls} /></Field></div>
        <div className="sm:col-span-2"><Field label="참여 대학"><input maxLength={300} value={draft.universities ?? ''} onChange={e => setField('universities', e.target.value)} className={inputCls} placeholder="부산대 · 부경대 · 동아대 …" /></Field></div>
        <div className="sm:col-span-2"><Field label="소개"><textarea rows={6} maxLength={3000} value={draft.intro ?? ''} onChange={e => setField('intro', e.target.value)} className={inputCls} /></Field></div>
      </div>

      {CLUB_LIST_SECTIONS.filter(s => s.key !== 'channels').map(def => (
        <ListEditor key={def.key} def={def} rows={(draft[def.key] as Row[] | undefined) ?? []} onChange={rows => setField(def.key, rows)} />
      ))}

      {/* 모집 안내 */}
      <div className="border border-neutral-900 bg-neutral-950 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <h3 className="sm:col-span-2 font-black">부원 모집 안내</h3>
        <Field label="모집 상태">
          <select value={recruit.status ?? ''} onChange={e => setRecruit('status', e.target.value)} className={inputCls}>
            <option value="">표시 안 함</option>
            <option value="open">모집 중</option>
            <option value="closed">모집 기간 아님</option>
          </select>
        </Field>
        <Field label="모집 기간"><input maxLength={60} value={recruit.period ?? ''} onChange={e => setRecruit('period', e.target.value)} className={inputCls} placeholder="2027.2.1 ~ 2.28" /></Field>
        <div className="sm:col-span-2"><Field label="대상"><input maxLength={300} value={recruit.target ?? ''} onChange={e => setRecruit('target', e.target.value)} className={inputCls} placeholder="부산·경남 지역 대학 재학생·휴학생" /></Field></div>
        <div className="sm:col-span-2"><Field label="절차"><textarea rows={3} maxLength={1000} value={recruit.process ?? ''} onChange={e => setRecruit('process', e.target.value)} className={inputCls} placeholder="서류 → 면접 → OT" /></Field></div>
        <div className="sm:col-span-2"><Field label="지원 링크" hint="모집 중일 때 '지원하기' 버튼으로 나옵니다"><input maxLength={500} inputMode="url" value={recruit.link ?? ''} onChange={e => setRecruit('link', e.target.value)} className={inputCls} placeholder="https://" /></Field></div>
      </div>

      {/* 연락 · 채널 */}
      <div className="border border-neutral-900 bg-neutral-950 p-5">
        <h3 className="font-black mb-4">연락</h3>
        <Field label="대표 이메일" hint="동아리 공용 메일을 권장합니다"><input type="email" maxLength={120} value={draft.contact_email ?? ''} onChange={e => setField('contact_email', e.target.value)} className={inputCls} /></Field>
      </div>
      {CLUB_LIST_SECTIONS.filter(s => s.key === 'channels').map(def => (
        <ListEditor key={def.key} def={def} rows={(draft[def.key] as Row[] | undefined) ?? []} onChange={rows => setField(def.key, rows)} />
      ))}

      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-black/95 border-t border-neutral-900 flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} disabled={saving} className="bg-[#EC1D25] px-6 py-3 text-sm font-bold disabled:opacity-50">
          {saving ? '저장 중…' : '소개 페이지 저장'}
        </button>
        <Link href={`/madleague/clubs/${slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white">
          소개 페이지 보기 <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        {message && <span className={`text-sm ${message.ok ? 'text-emerald-400' : 'text-[#EC1D25]'}`}>{message.text}</span>}
      </div>
    </div>
  );
}
