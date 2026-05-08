"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    LayoutTemplate, Search, Loader2, X, FileText, Calendar, BookOpen,
    ChevronRight, Heart, Copy, Check, TrendingUp, UserCircle2,
} from "lucide-react";
import type { MyverseRole } from "@/lib/myverse/types";
import { MYVERSE_ROLE_META } from "@/lib/myverse/types";
import { isSpecialTemplate as isSpecial, exportFrameworkText as exportFwText, tplDataKey } from "@/lib/myverse/templates";
import {
    type FrameworkData as SharedFrameworkData,
} from "./template-grids/_shared";
import {
    SwotGrid, FourPGrid, AnsoffGrid, BcgGrid, NineBoxGrid,
    EisenhowerGrid, PestGrid, MoscowGrid, QuadrantBlankGrid, KanoGrid,
} from "./template-grids/quadrants";
import { LeanCanvasGrid, BmcGrid, VpcGrid, OkrGrid } from "./template-grids/canvas";
import { EmpathyMapGrid, MandalartGrid, PersonaGrid, JtbdGrid, RiceGrid, FiveW1HGrid, FiveWhyGrid, IkigaiGrid, Porter5Grid, ScamperGrid, ParetoGrid, FishboneGrid, JourneyMapGrid } from "./template-grids/empathy";
import { KptGrid, OodaGrid, CornellGrid, DecisionMatrixGrid, FeynmanGrid } from "./template-grids/thinking";
import { OneOnOneGrid, MeetingGrid, InterviewGrid, AarGrid } from "./template-grids/meeting";
import { BrainstormGrid, DecisionLogGrid, EmotionLogGrid, GratitudeGrid, ReadingGrid, StandupGrid, WeeklyJournalGrid, ZettelkastenGrid, MindmapGrid } from "./template-grids/journal";
import { TimeBlockGrid, DailyDesignGrid, DeepWorkGrid, PomodoroGrid, HabitTrackerGrid, EnergyMapGrid, WeeklyReviewGrid, WeeklyWinGrid, MonthlyThemeGrid, QuarterlyGrid, YearPlanGrid, FiveYearGrid, MovingAverageGrid, ReversePlanGrid, SprintGrid } from "./template-grids/planning";

interface Template {
    id: string;
    key: string;
    category: string;
    subcategory: string | null;
    label: string;
    description: string | null;
    body_md: string;
    role_tags?: string[];
}

export type FrameworkData = SharedFrameworkData;

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; bar: string }> = {
    framework: {
        label: "프레임워크",
        icon: <BookOpen className="h-3 w-3" />,
        color: "text-slate-800",
        bg: "bg-slate-50 border-slate-200",
        bar: "bg-slate-700",
    },
    schedule: {
        label: "일정",
        icon: <Calendar className="h-3 w-3" />,
        color: "text-slate-900",
        bg: "bg-slate-50 border-slate-300",
        bar: "bg-slate-900",
    },
    note: {
        label: "노트",
        icon: <FileText className="h-3 w-3" />,
        color: "text-stone-800",
        bg: "bg-stone-50 border-stone-200",
        bar: "bg-stone-700",
    },
};


// ── 특수 프레임워크 렌더러 ────────────────────────────────────────────

