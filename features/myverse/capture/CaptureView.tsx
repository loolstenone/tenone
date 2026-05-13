"use client";

// 캡쳐 — 오늘의 한 장면(moments) + 방문 장소(places) + 일과 기록(routines)을 한 화면에 통합
// 데이터: GET /api/myverse/traces?date=today  →  source: moment | place | routine
// 저장 분기:
//   메모/사진/영상  → POST /api/myverse/moments
//   식사/운동       → POST /api/myverse/routines
//   체크인          → POST /api/myverse/places

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    Camera, Video, Utensils, Activity, MapPin, PenSquare,
    Sparkles, Loader2, Share2, ListPlus, FolderPlus, Search,
    Trash2, Globe, Lock, Plus, Image as ImageIcon, Clock,
    Target, FileText, Flag, Satellite, AlertCircle, Mic, Square,
    Brush, Contact, Mail, Castle, Lightbulb,
} from "lucide-react";
import { useAutoCheckin, type AutoCheckinPayload } from "@/lib/myverse/auto-checkin";
import { useRecorder } from "@/lib/myverse/use-recorder";

type Source = "moment" | "place" | "routine";
type MediaType = "image" | "video" | "text" | "audio" | null;

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

function suggestProjectTitle(t: UnifiedTrace): string {
    const candidates = t.source === "place"
        ? [t.location, t.caption, t.body]
        : t.source === "routine"
            ? [t.activity, t.body, t.caption]
            : [t.caption, t.body, t.activity, t.location];
    for (const c of candidates) {
        const s = (c ?? "").trim();
        if (s) return s.slice(0, 80);
    }
    const date = t.date || today();
    const label = t.source === "place" ? "장소" : t.source === "routine" ? "일과" : "한 장면";
    return `${date} 캡쳐 ${label}`;
}

