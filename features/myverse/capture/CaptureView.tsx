"use client";

// 캡쳐 — 오늘의 한 장면(moments) + 방문 장소(places) + 일과 기록(routines)을 한 화면에 통합
// 데이터: GET /api/myverse/traces?date=today  →  source: moment | place | routine
// 저장 분기:
//   메모/사진/영상  → POST /api/myverse/moments
//   식사/운동       → POST /api/myverse/routines
//   체크인          → POST /api/myverse/places

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Camera, Video, Utensils, Activity, MapPin, PenSquare,
    Sparkles, Loader2, Share2, ListPlus, FolderPlus, Search,
    Trash2, Globe, Lock, Plus, Image as ImageIcon, Clock,
} from "lucide-react";

type Source = "moment" | "place" | "routine";
type MediaType = "image" | "video" | "text" | null;

interface UnifiedTrace {
    id: string;                        // "m_{uuid}" | "p_{uuid}" | "r_{uuid}"
    source: Source;
    date: string;
    happened_at: string | null;
    media_type: MediaType;
    media_url: string | null;
    thumbnail_url: string | null;
    caption: string | null;
    body: string | null;
    location: string | null;
    with_whom: string | null;
    activity: string | null;
    category: string | null;
    duration_min: number | null;
    visibility: "private" | "public" | "friends" | null;
    domain: string | null;
    // 클라이언트 보강 — 카드별 AI 분석 결과 (moment만)
    nutrition?: { calories?: number; summary?: string } | null;
    exercise?: { kcal?: number; summary?: string } | null;
    sub_tags?: string[] | null;
}

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

function rawId(trace: UnifiedTrace): string {
    return trace.id.replace(/^[mpr]_/, "");
}

// ───────────────────────── AI 액션 제안 ─────────────────────────

type ActionId = "analyze-food" | "analyze-exercise" | "task" | "project" | "search" | "share" | "delete";
interface Action { id: ActionId; label: string; icon: typeof Sparkles; tone?: "primary" | "default" }

const FOOD_HINTS = ["음식", "식사", "커피", "디저트", "맛집", "food", "meal", "coffee", "cafe"];
const EXERCISE_HINTS = ["운동", "헬스", "러닝", "요가", "걷기", "산책", "스트레칭"];
const CELEBRATION_HINTS = ["생일", "축하", "기념", "성과", "오픈", "출시", "졸업"];

function hasHint(t: UnifiedTrace, hints: string[]): boolean {
    const tags = (t.sub_tags ?? []).map(s => s.toLowerCase());
    const blob = `${t.caption ?? ""} ${t.body ?? ""} ${t.activity ?? ""}`.toLowerCase();
    return hints.some(h => tags.includes(h.toLowerCase()) || blob.includes(h.toLowerCase()));
}

function suggestActions(t: UnifiedTrace): Action[] {
    const acts: Action[] = [];

    if (t.source === "moment") {
        const isMedia = t.media_type === "image" || t.media_type === "video";
        if (t.media_type === "text") {
            acts.push({ id: "task", label: "Task로", icon: ListPlus, tone: "primary" });
            acts.push({ id: "project", label: "프로젝트로", icon: FolderPlus });
            acts.push({ id: "search", label: "검색해 볼까요?", icon: Search });
        } else if (isMedia) {
            if (hasHint(t, FOOD_HINTS) || t.activity === "식사") {
                if (!t.nutrition) acts.push({ id: "analyze-food", label: "식단·열량 분석", icon: Utensils, tone: "primary" });
            } else if (hasHint(t, EXERCISE_HINTS) || t.activity === "운동") {
                if (!t.exercise) acts.push({ id: "analyze-exercise", label: "운동 분석", icon: Activity, tone: "primary" });
            } else if (t.domain === "work" || t.domain === "study") {
                acts.push({ id: "project", label: "프로젝트로", icon: FolderPlus, tone: "primary" });
                acts.push({ id: "task", label: "Task로", icon: ListPlus });
            } else if (hasHint(t, CELEBRATION_HINTS) || t.domain === "relation") {
                acts.push({ id: "share", label: "소셜 공유", icon: Share2, tone: "primary" });
            } else {
                acts.push({ id: "task", label: "Task로", icon: ListPlus });
            }
        }
    } else if (t.source === "place") {
        // 장소 — 메모로 발전·공유
        acts.push({ id: "task", label: "Task로", icon: ListPlus });
    } else if (t.source === "routine") {
        if (t.category === "meal") {
            acts.push({ id: "analyze-food", label: "식단 분석", icon: Utensils, tone: "primary" });
        } else if (t.category === "exercise") {
            acts.push({ id: "analyze-exercise", label: "운동 분석", icon: Activity, tone: "primary" });
        } else {
            acts.push({ id: "task", label: "Task로", icon: ListPlus });
        }
    }
    acts.push({ id: "share", label: "공유", icon: Share2 });
    acts.push({ id: "delete", label: "삭제", icon: Trash2 });
    const seen = new Set<ActionId>();
    return acts.filter(a => (seen.has(a.id) ? false : (seen.add(a.id), true)));
}

