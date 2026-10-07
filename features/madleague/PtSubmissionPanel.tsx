'use client';

/**
 * 경쟁 PT·프로젝트 워크스페이스 — 내 팀 제출물 (팀원 누구나 · 마감 전) · 단계별 예선/본선
 * 파일은 서명 업로드 URL로 브라우저가 Storage(mad-submissions, 비공개)에 직접 올린다 → /api/madleague/pt/submission
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock, Download, ExternalLink, FileText, Loader2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Submission {
  title: string; description: string | null; presentation_url: string | null;
  file_name: string | null; file_size: number | null;
  status: 'draft' | 'submitted' | 'withdrawn'; submitted_at: string | null; updated_at: string;
}

const inputCls = 'w-full bg-black border border-neutral-800 px-[14px] py-[10px] text-white outline-none transition focus:border-[#EC1D25] [color-scheme:dark]';
const ACCEPT = '.pdf,.ppt,.pptx,.key,.zip,.jpg,.jpeg,.png,.webp,.mp4';
const fmtSize = (n: number) => n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))}KB` : `${(n / 1024 / 1024).toFixed(1)}MB`;
const fmtDate = (s: string) => new Date(s).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export function PtSubmissionPanel({ teamId, stage = 'prelim' }: { teamId: string; stage?: 'prelim' | 'final' }) {
  const [sub, setSub] = useState<Submission | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', presentation_url: '' });
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/madleague/pt/submission?team_id=${teamId}&stage=${stage}`);
    const data = await res.json();
    if (!res.ok) { setMsg({ ok: false, text: data.error ?? '불러오지 못했습니다.' }); setLoaded(true); return; }
    setSub(data.submission);
    setDownloadUrl(data.download_url);
    setCanEdit(data.canEdit);
    setDeadline(data.deadline);
    setForm({
      title: data.submission?.title ?? '',
      description: data.submission?.description ?? '',
      presentation_url: data.submission?.presentation_url ?? '',
    });
    setLoaded(true);
  }, [teamId, stage]);
  useEffect(() => { load(); }, [load]);

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/madleague/pt/submission', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team_id: teamId, stage, ...body }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? '처리하지 못했습니다.');
    return data;
  };

  const save = async (submit: boolean) => {
    setBusy(true); setMsg(null);
    try {
      let uploaded: { path: string; name: string; size: number } | undefined;
      if (file) {
        const prep = await post({ action: 'prepare', file: { name: file.name, size: file.size, type: file.type } });
        const { error } = await createClient().storage.from(prep.bucket).uploadToSignedUrl(prep.path, prep.token, file, { contentType: file.type || 'application/octet-stream' });
        if (error) throw new Error('파일을 올리지 못했습니다. 다시 시도해 주세요.');
        uploaded = { path: prep.path, name: file.name, size: file.size };
      }
      await post({ action: 'save', ...form, file: uploaded, submit, consent });
      setFile(null); setConsent(false);
      if (fileRef.current) fileRef.current.value = '';
      setMsg({ ok: true, text: submit ? '최종 제출했습니다.' : '임시 저장했습니다. 마감 전에 최종 제출을 눌러 주세요.' });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : '처리하지 못했습니다.' });
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!confirm('최종 제출을 취소하고 임시 저장 상태로 돌릴까요? 마감 전에 다시 제출해야 합니다.')) return;
    setBusy(true); setMsg(null);
    try { await post({ action: 'withdraw' }); await load(); setMsg({ ok: true, text: '제출을 취소했습니다.' }); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : '처리하지 못했습니다.' }); }
    finally { setBusy(false); }
  };

  if (!loaded) return <p className="text-sm text-neutral-500">불러오는 중…</p>;

  return (
    <div className="space-y-4">
      {/* 현재 상태 */}
      {sub ? (
        <div className="bg-black border border-neutral-900 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {sub.status === 'submitted'
              ? <><CheckCircle2 className="h-4 w-4 text-green-400" /><span className="font-bold text-green-300">최종 제출 완료</span>{sub.submitted_at && <span className="text-neutral-500">· {fmtDate(sub.submitted_at)}</span>}</>
              : <><Clock className="h-4 w-4 text-yellow-500" /><span className="font-bold text-yellow-200">임시 저장</span><span className="text-neutral-500">· {fmtDate(sub.updated_at)} · 아직 제출되지 않았습니다</span></>}
          </div>
          <div className="text-sm font-medium">{sub.title}</div>
          <div className="flex flex-wrap gap-4 text-xs">
            {downloadUrl && sub.file_name && (
              <a href={downloadUrl} className="inline-flex items-center gap-1 text-neutral-300 hover:text-white">
                <Download className="h-3.5 w-3.5" /> {sub.file_name}{sub.file_size ? ` (${fmtSize(sub.file_size)})` : ''}
              </a>
            )}
            {sub.presentation_url && (
              <a href={sub.presentation_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-neutral-300 hover:text-white">
                발표자료 링크 <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-black border border-neutral-900 p-5 text-center">
          <FileText className="h-6 w-6 text-neutral-700 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">아직 제출한 자료가 없습니다.</p>
        </div>
      )}

      {deadline && <p className="text-xs text-neutral-500">마감 {fmtDate(deadline)} (KST)</p>}

      {/* 편집 */}
      {canEdit ? (
        <div className="space-y-3 border-t border-neutral-900 pt-4">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="제출물 제목 (예: 춤추는 고래 브랜드 전략 제안)" className={inputCls} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="간단한 설명 (선택)" className={inputCls} />
          <input value={form.presentation_url} onChange={e => setForm({ ...form, presentation_url: e.target.value })} placeholder="발표자료 링크 (선택, https://)" className={inputCls} />
          <label className="flex cursor-pointer items-center gap-2 border border-dashed border-neutral-800 px-4 py-3 text-sm text-neutral-400 hover:border-neutral-600">
            <Upload className="h-4 w-4" />
            {file ? `${file.name} (${fmtSize(file.size)})` : sub?.file_name ? `파일 교체 — 지금: ${sub.file_name}` : '발표 파일 올리기 (PDF·PPT·Keynote·ZIP 등, 50MB까지)'}
            <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <label className="flex items-start gap-2 text-xs text-neutral-400">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 accent-[#EC1D25]" />
            최종 제출하면 제출물이 심사를 위해 과제 기업과 심사위원에게 전달되는 것에 동의합니다. (최종 제출 시 필수)
          </label>
          {msg && <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => save(false)} disabled={busy || !form.title.trim()} className="border border-neutral-700 px-5 py-2.5 text-sm font-bold text-white hover:border-white disabled:opacity-40">
              임시 저장
            </button>
            <button onClick={() => save(true)} disabled={busy || !form.title.trim() || !consent} className="inline-flex items-center gap-1.5 bg-[#EC1D25] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} 최종 제출
            </button>
            {sub?.status === 'submitted' && (
              <button onClick={withdraw} disabled={busy} className="px-3 py-2.5 text-xs text-neutral-500 hover:text-white">제출 취소</button>
            )}
          </div>
        </div>
      ) : (
        <>
          {msg && <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
          <p className="text-xs text-neutral-500">마감되었거나 진행 중인 회차가 아니어서 수정할 수 없습니다.</p>
        </>
      )}
    </div>
  );
}