function getFrameworkBilingualName(tpl: Template): string | null {
    const k = tpl.key.toLowerCase();
    const l = tpl.label.toLowerCase();
    if (k.includes("empathy") || l.includes("공감")) return "Empathy Map";
    if (k.includes("lean") || l.includes("린 캔버스")) return "Lean Canvas";
    if (k.includes("mandalart") || l.includes("만다라")) return "Mandalart";
    if (k.includes("eisenhower") || l.includes("아이젠하워")) return "Eisenhower Matrix";
    if (k.includes("pest")) return "PEST Analysis";
    if (k.includes("moscow")) return "MoSCoW Prioritization";
    if (k === "quadrant") return "Quadrant Matrix";
    if (k.includes("business_canvas") || l.includes("비즈니스 모델 캔버스")) return "Business Model Canvas";
    if (k === "vpc" || l.includes("value proposition")) return "Value Proposition Canvas";
    if (k === "okr") return "Objectives & Key Results";
    if (k.includes("persona") || l.includes("페르소나")) return "User Persona";
    if (k.includes("jobs_to_be_done") || k.includes("jtbd") || l.includes("jobs-to-be-done")) return "Jobs-to-be-Done";
    if (k === "rice") return "RICE Prioritization";
    if (k === "5w1h") return "5W1H";
    if (k === "5why") return "5 Whys";
    if (k.includes("ikigai")) return "Ikigai";
    if (k.includes("porter")) return "Porter's Five Forces";
    if (k.includes("scamper")) return "SCAMPER";
    if (k === "kano") return "Kano Model";
    if (k.includes("pareto") || l.includes("80/20")) return "Pareto Principle (80/20)";
    if (k.includes("fishbone") || l.includes("피쉬본")) return "Fishbone (Ishikawa)";
    if (k.includes("journey") || l.includes("여정 지도")) return "Customer Journey Map";
    if (k.includes("retrospective") || l.includes("kpt")) return "KPT Retrospective";
    if (k === "ooda") return "OODA Loop";
    if (k.includes("cornell") || l.includes("코넬")) return "Cornell Notes";
    if (k.includes("decision_matrix") || l.includes("의사결정 매트릭스")) return "Decision Matrix";
    if (k.includes("feynman") || l.includes("파인만")) return "Feynman Technique";
    if (k === "1on1") return "1:1 Meeting Log";
    if (k === "meeting") return "Meeting Minutes";
    if (k === "interview") return "User Interview";
    if (k === "after_action") return "After Action Review";
    if (k === "brainstorm") return "Brainstorming";
    if (k === "decision_log") return "Decision Log";
    if (k === "emotion_log") return "Emotion Log";
    if (k === "gratitude") return "Gratitude Journal";
    if (k === "reading") return "Reading Notes";
    if (k === "standup") return "Daily Standup";
    if (k === "weekly_journal") return "Weekly Journal";
    if (k === "zettelkasten") return "Zettelkasten";
    if (k === "mindmap_outline") return "Mind Map Outline";
    if (k === "time_block") return "Time Blocking";
    if (k === "daily_design") return "Daily Design";
    if (k === "deep_work") return "Deep Work Sessions";
    if (k === "pomodoro") return "Pomodoro Tracker";
    if (k === "habit_tracker") return "Habit Tracker";
    if (k === "energy_map") return "Energy Map";
    if (k === "weekly_review") return "Weekly Review";
    if (k === "weekly_win") return "Weekly Wins";
    if (k === "monthly_theme") return "Monthly Theme";
    if (k === "quarterly") return "Quarterly Plan";
    if (k === "year_plan") return "Year Plan (12-Month Map)";
    if (k === "five_year") return "5-Year Vision";
    if (k === "moving_average") return "90-Day Experiment";
    if (k === "reverse_plan") return "Reverse Planning";
    if (k === "sprint") return "Sprint (2-Week)";
    if (k.includes("bcg") || l.includes("bcg")) return "BCG Matrix";
    if (k.includes("ansoff") || l.includes("ansoff")) return "Ansoff Matrix";
    if (k.includes("swot") || l.includes("swot")) return "SWOT Analysis";
    if ((k.includes("4p") || l.includes("4p")) && !k.includes("4ps")) return "4P Marketing Mix";
    if (k.includes("9box") || k.includes("nine_box") || l.includes("9-box") || l.includes("9box")) return "9-Box Grid";
    return null;
}

