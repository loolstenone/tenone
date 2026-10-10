'use client';

/**
 * 동아리 부원 모집 지원서 확인 — 그 동아리 운영진·직원 (/madleague/clubs/{slug}/manage)
 * 지원서 양식·모집 기간은 MAD League 운영진이 인트라에서 연다. 여기서는 응답 확인·합격/불합격·메모만.
 */
import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatAnswer, AVAILABILITY_LABEL } from '@/lib/forms';
import type { FormAvailability, FormQuestion } from '@/types/forms';

interface Resp {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  staff_note: string | null;
  created_at: string;
  answers: Record<string, unknown>;
  name: string | null;
  email: string | null;
}
interface Data {
  forms: { id: string; title: string; availability: FormAvailability }[];
  form: { id: string; title: string; questions: FormQuestion[]; availability: FormAvailability } | null;
  responses: Resp[];
}

const STATUS_LABEL: Record<Resp['status'], string> = { pending: '검토 중', accepted: '합격', rejected: '불합격' };
const inputCls = 'w-full bg-black border border-neutral-800 px-[14px] py-[10px] text-white outline-none transition focus:border-[#EC1D25] [color-scheme:dark]';

export function ClubRecruitResponses({ slug }: { slug: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [tab, setTab] = useState<Resp['status']>('pending');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (id: string | null) => {
    try {
      const res = await fetch(`/api/madleague/clubs/${slug}/recruit${id ? `?form=${id}` : ''}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? '불러오지 못했습니다.'); return; }
      setData(json as Data);
    } catch {
      setError('불러오지 못했습니다.');
    }
  }, [slug]);

  useEffect(() => { load(formId); }, [load, formId]);

  async function update(id: string, patch: { status?: Resp['status']; staff_note?: string }) {
    setBusy(id);
    try {
      const res = await fetch(`/api/madleague/clubs/${slug}/recruit`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ responseId: id, ...patch }),
      });
      if (!res.ok) { alert((await res.json()).error ?? '저장하지 못했습니다.'); return; }
      setData(d => d && { ...d, responses: d.responses.map(r => (r.id === id ? { ...r, ...patch } : r)) });
    } finally {
      setBusy(null);
    }
  }

  if (error) return <p className="text-sm text-[#EC1D25]">{error}</p>;
  if (!data) return <p className="text-sm text-neutral-500">불러오는 중…</p>;
  if (!data.form) {
    return (
      <p className="text-sm text-neutral-400 border border-neutral-900 bg-neutral-950 p-5">
        아직 이 동아리의 모집 지원서가 없습니다. 공동 모집 기간이 정해지면 MAD League 운영진이 지원서를 열어 드립니다.
      </p>
    );
  }

  const questions = data.form.questions.filter(q => q.type !== 'section');
  const list = data.responses.filter(r => r.status === tab);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {data.forms.length > 1 ? (
          <select value={data.form.id} onChange={e => setFormId(e.target.value)} className={`${inputCls} w-auto`}>
            {data.forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
        ) : <span className="font-bold">{data.form.title}</span>}
        <span className="text-xs border border-neutral-800 px-2 py-1 text-neutral-400">{AVAILABILITY_LABEL[data.form.availability]}</span>
      </div>
      <p className="mb-4 text-xs text-neutral-500">지원자 개인정보는 부원 선발에만 쓰고, 동아리 밖으로 옮기거나 공유하지 마세요.</p>

      <div className="flex gap-1 border-b border-neutral-900 mb-4">
        {(['pending', 'accepted', 'rejected'] as const).map(s => (
          <button key={s} type="button" onClick={() => setTab(s)}
            className={`px-4 py-2 text-sm font-bold border-b-2 -mb-px ${tab === s ? 'border-[#EC1D25] text-white' : 'border-transparent text-neutral-500'}`}>
            {STATUS_LABEL[s]} {data.responses.filter(r => r.status === s).length}
          </button>
        ))}
      </div>

      {list.length === 0 ? <p className="text-sm text-neutral-500 py-6">해당하는 지원서가 없습니다.</p> : (
        <div className="space-y-2">
          {list.map(r => (
            <div key={r.id} className="border border-neutral-900 bg-neutral-950">
              <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} className="w-full flex items-center justify-between gap-4 p-4 text-left">
                <span>
                  <span className="font-bold">{r.name ?? '(이름 없음)'}</span>
                  <span className="ml-3 text-xs text-neutral-500">{new Date(r.created_at).toLocaleDateString('ko-KR')}</span>
                </span>
                {open === r.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {open === r.id && (
                <div className="border-t border-neutral-900 p-4 space-y-4">
                  {r.email && <div className="text-sm"><span className="text-neutral-500 mr-2">이메일</span>{r.email}</div>}
                  {questions.map(q => {
                    const v = formatAnswer(r.answers?.[q.id]);
                    return v ? (
                      <div key={q.id}>
                        <div className="text-xs font-bold text-neutral-500">{q.label}</div>
                        <div className="mt-1 text-sm whitespace-pre-line break-keep">{q.type === 'file' ? '첨부 파일 — MAD League 운영진에게 요청하세요' : v}</div>
                      </div>
                    ) : null;
                  })}
                  <div>
                    <div className="text-xs font-bold text-neutral-500 mb-1">운영진 메모 (지원자에게 보이지 않음)</div>
                    <textarea rows={2} maxLength={1000} defaultValue={r.staff_note ?? ''} onBlur={e => e.target.value !== (r.staff_note ?? '') && update(r.id, { staff_note: e.target.value })} className={inputCls} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['accepted', 'rejected', 'pending'] as const).filter(s => s !== r.status).map(s => (
                      <button key={s} type="button" disabled={busy === r.id} onClick={() => update(r.id, { status: s })}
                        className={`px-4 py-2 text-sm font-bold disabled:opacity-50 ${s === 'accepted' ? 'bg-[#EC1D25]' : 'border border-neutral-700 text-neutral-300'}`}>
                        {s === 'pending' ? '검토 중으로' : STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
