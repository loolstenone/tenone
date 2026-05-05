"use client";

import { useState } from "react";
import { Loader2, Sparkles, FolderOpen, Plus, X, Check } from "lucide-react";
import type { AiTone } from "@/lib/myverse/types";
import { GroupMarker } from "@/features/myverse/planner/SettingsLayout";

const METRIC_LABELS: Record<string, string> = {
    energy: "에너지", satisfaction: "만족도", mood: "기분",
    study: "공부", faith: "신앙", exercise: "운동", health: "건강",
};

interface Project {
    id: string;
    title: string;
    status?: string;
}

interface Props {
    initialTone: AiTone;
    initialContextScope: string[];
    initialTrackingMetrics: string[];
    initialNoteShortcuts: string[];
    initialCountryPref: string[];
    initialProjectLinks: Record<string, string | null>;
    save: (patch: Record<string, unknown>) => Promise<void>;
    showToast: (text: string, ok?: boolean) => void;
}

export function SettingsAi({
    initialTone,
    initialContextScope,
    initialTrackingMetrics,
    initialNoteShortcuts,
    initialCountryPref,
    initialProjectLinks,
    save,
    showToast,
}: Props) {
    const [tone, setTone] = useState<AiTone>(initialTone);
    const [contextScope, setContextScope] = useState<string[]>(initialContextScope);
    const [trackingMetrics, setTrackingMetrics] = useState<string[]>(initialTrackingMetrics);
    const [noteShortcuts, setNoteShortcuts] = useState<string[]>(initialNoteShortcuts);
    const [countryPref, setCountryPref] = useState<string[]>(initialCountryPref);
    const [sampleLoading, setSampleLoading] = useState(false);
    const [sampleText, setSampleText] = useState<string | null>(null);
    const [projectLinks, setProjectLinks] = useState<Record<string, string | null>>(initialProjectLinks);
    const [projectPickerMetric, setProjectPickerMetric] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState("");
    const [creatingProject, setCreatingProject] = useState(false);

    async function generateSample() {
        setSampleLoading(true);
        setSampleText(null);
        try {
            const res = await fetch("/api/myverse/briefing/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "morning" }),
            });
            if (res.ok) {
                const d = await res.json();
                setSampleText(d.content || d.briefing?.content || "샘플 생성 완료 (내용 없음)");
            } else {
                setSampleText("샘플 생성에 실패했습니다. API 키 설정을 확인해 주세요.");
            }
        } finally { setSampleLoading(false); }
    }

    async function openProjectPicker(metricKey: string) {
        setProjectPickerMetric(metricKey);
        setProjectsLoading(true);
        try {
            const res = await fetch("/api/myverse/projects");
            if (res.ok) {
                const d = await res.json();
                setProjects((d.projects || []).filter((p: Project) => p.status !== "completed"));
            }
        } finally { setProjectsLoading(false); }
    }

    function linkProject(metricKey: string, projectId: string | null) {
        const next = { ...projectLinks, [metricKey]: projectId };
        setProjectLinks(next);
        if (typeof window !== "undefined") localStorage.setItem("myverse_tracking_projects", JSON.stringify(next));
        setProjectPickerMetric(null);
        setNewProjectTitle("");
    }

    async function createAndLinkProject(metricKey: string) {
        if (!newProjectTitle.trim()) return;
        setCreatingProject(true);
        try {
            const res = await fetch("/api/myverse/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newProjectTitle.trim(),
                    description: `${METRIC_LABELS[metricKey] ?? metricKey} 트래킹 프로젝트`,
                }),
            });
            if (res.ok) {
                const d = await res.json();
                const proj = d.project ?? d;
                linkProject(metricKey, proj.id);
                showToast(`"${proj.title}" 프로젝트 연결 완료`);
            } else {
                showToast("프로젝트 생성 실패", false);
            }
        } finally { setCreatingProject(false); }
    }

    return (
        <>
            <GroupMarker group="behavior" no="03" label="기능" />

            {/* AI 비서 */}
            <section id="sec-ai" className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-4">AI 비서</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-neutral-500 mb-2">AI 톤</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(["professional", "friendly", "brief"] as AiTone[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setTone(t); save({ ai_tone: t }); }}
                                    className={`py-2 text-sm rounded-lg transition-colors ${
                                        tone === t
                                            ? "bg-[#6366F1] text-white"
                                            : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                                    }`}
                                >
                                    {t === "professional" ? "전문적" : t === "friendly" ? "친근함" : "간결함"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-100">
                        <label className="block text-xs text-neutral-500 mb-1">컨텍스트 범위</label>
                        <p className="text-[10px] text-neutral-400 mb-3">브리핑 생성 시 참조할 정보를 선택하세요</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: "identity", label: "퍼스널" },
                                { key: "weekly",   label: "이번 주" },
                                { key: "monthly",  label: "이번 달" },
                                { key: "projects", label: "프로젝트" },
                                { key: "daily",    label: "오늘 할 일" },
                            ].map(({ key, label }) => {
                                const on = contextScope.includes(key);
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            const next = on
                                                ? contextScope.filter(s => s !== key)
                                                : [...contextScope, key];
                                            setContextScope(next);
                                            save({ ai_context_scope: next });
                                        }}
                                        className={`px-3 py-1.5 text-xs rounded-full transition-colors border ${
                                            on
                                                ? "border-[#6366F1] bg-[#6366F1]/5 text-[#6366F1]"
                                                : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-100">
                        <button
                            onClick={generateSample}
                            disabled={sampleLoading}
                            className="flex items-center gap-1.5 text-xs text-[#6366F1] hover:underline disabled:opacity-50"
                        >
                            {sampleLoading
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Sparkles className="h-3 w-3" />}
                            브리핑 샘플 미리보기
                        </button>
                        {sampleText && (
                            <div className="mt-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                {sampleText}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 일간 기록 */}
            <section id="tracking" className="bg-white border border-neutral-200 rounded-xl p-6 scroll-mt-16">
                <h2 className="text-sm font-semibold text-neutral-900 mb-1">일간 기록</h2>
                <p className="text-xs text-neutral-500 mb-4">
                    Daily 페이지에 노출할 기록 단축키와 자기 점검 항목을 선택하세요.
                </p>

                {/* 기록 단축키 */}
                <p className="text-xs font-medium text-neutral-700 mb-2">기록 단축키</p>
                <div className="space-y-2 mb-6">
                    {[
                        { key: "gratitude", label: "감사 3가지", hint: "오늘 감사한 것 3가지를 기록하는 단축 버튼" },
                        { key: "emotion",   label: "감정 일기",  hint: "오늘의 감정·이유·내일 다짐을 기록하는 단축 버튼" },
                    ].map((s) => {
                        const checked = noteShortcuts.includes(s.key);
                        return (
                            <div
                                key={s.key}
                                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                                    checked ? "border-neutral-200 hover:border-neutral-300" : "border-neutral-100 bg-neutral-50"
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${checked ? "text-neutral-900" : "text-neutral-400"}`}>{s.label}</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">{s.hint}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = checked
                                            ? noteShortcuts.filter(k => k !== s.key)
                                            : [...noteShortcuts, s.key];
                                        setNoteShortcuts(next);
                                        save({ daily_note_shortcuts: next });
                                    }}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                        checked ? "bg-[#6366F1] border-[#6366F1]" : "border-neutral-300 bg-white"
                                    }`}
                                >
                                    {checked && <Check className="h-3 w-3 text-white" />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* 자기 점검 */}
                <p className="text-xs font-medium text-neutral-700 mb-2">자기 점검</p>
                <div className="space-y-2">
                    {[
                        { key: "energy",       label: "에너지",   hint: "컨디션·체력 1~5" },
                        { key: "satisfaction", label: "만족도",   hint: "오늘 하루 만족 1~5" },
                        { key: "mood",         label: "기분",     hint: "감정 상태 1~5" },
                        { key: "study",        label: "공부",     hint: "학습 집중도 1~5 + 메모" },
                        { key: "faith",        label: "신앙",     hint: "영적 충만도 1~5 + 메모" },
                        { key: "exercise",     label: "운동",     hint: "종류·시간(분)·거리(km)" },
                        { key: "health",       label: "건강",     hint: "혈압·혈당·체중·체온" },
                    ].map((m) => {
                        const checked = trackingMetrics.includes(m.key);
                        const linkedProjectId = projectLinks[m.key];
                        const linkedProject = projects.find(p => p.id === linkedProjectId);
                        return (
                            <div
                                key={m.key}
                                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                                    checked ? "border-neutral-200 hover:border-neutral-300" : "border-neutral-100 bg-neutral-50"
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${checked ? "text-neutral-900" : "text-neutral-400"}`}>{m.label}</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">{m.hint}</p>
                                    {checked && linkedProjectId && (
                                        <button
                                            onClick={() => linkProject(m.key, null)}
                                            className="mt-1 flex items-center gap-1 text-[10px] text-[#6366F1] hover:text-red-500 transition-colors"
                                            title="프로젝트 연결 해제"
                                        >
                                            <FolderOpen className="h-2.5 w-2.5" />
                                            {linkedProject ? linkedProject.title : "연결됨"} ×
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {checked && (
                                        <button
                                            onClick={() => openProjectPicker(m.key)}
                                            title="프로젝트와 연결"
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                                                linkedProjectId
                                                    ? "bg-[#6366F1]/10 text-[#6366F1] hover:bg-[#6366F1]/20"
                                                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                                            }`}
                                        >
                                            <FolderOpen className="h-3 w-3" />
                                            프로젝트화
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const next = checked
                                                ? trackingMetrics.filter(k => k !== m.key)
                                                : [...trackingMetrics, m.key];
                                            setTrackingMetrics(next);
                                            save({ daily_tracking_metrics: next });
                                        }}
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                            checked ? "bg-[#6366F1] border-[#6366F1]" : "border-neutral-300 bg-white"
                                        }`}
                                    >
                                        {checked && <Check className="h-3 w-3 text-white" />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 공휴일·절기 국가 */}
            <section className="bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-neutral-900 mb-1">공휴일·절기 국가</h2>
                <p className="text-xs text-neutral-500 mb-4">
                    선택한 국가의 법정공휴일·절기가 일/주/월/연 캘린더에 자동 반영됩니다.
                </p>
                <div className="space-y-2">
                    {[
                        { code: "KR", label: "🇰🇷 한국", hint: "법정공휴일 + 24절기" },
                        { code: "US", label: "🇺🇸 미국", hint: "Federal Holidays" },
                        { code: "JP", label: "🇯🇵 일본", hint: "国民の祝日" },
                        { code: "CN", label: "🇨🇳 중국", hint: "法定节假日" },
                    ].map((c) => {
                        const checked = countryPref.includes(c.code);
                        return (
                            <div
                                key={c.code}
                                onClick={() => {
                                    const next = checked
                                        ? countryPref.filter((k) => k !== c.code)
                                        : [...countryPref, c.code];
                                    const final = next.length === 0 ? ["KR"] : next;
                                    setCountryPref(final);
                                    save({ country_pref: final });
                                }}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 cursor-pointer"
                            >
                                <div>
                                    <p className="text-sm text-neutral-900">{c.label}</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">{c.hint}</p>
                                </div>
                                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                                    checked ? "bg-[#6366F1] border-[#6366F1]" : "border-neutral-300 bg-white"
                                }`}>
                                    {checked && <Check className="h-3 w-3 text-white" />}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 프로젝트화 모달 */}
            {projectPickerMetric && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-5 max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-neutral-900">
                                {METRIC_LABELS[projectPickerMetric] ?? projectPickerMetric} 프로젝트화
                            </h3>
                            <button
                                onClick={() => { setProjectPickerMetric(null); setNewProjectTitle(""); }}
                                className="p-1 rounded hover:bg-neutral-100"
                            >
                                <X className="h-4 w-4 text-neutral-400" />
                            </button>
                        </div>
                        <p className="text-xs text-neutral-500 mb-4">
                            이 트래킹 항목을 연결할 프로젝트를 선택하거나 새로 만드세요.
                            Daily 트래킹 데이터가 해당 프로젝트 컨텍스트로 관리됩니다.
                        </p>

                        {/* 새 프로젝트 만들기 */}
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") createAndLinkProject(projectPickerMetric); }}
                                placeholder="새 프로젝트 이름 입력"
                                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6366F1]"
                                autoFocus
                            />
                            <button
                                onClick={() => createAndLinkProject(projectPickerMetric)}
                                disabled={creatingProject || !newProjectTitle.trim()}
                                className="flex items-center gap-1 px-3 py-2 bg-[#6366F1] text-white text-sm rounded-lg hover:bg-[#4F46E5] disabled:opacity-50 shrink-0"
                            >
                                {creatingProject ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                만들기
                            </button>
                        </div>

                        {/* 기존 프로젝트 목록 */}
                        <div className="overflow-y-auto flex-1">
                            {projectsLoading ? (
                                <div className="flex items-center justify-center py-6 text-neutral-400 text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> 불러오는 중…
                                </div>
                            ) : projects.length === 0 ? (
                                <p className="text-xs text-neutral-400 text-center py-4">
                                    진행 중인 프로젝트가 없습니다.<br />위에서 새로 만드세요.
                                </p>
                            ) : (
                                <div className="space-y-1.5">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2">기존 프로젝트 선택</p>
                                    {projects.map((p) => {
                                        const isLinked = projectLinks[projectPickerMetric] === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => linkProject(projectPickerMetric, p.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors border ${
                                                    isLinked
                                                        ? "border-[#6366F1] bg-[#6366F1]/5 text-[#6366F1] font-medium"
                                                        : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                                                }`}
                                            >
                                                <FolderOpen className="h-4 w-4 shrink-0 text-neutral-400" />
                                                <span className="flex-1 truncate">{p.title}</span>
                                                {isLinked && <Check className="h-3.5 w-3.5 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
