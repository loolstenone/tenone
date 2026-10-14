"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, Check, X, Camera } from "lucide-react";
import { VoiceRecordButton } from "@/features/myverse/planner/VoiceRecordButton";
import { commitParsedActions, describeAction, saveMemoNote, shrinkImage, todayKst, READ_IMAGE_EVENT, type ParsedAction } from "@/features/myverse/planner/ai-actions";

// 생각 쏟아내기 — 플래너'스 AI 1단계 (2026-10-14)
// "기록은 아날로그처럼 자유롭게" → 생각나는 대로 적거나 말하면 AI가 할 일·일정으로 나누고, 사람이 확인한 뒤 넣는다
// 해석 = /api/myverse/ai/parse-input (유료 회원 전용 → 402면 앱 쉘의 AiPaidOnlyNotice가 안내) · 등록 = ai-actions.ts
// ❌ 확인 없이 바로 넣지 않는다 (AI가 잘못 나눠도 사용자가 고른다)
// 3단계(2026-10-14): "사진으로" — 종이·PAD 플래너 페이지를 찍으면 /api/myverse/handwriting 이 읽는다 (불렛 저널 기호 → 상태). 사진은 브라우저에서 줄여 한 번 보내고 저장하지 않는다

const MARK: Record<string, string> = { done: "끝냄", migrated: "미룸", scheduled: "일정으로", cancelled: "취소" };