function renderSpecial(
    tpl: Template,
    data: FrameworkData,
    onChange: (key: string, val: string) => void,
): React.ReactNode | null {
    const k = tpl.key.toLowerCase();
    const l = tpl.label.toLowerCase();
    if (k.includes("bcg") || l.includes("bcg")) return <BcgGrid data={data} onChange={onChange} />;
    if (k.includes("swot") || l.includes("swot")) return <SwotGrid data={data} onChange={onChange} />;
    if ((k.includes("4p") || l.includes("4p")) && !k.includes("4ps")) return <FourPGrid data={data} onChange={onChange} />;
    if (k.includes("ansoff") || l.includes("ansoff")) return <AnsoffGrid data={data} onChange={onChange} />;
    if (k.includes("9box") || k.includes("nine_box") || l.includes("9-box") || l.includes("9box")) return <NineBoxGrid data={data} onChange={onChange} />;
    if (k.includes("empathy") || l.includes("공감")) return <EmpathyMapGrid data={data} onChange={onChange} />;
    if (k.includes("lean") || l.includes("린 캔버스")) return <LeanCanvasGrid data={data} onChange={onChange} />;
    if (k.includes("mandalart") || l.includes("만다라")) return <MandalartGrid data={data} onChange={onChange} />;
    if (k.includes("eisenhower") || l.includes("아이젠하워")) return <EisenhowerGrid data={data} onChange={onChange} />;
    if (k.includes("pest") || l.includes("pest 분석")) return <PestGrid data={data} onChange={onChange} />;
    if (k.includes("moscow") || l.includes("moscow")) return <MoscowGrid data={data} onChange={onChange} />;
    if (k === "quadrant" || l.includes("4분면 매트릭스")) return <QuadrantBlankGrid data={data} onChange={onChange} />;
    if (k.includes("business_canvas") || l.includes("비즈니스 모델 캔버스")) return <BmcGrid data={data} onChange={onChange} />;
    if (k === "vpc" || l.includes("value proposition canvas")) return <VpcGrid data={data} onChange={onChange} />;
    if (k === "okr" || l === "okr") return <OkrGrid data={data} onChange={onChange} />;
    if (k.includes("persona") || l.includes("페르소나")) return <PersonaGrid data={data} onChange={onChange} />;
    if (k.includes("jobs_to_be_done") || k.includes("jtbd") || l.includes("jobs-to-be-done")) return <JtbdGrid data={data} onChange={onChange} />;
    if (k === "rice") return <RiceGrid data={data} onChange={onChange} />;
    if (k === "5w1h") return <FiveW1HGrid data={data} onChange={onChange} />;
    if (k === "5why") return <FiveWhyGrid data={data} onChange={onChange} />;
    if (k.includes("ikigai") || l.includes("이키가이")) return <IkigaiGrid data={data} onChange={onChange} />;
    if (k.includes("porter")) return <Porter5Grid data={data} onChange={onChange} />;
    if (k.includes("scamper")) return <ScamperGrid data={data} onChange={onChange} />;
    if (k === "kano") return <KanoGrid data={data} onChange={onChange} />;
    if (k.includes("pareto") || l.includes("파레토") || l.includes("80/20")) return <ParetoGrid data={data} onChange={onChange} />;
    if (k.includes("fishbone") || l.includes("피쉬본")) return <FishboneGrid data={data} onChange={onChange} />;
    if (k.includes("journey") || l.includes("여정 지도")) return <JourneyMapGrid data={data} onChange={onChange} />;
    if (k.includes("retrospective") || l.includes("kpt")) return <KptGrid data={data} onChange={onChange} />;
    if (k === "ooda") return <OodaGrid data={data} onChange={onChange} />;
    if (k.includes("cornell") || l.includes("코넬")) return <CornellGrid data={data} onChange={onChange} />;
    if (k.includes("decision_matrix") || l.includes("의사결정 매트릭스")) return <DecisionMatrixGrid data={data} onChange={onChange} />;
    if (k.includes("feynman") || l.includes("파인만")) return <FeynmanGrid data={data} onChange={onChange} />;
    if (k === "1on1") return <OneOnOneGrid data={data} onChange={onChange} />;
    if (k === "meeting") return <MeetingGrid data={data} onChange={onChange} />;
    if (k === "interview") return <InterviewGrid data={data} onChange={onChange} />;
    if (k === "after_action") return <AarGrid data={data} onChange={onChange} />;
    if (k === "brainstorm") return <BrainstormGrid data={data} onChange={onChange} />;
    if (k === "decision_log") return <DecisionLogGrid data={data} onChange={onChange} />;
    if (k === "emotion_log") return <EmotionLogGrid data={data} onChange={onChange} />;
    if (k === "gratitude") return <GratitudeGrid data={data} onChange={onChange} />;
    if (k === "reading") return <ReadingGrid data={data} onChange={onChange} />;
    if (k === "standup") return <StandupGrid data={data} onChange={onChange} />;
    if (k === "weekly_journal") return <WeeklyJournalGrid data={data} onChange={onChange} />;
    if (k === "zettelkasten") return <ZettelkastenGrid data={data} onChange={onChange} />;
    if (k === "mindmap_outline") return <MindmapGrid data={data} onChange={onChange} />;
    if (k === "time_block") return <TimeBlockGrid data={data} onChange={onChange} />;
    if (k === "daily_design") return <DailyDesignGrid data={data} onChange={onChange} />;
    if (k === "deep_work") return <DeepWorkGrid data={data} onChange={onChange} />;
    if (k === "pomodoro") return <PomodoroGrid data={data} onChange={onChange} />;
    if (k === "habit_tracker") return <HabitTrackerGrid data={data} onChange={onChange} />;
    if (k === "energy_map") return <EnergyMapGrid data={data} onChange={onChange} />;
    if (k === "weekly_review") return <WeeklyReviewGrid data={data} onChange={onChange} />;
    if (k === "weekly_win") return <WeeklyWinGrid data={data} onChange={onChange} />;
    if (k === "monthly_theme") return <MonthlyThemeGrid data={data} onChange={onChange} />;
    if (k === "quarterly") return <QuarterlyGrid data={data} onChange={onChange} />;
    if (k === "year_plan") return <YearPlanGrid data={data} onChange={onChange} />;
    if (k === "five_year") return <FiveYearGrid data={data} onChange={onChange} />;
    if (k === "moving_average") return <MovingAverageGrid data={data} onChange={onChange} />;
    if (k === "reverse_plan") return <ReversePlanGrid data={data} onChange={onChange} />;
    if (k === "sprint") return <SprintGrid data={data} onChange={onChange} />;
    return null;
}

