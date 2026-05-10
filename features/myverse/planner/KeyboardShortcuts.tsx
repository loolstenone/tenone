"use client";

// 글로벌 키보드 단축키 — 명령 팔레트 + 라우트 점프 + 치트시트
// 입력 필드(input/textarea/contentEditable)에서는 비활성

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "./CommandPalette";
import { Keyboard, X } from "lucide-react";

const ROUTE_KEYS: Record<string, string> = {
    i: "/myverse/app/index",
    t: "/myverse/app/today",
    w: "/myverse/app/weekly",
    m: "/myverse/app/monthly",
    y: "/myverse/app/yearly",
    p: "/myverse/app/projects",
    c: "/myverse/app/contacts",
    s: "/myverse/app/search",
};

const SHORTCUTS_LIST = [
    { keys: ["⌘K", "Ctrl+K"], desc: "명령 팔레트 열기" },
    { keys: ["?"], desc: "이 단축키 치트시트" },
    { keys: ["/"], desc: "빠른 기록 (흔적 작성)" },
    { keys: ["I"], desc: "인덱스로 이동" },
    { keys: ["T"], desc: "일간으로 이동" },
    { keys: ["W"], desc: "주간으로 이동" },
    { keys: ["M"], desc: "월간으로 이동" },
    { keys: ["Y"], desc: "연간으로 이동" },
    { keys: ["P"], desc: "프로젝트로 이동" },
    { keys: ["C"], desc: "연락처로 이동" },
    { keys: ["S"], desc: "검색으로 이동" },
    { keys: ["G"], desc: "다른 페이지로 이동 (= 명령 팔레트)" },
    { keys: ["ESC"], desc: "모달·팔레트 닫기" },
];

function isTypingTarget(e: KeyboardEvent): boolean {
    const t = e.target as HTMLElement | null;
    if (!t) return false;
    const tag = t.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (t.isContentEditable) return true;
    return false;
}

export function KeyboardShortcuts() {
    const router = useRouter();
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [cheatOpen, setCheatOpen] = useState(false);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            // ⌘K / Ctrl+K — 모든 상황 (input 안에서도)
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setPaletteOpen(true);
                return;
            }

            // 입력 중에는 그 외 단축키 무시
            if (isTypingTarget(e)) return;
            // 모디파이어 키 조합은 무시 (브라우저 단축키 보호)
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            // ?  치트시트
            if (e.key === "?") {
                e.preventDefault();
                setCheatOpen(true);
                return;
            }

            // / — 빠른 기록(Traces 작성 모드 직행) — 노션 슬래시 명령 패턴
            if (e.key === "/") {
                e.preventDefault();
                router.push("/myverse/app/traces?compose=1");
                return;
            }

            // g — 명령 팔레트 별칭
            if (e.key.toLowerCase() === "g") {
                e.preventDefault();
                setPaletteOpen(true);
                return;
            }

            // 라우트 점프
            const key = e.key.toLowerCase();
            const route = ROUTE_KEYS[key];
            if (route) {
                e.preventDefault();
                router.push(route);
            }
        }

        // 명령 팔레트 → 치트시트 트리거 (CommandPalette에서 dispatch)
        function onShowShortcuts() { setCheatOpen(true); }

        window.addEventListener("keydown", onKey);
        window.addEventListener("pp-show-shortcuts", onShowShortcuts as EventListener);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("pp-show-shortcuts", onShowShortcuts as EventListener);
        };
    }, [router]);

    return (
        <>
            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
            {cheatOpen && (
                <div
                    className="fixed inset-0 z-[9100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setCheatOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                            <div className="flex items-center gap-2">
                                <Keyboard className="h-4 w-4 text-[#6366F1]" />
                                <h2 className="font-serif text-lg text-neutral-900">단축키</h2>
                            </div>
                            <button
                                onClick={() => setCheatOpen(false)}
                                className="text-neutral-400 hover:text-neutral-700 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </header>
                        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
                            {SHORTCUTS_LIST.map((s, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-700">{s.desc}</span>
                                    <div className="flex items-center gap-1">
                                        {s.keys.map((k, ki) => (
                                            <kbd key={ki} className="px-2 py-0.5 text-[11px] font-mono border border-neutral-200 rounded bg-neutral-50 text-neutral-600">
                                                {k}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 text-[11px] text-neutral-500">
                            입력 필드에 포커스가 있을 때는 단축키가 비활성됩니다.
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