export function BrainDump({ date }: { date?: string }) {
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);
    const [actions, setActions] = useState<ParsedAction[] | null>(null);
    const [picked, setPicked] = useState<boolean[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [memo, setMemo] = useState<string>("");
    const [keepMemo, setKeepMemo] = useState(true);
    const [fromPhoto, setFromPhoto] = useState<string | null>(null); // 사진에서 읽은 페이지 날짜
    const fileRef = useRef<HTMLInputElement>(null);

    const rootRef = useRef<HTMLElement>(null);

    // 손글씨 노트의 '글자로 바꾸기' (DailyView) → 여기서 읽는다
    useEffect(() => {
        const onRead = (e: Event) => {
            const d = (e as CustomEvent<{ image: string; source: string }>).detail;
            if (!d?.image) return;
            rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            void readImage(d.image, d.source === "pencil" ? "pencil" : "photo");
        };
        window.addEventListener(READ_IMAGE_EVENT, onRead);
        return () => window.removeEventListener(READ_IMAGE_EVENT, onRead);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    async function readPhoto(file: File) {
        try {
            await readImage(await shrinkImage(file), "photo");
        } catch {
            setMessage("사진을 열지 못했어요. 다른 사진으로 해 주세요.");
        } finally {
            if (fileRef.current) fileRef.current.value = "";
        }
    }

    async function readImage(image: string, source: "photo" | "pencil") {
        if (busy) return;
        setBusy(true); setMessage(source === "pencil" ? "손글씨를 읽고 있어요…" : "사진을 읽고 있어요…");
        try {
            const res = await fetch("/api/myverse/handwriting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image, today: date ?? todayKst(), source }),
            });
            if (res.status === 402) { setMessage(null); return; }
            const d = await res.json().catch(() => ({}));
            if (!res.ok) { setMessage(res.status === 413 ? "사진이 너무 커요. 다시 찍어 주세요." : "읽지 못했어요. 잠시 뒤 다시 해 주세요."); return; }
            const list: ParsedAction[] = d.actions ?? [];
            if (list.length === 0 && !d.memo) { setMessage(d.summary ?? "읽을 내용이 없었어요."); return; }
            setActions(list);
            setPicked(list.map((a) => a.input.mark !== "cancelled"));
            setMemo(d.memo ?? ""); setKeepMemo(!!d.memo);
            setFromPhoto(d.page_date ?? null);
            setMessage(null);
        } catch {
            setMessage("연결이 불안정해요. 잠시 뒤 다시 해 주세요.");
        } finally {
            setBusy(false);
        }
    }

    async function parse() {
        const t = text.trim();
        if (!t || busy) return;
        setBusy(true); setMessage(null);
        try {
            const res = await fetch("/api/myverse/ai/parse-input", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: t, today: date ?? todayKst() }),
            });
            const d = await res.json().catch(() => ({}));
            if (res.status === 402) return; // 유료 안내는 앱 쉘이 띄운다
            if (!res.ok) { setMessage("정리하지 못했어요. 잠시 뒤 다시 해 주세요."); return; }
            const list: ParsedAction[] = d.actions ?? [];
            if (list.length === 0) { setMessage(d.summary ?? "등록할 항목을 찾지 못했어요."); return; }
            setActions(list);
            setPicked(list.map(() => true));
            setMemo(""); setFromPhoto(null);
        } catch {
            setMessage("연결이 불안정해요. 잠시 뒤 다시 해 주세요.");
        } finally {
            setBusy(false);
        }
    }

    async function commit() {
        if (!actions) return;
        const chosen = actions.filter((_, i) => picked[i]);
        const withMemo = keepMemo && memo.trim().length > 0;
        if (chosen.length === 0 && !withMemo) { setActions(null); return; }
        setBusy(true);
        const { ok, failed } = await commitParsedActions(chosen);
        let memoSaved = false;
        if (withMemo) memoSaved = await saveMemoNote(fromPhoto ?? date ?? todayKst(), "손글씨 메모", memo);
        setBusy(false);
        setActions(null); setMemo("");
        if (ok > 0) setText("");
        setMessage(failed > 0 ? `${ok}개를 넣었고 ${failed}개는 넣지 못했어요.` : `${ok}개를 플래너에 넣었어요${memoSaved ? " · 메모도 노트로 남겼어요" : ""}.`);
        // 노트는 오늘 화면이 들고 있는 목록과 겹치지 않게 새로 연다 (안 그러면 화면의 옛 노트 목록이 자동 저장으로 덮어쓴다)
        if (memoSaved) setTimeout(() => window.location.reload(), 900);
    }

    return (
        <section ref={rootRef} className="mb-10 scroll-mt-20 border border-neutral-200 bg-white p-6 md:p-8 myverse-dark:border-white/10 myverse-dark:bg-white/5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--pp-accent)]">
                <Sparkles className="h-4 w-4" /> 생각 쏟아내기
            </div>

            {!actions ? (
                <>
                    <textarea
                        value={text}
                        onChange={(e) => { setText(e.target.value); setMessage(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void parse(); } }}
                        rows={3}
                        maxLength={2000}
                        placeholder="생각나는 대로 적어 보세요. 예) 내일 오후 2시 외근 끝나면 카페에서 보고서 초안 잡고, 저녁엔 운동"
                        className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 myverse-dark:text-neutral-100"
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <VoiceRecordButton label="말로 하기" onTranscribed={(t) => setText((prev) => (prev ? `${prev} ${t}` : t))} />
                        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void readPhoto(f); }} />
                        <button onClick={() => fileRef.current?.click()} disabled={busy} title="종이·PAD 플래너 페이지를 찍으면 할 일·일정·메모로 읽어요 (사진은 저장하지 않아요)" className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-[var(--pp-accent)] disabled:opacity-40">
                            <Camera className="h-4 w-4" /> 사진으로
                        </button>
                        {message && <p className="text-sm text-neutral-500">{message}</p>}
                        <button
                            onClick={parse}
                            disabled={busy || !text.trim()}
                            className="ml-auto inline-flex items-center gap-1.5 bg-[var(--pp-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--pp-accent-strong)] disabled:opacity-40"
                        >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} 할 일·일정으로 정리
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <p className="mt-3 text-sm text-neutral-500">{fromPhoto ? `손글씨 페이지(${fromPhoto})를 이렇게 읽었어요. 넣을 것만 고르세요. 사진은 저장하지 않았어요.` : "이렇게 정리했어요. 넣을 것만 고르세요."}</p>
                    <ul className="mt-3 divide-y divide-neutral-100 border-y border-neutral-100 myverse-dark:divide-white/10 myverse-dark:border-white/10">
                        {actions.map((a, i) => {
                            const d = describeAction(a);
                            return (
                                <li key={i}>
                                    <label className="flex cursor-pointer items-center gap-3 py-3">
                                        <input type="checkbox" checked={picked[i] ?? false} onChange={(e) => setPicked((p) => p.map((v, k) => (k === i ? e.target.checked : v)))} className="h-4 w-4 accent-[var(--pp-accent)]" />
                                        <span className={`shrink-0 px-1.5 py-0.5 text-[11px] font-bold ${d.kind === "일정" ? "bg-[var(--pp-accent)] text-white" : "bg-neutral-100 text-neutral-600"}`}>{d.kind}</span>
                                        <span className={`min-w-0 flex-1 truncate text-[15px] ${a.input.mark === "cancelled" ? "text-neutral-400 line-through" : ""}`}>{d.title}{a.input.priority === "high" && <b className="ml-1 text-red-500">!</b>}</span>
                                        {typeof a.input.mark === "string" && MARK[a.input.mark] && <span className="shrink-0 text-[11px] text-neutral-500">{MARK[a.input.mark]}</span>}
                                        <span className="shrink-0 text-sm text-neutral-400">{d.when}</span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                    {memo && (
                        <label className="mt-4 block cursor-pointer border border-neutral-100 bg-neutral-50 p-3 myverse-dark:border-white/10 myverse-dark:bg-white/5">
                            <span className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={keepMemo} onChange={(e) => setKeepMemo(e.target.checked)} className="h-4 w-4 accent-[var(--pp-accent)]" /> 메모는 그날 노트로 남기기</span>
                            <span className="mt-2 block whitespace-pre-line text-sm text-neutral-600">{memo}</span>
                        </label>
                    )}
                    <div className="mt-4 flex items-center justify-end gap-2">
                        <button onClick={() => { setActions(null); setMemo(""); }} disabled={busy} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-neutral-500 hover:text-neutral-900"><X className="h-4 w-4" /> 다시 쓰기</button>
                        <button onClick={commit} disabled={busy || (!picked.some(Boolean) && !(keepMemo && memo))} className="inline-flex items-center gap-1.5 bg-[var(--pp-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--pp-accent-strong)] disabled:opacity-40">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {picked.filter(Boolean).length}개{keepMemo && memo ? " + 메모" : ""} 넣기
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
