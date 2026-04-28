"use client";

// AI 채팅 사이드패널 — Phase 2 A2
// 우측에서 슬라이드, 현재 페이지 컨텍스트 자동 인식
// 토글: 우측 floating 버튼 + 단축키 'B' (KeyboardShortcuts에서 dispatch)
// 메시지 localStorage 보관 (최근 30개)

import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, X, Send, Loader2, Trash2, Sun, CalendarDays, AlertCircle, Target, Activity } from "lucide-react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    ts: number;
}

const STORAGE_KEY = "pp_ai_chat_messages";
const MAX_HISTORY = 30;

function loadHistory(): ChatMessage[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.slice(-MAX_HISTORY) : [];
    } catch { return []; }
}
function saveHistory(msgs: ChatMessage[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY)));
    } catch { /* quota exceeded etc */ }
}

function todayStr(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const HIDDEN_PATHS = ["/planners/app/canvas/", "/planners/onboarding", "/planners/purchase"];

export function AiSidePanel() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [pathname, setPathname] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // 히스토리 로드
    useEffect(() => {
        setMessages(loadHistory());
    }, []);

    // pathname
    useEffect(() => {
        if (typeof window === "undefined") return;
        setPathname(window.location.pathname);
        const onChange = () => setPathname(window.location.pathname);
        window.addEventListener("popstate", onChange);
        const id = setInterval(onChange, 600);
        return () => {
            window.removeEventListener("popstate", onChange);
            clearInterval(id);
        };
    }, []);

    // 외부 토글 이벤트
    useEffect(() => {
        function onToggle() { setOpen(o => !o); }
        function onOpen()   { setOpen(true); }
        window.addEventListener("pp-ai-panel-toggle", onToggle);
        window.addEventListener("pp-ai-panel-open", onOpen);
        return () => {
            window.removeEventListener("pp-ai-panel-toggle", onToggle);
            window.removeEventListener("pp-ai-panel-open", onOpen);
        };
    }, []);

    // 열릴 때 포커스 + 스크롤
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                inputRef.current?.focus();
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 50);
        }
    }, [open]);

    // 메시지 변할 때 스크롤 + 영속화
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        saveHistory(messages);
    }, [messages]);

    // 패널 열릴 때 body class 토글 — BetaFeedbackButton 등 다른 floating CTA 숨김용
    useEffect(() => {
        if (typeof document === "undefined") return;
        document.body.classList.toggle("pp-ai-panel-open", open);
        return () => { document.body.classList.remove("pp-ai-panel-open"); };
    }, [open]);

    // 자연어 등록 의도가 감지되면 직접 등록한다 — 명령 팔레트로 떠넘기지 않음
    interface AiAction {
        tool: "create_task" | "create_event" | "create_note";
        input: Record<string, unknown>;
    }
    async function commitAiActions(actions: AiAction[]): Promise<string[]> {
        const summaries: string[] = [];
        for (const a of actions) {
            if (a.tool === "create_task") {
                const date = (a.input.date as string) || todayStr();
                const text = a.input.text as string;
                const time = (a.input.time as string | null) ?? null;
                const r = await fetch(`/api/planners/daily?date=${date}`);
                const cur = r.ok ? await r.json() : null;
                const tasks = Array.isArray(cur?.daily?.tasks) ? cur.daily.tasks : [];
                tasks.push({ id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, text, status: "todo", time });
                await fetch(`/api/planners/daily`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date, tasks }),
                });
                summaries.push(`📋 할 일 — ${date}${time ? ` ${time}` : ""} · ${text}`);
            } else if (a.tool === "create_event") {
                await fetch(`/api/planners/calendar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        entry_date: a.input.date,
                        kind: a.input.kind || "meeting",
                        title: a.input.title,
                        start_time: a.input.start_time ?? null,
                        end_time: a.input.end_time ?? null,
                        location: a.input.location ?? null,
                    }),
                });
                const t = a.input.start_time as string | undefined;
                const loc = a.input.location as string | undefined;
                summaries.push(`📅 일정 — ${a.input.date}${t ? ` ${t}` : ""} · ${a.input.title}${loc ? ` @ ${loc}` : ""}`);
            } else if (a.tool === "create_note") {
                const date = (a.input.date as string) || todayStr();
                const content = a.input.content as string;
                const r = await fetch(`/api/planners/daily?date=${date}`);
                const cur = r.ok ? await r.json() : null;
                const prev = (cur?.daily?.notes ?? "") as string;
                const next = prev ? `${prev}\n\n${content}` : content;
                await fetch(`/api/planners/daily`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date, notes: next }),
                });
                summaries.push(`📝 노트 — ${date} · ${content.slice(0, 40)}${content.length > 40 ? "…" : ""}`);
            }
        }
        return summaries;
    }

    // 명백한 질문·대화는 parse-input 건너뜀 (false-positive 방지)
    function looksLikeChat(t: string): boolean {
        const s = t.trim();
        // 의문부호로 끝남
        if (/[?？]$/.test(s)) return true;
        // 일반 의문/조언/회고 키워드
        if (/(뭐|뭣|무엇|어떻|어디|어느|언제|누가|왜|어찌|할 수 있|있나|있어\?|있을까|아닌가|맞아|뭐야|어때|있을지|할까|좋을까|모르겠|추천해|알려줘|도와줘|분석해|제안해|회고|정리해|어땠|있는지)/.test(s)) return true;
        // 너무 짧으면 (2자 미만) 잡담
        if (s.length < 2) return true;
        return false;
    }

    const sendText = useCallback(async (text: string) => {
        if (!text.trim() || busy) return;
        const userMsg: ChatMessage = { role: "user", content: text, ts: Date.now() };
        const next = [...messages, userMsg];
        setMessages(next);
        setInput("");
        setBusy(true);
        try {
            // 명백한 질문은 곧장 chat 으로 — parse-input 건너뜀
            const skipParse = looksLikeChat(text);
            const parseData = skipParse ? null : await (async () => {
                const r = await fetch("/api/planners/ai/parse-input", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, today: todayStr() }),
                });
                return r.ok ? r.json() : null;
            })();
            if (parseData?.actions?.length > 0) {
                // 자동 등록 — 사용자에게 실시간 반영. 위치/시간 잘못 파악된 경우 사용자가 직접 수정·삭제 가능
                try {
                    const summaries = await commitAiActions(parseData.actions);
                    const msg = `✅ ${summaries.length}건 등록 완료\n\n${summaries.join("\n")}\n\n잘못 파악한 부분이 있으면 해당 화면에서 수정하거나 삭제해 주세요.`;
                    setMessages(curr => [...curr, { role: "assistant", content: msg, ts: Date.now() }]);
                } catch (e) {
                    setMessages(curr => [...curr, {
                        role: "assistant",
                        content: `등록 시도했으나 실패했어요: ${e instanceof Error ? e.message : "알 수 없음"}`,
                        ts: Date.now(),
                    }]);
                }
                return;
            }

            // 2) 등록 의도 아니면 일반 채팅
            const res = await fetch("/api/planners/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: next.map(m => ({ role: m.role, content: m.content })),
                    today: todayStr(),
                    view: pathname.replace("/planners/app/", "") || "today",
                }),
            });
            const d = await res.json();
            const reply = res.ok && d.reply
                ? d.reply
                : (d?.error === "ai_disabled"
                    ? "AI 키가 설정되지 않았습니다."
                    : `오류: ${d?.detail || d?.error || "응답 실패"}`);
            setMessages(curr => [...curr, { role: "assistant", content: reply, ts: Date.now() }]);
        } catch (e) {
            setMessages(curr => [...curr, {
                role: "assistant",
                content: `통신 오류: ${e instanceof Error ? e.message : "알 수 없음"}`,
                ts: Date.now(),
            }]);
        } finally {
            setBusy(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [busy, messages, pathname]);

    const send = useCallback(() => sendText(input), [sendText, input]);

    // Quick prompts — 빈 상태에서 빠른 시작 (A4 회고 · A5 이월 · A6 과적재 모두 커버)
    const QUICK_PROMPTS = [
        { icon: Sun,          label: "어제 회고 정리",            prompt: "어제 한 일과 미완 항목을 정리하고, 잘된 점·개선할 점을 3줄로 회고해 주세요." },
        { icon: CalendarDays, label: "이번 주 회고 + 다음 주 계획", prompt: "이번 주 task 진행을 분석하고, 다음 주에 집중할 우선순위 3가지를 제안해 주세요." },
        { icon: Target,       label: "이번 주 우선순위",          prompt: "이번 주에 가장 먼저 처리해야 할 일 Top 3을 이유와 함께 알려주세요." },
        { icon: Activity,     label: "이번 주 부하 분석",         prompt: "이번 주 등록된 task·미팅 양을 평소와 비교해 분석해 주세요. 과부하라면 어떤 항목을 줄이거나 다른 주로 옮길지 구체적으로 제안하세요." },
        { icon: AlertCircle,  label: "미완 업무 정리 제안",       prompt: "최근 7일간 미완 task 들을 분석해서 (1) 분리할 것 (2) 다음 주로 미룰 것 (3) 폐기할 것 으로 분류하고 이유를 알려주세요." },
    ];

    function clearHistory() {
        if (!confirm("대화 기록을 모두 지울까요?")) return;
        setMessages([]);
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    }

    const visible = pathname && !HIDDEN_PATHS.some(p => pathname.startsWith(p));
    if (!visible) return null;

    return (
        <>
            {/* 토글 버튼 — QuickCapture 위에 배치 */}
            <button
                onClick={() => setOpen(o => !o)}
                title="AI 비서 (단축키 B)"
                aria-label="AI 비서 토글"
                className={`fixed bottom-[5.25rem] right-5 z-[8500] w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center ${
                    open
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-[#0F766E] border border-[#0F766E]/30 hover:border-[#0F766E] hover:scale-105"
                }`}
            >
                {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
            </button>

            {/* 패널 */}
            {open && (
                <aside className="fixed top-0 right-0 z-[8500] h-full w-full max-w-sm bg-white border-l border-neutral-200 shadow-2xl flex flex-col">
                    <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 shrink-0">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#0F766E]" />
                            <h2 className="text-sm font-semibold text-neutral-900">AI 비서</h2>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={clearHistory}
                                title="대화 기록 삭제"
                                className="p-1.5 rounded text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </header>

                    {/* 메시지 영역 */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                        {messages.length === 0 && (
                            <div className="space-y-3">
                                <div className="text-center py-4">
                                    <Sparkles className="h-6 w-6 text-[#0F766E] mx-auto mb-2 opacity-60" />
                                    <p className="text-xs text-neutral-500">현재 페이지·최근 7일 데이터를 자동으로 알고 있어요.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold px-1">빠른 시작</p>
                                    {QUICK_PROMPTS.map((q, i) => {
                                        const Icon = q.icon;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => sendText(q.prompt)}
                                                disabled={busy}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm text-neutral-700 hover:bg-[#0F766E]/5 hover:text-[#0F766E] border border-neutral-100 hover:border-[#0F766E]/30 transition-colors disabled:opacity-50"
                                            >
                                                <Icon className="h-3.5 w-3.5 text-[#0F766E] shrink-0" />
                                                <span className="flex-1 text-xs">{q.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                                    m.role === "user"
                                        ? "bg-[#0F766E] text-white"
                                        : "bg-neutral-100 text-neutral-800"
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {busy && (
                            <div className="flex justify-start">
                                <div className="bg-neutral-100 rounded-2xl px-3 py-2 inline-flex items-center gap-2 text-xs text-neutral-500">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    생각 중…
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 입력 영역 */}
                    <div className="border-t border-neutral-200 p-3 shrink-0">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        send();
                                    }
                                }}
                                placeholder="물어보기… (Shift+↵ 줄바꿈)"
                                rows={1}
                                className="flex-1 resize-none px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#0F766E] max-h-32"
                            />
                            <button
                                onClick={send}
                                disabled={busy || !input.trim()}
                                className="shrink-0 w-9 h-9 rounded-lg bg-[#0F766E] text-white flex items-center justify-center hover:bg-[#0d5e56] disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1.5">현재 페이지 + 최근 7일 데이터를 자동 참조합니다.</p>
                    </div>
                </aside>
            )}
        </>
    );
}