// ───────────────────────── 컴포넌트 ─────────────────────────

type ComposerKind = "memo" | "photo" | "video" | "meal" | "exercise" | "checkin";

export function CaptureView() {
    const [traces, setTraces] = useState<UnifiedTrace[]>([]);
    const [loading, setLoading] = useState(true);
    const [composer, setComposer] = useState<ComposerKind | null>(null);
    const [text, setText] = useState("");
    const [extraField, setExtraField] = useState("");   // 시간(routine) 또는 장소(place)
    const [submitting, setSubmitting] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const imgRef = useRef<HTMLInputElement | null>(null);
    const vidRef = useRef<HTMLInputElement | null>(null);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2400);
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/myverse/traces?date=${today()}`);
        if (res.ok) {
            const d = await res.json();
            setTraces(d.traces ?? []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── 빠른 도크 ────────────────────────────

    function openComposer(kind: ComposerKind) {
        if (kind === "photo") { imgRef.current?.click(); return; }
        if (kind === "video") { vidRef.current?.click(); return; }
        setComposer(kind);
        setText("");
        setExtraField("");
        if (kind === "checkin" && typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => setExtraField(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`),
                () => {},
                { timeout: 5000 },
            );
        }
    }

    async function submitComposer() {
        if (!composer || !text.trim()) return;
        setSubmitting(true);
        try {
            if (composer === "memo") {
                await fetch("/api/myverse/moments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: today(), media_type: "text", body: text.trim(), visibility: "private" }),
                });
            } else if (composer === "checkin") {
                await fetch("/api/myverse/places", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date: today(),
                        place_name: text.trim(),
                        address: extraField || null,
                        visited_at: new Date().toTimeString().slice(0, 5),
                        category: "general",
                    }),
                });
            } else if (composer === "meal" || composer === "exercise") {
                await fetch("/api/myverse/routines", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date: today(),
                        activity: text.trim(),
                        start_time: extraField || new Date().toTimeString().slice(0, 5),
                        category: composer === "meal" ? "meal" : "exercise",
                        note: null,
                    }),
                });
            }
            setComposer(null);
            setText("");
            setExtraField("");
            await load();
            showToast("기록 완료");
        } catch {
            showToast("저장 실패");
        } finally {
            setSubmitting(false);
        }
    }

    async function uploadMedia(file: File) {
        const form = new FormData();
        form.append("file", file);
        form.append("date", today());
        const up = await fetch("/api/myverse/moments/upload", { method: "POST", body: form });
        if (!up.ok) { showToast("업로드 실패"); return; }
        const upData = await up.json();
        const media_type: MediaType = file.type.startsWith("video/") ? "video" : "image";
        const post = await fetch("/api/myverse/moments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: today(),
                media_type,
                media_url: upData.url ?? upData.publicUrl ?? upData.media_url,
                thumbnail_url: upData.thumbnail_url ?? null,
                visibility: "private",
            }),
        });
        if (!post.ok) { showToast("저장 실패"); return; }
        await load();
        showToast("AI가 분석 중…");
    }

    // ── 카드 액션 ────────────────────────────

    async function runAction(t: UnifiedTrace, action: ActionId) {
        setBusyId(t.id);
        try {
            const id = rawId(t);

            if (action === "analyze-food" && t.source === "moment") {
                const res = await fetch(`/api/myverse/moments/${id}/analyze-food`, { method: "POST" });
                if (!res.ok) { showToast("분석 실패"); return; }
                showToast("식단 분석 완료");
                await load();
            } else if (action === "analyze-exercise" && t.source === "moment") {
                const res = await fetch(`/api/myverse/moments/${id}/analyze-exercise`, { method: "POST" });
                if (!res.ok) { showToast("분석 실패"); return; }
                showToast("운동 분석 완료");
                await load();
            } else if (action === "analyze-food" || action === "analyze-exercise") {
                // routine 카드에서 분석 호출 — moment과 1:1 미러가 있을 수도 있지만, MVP에서는 안내만
                showToast("이 기록은 사진이 없어서 분석할 수 없어요");
            } else if (action === "task") {
                const title = (t.body || t.caption || t.activity || t.location || "").slice(0, 120);
                if (!title.trim()) { showToast("내용이 없어요"); return; }
                const res = await fetch("/api/myverse/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: today(), title, type: "task", source: { type: t.source, id } }),
                });
                if (!res.ok) { showToast("Task 생성 실패"); return; }
                showToast("오늘 Task에 추가됨");
            } else if (action === "project") {
                showToast("프로젝트 선택 화면은 다음 단계에서 추가됩니다");
            } else if (action === "search") {
                const q = (t.body || t.caption || t.activity || "").trim();
                if (!q) { showToast("검색할 내용이 없어요"); return; }
                window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank", "noopener");
            } else if (action === "share") {
                const text = t.caption || t.body || t.activity || t.location || "Myverse";
                if (typeof navigator !== "undefined" && navigator.share) {
                    await navigator.share({ text, url: t.media_url || undefined }).catch(() => {});
                } else if (t.media_url) {
                    await navigator.clipboard.writeText(t.media_url);
                    showToast("URL 복사됨");
                } else {
                    await navigator.clipboard.writeText(text);
                    showToast("내용 복사됨");
                }
            } else if (action === "delete") {
                if (!confirm("이 기록을 삭제할까요?")) return;
                const endpoint = t.source === "moment"
                    ? `/api/myverse/moments/${id}`
                    : t.source === "place"
                        ? `/api/myverse/places?id=${id}`
                        : `/api/myverse/routines?id=${id}`;
                const res = await fetch(endpoint, { method: "DELETE" });
                if (!res.ok) { showToast("삭제 실패"); return; }
                await load();
                showToast("삭제됨");
            }
        } finally {
            setBusyId(null);
        }
    }

    // ── 렌더 ────────────────────────────

    const composerCfg = useMemo(() => {
        if (!composer) return null;
        return {
            memo:     { label: "메모",   placeholder: "메모를 남겨보세요. 아이디어·생각·할 일 모두 환영.", extraLabel: null,           extraPlaceholder: "" },
            checkin:  { label: "체크인", placeholder: "어디에 계신가요? (예: 스타벅스 강남점)",            extraLabel: "주소·좌표",     extraPlaceholder: "주소 또는 좌표 (선택)" },
            meal:     { label: "식사",   placeholder: "무엇을 드셨나요? (예: 점심, 김치찌개)",              extraLabel: "시간",          extraPlaceholder: "12:30 (선택)" },
            exercise: { label: "운동",   placeholder: "어떤 운동을 했나요? (예: 30분 러닝)",                extraLabel: "시간",          extraPlaceholder: "07:00 (선택)" },
            photo:    null,
            video:    null,
        }[composer];
    }, [composer]);

    return (
        <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
            {/* 헤더 */}
            <div className="mb-5">
                <h1 className="text-xl font-semibold text-neutral-900 myverse-dark:text-neutral-100 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#6366F1]" />
                    캡쳐
                </h1>
                <p className="text-xs text-neutral-500 mt-1">한 장면 · 방문 장소 · 일과를 한 곳에 기록하면 AI가 9 영역으로 정리하고 다음 행동을 제안합니다.</p>
            </div>

            {/* 빠른 도크 */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                <DockBtn icon={PenSquare} label="메모"   onClick={() => openComposer("memo")} />
                <DockBtn icon={Camera}    label="사진"   onClick={() => openComposer("photo")} />
                <DockBtn icon={Video}     label="영상"   onClick={() => openComposer("video")} />
                <DockBtn icon={Utensils}  label="식사"   onClick={() => openComposer("meal")} />
                <DockBtn icon={Activity}  label="운동"   onClick={() => openComposer("exercise")} />
                <DockBtn icon={MapPin}    label="체크인" onClick={() => openComposer("checkin")} />
            </div>

            <input ref={imgRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && uploadMedia(e.target.files[0])} />
            <input ref={vidRef} type="file" accept="video/*" hidden onChange={e => e.target.files?.[0] && uploadMedia(e.target.files[0])} />

            {/* Composer */}
            {composer && composerCfg && (
                <div className="mb-4 p-3 rounded-xl border border-neutral-200 myverse-dark:border-white/10 bg-white myverse-dark:bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#6366F1]">{composerCfg.label}</span>
                        <button onClick={() => setComposer(null)} className="text-xs text-neutral-400 hover:text-neutral-600">취소</button>
                    </div>
                    <textarea
                        autoFocus
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder={composerCfg.placeholder}
                        className="w-full min-h-[72px] resize-none bg-transparent text-sm text-neutral-800 myverse-dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none"
                    />
                    {composerCfg.extraLabel && (
                        <input
                            value={extraField}
                            onChange={e => setExtraField(e.target.value)}
                            placeholder={composerCfg.extraPlaceholder}
                            className="w-full mt-2 px-2 py-1.5 text-xs bg-neutral-50 myverse-dark:bg-white/5 rounded-md text-neutral-700 myverse-dark:text-neutral-300 placeholder:text-neutral-400 focus:outline-none"
                        />
                    )}
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={submitComposer}
                            disabled={submitting || !text.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-xs font-medium hover:bg-[#4F46E5] disabled:opacity-40 transition-colors"
                        >
                            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                            기록
                        </button>
                    </div>
                </div>
            )}

            {/* 카드 리스트 */}
            <div className="mt-4">
                <div className="text-[10px] uppercase tracking-widest font-semibold text-neutral-400 mb-2">오늘의 흔적</div>
                {loading ? (
                    <div className="py-12 text-center"><Loader2 className="h-4 w-4 animate-spin text-neutral-400 mx-auto" /></div>
                ) : traces.length === 0 ? (
                    <div className="py-12 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 myverse-dark:border-white/10 rounded-xl">
                        아직 기록이 없어요. 위에서 빠르게 시작해 보세요.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {traces.map(t => (
                            <TraceCard key={t.id} trace={t} busy={busyId === t.id} onAction={a => runAction(t, a)} />
                        ))}
                    </div>
                )}
            </div>

            {toast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-900 text-white text-xs rounded-full shadow-lg z-50">
                    {toast}
                </div>
            )}
        </div>
    );
}

// ───────────────────────── 서브 컴포넌트 ─────────────────────────

function DockBtn({ icon: Icon, label, onClick }: { icon: typeof Camera; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl border border-neutral-200 myverse-dark:border-white/10 bg-white myverse-dark:bg-white/5 hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-colors group"
        >
            <Icon className="h-4 w-4 text-neutral-500 group-hover:text-[#6366F1]" />
            <span className="text-[11px] font-medium text-neutral-700 myverse-dark:text-neutral-300">{label}</span>
        </button>
    );
}

const SOURCE_META: Record<Source, { icon: typeof ImageIcon; label: string; tone: string }> = {
    moment:  { icon: ImageIcon, label: "한 장면", tone: "text-[#6366F1] bg-[#6366F1]/10" },
    place:   { icon: MapPin,    label: "장소",    tone: "text-emerald-600 bg-emerald-500/10" },
    routine: { icon: Clock,     label: "일과",    tone: "text-amber-600 bg-amber-500/10" },
};

const DOMAIN_LABELS: Record<string, string> = {
    body: "BODY", work: "업무", study: "공부", daily: "일상",
    schedule: "일정", travel: "여행", move: "이동", relation: "관계",
};

function TraceCard({ trace: t, busy, onAction }: { trace: UnifiedTrace; busy: boolean; onAction: (a: ActionId) => void }) {
    const actions = suggestActions(t);
    const meta = SOURCE_META[t.source];
    const SourceIcon = meta.icon;
    const time = t.happened_at
        ? new Date(t.happened_at.length === 5 ? `${t.date}T${t.happened_at}` : t.happened_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
        : null;
    const domainLabel = t.domain ? DOMAIN_LABELS[t.domain] ?? t.domain : null;
    const isMedia = t.source === "moment" && (t.media_type === "image" || t.media_type === "video");

    return (
        <div className="rounded-xl border border-neutral-200 myverse-dark:border-white/10 bg-white myverse-dark:bg-white/5 overflow-hidden">
            {isMedia && t.media_url && (
                <div className="bg-neutral-100 myverse-dark:bg-black/30">
                    {t.media_type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.thumbnail_url || t.media_url} alt={t.caption ?? ""} className="w-full max-h-96 object-contain" />
                    ) : (
                        <video src={t.media_url} controls className="w-full max-h-96" />
                    )}
                </div>
            )}

            <div className="p-3 space-y-2">
                {/* 메타 헤더 */}
                <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-neutral-400">
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${meta.tone}`}>
                        <SourceIcon className="h-3 w-3" />
                        {meta.label}
                    </span>
                    {time && <span>{time}</span>}
                    {t.duration_min != null && t.duration_min > 0 && <span>· {t.duration_min}분</span>}
                    {t.visibility === "public" && <Globe className="h-3 w-3" />}
                    {t.visibility === "private" && <Lock className="h-3 w-3" />}
                    {domainLabel && <span className="px-1.5 py-0.5 rounded bg-neutral-100 myverse-dark:bg-white/10 text-neutral-500">{domainLabel}</span>}
                    {t.category && <span className="px-1.5 py-0.5 rounded bg-neutral-100 myverse-dark:bg-white/10 text-neutral-500">{t.category}</span>}
                    {(t.sub_tags ?? []).slice(0, 3).map(tg => <span key={tg}>#{tg}</span>)}
                </div>

                {/* 주 본문 — source별 표시 */}
                {t.source === "place" && (
                    <div>
                        <p className="text-sm font-medium text-neutral-800 myverse-dark:text-neutral-200 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                            {t.location}
                        </p>
                        {t.caption && <p className="text-xs text-neutral-500 mt-0.5">{t.caption}</p>}
                        {t.body && <p className="text-xs text-neutral-600 myverse-dark:text-neutral-400 mt-1 whitespace-pre-wrap">{t.body}</p>}
                    </div>
                )}
                {t.source === "routine" && (
                    <div>
                        <p className="text-sm font-medium text-neutral-800 myverse-dark:text-neutral-200">{t.activity}</p>
                        {t.body && <p className="text-xs text-neutral-600 myverse-dark:text-neutral-400 mt-1 whitespace-pre-wrap">{t.body}</p>}
                    </div>
                )}
                {t.source === "moment" && (
                    <>
                        {t.body && <p className="text-sm text-neutral-800 myverse-dark:text-neutral-200 whitespace-pre-wrap">{t.body}</p>}
                        {t.caption && !t.body && <p className="text-sm text-neutral-600 myverse-dark:text-neutral-400">{t.caption}</p>}
                    </>
                )}

                {/* AI 분석 결과 */}
                {t.nutrition?.summary && (
                    <div className="text-xs text-emerald-700 myverse-dark:text-emerald-400 bg-emerald-50 myverse-dark:bg-emerald-500/10 px-2 py-1 rounded">
                        🍽 {t.nutrition.summary}{t.nutrition.calories ? ` · ${t.nutrition.calories} kcal` : ""}
                    </div>
                )}
                {t.exercise?.summary && (
                    <div className="text-xs text-rose-700 myverse-dark:text-rose-400 bg-rose-50 myverse-dark:bg-rose-500/10 px-2 py-1 rounded">
                        🏃 {t.exercise.summary}{t.exercise.kcal ? ` · ${t.exercise.kcal} kcal` : ""}
                    </div>
                )}

                {/* 액션 칩 */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {busy ? (
                        <span className="flex items-center gap-1 text-[11px] text-neutral-400"><Loader2 className="h-3 w-3 animate-spin" /> 처리 중…</span>
                    ) : (
                        actions.map(a => {
                            const Icon = a.icon;
                            const primary = a.tone === "primary";
                            return (
                                <button
                                    key={a.id}
                                    onClick={() => onAction(a.id)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors ${
                                        primary
                                            ? "bg-[#6366F1] text-white hover:bg-[#4F46E5]"
                                            : a.id === "delete"
                                                ? "text-neutral-400 hover:text-red-500"
                                                : "text-neutral-600 myverse-dark:text-neutral-400 hover:bg-neutral-100 myverse-dark:hover:bg-white/10"
                                    }`}
                                >
                                    <Icon className="h-3 w-3" />
                                    {a.label}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
