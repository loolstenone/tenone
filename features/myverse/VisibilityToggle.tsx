"use client";

// 공개 범위 토글 — 콘텐츠 카드 우상단에 부착
// 3단계: private(나만) · friends(친구) · public(전체 공개)
//
// 첫 public 전환 시 핸들이 없으면 HandleRegisterModal 호출.
// 변경은 즉시 PATCH 호출.

import { useState } from "react";
import { Lock, Users, Globe } from "lucide-react";
import { HandleRegisterModal } from "./HandleRegisterModal";
import type { Visibility } from "@/lib/myverse/domains";

interface Props {
    targetTable: string;        // 'planners_daily_moments' 등
    targetId: string;           // row id
    initial: Visibility;
    /** 사용자의 현재 핸들 — null이면 첫 public 시 등록 모달 */
    handle: string | null;
    onChanged?: (next: Visibility) => void;
    size?: "sm" | "md";
}

const OPTS: { key: Visibility; icon: typeof Lock; label: string; color: string }[] = [
    { key: "private", icon: Lock,   label: "나만",  color: "#6B7280" },
    { key: "friends", icon: Users,  label: "친구",  color: "#F59E0B" },
    { key: "public",  icon: Globe,  label: "공개",  color: "#10B981" },
];

export function VisibilityToggle({
    targetTable, targetId, initial, handle: initialHandle, onChanged, size = "sm",
}: Props) {
    const [value, setValue] = useState<Visibility>(initial);
    const [open, setOpen] = useState(false);
    const [handle, setHandle] = useState<string | null>(initialHandle);
    const [pendingPublic, setPendingPublic] = useState(false);
    const [saving, setSaving] = useState(false);

    const current = OPTS.find(o => o.key === value)!;
    const Icon = current.icon;
    const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

    async function change(next: Visibility) {
        setOpen(false);
        // public으로 전환하는데 핸들이 없으면 핸들 등록 먼저
        if (next === "public" && !handle) {
            setPendingPublic(true);
            return;
        }
        await commit(next);
    }

    async function commit(next: Visibility) {
        setSaving(true);
        const prev = value;
        setValue(next);
        try {
            const res = await fetch("/api/myverse/visibility", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ table: targetTable, id: targetId, visibility: next }),
            });
            if (!res.ok) {
                setValue(prev);
                const json = await res.json().catch(() => ({}));
                alert(`공개 범위 변경 실패: ${json.error ?? res.status}`);
                return;
            }
            onChanged?.(next);
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="relative inline-block">
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    disabled={saving}
                    title={`현재: ${current.label}`}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] hover:bg-neutral-100 transition-colors ${size === "md" ? "text-xs" : ""}`}
                    style={{ color: current.color }}
                >
                    <Icon className={iconSize} />
                    {size === "md" && <span>{current.label}</span>}
                </button>
                {open && (
                    <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[110px]">
                        {OPTS.map(o => {
                            const OIcon = o.icon;
                            return (
                                <button
                                    key={o.key}
                                    onClick={() => change(o.key)}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-neutral-50 transition-colors ${
                                        o.key === value ? "font-semibold" : ""
                                    }`}
                                    style={o.key === value ? { color: o.color } : undefined}
                                >
                                    <OIcon className="h-3.5 w-3.5" style={{ color: o.color }} />
                                    {o.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <HandleRegisterModal
                open={pendingPublic}
                onClose={() => setPendingPublic(false)}
                onRegistered={(h) => {
                    setHandle(h);
                    void commit("public");
                }}
                contextNote="공개 범위를 '전체 공개'로 바꾸려면 myverse.kr/@핸들 주소가 필요합니다."
            />
        </>
    );
}