function buildProjectContent(t: UnifiedTrace): string {
    const lines: string[] = [];
    if (t.body) lines.push(t.body);
    if (t.caption && t.caption !== t.body) lines.push(t.caption);
    if (t.source === "place" && t.location) lines.push(`📍 ${t.location}`);
    if (t.source === "routine" && t.activity) lines.push(`⏱ ${t.activity}${t.duration_min ? ` · ${t.duration_min}분` : ""}`);
    if (t.media_url && t.media_type === "image") lines.push(`![](${t.media_url})`);
    else if (t.media_url) lines.push(t.media_url);
    if (t.nutrition?.summary) lines.push(`🍽 ${t.nutrition.summary}${t.nutrition.calories ? ` · ${t.nutrition.calories} kcal` : ""}`);
    if (t.exercise?.summary) lines.push(`🏃 ${t.exercise.summary}${t.exercise.kcal ? ` · ${t.exercise.kcal} kcal` : ""}`);
    const tags = (t.sub_tags ?? []).map(s => `#${s}`).join(" ");
    if (tags) lines.push(tags);
    const sourceLabel = t.source === "moment" ? "한 장면" : t.source === "place" ? "장소" : "일과";
    lines.push("");
    lines.push(`— 캡쳐(${sourceLabel})에서 가져옴 · ${t.date}${t.happened_at ? ` ${String(t.happened_at).slice(0, 5)}` : ""}`);
    return lines.join("\n");
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
        } else if (t.media_type === "audio") {
            acts.push({ id: "task", label: "Task로", icon: ListPlus, tone: "primary" });
            acts.push({ id: "project", label: "프로젝트로", icon: FolderPlus });
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

interface ProjectOpt { id: string; title: string }
type ProjectMode = "note" | "milestone";

export function CaptureView() {
    const [traces, setTraces] = useState<UnifiedTrace[]>([]);
    const [loading, setLoading] = useState(true);
    const [composer, setComposer] = useState<ComposerKind | null>(null);
    const [text, setText] = useState("");
    const [extraField, setExtraField] = useState("");   // 체크인 주소 (장소)
    // 운동·식사 전용 구조화 필드
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [intensity, setIntensity] = useState<number>(0);          // 1~5, 0=미지정
    const [heartRate, setHeartRate] = useState<string>("");          // BPM
    const [kcal, setKcal] = useState<string>("");                    // 칼로리
    const [composition, setComposition] = useState<string>("");      // 메뉴 구성 / 세트 구성
    const [submitting, setSubmitting] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const imgRef = useRef<HTMLInputElement | null>(null);
    const vidRef = useRef<HTMLInputElement | null>(null);

    // 자동 체크인 — 앱이 foreground일 때 30분 슬롯 단위 자동 위치 기록
    const handleAutoCheckin = useCallback(async (p: AutoCheckinPayload) => {
        const res = await fetch("/api/myverse/places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: p.date,
                place_name: "자동 기록",
                visited_at: p.timeSlot,
                address: `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`,
                category: "general",
                note: "자동 체크인 (GPS)",
            }),
        });
        if (res.ok) {
            await load();
            showToast("자동 체크인 기록됨");
        }
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps
    const autoCheckin = useAutoCheckin(handleAutoCheckin);

    // 녹음 (MediaRecorder)
    const recorder = useRecorder();
    const recordingUploadingRef = useRef(false);
    const handleRecordToggle = useCallback(async () => {
        if (recorder.state === "idle") {
            await recorder.start();
            return;
        }
        if (recorder.state === "recording") {
            if (recordingUploadingRef.current) return;
            recordingUploadingRef.current = true;
            try {
                const result = await recorder.stop();
                if (!result) { showToast("녹음 내용이 없어요"); return; }
                showToast("업로드 중…");
                const form = new FormData();
                const file = new File([result.blob], result.filename, { type: result.mimeType });
                form.append("file", file);
                form.append("date", today());
                const up = await fetch("/api/myverse/moments/upload", { method: "POST", body: form });
                if (!up.ok) { showToast("업로드 실패"); return; }
                const upData = await up.json();
                const post = await fetch("/api/myverse/moments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date: today(),
                        media_type: "audio",
                        media_url: upData.url ?? upData.publicUrl ?? upData.media_url,
                        duration_sec: result.durationSec,
                        visibility: "private",
                    }),
                });
                if (!post.ok) { showToast("저장 실패"); return; }
                await load();
                showToast("녹음 저장됨");
            } finally {
                recordingUploadingRef.current = false;
            }
        }
    }, [recorder]);  // eslint-disable-line react-hooks/exhaustive-deps

    // 프로젝트로 적용 모달
    const [projectTarget, setProjectTarget] = useState<UnifiedTrace | null>(null);
    const [projects, setProjects] = useState<ProjectOpt[]>([]);
    const [projectsLoaded, setProjectsLoaded] = useState(false);
    const [projectId, setProjectId] = useState<string>("");
    const [projectMode, setProjectMode] = useState<ProjectMode>("note");
    const [projectTitle, setProjectTitle] = useState("");
    const [projectDueDate, setProjectDueDate] = useState<string>("");
    const [projectSubmitting, setProjectSubmitting] = useState(false);

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
        const nowHHMM = new Date().toTimeString().slice(0, 5);
        if (kind === "meal" || kind === "exercise") {
            setStartTime(nowHHMM);
            setEndTime("");
            setIntensity(0);
            setHeartRate("");
            setKcal("");
            setComposition("");
        }
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
                const isMeal = composer === "meal";
                const payload: Record<string, unknown> = {
                    date: today(),
                    activity: text.trim(),
                    start_time: startTime || new Date().toTimeString().slice(0, 5),
                    end_time: endTime || null,
                    category: isMeal ? "meal" : "exercise",
                    composition: composition.trim() || null,
                    kcal: kcal ? Number(kcal) : null,
                };
                if (!isMeal) {
                    payload.level = intensity >= 1 && intensity <= 5 ? intensity : null;
                    payload.heart_rate = heartRate ? Number(heartRate) : null;
                }
                await fetch("/api/myverse/routines", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
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

    // ── 프로젝트로 적용 모달 ────────────────────────────

    async function loadProjects() {
        try {
            const res = await fetch("/api/myverse/projects");
            if (res.ok) {
                const d = await res.json();
                const list = (d.projects ?? []).map((p: { id: string; title?: string }) => ({
                    id: p.id,
                    title: p.title || "(제목 없음)",
                }));
                setProjects(list);
                setProjectsLoaded(true);
                return list as ProjectOpt[];
            }
        } catch {
            // 무시 — UI에서 안내
        }
        setProjectsLoaded(true);
        return [];
    }

    async function openProjectModal(t: UnifiedTrace) {
        const list = projectsLoaded ? projects : await loadProjects();
        if (!list.length) {
            showToast("먼저 프로젝트를 만들어 주세요");
            return;
        }
        setProjectTarget(t);
        setProjectId(list[0]?.id ?? "");
        setProjectMode("note");
        setProjectTitle(suggestProjectTitle(t));
        setProjectDueDate(t.date || today());
    }

    function closeProjectModal() {
        setProjectTarget(null);
        setProjectSubmitting(false);
    }

    async function submitProject() {
        if (!projectTarget || !projectId || !projectTitle.trim()) return;
        setProjectSubmitting(true);
        try {
            if (projectMode === "note") {
                const res = await fetch(`/api/myverse/projects/${projectId}/notes`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: projectTitle.trim(),
                        content: buildProjectContent(projectTarget),
                    }),
                });
                if (!res.ok) { showToast("노트 저장 실패"); return; }
                showToast("프로젝트 노트에 추가됨");
            } else {
                const res = await fetch(`/api/myverse/projects/${projectId}/milestones`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: projectTitle.trim(),
                        description: buildProjectContent(projectTarget),
                        due_date: projectDueDate || null,
                        order_index: 0,
                    }),
                });
                if (!res.ok) { showToast("마일스톤 생성 실패"); return; }
                showToast("마일스톤이 생성됐어요");
            }
            closeProjectModal();
        } finally {
            setProjectSubmitting(false);
        }
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
                await openProjectModal(t);
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
            meal:     { label: "식사",   placeholder: "무엇을 드셨나요? (예: 점심, 저녁)",                  extraLabel: null,            extraPlaceholder: "" },
            exercise: { label: "운동",   placeholder: "어떤 운동을 했나요? (예: 러닝, 헬스, 요가)",          extraLabel: null,            extraPlaceholder: "" },
            photo:    null,
            video:    null,
        }[composer];
    }, [composer]);

    const isStructuredComposer = composer === "meal" || composer === "exercise";

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

            {/* 자동 체크인 토글 */}
            <div className={`mb-3 flex items-center justify-between gap-3 rounded-xl px-3 py-2 border transition-colors ${
                autoCheckin.enabled
                    ? "border-emerald-300 bg-emerald-50 myverse-dark:border-emerald-500/30 myverse-dark:bg-emerald-500/10"
                    : "border-neutral-200 bg-white myverse-dark:border-white/10 myverse-dark:bg-white/5"
            }`}>
                <div className="flex items-center gap-2 min-w-0">
                    <Satellite className={`h-4 w-4 flex-shrink-0 ${autoCheckin.enabled ? "text-emerald-600" : "text-neutral-400"}`} />
                    <div className="min-w-0">
                        <div className="text-xs font-medium text-neutral-800 myverse-dark:text-neutral-200">자동 체크인</div>
                        {autoCheckin.error ? (
                            <div className="text-[10px] text-rose-600 flex items-center gap-1 mt-0.5">
                                <AlertCircle className="h-2.5 w-2.5 flex-shrink-0" />
                                <span className="truncate">{autoCheckin.error}</span>
                            </div>
                        ) : autoCheckin.enabled ? (
                            <div className="text-[10px] text-neutral-500 myverse-dark:text-neutral-400 truncate">
                                {autoCheckin.lastCheckinAt
                                    ? `최근 기록 ${autoCheckin.lastCheckinAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`
                                    : autoCheckin.lastPollAt
                                        ? `폴링 ${autoCheckin.lastPollAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} · 30분마다`
                                        : "위치 권한을 허용해 주세요"}
                            </div>
                        ) : (
                            <div className="text-[10px] text-neutral-400">30분마다 자동 위치 기록 (앱 열려있을 때만)</div>
                        )}
                    </div>
                </div>
                <button
                    onClick={autoCheckin.toggle}
                    aria-pressed={autoCheckin.enabled}
                    className={`flex-shrink-0 w-9 h-5 rounded-full transition-colors relative ${
                        autoCheckin.enabled ? "bg-emerald-500" : "bg-neutral-300 myverse-dark:bg-white/20"
                    }`}
                >
                    <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                            autoCheckin.enabled ? "left-[18px]" : "left-0.5"
                        }`}
                    />
                </button>
            </div>

            {/* 빠른 도크 */}
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-3">
                <DockBtn icon={PenSquare} label="메모"   onClick={() => openComposer("memo")} />
                <DockBtn icon={Camera}    label="사진"   onClick={() => openComposer("photo")} />
                <DockBtn icon={Video}     label="영상"   onClick={() => openComposer("video")} />
                <RecordBtn
                    state={recorder.state}
                    elapsedSec={recorder.elapsedSec}
                    error={recorder.error}
                    onClick={handleRecordToggle}
                />
                <DockBtn icon={Utensils}  label="식사"   onClick={() => openComposer("meal")} />
                <DockBtn icon={Activity}  label="운동"   onClick={() => openComposer("exercise")} />
                <DockBtn icon={MapPin}    label="체크인" onClick={() => openComposer("checkin")} />
            </div>

            {/* 퀵 메뉴 — 도크 밑 가로 스크롤 칩 */}
            <div className="flex flex-wrap gap-1.5 mb-5">
                <QuickLink href="/myverse/app/canvas"   icon={Brush}    label="캔버스" />
                <QuickLink href="/myverse/app/contacts" icon={Contact}  label="연락처" />
                <QuickLink href="/myverse/app/mail"     icon={Mail}     label="메일" />
                <QuickLink href="/myverse/app/personal" icon={Castle}   label="퍼스널" />
                <QuickLink href="/myverse/app/insights" icon={Lightbulb} label="인사이트" />
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
                        className="w-full min-h-[60px] resize-none bg-transparent text-sm text-neutral-800 myverse-dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none"
                    />

                    {/* 체크인 — 주소/좌표 */}
                    {composer === "checkin" && composerCfg.extraLabel && (
                        <input
                            value={extraField}
                            onChange={e => setExtraField(e.target.value)}
                            placeholder={composerCfg.extraPlaceholder}
                            className="w-full mt-2 px-2 py-1.5 text-xs bg-neutral-50 myverse-dark:bg-white/5 rounded-md text-neutral-700 myverse-dark:text-neutral-300 placeholder:text-neutral-400 focus:outline-none"
                        />
                    )}

                    {/* 식사·운동 — 구조화 폼 */}
                    {isStructuredComposer && (
                        <div className="mt-2 space-y-2">
                            {/* 시작/종료 시각 */}
                            <div className="grid grid-cols-2 gap-2">
                                <FormField label="시작">
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs bg-neutral-50 myverse-dark:bg-white/5 rounded-md text-neutral-700 myverse-dark:text-neutral-300 focus:outline-none"
                                    />
                                </FormField>
                                <FormField label="종료 (선택)">
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs bg-neutral-50 myverse-dark:bg-white/5 rounded-md text-neutral-700 myverse-dark:text-neutral-300 focus:outline-none"
                                    />
                                </FormField>
                            </div>

                            {/* 메뉴 구성 / 세트 구성 */}
                            <FormField label={composer === "meal" ? "메뉴 구성 (선택)" : "세트 구성 (선택)"}>
                                <input
                                    value={composition}
                                    onChange={e => setComposition(e.target.value)}
                                    placeholder={composer === "meal" ? "예: 김치찌개 · 밥 · 계란 · 김" : "예: 스쿼트 5×5 · 데드리프트 3×8"}
                                    className="w-full px-2 py-1.5 text-xs bg-neutral-50 myverse-dark:bg-white/5 rounded-md text-neutral-700 myverse-dark:text-neutral-300 placeholder:text-neutral-400 focus:outline-none"
                                />
                            </FormField>

                            {/* 운동 강도 (운동만) */}
                            {composer === "exercise" && (
                                <FormField label="강도">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setIntensity(intensity === n ? 0 : n)}
                                                className={`flex-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                                                    intensity === n
                                                        ? "bg-[#6366F1] text-white"
                                                        : "bg-neutral-50 myverse-dark:bg-white/5 text-neutral-500 hover:bg-neutral-100"
                                                }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </FormField>
                            )}

                            {/* 칼로리 + (운동의 경우) 심박수 */}
                            <div className="grid grid-cols-2 gap-2">
                                <FormField label={composer === "meal" ? "섭취 칼로리 (kcal, 선택)" : "소모 칼로리 (kcal, 선택)"}>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        value={kcal}
                                        onChange={e => setKcal(e.target.value)}
                                        placeholder="예: 450"
                                        className="w-full px-2 py-1.5 text-xs bg-neutral-50 myverse-dark:bg-white/5 rounded-md text-neutral-700 myverse-dark:text-neutral-300 placeholder:text-neutral-400 focus:outline-none"
                                    />
                                </FormField>
                                {composer === "exercise" && (
                                    <FormField label="평균 심박수 (BPM, 선택)">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min={0}
                                            value={heartRate}
                                            onChange={e => setHeartRate(e.target.value)}
                                            placeholder="예: 145"
                                            className="w-full px-2 py-1.5 text-xs bg-neutral-50 myverse-dark:bg-white/5 rounded-md text-neutral-700 myverse-dark:text-neutral-300 placeholder:text-neutral-400 focus:outline-none"
                                        />
                                    </FormField>
                                )}
                            </div>
                        </div>
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

            {projectTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeProjectModal}>
                    <div
                        className="w-full max-w-md rounded-2xl bg-white myverse-dark:bg-neutral-900 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 pt-5 pb-3 border-b border-neutral-100 myverse-dark:border-white/10">
                            <h3 className="text-base font-semibold text-neutral-900 myverse-dark:text-neutral-100 flex items-center gap-2">
                                <Target className="h-4 w-4 text-[#6366F1]" />
                                프로젝트로 적용
                            </h3>
                            <p className="text-[11px] text-neutral-500 mt-1">
                                선택한 캡쳐를 노트 또는 마일스톤으로 프로젝트에 추가합니다.
                            </p>
                        </div>

                        <div className="px-5 py-4 space-y-3">
                            {/* 프로젝트 선택 */}
                            <div>
                                <label className="block text-[11px] font-semibold text-neutral-500 myverse-dark:text-neutral-400 mb-1">프로젝트</label>
                                <select
                                    value={projectId}
                                    onChange={e => setProjectId(e.target.value)}
                                    className="w-full text-sm border border-neutral-200 myverse-dark:border-white/10 rounded-md px-2 py-1.5 bg-white myverse-dark:bg-white/5 text-neutral-800 myverse-dark:text-neutral-200 focus:outline-none focus:border-[#6366F1]"
                                >
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 모드 선택 */}
                            <div>
                                <label className="block text-[11px] font-semibold text-neutral-500 myverse-dark:text-neutral-400 mb-1">유형</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setProjectMode("note")}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs border transition-colors ${
                                            projectMode === "note"
                                                ? "bg-[#6366F1] text-white border-[#6366F1]"
                                                : "border-neutral-200 myverse-dark:border-white/10 text-neutral-600 myverse-dark:text-neutral-400 hover:border-[#6366F1]"
                                        }`}
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        프로젝트 노트
                                    </button>
                                    <button
                                        onClick={() => setProjectMode("milestone")}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs border transition-colors ${
                                            projectMode === "milestone"
                                                ? "bg-[#6366F1] text-white border-[#6366F1]"
                                                : "border-neutral-200 myverse-dark:border-white/10 text-neutral-600 myverse-dark:text-neutral-400 hover:border-[#6366F1]"
                                        }`}
                                    >
                                        <Flag className="h-3.5 w-3.5" />
                                        마일스톤
                                    </button>
                                </div>
                            </div>

                            {/* 제목 */}
                            <div>
                                <label className="block text-[11px] font-semibold text-neutral-500 myverse-dark:text-neutral-400 mb-1">제목</label>
                                <input
                                    value={projectTitle}
                                    onChange={e => setProjectTitle(e.target.value)}
                                    placeholder="제목"
                                    className="w-full text-sm border border-neutral-200 myverse-dark:border-white/10 rounded-md px-2 py-1.5 bg-white myverse-dark:bg-white/5 text-neutral-800 myverse-dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:border-[#6366F1]"
                                />
                            </div>

                            {/* 마일스톤 모드일 때만 마감일 */}
                            {projectMode === "milestone" && (
                                <div>
                                    <label className="block text-[11px] font-semibold text-neutral-500 myverse-dark:text-neutral-400 mb-1">마감일</label>
                                    <input
                                        type="date"
                                        value={projectDueDate}
                                        onChange={e => setProjectDueDate(e.target.value)}
                                        className="w-full text-sm border border-neutral-200 myverse-dark:border-white/10 rounded-md px-2 py-1.5 bg-white myverse-dark:bg-white/5 text-neutral-800 myverse-dark:text-neutral-200 focus:outline-none focus:border-[#6366F1]"
                                    />
                                </div>
                            )}

                            {/* 미리보기 */}
                            <div className="text-[11px] text-neutral-500 myverse-dark:text-neutral-400 bg-neutral-50 myverse-dark:bg-white/5 rounded-md p-2 max-h-32 overflow-y-auto whitespace-pre-wrap">
                                {buildProjectContent(projectTarget).slice(0, 400)}
                                {buildProjectContent(projectTarget).length > 400 ? "…" : ""}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-100 myverse-dark:border-white/10">
                            <button
                                onClick={closeProjectModal}
                                disabled={projectSubmitting}
                                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 myverse-dark:hover:text-neutral-300 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={submitProject}
                                disabled={projectSubmitting || !projectId || !projectTitle.trim()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] text-white rounded-md text-xs font-medium hover:bg-[#4F46E5] disabled:opacity-40 transition-colors"
                            >
                                {projectSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                {projectMode === "note" ? "노트로 저장" : "마일스톤 생성"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-900 text-white text-xs rounded-full shadow-lg z-50">
                    {toast}
                </div>
            )}
        </div>
    );
}

