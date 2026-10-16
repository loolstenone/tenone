"use client";

/**
 * 공개 설정 패널 공용 부품 — 유니버스(/profile)·브랜드 마이페이지(/madleague/my 등)가 같은 모양·같은 규칙으로 쓴다 (2026-10-16)
 *   RailSwitch  켜기/끄기 · RailSection  구획 제목 · HandleEditor  프로필 주소(핸들) 만들기·바꾸기
 * 핸들은 유니버스 하나 (members.handle) — 어느 화면에서 바꿔도 모든 서비스 주소가 같이 바뀐다. 규칙은 DB 트리거가 강제
 */
import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { checkHandleAvailable } from "@/lib/supabase/universe-profile";
import { friendlyDbError, HANDLE_RE } from "@/lib/profile/public-profile";
import type { PanelTone } from "@/components/profile/ShareLinksSection";

export const AUTO_HANDLE = /^u_[a-z0-9]{8,10}$/;

export interface SwitchColors { on: string; off: string; knob: string }

export function RailSwitch({ on, onClick, disabled, label, colors }: {
    on: boolean; onClick: () => void; disabled?: boolean; label: string; colors: SwitchColors;
}) {
    return (
        <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} disabled={disabled}
            className="relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-40"
            style={{ background: on ? colors.on : colors.off }}>
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow transition-transform ${on ? "translate-x-4" : ""}`}
                style={{ background: colors.knob }} />
        </button>
    );
}

export function RailSection({ title, tone, children }: { title: string; tone: PanelTone; children: ReactNode }) {
    return (
        <section className={`py-5 border-t first:border-t-0 first:pt-0 ${tone.border}`}>
            <h3 className={`text-xs font-semibold mb-3 ${tone.text}`}>{title}</h3>
            {children}
        </section>
    );
}

/** 프로필 주소(핸들) — 보기 · 만들기 · 바꾸기. displayPrefix 예: 'tenone.biz/@' · 'madleague.net/@' */
export function HandleEditor({ tone, displayPrefix, onError }: {
    tone: PanelTone;
    displayPrefix: string;
    onError: (msg: string) => void;
}) {
    const { user, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [state, setState] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
    const [busy, setBusy] = useState(false);

    // 볼 수 없는 프로필 화면의 '이 주소 가져가기'(?handle=) → 바꾸기를 열고 채워 둔다
    useEffect(() => {
        if (!user) return;
        const want = new URLSearchParams(window.location.search).get("handle")?.toLowerCase() ?? "";
        if (!HANDLE_RE.test(want) || want === user.handle) return;
        setDraft(want);
        setEditing(true);
        window.history.replaceState(null, "", window.location.pathname);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 첫 진입 1회
    }, [user?.id]);

    useEffect(() => {
        if (!editing || !user) return;
        const h = draft.trim();
        if (!h || h === user.handle) { setState("idle"); return; }
        if (!HANDLE_RE.test(h)) { setState("invalid"); return; }
        setState("checking");
        const t = setTimeout(() => {
            checkHandleAvailable(h, user.id).then(ok => setState(ok ? "ok" : "taken")).catch(() => setState("idle"));
        }, 400);
        return () => clearTimeout(t);
    }, [draft, editing, user]);

    if (!user) return null;
    const auto = !user.handle || AUTO_HANDLE.test(user.handle);

    async function save() {
        if (state !== "ok" || !user) return;
        setBusy(true); onError("");
        const h = draft.trim();
        const { error } = await createClient().from("members").update({ handle: h }).eq("id", user.id);
        setBusy(false);
        if (error) { onError(friendlyDbError(error, "주소를 바꾸지 못했습니다.")); return; }
        updateProfile({ handle: h });
        setEditing(false);
        setState("idle");
    }

    if (!editing) {
        return (
            <>
                <p className={`text-sm break-all ${tone.text}`}>{displayPrefix}{user.handle ?? "…"}</p>
                {auto && <p className={`text-[11px] mt-1 leading-relaxed ${tone.sub}`}>가입할 때 자동으로 만든 주소입니다. 원하는 이름으로 바꿔 보세요.</p>}
                <button onClick={() => { setDraft(auto ? "" : user.handle ?? ""); setEditing(true); }}
                    className={`mt-2 text-xs underline underline-offset-2 ${tone.text}`}>
                    {auto ? "나만의 주소 만들기" : "주소 바꾸기"}
                </button>
            </>
        );
    }
    return (
        <div className="space-y-2">
            <div className={`flex items-center rounded-lg px-3 ${tone.field}`}>
                <span className={`text-xs shrink-0 ${tone.sub}`}>{displayPrefix}</span>
                <input autoFocus value={draft}
                    onChange={e => setDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))}
                    placeholder="my_name" className={`flex-1 min-w-0 bg-transparent py-2 text-sm outline-none ${tone.text}`} />
                {state === "checking" && <Loader2 className={`h-3.5 w-3.5 animate-spin ${tone.sub}`} />}
            </div>
            <p className={`text-[11px] leading-relaxed ${state === "taken" || state === "invalid" ? "text-red-500" : tone.sub}`}>
                {state === "ok" ? "사용할 수 있는 주소입니다."
                    : state === "taken" ? "이미 쓰고 있거나 쓸 수 없는 주소입니다."
                        : state === "invalid" ? "영문 소문자·숫자·_ 로 3~20자."
                            : "영문 소문자·숫자·_ 3~20자 · 모든 Ten:One™ 서비스에서 같은 주소 · 7일에 한 번 바꿀 수 있고, 예전 주소는 30일 동안 새 주소로 이어집니다."}
            </p>
            <div className="flex gap-2">
                <button onClick={save} disabled={state !== "ok" || busy}
                    className={`flex-1 text-xs font-medium rounded-lg py-2 disabled:opacity-40 ${tone.button.className}`} style={tone.button.style}>저장</button>
                <button onClick={() => { setEditing(false); setState("idle"); }}
                    className={`text-xs border rounded-lg px-3 py-2 ${tone.border} ${tone.sub}`}>취소</button>
            </div>
        </div>
    );
}
