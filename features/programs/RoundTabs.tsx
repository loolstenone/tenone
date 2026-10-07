'use client';

/**
 * 프로그램 회차 방 (코어) — 공지 · Q&A · 우리 팀 제출(팀원) · 제출물(직원·클라이언트, 코멘트)
 * 팀원·직원·클라이언트가 같은 화면을 쓴다 (모바일 우선 — 이동 중 공지 작성·답변)
 */
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, EyeOff, FolderOpen, Lock, MessageCircle, Megaphone, Pin, Trash2, Upload } from 'lucide-react';
import { SubmissionPanel } from './SubmissionPanel';

type Tab = 'notice' | 'qna' | 'submit' | 'works';
interface Comment { id: string; author_role: 'staff' | 'client'; body: string; visible_to_team: boolean; created_at: string }
interface Work { id: string; stage: 'prelim' | 'final'; title: string; description: string | null; presentation_url: string | null; file_name: string | null; status: string; submitted_at: string | null; comments: Comment[] }
interface WorkTeam { id: string; name: string; is_finalist: boolean; submissions: Work[] }
interface Notice { id: string; title: string; body: string | null; pinned: boolean; created_at: string }
interface Question {
  id: string; title: string; body: string | null; is_private: boolean; status: string; created_at: string;
  team: string; asker: string | null; mine: boolean;
  answers: { id: string; role: 'staff' | 'client'; body: string; created_at: string }[];
}

const inputCls = 'w-full bg-black border border-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--pa,#EC1D25)]';
const fmt = (s: string) => new Date(s).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const ROLE_LABEL = { staff: '운영진', client: '클라이언트' } as const;