// ───────────────────────── 서브 컴포넌트 ─────────────────────────

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">{label}</div>
            {children}
        </div>
    );
}

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

function RecordBtn({
    state, elapsedSec, error, onClick,
}: {
    state: "idle" | "requesting" | "recording" | "stopping";
    elapsedSec: number;
    error: string | null;
    onClick: () => void;
}) {
    const recording = state === "recording";
    const busy = state === "requesting" || state === "stopping";
    const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
    const ss = String(elapsedSec % 60).padStart(2, "0");
    const Icon = recording ? Square : Mic;
    return (
        <button
            onClick={onClick}
            disabled={busy}
            title={error ?? undefined}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl border transition-colors group disabled:opacity-50 ${
                recording
                    ? "border-rose-400 bg-rose-50 myverse-dark:bg-rose-500/10 hover:bg-rose-100"
                    : error
                        ? "border-rose-200 bg-white myverse-dark:bg-white/5 hover:border-rose-300"
                        : "border-neutral-200 myverse-dark:border-white/10 bg-white myverse-dark:bg-white/5 hover:border-[#6366F1] hover:bg-[#6366F1]/5"
            }`}
        >
            {recording && (
                <span className="absolute -mt-3 -ml-7 h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
            {busy
                ? <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />
                : <Icon className={`h-4 w-4 ${recording ? "text-rose-600 fill-rose-600" : "text-neutral-500 group-hover:text-[#6366F1]"}`} />}
            <span className={`text-[11px] font-medium ${recording ? "text-rose-600 tabular-nums" : "text-neutral-700 myverse-dark:text-neutral-300"}`}>
                {recording ? `${mm}:${ss}` : "녹음"}
            </span>
        </button>
    );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: typeof Brush; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-neutral-200 myverse-dark:border-white/10 bg-white myverse-dark:bg-white/5 text-[11px] text-neutral-600 myverse-dark:text-neutral-400 hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
        >
            <Icon className="h-3 w-3" />
            {label}
        </Link>
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
    const isAudio = t.source === "moment" && t.media_type === "audio";

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
            {isAudio && t.media_url && (
                <div className="px-3 pt-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#6366F1]/5 border border-[#6366F1]/20">
                        <Mic className="h-3.5 w-3.5 text-[#6366F1] flex-shrink-0" />
                        <audio src={t.media_url} controls className="w-full h-8" />
                    </div>
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