export function renderFramework(
    key: string,
    label: string,
    data: FrameworkData,
    onChange: (k: string, v: string) => void,
): React.ReactNode | null {
    return renderSpecial(
        { key, label, id: '', category: '', subcategory: null, description: null, body_md: '' },
        data,
        onChange,
    );
}

const isSpecialTemplate = isSpecial;

// ── 마크다운 렌더러 ──────────────────────────────────────────────────
function renderMd(md: string): React.ReactNode {
    const lines = md.split("\n");
    const nodes: React.ReactNode[] = [];
    let i = 0;

    function inlineRender(text: string): React.ReactNode {
        const parts: React.ReactNode[] = [];
        let rest = text;
        let key = 0;
        while (rest.length > 0) {
            const boldMatch = rest.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
            const italicMatch = rest.match(/^(.*?)_(.+?)_(.*)/s);
            if (boldMatch && (!italicMatch || boldMatch[1].length <= italicMatch[1].length)) {
                if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
                parts.push(<strong key={key++} className="font-semibold text-neutral-900">{boldMatch[2]}</strong>);
                rest = boldMatch[3];
            } else if (italicMatch) {
                if (italicMatch[1]) parts.push(<span key={key++}>{italicMatch[1]}</span>);
                parts.push(<em key={key++} className="italic text-neutral-700">{italicMatch[2]}</em>);
                rest = italicMatch[3];
            } else {
                parts.push(<span key={key++}>{rest}</span>);
                rest = "";
            }
        }
        return parts.length === 1 ? parts[0] : <>{parts}</>;
    }

    while (i < lines.length) {
        const line = lines[i];
        if (line.startsWith("### ")) {
            nodes.push(<h3 key={i} className="text-xs font-semibold text-neutral-700 mt-4 mb-1 uppercase tracking-wider">{line.slice(4)}</h3>);
            i++; continue;
        }
        if (line.startsWith("## ")) {
            nodes.push(<h2 key={i} className="text-sm font-semibold text-neutral-800 mt-5 mb-2 border-b border-neutral-100 pb-1">{line.slice(3)}</h2>);
            i++; continue;
        }
        if (line.startsWith("# ")) {
            nodes.push(<h1 key={i} className="font-serif text-base text-neutral-900 mt-5 mb-2">{line.slice(2)}</h1>);
            i++; continue;
        }
        if (line.match(/^[-*]{3,}$/)) {
            nodes.push(<hr key={i} className="border-neutral-200 my-3" />);
            i++; continue;
        }
        if (line.startsWith("|")) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
            const rows = tableLines.filter(l => !l.match(/^\|[-| :]+\|$/));
            nodes.push(
                <div key={i} className="overflow-x-auto my-3">
                    <table className="w-full text-xs border-collapse">
                        <tbody>
                            {rows.map((r, ri) => {
                                const cells = r.split("|").slice(1, -1).map(c => c.trim());
                                return (
                                    <tr key={ri} className={ri === 0 ? "bg-neutral-50" : "border-t border-neutral-100"}>
                                        {cells.map((c, ci) => (
                                            ri === 0
                                                ? <th key={ci} className="text-left px-2 py-1 font-medium text-neutral-600">{c}</th>
                                                : <td key={ci} className="px-2 py-1 text-neutral-700">{inlineRender(c)}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
            continue;
        }
        if (line.match(/^- \[[ x]\] /)) {
            const items: React.ReactNode[] = [];
            while (i < lines.length && lines[i].match(/^- \[[ x]\] /)) {
                const checked = lines[i][3] === "x";
                const text = lines[i].slice(6);
                items.push(
                    <li key={i} className="flex items-start gap-2 py-0.5">
                        <span className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded border-2 flex items-center justify-center text-[9px] font-bold ${checked ? "bg-[#6366F1] border-[#6366F1] text-white" : "border-neutral-300"}`}>
                            {checked && ""}
                        </span>
                        <span className={`text-xs leading-snug ${checked ? "line-through text-neutral-400" : "text-neutral-700"}`}>{inlineRender(text)}</span>
                    </li>
                );
                i++;
            }
            nodes.push(<ul key={`chk-${i}`} className="space-y-0.5 my-2">{items}</ul>);
            continue;
        }
        if (line.match(/^[-*] /) || line.match(/^\d+\. /)) {
            const items: React.ReactNode[] = [];
            const isOrdered = line.match(/^\d+\. /);
            while (i < lines.length && (lines[i].match(/^[-*] /) || lines[i].match(/^\d+\. /))) {
                const text = lines[i].replace(/^[-*] /, "").replace(/^\d+\. /, "");
                items.push(<li key={i} className="text-xs text-neutral-700 leading-snug py-0.5 pl-1">{inlineRender(text)}</li>);
                i++;
            }
            const cls = "my-2 space-y-0.5 " + (isOrdered ? "list-decimal list-inside" : "list-disc list-inside");
            nodes.push(isOrdered ? <ol key={`ol-${i}`} className={cls}>{items}</ol> : <ul key={`ul-${i}`} className={cls}>{items}</ul>);
            continue;
        }
        if (line.startsWith("    ") || line.startsWith("\t")) {
            nodes.push(
                <div key={i} className="ml-4 pl-3 border-l-2 border-neutral-200 py-0.5">
                    <span className="text-xs text-neutral-400">{inlineRender(line.trim())}</span>
                </div>
            );
            i++; continue;
        }
        if (line.trim() === "") {
            nodes.push(<div key={i} className="h-2" />);
            i++; continue;
        }
        nodes.push(<p key={i} className="text-xs text-neutral-700 leading-relaxed">{inlineRender(line)}</p>);
        i++;
    }
    return <>{nodes}</>;
}

// ── localStorage 키 ──────────────────────────────────────────────────
const FAV_KEY = "myverse_tpl_favorites";
const dataKey = tplDataKey;

// ── 추천 템플릿 (사용 빈도 기준 Top 10) ──────────────────────────────
const RECOMMENDED_KEYS = [
    "daily_design",   // 하루 설계 — 매일 사용
    "weekly_review",  // 주간 리뷰 — 매주 회고
    "meeting",        // 회의록 — 직장인 가장 빈번
    "cornell",        // 코넬 노트 — 독서·강의 표준
    "eisenhower",     // 아이젠하워 — 우선순위 결정
    "brainstorm",     // 브레인스토밍 — 아이디어 발산
    "retrospective",  // KPT 회고 — 팀·개인 성찰
    "habit_tracker",  // 습관 트래커 — 루틴 관리
    "okr",            // OKR — 목표·핵심결과
    "swot",           // SWOT — 자기·사업 분석
] as const;

// ── 메인 컴포넌트 ────────────────────────────────────────────────────
const VALID_CATS = ["all", "my_role", "framework", "schedule", "note", "recommended", "favorites"] as const;
type CatType = typeof VALID_CATS[number];

export function TemplatesView() {
    const searchParams = useSearchParams();
    const initialCat = (() => {
        const c = searchParams.get("category");
        return (VALID_CATS as readonly string[]).includes(c ?? "") ? (c as CatType) : "all";
    })();

    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [cat, setCat] = useState<CatType>(initialCat);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Template | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState(false);
    const [tplData, setTplData] = useState<FrameworkData>({});
    const [userRole, setUserRole] = useState<MyverseRole | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(FAV_KEY);
            if (raw) setFavorites(new Set(JSON.parse(raw)));
        } catch { /* noop */ }
    }, []);

    // 템플릿 선택 시 데이터 초기화 (Templates 페이지는 저장고 — 데이터 저장 없음)
    useEffect(() => {
        setTplData({});
    }, [selected?.id]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [tplRes, settingsRes] = await Promise.all([
                fetch(`/api/myverse/templates`),
                fetch(`/api/myverse/settings`),
            ]);
            if (tplRes.ok) {
                const d = await tplRes.json();
                setTemplates(d.templates || []);
            }
            if (settingsRes.ok) {
                const s = await settingsRes.json();
                if (s.user?.user_role) setUserRole(s.user.user_role as MyverseRole);
            }
            setLoading(false);
        })();
    }, []);

    function toggleFavorite(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            try { localStorage.setItem(FAV_KEY, JSON.stringify([...next])); } catch { /* noop */ }
            return next;
        });
    }

    const handleCellChange = useCallback((key: string, val: string) => {
        if (!selected) return;
        setTplData(prev => ({ ...prev, [key]: val }));
    }, [selected]);

    async function copyToClipboard() {
        if (!selected) return;
        const text = isSpecialTemplate(selected)
            ? exportFwText(selected, tplData)
            : selected.body_md;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* noop */ }
    }

    const isRoleMatch = useCallback((t: Template) =>
        userRole && t.role_tags && t.role_tags.length > 0
            ? t.role_tags.includes(userRole)
            : false
    , [userRole]);

    const filtered = useMemo(() => {
        let list = templates;
        if (cat === "favorites") list = list.filter(t => favorites.has(t.id));
        else if (cat === "recommended") list = list.filter(t => (RECOMMENDED_KEYS as readonly string[]).includes(t.key));
        else if (cat === "my_role") list = list.filter(t => isRoleMatch(t));
        else if (cat !== "all") list = list.filter(t => t.category === cat);
        // "all" 탭: 역할 매칭 템플릿 상단 정렬
        if (cat === "all" && userRole) {
            list = [...list].sort((a, b) => {
                const aMatch = isRoleMatch(a) ? 0 : 1;
                const bMatch = isRoleMatch(b) ? 0 : 1;
                return aMatch - bMatch;
            });
        }
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(t =>
                t.label.toLowerCase().includes(q) ||
                (t.description ?? "").toLowerCase().includes(q) ||
                (t.subcategory ?? "").toLowerCase().includes(q)
            );
        }
        return list;
    }, [templates, cat, query, favorites, isRoleMatch, userRole]);

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: templates.length, my_role: 0, framework: 0, schedule: 0, note: 0, recommended: 0, favorites: 0 };
        templates.forEach(t => {
            if (t.category === "framework") c.framework++;
            else if (t.category === "schedule") c.schedule++;
            else if (t.category === "note") c.note++;
            if ((RECOMMENDED_KEYS as readonly string[]).includes(t.key)) c.recommended++;
            if (favorites.has(t.id)) c.favorites++;
            if (isRoleMatch(t)) c.my_role++;
        });
        return c;
    }, [templates, favorites, isRoleMatch]);

    const grouped = useMemo(() => {
        const groups: Record<string, Template[]> = {};
        filtered.forEach(t => {
            const key = t.category;
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });
        return groups;
    }, [filtered]);

    const roleLabel = userRole ? MYVERSE_ROLE_META[userRole]?.label : null;
    const TABS = [
        { id: "all" as const, label: "전체" },
        { id: "my_role" as const, label: roleLabel ?? "내 역할" },
        { id: "framework" as const, label: "프레임워크" },
        { id: "schedule" as const, label: "스케줄" },
        { id: "note" as const, label: "노트" },
        { id: "recommended" as const, label: "추천" },
        { id: "favorites" as const, label: "즐겨찾기" },
    ];

    const hasData = Object.values(tplData).some(v => v.trim());

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            <div className="flex items-center gap-3 mb-2">
                <LayoutTemplate className="h-6 w-6 text-[#6366F1]" />
                <h1 className="font-serif text-3xl text-neutral-900">템플릿</h1>
            </div>
            <p className="text-sm text-neutral-500 mb-8">
                기획자의 사고 틀. 스케줄 · 노트 · 프레임워크. 일간·프로젝트 노트로 불러와 채울 수 있습니다.
            </p>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="이름·설명 검색"
                    className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#6366F1]"
                />
            </div>

            {/* 탭 필터 — IdentitySubNav 일관 패턴 (밑줄 + active teal) */}
            <nav className="flex items-center gap-1 border-b border-neutral-200 mb-6 overflow-x-auto pb-px">
                {TABS.map(tab => {
                    const isActive = cat === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setCat(tab.id)}
                            className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition-colors shrink-0 ${
                                isActive
                                    ? "text-[#6366F1] font-semibold"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {tab.label}
                            {counts[tab.id] > 0 && (
                                <span className="ml-1 opacity-60 text-xs">({counts[tab.id]})</span>
                            )}
                            {isActive && (
                                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#6366F1]" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {loading ? (
                <div className="py-16 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mx-auto" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 text-sm">
                    {cat === "favorites" ? (
                        <>
                            <Heart className="h-8 w-8 mx-auto mb-3 text-neutral-200" />
                            즐겨찾기한 템플릿이 없습니다.<br />
                            <span className="text-xs">카드의 하트를 눌러 저장하세요.</span>
                        </>
                    ) : cat === "my_role" && !userRole ? (
                        <>
                            <UserCircle2 className="h-8 w-8 mx-auto mb-3 text-neutral-200" />
                            <p className="text-sm text-neutral-500 mb-1">역할을 설정하지 않았습니다.</p>
                            <p className="text-xs text-neutral-400 mb-4">설정에서 나의 역할을 선택하면 맞춤 템플릿을 추천해드립니다.</p>
                            <a
                                href="/myverse/app/settings"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition-colors"
                            >
                                <UserCircle2 className="h-3.5 w-3.5" />
                                역할 설정하기
                            </a>
                        </>
                    ) : cat === "my_role" ? (
                        <>
                            <UserCircle2 className="h-8 w-8 mx-auto mb-3 text-neutral-200" />
                            <p className="text-sm text-neutral-500 mb-1">
                                {MYVERSE_ROLE_META[userRole!]?.label} 맞춤 템플릿을 준비 중입니다.
                            </p>
                            <p className="text-xs text-neutral-400">전체 탭에서 다른 템플릿을 살펴보세요.</p>
                        </>
                    ) : query ? (
                        `"${query}"에 대한 템플릿이 없습니다.`
                    ) : (
                        "등록된 템플릿이 없습니다."
                    )}
                </div>
            ) : cat === "all" ? (
                <div className="space-y-8">
                    {["framework", "schedule", "note"].map(catKey => {
                        const items = grouped[catKey];
                        if (!items?.length) return null;
                        const meta = CATEGORY_META[catKey];
                        return (
                            <div key={catKey}>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <h3 className="text-xs uppercase tracking-widest text-neutral-400">{meta.label}</h3>
                                    <span className="text-[10px] text-neutral-300">{items.length}</span>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {items.map(tpl => (
                                        <TemplateCard
                                            key={tpl.id}
                                            tpl={tpl}
                                            isFavorite={favorites.has(tpl.id)}
                                            onToggleFavorite={(e) => toggleFavorite(tpl.id, e)}
                                            onClick={() => setSelected(tpl)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <>
                    {cat === "my_role" && userRole && (
                        <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-teal-50 border border-teal-100">
                            <UserCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-teal-800">
                                    {MYVERSE_ROLE_META[userRole].label} 맞춤 템플릿
                                </p>
                                <p className="text-xs text-teal-600 mt-0.5">
                                    {MYVERSE_ROLE_META[userRole].desc} — {filtered.length}개 추천
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filtered.map(tpl => (
                            <TemplateCard
                                key={tpl.id}
                                tpl={tpl}
                                isFavorite={favorites.has(tpl.id)}
                                onToggleFavorite={(e) => toggleFavorite(tpl.id, e)}
                                onClick={() => setSelected(tpl)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* 모달 */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="px-6 py-4 border-b border-neutral-200 flex items-start justify-between gap-4 shrink-0">
                            <div className="min-w-0">
                                {(() => {
                                    const meta = CATEGORY_META[selected.category];
                                    return (
                                        <div className={`flex items-center gap-1.5 mb-2 w-fit px-2 py-1 rounded border text-[10px] font-medium ${meta?.bg} ${meta?.color}`}>
                                            {meta?.icon}
                                            {meta?.label || selected.category}
                                            {selected.subcategory && (
                                                <><ChevronRight className="h-2.5 w-2.5 opacity-50" /><span className="opacity-70">{selected.subcategory}</span></>
                                            )}
                                        </div>
                                    );
                                })()}
                                <h3 className="font-serif text-xl text-neutral-900 leading-tight">{selected.label}</h3>
                                {(() => {
                                    const en = getFrameworkBilingualName(selected);
                                    return en && en !== selected.label
                                        ? <p className="text-xs text-neutral-400 font-medium mt-0.5">{en}</p>
                                        : null;
                                })()}
                                {selected.description && (
                                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{selected.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={(e) => toggleFavorite(selected.id, e)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                        favorites.has(selected.id)
                                            ? "text-slate-700 bg-slate-100 hover:bg-slate-200"
                                            : "text-neutral-400 hover:bg-neutral-100 hover:text-slate-700"
                                    }`}
                                    title="즐겨찾기"
                                >
                                    <Heart className="h-4 w-4" fill={favorites.has(selected.id) ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* 본문 */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            {(() => {
                                const special = renderSpecial(selected, tplData, handleCellChange);
                                if (special) {
                                    return (
                                        <div>
                                            {special}
                                            {selected.body_md.trim() && (
                                                <details className="mt-4 border-t border-neutral-100 pt-4">
                                                    <summary className="text-[10px] text-neutral-400 uppercase tracking-wider cursor-pointer hover:text-neutral-600 select-none">
                                                        작성 가이드 보기
                                                    </summary>
                                                    <div className="bg-neutral-50 rounded-lg p-4 mt-2">
                                                        {renderMd(selected.body_md)}
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="bg-neutral-50 rounded-lg p-5 min-h-32">
                                        {renderMd(selected.body_md)}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* 푸터 */}
                        <div className="px-6 py-3 border-t border-neutral-100 flex items-center justify-between shrink-0">
                            <span className="text-[11px] text-neutral-400">
                                {isSpecialTemplate(selected)
                                    ? hasData ? "연습용 입력입니다. 여기서 입력한 내용은 저장되지 않습니다." : "각 셀을 클릭해 바로 입력하세요."
                                    : 'Daily · 프로젝트 노트에서 "템플릿 삽입"으로 사용하세요.'
                                }
                            </span>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                {copied ? <Check className="h-3 w-3 text-[#6366F1]" /> : <Copy className="h-3 w-3" />}
                                {copied ? "복사됨" : hasData ? "내용 복사" : "마크다운 복사"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── 템플릿 카드 ──────────────────────────────────────────────────────
function TemplateCard({
    tpl, isFavorite, onToggleFavorite, onClick,
}: {
    tpl: Template;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
    onClick: () => void;
}) {
    const meta = CATEGORY_META[tpl.category];
    const isSpecial = isSpecialTemplate(tpl);

    const previewLines = tpl.body_md
        .split("\n")
        .filter(l => l.trim() && !l.match(/^#{1,3} /) && !l.match(/^[-*]{3,}$/) && !l.startsWith("|"))
        .slice(0, 3)
        .map(l => l.replace(/^[-*\d.[\]x ]+/, "").replace(/\*\*/g, "").replace(/_/g, "").trim())
        .filter(Boolean);

    return (
        <div className="group relative bg-white border border-neutral-200 rounded-xl hover:border-[#6366F1]/40 hover:shadow-sm transition-all cursor-pointer">
            <button
                onClick={onToggleFavorite}
                className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
                    isFavorite
                        ? "text-slate-700 bg-slate-100 opacity-100"
                        : "text-neutral-300 bg-white opacity-0 group-hover:opacity-100"
                }`}
                title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
            >
                <Heart className="h-3 w-3" fill={isFavorite ? "currentColor" : "none"} />
            </button>

            <div className="p-4" onClick={onClick}>
                {tpl.subcategory && (
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">{tpl.subcategory}</p>
                )}

                <h4 className="font-semibold text-neutral-900 text-sm leading-snug mb-1.5 group-hover:text-[#6366F1] transition-colors pr-6">
                    {tpl.label}
                </h4>

                {tpl.description && (
                    <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-2">
                        {tpl.description}
                    </p>
                )}

                {previewLines.length > 0 && (
                    <ul className="space-y-0.5 mt-2">
                        {previewLines.map((l, i) => (
                            <li key={i} className="text-[11px] text-neutral-400 leading-snug truncate">· {l}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