export function RoundTabs({ compId, role, teamId, isFinalist, kind, finalDeadline }: {
  compId: string; role: 'staff' | 'client' | 'team'; teamId: string | null; isFinalist: boolean; kind: string; finalDeadline: string | null;
}) {
  const reviewer = role === 'staff' || role === 'client';
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get('tab') as Tab) || 'notice';
  const allowed = (t: Tab) => t === 'notice' || t === 'qna' || (t === 'submit' && !!teamId) || (t === 'works' && reviewer);
  const [tab, setTab] = useState<Tab>(allowed(initial) ? initial : 'notice');
  const go = (t: Tab) => { setTab(t); router.replace(`?tab=${t}`, { scroll: false }); };

  const tabs: { key: Tab; label: string; icon: typeof Megaphone }[] = [
    { key: 'notice', label: '공지', icon: Megaphone },
    { key: 'qna', label: 'Q&A', icon: MessageCircle },
    ...(reviewer ? [{ key: 'works' as Tab, label: '제출물', icon: FolderOpen }] : []),
    ...(teamId ? [{ key: 'submit' as Tab, label: '우리 팀 제출', icon: Upload }] : []),
  ];

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 flex border-b border-neutral-900 bg-black px-4 sm:mx-0 sm:px-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => go(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3.5 text-sm font-bold transition sm:flex-none sm:px-6 ${tab === t.key ? 'border-b-2 border-[var(--pa,#EC1D25)] text-white' : 'text-neutral-500 hover:text-white'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {tab === 'notice' && <Notices compId={compId} />}
        {tab === 'qna' && <Qna compId={compId} />}
        {tab === 'works' && reviewer && <Works compId={compId} />}
        {tab === 'submit' && teamId && (
          <div className="space-y-8">
            {isFinalist && (
              <div className="border border-[#FFC000]/30 p-4 sm:p-5">
                <div className="mb-1 text-xs font-bold tracking-widest text-[#FFC000]">본선 제출 · FINAL</div>
                <p className="mb-4 text-xs text-neutral-500">현장 PT 전까지 디벨롭한 제안서를 올려 주세요.{finalDeadline ? ` 마감 ${finalDeadline}` : ''}</p>
                <SubmissionPanel teamId={teamId} stage="final" />
              </div>
            )}
            <div>
              <div className="mb-3 text-xs font-bold tracking-widest text-neutral-600">{kind === 'project' ? '제출' : '예선 제출'}</div>
              <SubmissionPanel teamId={teamId} stage="prelim" />
            </div>
            <TeamFeedback compId={compId} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 공지 ─── */
function Notices({ compId }: { compId: string }) {
  const [list, setList] = useState<Notice[] | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', pinned: false });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const url = `/api/programs/rounds/${compId}/notices`;

  const load = useCallback(async () => {
    const res = await fetch(url); const d = await res.json();
    if (!res.ok) { setErr(d.error ?? '불러오지 못했습니다.'); setList([]); return; }
    setList(d.notices); setCanWrite(d.canWrite);
  }, [url]);
  useEffect(() => { load(); }, [load]);

  const send = async (method: string, body?: unknown, q = '') => {
    setBusy(true); setErr('');
    const res = await fetch(url + q, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const d = await res.json(); setBusy(false);
    if (!res.ok) { setErr(d.error ?? '처리하지 못했습니다.'); return false; }
    await load(); return true;
  };

  if (!list) return <p className="text-sm text-neutral-500">불러오는 중…</p>;
  return (
    <div className="space-y-4">
      {canWrite && (open ? (
        <div className="space-y-2 border border-neutral-800 p-4">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="공지 제목" className={inputCls} />
          <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={5} placeholder="내용" className={inputCls} />
          <label className="flex items-center gap-2 text-xs text-neutral-400">
            <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} className="accent-[var(--pa,#EC1D25)]" /> 상단 고정
          </label>
          <div className="flex gap-2">
            <button disabled={busy || !form.title.trim()} onClick={async () => { if (await send('POST', form)) { setForm({ title: '', body: '', pinned: false }); setOpen(false); } }}
              className="flex-1 bg-[var(--pa,#EC1D25)] py-2.5 text-sm font-bold text-white disabled:opacity-40 sm:flex-none sm:px-6">올리기 · 참여자에게 알림</button>
            <button onClick={() => setOpen(false)} className="px-4 text-sm text-neutral-500">취소</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-full border border-dashed border-neutral-800 py-3 text-sm font-bold text-neutral-400 hover:border-neutral-600 hover:text-white">+ 공지 쓰기</button>
      ))}
      {err && <p className="text-sm text-red-400">{err}</p>}
      {list.length === 0 ? <p className="py-10 text-center text-sm text-neutral-600">공지가 없습니다.</p> : list.map(n => (
        <article key={n.id} className="border border-neutral-900 bg-neutral-950 p-4">
          <div className="flex items-start gap-2">
            {n.pinned && <Pin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pa,#EC1D25)]" />}
            <h3 className="flex-1 font-bold">{n.title}</h3>
            {canWrite && (
              <div className="flex shrink-0 gap-2 text-neutral-600">
                <button title={n.pinned ? '고정 해제' : '상단 고정'} disabled={busy} onClick={() => send('PATCH', { notice_id: n.id, pinned: !n.pinned })} className="hover:text-white"><Pin className="h-4 w-4" /></button>
                <button title="삭제" disabled={busy} onClick={() => { if (confirm('공지를 삭제할까요?')) send('DELETE', undefined, `?notice_id=${n.id}`); }} className="hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          {n.body && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-300">{n.body}</p>}
          <div className="mt-2 text-xs text-neutral-600">{fmt(n.created_at)}</div>
        </article>
      ))}
    </div>
  );
}

/* ─── Q&A ─── */
function Qna({ compId }: { compId: string }) {
  const [d, setD] = useState<{ questions: Question[]; canAsk: boolean; canAnswer: boolean } | null>(null);
  const [form, setForm] = useState({ title: '', body: '', is_private: false });
  const [reply, setReply] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const url = `/api/programs/rounds/${compId}/qna`;

  const load = useCallback(async () => {
    const res = await fetch(url); const j = await res.json();
    if (!res.ok) { setErr(j.error ?? '불러오지 못했습니다.'); setD({ questions: [], canAsk: false, canAnswer: false }); return; }
    setD(j);
  }, [url]);
  useEffect(() => { load(); }, [load]);

  const post = async (body: Record<string, unknown>) => {
    setBusy(true); setErr('');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await res.json(); setBusy(false);
    if (!res.ok) { setErr(j.error ?? '처리하지 못했습니다.'); return false; }
    await load(); return true;
  };

  if (!d) return <p className="text-sm text-neutral-500">불러오는 중…</p>;
  return (
    <div className="space-y-4">
      {d.canAsk && (
        <div className="space-y-2 border border-neutral-800 p-4">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="질문 제목" className={inputCls} />
          <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={3} placeholder="자세한 내용 (선택)" className={inputCls} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              <input type="checkbox" checked={form.is_private} onChange={e => setForm({ ...form, is_private: e.target.checked })} className="accent-[var(--pa,#EC1D25)]" />
              <Lock className="h-3.5 w-3.5" /> 비밀 질문 (우리 팀·운영진·클라이언트만)
            </label>
            <button disabled={busy || !form.title.trim()} onClick={async () => { if (await post({ action: 'ask', ...form })) setForm({ title: '', body: '', is_private: false }); }}
              className="ml-auto bg-[var(--pa,#EC1D25)] px-5 py-2 text-sm font-bold text-white disabled:opacity-40">질문하기</button>
          </div>
        </div>
      )}
      {err && <p className="text-sm text-red-400">{err}</p>}
      {d.questions.length === 0 ? <p className="py-10 text-center text-sm text-neutral-600">질문이 없습니다.</p> : d.questions.map(q => (
        <article key={q.id} className="border border-neutral-900 bg-neutral-950 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {q.is_private && <span className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 text-neutral-400"><Lock className="h-3 w-3" /> 비밀</span>}
            <span className={`px-2 py-0.5 ${q.status === 'answered' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-300'}`}>{q.status === 'answered' ? '답변 완료' : '답변 대기'}</span>
            <span className="text-neutral-500">{q.team}{q.asker ? ` · ${q.asker}` : ''} · {fmt(q.created_at)}</span>
            {(q.mine && q.status === 'open') || d.canAnswer ? (
              <button title="질문 삭제" disabled={busy} onClick={() => { if (confirm('질문을 삭제할까요?')) post({ action: 'delete', question_id: q.id }); }} className="ml-auto text-neutral-600 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
            ) : null}
          </div>
          <h3 className="mt-2 font-bold">{q.title}</h3>
          {q.body && <p className="mt-1 whitespace-pre-line text-sm text-neutral-300">{q.body}</p>}
          {q.answers.map(a => (
            <div key={a.id} className="mt-3 border-l-2 border-[var(--pa,#EC1D25)]/50 bg-black/40 py-2 pl-3 pr-2">
              <div className="text-xs font-bold text-[var(--pa,#EC1D25)]">{ROLE_LABEL[a.role]} <span className="font-normal text-neutral-600">· {fmt(a.created_at)}</span></div>
              <p className="mt-1 whitespace-pre-line text-sm text-neutral-200">{a.body}</p>
            </div>
          ))}
          {d.canAnswer && (
            <div className="mt-3 flex gap-2">
              <input value={reply[q.id] ?? ''} onChange={e => setReply({ ...reply, [q.id]: e.target.value })} placeholder="답변 쓰기" className={inputCls} />
              <button disabled={busy || !(reply[q.id] ?? '').trim()} onClick={async () => { if (await post({ action: 'answer', question_id: q.id, body: reply[q.id] })) setReply({ ...reply, [q.id]: '' }); }}
                className="shrink-0 bg-white px-4 text-sm font-bold text-black disabled:opacity-40">답변</button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

/* ─── 제출물 (직원·클라이언트) — 팀 이름 × 최종 제출물, 내려받기, 코멘트 ─── */
function Works({ compId }: { compId: string }) {
  const [teams, setTeams] = useState<WorkTeam[] | null>(null);
  const [draft, setDraft] = useState<Record<string, { body: string; visible: boolean }>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const url = `/api/programs/rounds/${compId}/works`;

  const load = useCallback(async () => {
    const res = await fetch(url); const j = await res.json();
    if (!res.ok) { setErr(j.error ?? '불러오지 못했습니다.'); setTeams([]); return; }
    setTeams(j.teams);
  }, [url]);
  useEffect(() => { load(); }, [load]);

  const download = async (teamId: string, stage: string) => {
    const res = await fetch(`/api/programs/submission?team_id=${teamId}&stage=${stage}`); const j = await res.json();
    if (j.download_url) window.location.href = j.download_url; else setErr(j.error ?? '파일이 없습니다.');
  };
  const comment = async (subId: string) => {
    const d = draft[subId]; if (!d?.body.trim()) return;
    setBusy(true); setErr('');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submission_id: subId, body: d.body, visible_to_team: d.visible }) });
    const j = await res.json(); setBusy(false);
    if (!res.ok) { setErr(j.error ?? '처리하지 못했습니다.'); return; }
    setDraft({ ...draft, [subId]: { body: '', visible: true } }); await load();
  };

  if (!teams) return <p className="text-sm text-neutral-500">불러오는 중…</p>;
  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500">최종 제출된 자료만 보입니다. 팀원 개인 정보는 표시하지 않습니다.</p>
      {err && <p className="text-sm text-red-400">{err}</p>}
      {teams.length === 0 && <p className="py-10 text-center text-sm text-neutral-600">팀이 없습니다.</p>}
      {teams.map(t => (
        <section key={t.id} className="border border-neutral-900 bg-neutral-950 p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-black">{t.name}</h3>
            {t.is_finalist && <span className="bg-[#FFC000]/15 px-2 py-0.5 text-[10px] font-bold text-[#FFC000]">본선 진출</span>}
          </div>
          {t.submissions.length === 0 ? <p className="mt-2 text-sm text-neutral-600">아직 최종 제출이 없습니다.</p> : t.submissions.map(s => (
            <div key={s.id} className="mt-3 border-t border-neutral-900 pt-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 font-bold ${s.stage === 'final' ? 'bg-[#FFC000]/15 text-[#FFC000]' : 'bg-white/5 text-neutral-300'}`}>{s.stage === 'final' ? '본선' : '예선'}</span>
                {s.submitted_at && <span className="text-neutral-500">{fmt(s.submitted_at)} 제출</span>}
              </div>
              <div className="mt-1 font-bold">{s.title}</div>
              {s.description && <p className="mt-1 whitespace-pre-line text-sm text-neutral-400">{s.description}</p>}
              <div className="mt-2 flex flex-wrap gap-4 text-xs">
                {s.file_name && <button onClick={() => download(t.id, s.stage)} className="inline-flex items-center gap-1 text-neutral-300 hover:text-white"><Download className="h-3.5 w-3.5" /> {s.file_name}</button>}
                {s.presentation_url && <a href={s.presentation_url} target="_blank" rel="noopener noreferrer" className="text-neutral-300 underline hover:text-white">발표자료 링크</a>}
              </div>
              {s.comments.map(c => <CommentRow key={c.id} c={c} />)}
              <div className="mt-3 space-y-2">
                <textarea rows={2} value={draft[s.id]?.body ?? ''} onChange={e => setDraft({ ...draft, [s.id]: { body: e.target.value, visible: draft[s.id]?.visible ?? true } })} placeholder="코멘트" className={inputCls} />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-neutral-400">
                    <input type="checkbox" checked={draft[s.id]?.visible ?? true} onChange={e => setDraft({ ...draft, [s.id]: { body: draft[s.id]?.body ?? '', visible: e.target.checked } })} className="accent-[var(--pa,#EC1D25)]" />
                    팀에게 공개 (끄면 운영진·클라이언트만 보는 심사 메모)
                  </label>
                  <button disabled={busy || !(draft[s.id]?.body ?? '').trim()} onClick={() => comment(s.id)} className="ml-auto bg-white px-4 py-2 text-sm font-bold text-black disabled:opacity-40">등록</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function CommentRow({ c }: { c: Comment }) {
  return (
    <div className="mt-2 border-l-2 border-[var(--pa,#EC1D25)]/50 bg-black/40 py-2 pl-3 pr-2">
      <div className="flex items-center gap-2 text-xs font-bold text-[var(--pa,#EC1D25)]">
        {ROLE_LABEL[c.author_role]}
        {!c.visible_to_team && <span className="inline-flex items-center gap-1 font-normal text-neutral-500"><EyeOff className="h-3 w-3" /> 심사 메모</span>}
        <span className="font-normal text-neutral-600">· {fmt(c.created_at)}</span>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-neutral-200">{c.body}</p>
    </div>
  );
}

/* ─── 우리 팀이 받은 피드백 (팀에게 공개된 코멘트) ─── */
function TeamFeedback({ compId }: { compId: string }) {
  const [subs, setSubs] = useState<Work[] | null>(null);
  useEffect(() => {
    fetch(`/api/programs/rounds/${compId}/works`).then(r => r.json())
      .then(j => setSubs((j.teams?.[0]?.submissions ?? []) as Work[])).catch(() => setSubs([]));
  }, [compId]);
  const withComments = (subs ?? []).filter(s => s.comments.length > 0);
  if (!withComments.length) return null;
  return (
    <div>
      <div className="mb-3 text-xs font-bold tracking-widest text-neutral-600">받은 피드백</div>
      {withComments.map(s => (
        <div key={s.id} className="mb-3 border border-neutral-900 bg-neutral-950 p-4">
          <div className="text-xs text-neutral-500">{s.stage === 'final' ? '본선' : '예선'} · {s.title}</div>
          {s.comments.map(c => <CommentRow key={c.id} c={c} />)}
        </div>
      ))}
    </div>
  );
}
