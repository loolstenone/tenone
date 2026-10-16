"use client";

/**
 * 공개 설정 (본인만) — /profile 오른쪽에 떠 있는 패널 (2026-10-16 개편)
 *
 * 프로필 "내용"(이름·사진·소개…)은 왼쪽에서 고치고, "다른 사람에게 어떻게 보일지"는 여기서 정한다.
 *   ① 공개 여부   ② 프로필 주소(핸들)   ③ 보일 항목   ④ 검색 노출   ⑤ 미리보기   ⑥ 공유(주소·QR·기한 있는 링크)   ⑦ 방문 수
 * 규칙(만 14세 확인·핸들 7일/90일·운영 숨김)은 DB가 강제한다 — 거절되면 이유를 그대로 보여 준다 (sql/profile-p1-core.sql)
 * 실제로 보이는 값 = DB 함수 profile_public_payload 한 곳 (미리보기도 같은 함수)
 */
import { useEffect, useState } from "react";
import { BarChart3, Check, Copy, ExternalLink, Eye, Loader2, QrCode, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { checkHandleAvailable } from "@/lib/supabase/universe-profile";
import {
    friendlyDbError, publicProfileUrl, toPublicProfileData, HANDLE_RE, type PublicProfileRow,
} from "@/lib/profile/public-profile";
import { QrBox, ShareLinksSection, useProfileViews, type PanelTone } from "@/components/profile/ShareLinksSection";
import { UniverseProfile, type PublicProfileData } from "@/components/UniverseProfile";

const TONE: PanelTone = {
    text: "tn-text",
    sub: "tn-text-sub",
    border: "tn-border",
    button: { className: "tn-btn-primary" },
    field: "tn-text bg-transparent border tn-border",
};

/** 공개 프로필에 보일 항목 — on = DB가 내보내는 기준과 같게 (소개·소속·소셜은 끄지 않으면 보임, 이메일은 켤 때만) */
const FIELDS: { key: string; label: string; defaultOn: boolean }[] = [
    { key: "bio", label: "자기소개", defaultOn: true },
    { key: "company", label: "소속", defaultOn: true },
    { key: "socialLinks", label: "소셜 링크", defaultOn: true },
    { key: "email", label: "이메일", defaultOn: false },
];
/** 다른 서비스 활동 — 본인이 켤 때만 (계약 4). 이용 중인 서비스만 보여 준다 */
const BRAND_FIELDS: { key: string; label: string }[] = [
    { key: "hero", label: "HeRo" },
    { key: "badak", label: "Badak" },
    { key: "madleague", label: "MAD League" },
    { key: "madleap", label: "MADLeap" },
    { key: "youinone", label: "YouInOne" },
];
const AUTO_HANDLE = /^u_[a-z0-9]{8}$/;

function Switch({ on, onClick, disabled, label }: { on: boolean; onClick: () => void; disabled?: boolean; label: string }) {
    return (
        <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} disabled={disabled}
            className="relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-40"
            style={{ background: on ? "var(--tn-text)" : "var(--tn-border)" }}>
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full shadow transition-transform ${on ? "translate-x-4" : ""}`}
                style={{ background: "var(--tn-bg)" }} />
        </button>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="py-5 border-t tn-border first:border-t-0 first:pt-0">
            <h3 className="text-xs font-semibold tn-text mb-3">{title}</h3>
            {children}
        </section>
    );
}

export function ProfileVisibilityRail() {
    const { user, updateProfile } = useAuth();
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);
    const [searchable, setSearchable] = useState(false);
    const [joined, setJoined] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [qr, setQr] = useState(false);
    const [preview, setPreview] = useState<PublicProfileData | null>(null);
    const views = useProfileViews("universe");

    // 핸들 바꾸기
    const [editingHandle, setEditingHandle] = useState(false);
    const [handleDraft, setHandleDraft] = useState("");
    const [handleState, setHandleState] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");

    useEffect(() => {
        if (!user) return;
        createClient().from("members").select("profile_searchable").eq("id", user.id).maybeSingle()
            .then(({ data }: { data: { profile_searchable?: boolean } | null }) => setSearchable(!!data?.profile_searchable));
        fetch("/api/brand-join/mine").then(r => r.ok ? r.json() : { brands: [] })
            .then((d: { brands?: string[] }) => setJoined(d.brands ?? [])).catch(() => {});
    }, [user]);

    // /profile?handle=… (볼 수 없는 프로필 화면의 '이 주소 가져가기') → 주소 바꾸기를 열고 채워 둔다
    useEffect(() => {
        if (!user) return;
        const want = new URLSearchParams(window.location.search).get("handle")?.toLowerCase() ?? "";
        if (!HANDLE_RE.test(want) || want === user.handle) return;
        setHandleDraft(want);
        setEditingHandle(true);
        window.history.replaceState(null, "", window.location.pathname);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 첫 진입 1회
    }, [user?.id]);

    useEffect(() => {
        if (!editingHandle || !user) return;
        const h = handleDraft.trim();
        if (!h || h === user.handle) { setHandleState("idle"); return; }
        if (!HANDLE_RE.test(h)) { setHandleState("invalid"); return; }
        setHandleState("checking");
        const t = setTimeout(() => {
            checkHandleAvailable(h, user.id).then(ok => setHandleState(ok ? "ok" : "taken")).catch(() => setHandleState("idle"));
        }, 400);
        return () => clearTimeout(t);
    }, [handleDraft, editingHandle, user]);

    if (!user) return null;

    const isPublic = user.profileVisibility === "public";
    const ps = (user.privacySettings ?? {}) as Record<string, boolean | undefined>;
    const isOn = (key: string, defaultOn: boolean) => defaultOn ? ps[key] !== false : ps[key] === true;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.tenone.biz";
    const publicUrl = user.handle ? publicProfileUrl(origin, user.handle) : null;
    const brandFields = BRAND_FIELDS.filter(b => joined.includes(b.key));
    const autoHandle = !user.handle || AUTO_HANDLE.test(user.handle);

    async function save(updates: Record<string, unknown>, fallback: string) {
        setBusy(true); setNotice("");
        const { error } = await createClient().from("members").update(updates).eq("id", user!.id);
        setBusy(false);
        if (error) { setNotice(friendlyDbError(error, fallback)); return false; }
        return true;
    }

    async function toggleVisibility() {
        const next = isPublic ? "private" : "public";
        if (await save({ profile_visibility: next }, "공개 설정을 바꾸지 못했습니다.")) updateProfile({ profileVisibility: next });
    }

    async function toggleField(key: string, defaultOn: boolean) {
        const next = { ...ps, [key]: !isOn(key, defaultOn) };
        if (await save({ privacy_settings: next }, "보일 항목을 바꾸지 못했습니다.")) {
            updateProfile({ privacySettings: next as import("@/types/auth").PrivacySettings });
        }
    }

    async function toggleSearchable() {
        if (await save({ profile_searchable: !searchable }, "검색 노출 설정을 바꾸지 못했습니다.")) setSearchable(!searchable);
    }

    async function saveHandle() {
        const h = handleDraft.trim();
        if (handleState !== "ok") return;
        if (await save({ handle: h }, "주소를 바꾸지 못했습니다.")) {
            updateProfile({ handle: h });
            setEditingHandle(false);
            setHandleState("idle");
        }
    }

    async function openPreview() {
        setNotice("");
        const { data, error } = await createClient().rpc("preview_my_public_profile");
        if (error || !data) { setNotice("미리보기를 불러오지 못했습니다."); return; }
        setPreview(toPublicProfileData(data as PublicProfileRow));
    }

    return (
        <>
            {preview && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4"
                    onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
                    <div className="w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-3 text-white/70">
                            <span className="text-xs">
                                {isPublic ? "다른 사람이 보는 화면입니다" : "공개로 바꾸면 다른 사람에게 이렇게 보입니다 (지금은 비공개)"}
                            </span>
                            <button onClick={() => setPreview(null)} aria-label="닫기" className="hover:text-white"><X className="h-5 w-5" /></button>
                        </div>
                        <UniverseProfile isOwner={false} publicData={preview} preview />
                    </div>
                </div>
            )}

            <aside className="rounded-2xl border tn-border tn-surface p-5">
                {notice && <p role="alert" className="mb-4 text-xs text-red-500 leading-relaxed">{notice}</p>}

                <div>
                <Section title="공개 프로필">
                    <p className="text-[11px] tn-text-sub leading-relaxed mb-3">
                        다른 사람이 내 주소로 들어왔을 때 보는 화면입니다. 비공개면 나만 볼 수 있습니다.
                    </p>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm tn-text">{isPublic ? "공개 중" : "비공개"}</span>
                        <Switch on={isPublic} onClick={toggleVisibility} disabled={busy} label="프로필 공개" />
                    </div>
                    <button onClick={openPreview}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs tn-text border tn-border rounded-lg py-2 hover:opacity-80">
                        <Eye className="h-3.5 w-3.5" /> 다른 사람에게 보이는 화면
                    </button>
                </Section>

                <Section title="프로필 주소">
                    {!editingHandle ? (
                        <>
                            <p className="text-sm tn-text break-all">tenone.biz/@{user.handle ?? "…"}</p>
                            {autoHandle && (
                                <p className="text-[11px] tn-text-sub mt-1 leading-relaxed">가입할 때 자동으로 만든 주소입니다. 원하는 이름으로 바꿔 보세요.</p>
                            )}
                            <button onClick={() => { setHandleDraft(autoHandle ? "" : user.handle ?? ""); setEditingHandle(true); }}
                                className="mt-2 text-xs tn-text underline underline-offset-2">
                                {autoHandle ? "나만의 주소 만들기" : "주소 바꾸기"}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center rounded-lg border tn-border px-3">
                                <span className="text-xs tn-text-sub">tenone.biz/@</span>
                                <input autoFocus value={handleDraft}
                                    onChange={e => setHandleDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))}
                                    placeholder="my_name" className="flex-1 min-w-0 bg-transparent py-2 text-sm tn-text outline-none" />
                                {handleState === "checking" && <Loader2 className="h-3.5 w-3.5 animate-spin tn-text-sub" />}
                            </div>
                            <p className={`text-[11px] leading-relaxed ${handleState === "taken" || handleState === "invalid" ? "text-red-500" : "tn-text-sub"}`}>
                                {handleState === "ok" ? "사용할 수 있는 주소입니다."
                                    : handleState === "taken" ? "이미 쓰고 있거나 쓸 수 없는 주소입니다."
                                        : handleState === "invalid" ? "영문 소문자·숫자·_ 로 3~20자."
                                            : "영문 소문자·숫자·_ 3~20자 · 7일에 한 번 바꿀 수 있고, 예전 주소는 30일 동안 새 주소로 이어집니다."}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={saveHandle} disabled={handleState !== "ok" || busy}
                                    className="flex-1 text-xs font-medium rounded-lg py-2 tn-btn-primary disabled:opacity-40">저장</button>
                                <button onClick={() => { setEditingHandle(false); setHandleState("idle"); }}
                                    className="text-xs tn-text-sub border tn-border rounded-lg px-3 py-2">취소</button>
                            </div>
                        </div>
                    )}
                </Section>

                <Section title="보일 항목">
                    <p className="text-[11px] tn-text-sub leading-relaxed mb-3">
                        이름·사진·관심 분야는 항상 보입니다. 연락처는 어떤 경우에도 보이지 않습니다.
                    </p>
                    <ul className="space-y-2.5">
                        {FIELDS.map(f => (
                            <li key={f.key} className="flex items-center justify-between gap-3">
                                <span className="text-sm tn-text">{f.label}</span>
                                <Switch on={isOn(f.key, f.defaultOn)} onClick={() => toggleField(f.key, f.defaultOn)} disabled={busy} label={`${f.label} 보이기`} />
                            </li>
                        ))}
                    </ul>
                    {brandFields.length > 0 && (
                        <>
                            <p className="text-[11px] tn-text-sub mt-4 mb-2.5">다른 서비스 활동 (켠 것만)</p>
                            <ul className="space-y-2.5">
                                {brandFields.map(f => (
                                    <li key={f.key} className="flex items-center justify-between gap-3">
                                        <span className="text-sm tn-text">{f.label}</span>
                                        <Switch on={isOn(f.key, false)} onClick={() => toggleField(f.key, false)} disabled={busy} label={`${f.label} 활동 보이기`} />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    <div className="flex items-start justify-between gap-3 mt-4 pt-4 border-t tn-border">
                        <span className={`text-sm ${isPublic ? "tn-text" : "tn-text-sub"}`}>
                            검색엔진에 노출
                            <span className="block text-[11px] tn-text-sub mt-0.5 leading-relaxed">구글·네이버 검색에 나옵니다. 공개일 때만 켤 수 있습니다.</span>
                        </span>
                        <Switch on={isPublic && searchable} onClick={toggleSearchable} disabled={busy || !isPublic} label="검색엔진 노출" />
                    </div>
                </Section>

                <Section title="공유">
                    {isPublic && publicUrl ? (
                        <div className="space-y-3 mb-5">
                            <div className="flex gap-2">
                                <button onClick={() => navigator.clipboard.writeText(publicUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
                                    className="flex-1 flex items-center justify-center gap-1.5 text-xs tn-text border tn-border rounded-lg py-2">
                                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} 주소 복사
                                </button>
                                <button onClick={() => setQr(v => !v)} className="flex items-center gap-1.5 text-xs tn-text border tn-border rounded-lg px-3 py-2">
                                    <QrCode className="h-3.5 w-3.5" /> QR
                                </button>
                                <a href={publicUrl} target="_blank" rel="noopener noreferrer" aria-label="공개 페이지 열기"
                                    className="flex items-center tn-text border tn-border rounded-lg px-3 py-2"><ExternalLink className="h-3.5 w-3.5" /></a>
                            </div>
                            {qr && <QrBox url={publicUrl} fileName={`profile-${user.handle}-qr.png`} tone={TONE} onClose={() => setQr(false)} />}
                        </div>
                    ) : (
                        <p className="text-[11px] tn-text-sub leading-relaxed mb-5">비공개라 주소를 알려 줘도 열리지 않습니다. 특정 사람에게만 보여 주려면 아래 링크를 쓰세요.</p>
                    )}
                    <ShareLinksSection scope="universe" tone={TONE} buildUrl={(h, t) => publicProfileUrl(origin, h, t)} />
                </Section>
                </div>

                {views && (
                    <p className="pt-4 border-t tn-border text-[11px] tn-text-sub flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                        방문 7일 {views.d7.toLocaleString()} · 30일 {views.d30.toLocaleString()} (누가 봤는지는 남기지 않습니다)
                    </p>
                )}
            </aside>
        </>
    );
}
