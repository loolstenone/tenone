"use client";

/**
 * 브랜드 공개 프로필 설정 (본인만) — 브랜드 마이페이지에 둔다. 예: /madleague/my → www.madleague.net/@핸들
 *
 * - 핸들: 유니버스 하나 (members.handle). 자동 핸들(u_…)이면 여기서 정하게 한다 (?handle= 로 들어오면 채워 둠)
 * - 공개·검색 노출·보일 항목·함께 보여 줄 다른 브랜드 활동 → member_brand_profile_settings (본인 행만, RLS)
 *   다른 브랜드 활동은 체크 = 그 브랜드 활동을 이 프로필에 보여 주는 데 동의 (include_consent_at 기록 — 계약 4·제18조)
 * - 미리보기 = 서버가 실제로 내보내는 값 (preview_my_brand_profile)
 * 규칙(만 14세·가입한 브랜드만·운영 숨김)은 DB 트리거가 강제한다 — sql/profile-p2-brand.sql
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BarChart3, Check, Copy, Eye, QrCode, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { friendlyDbError, HANDLE_RE, type BrandProfileRow } from "@/lib/profile/public-profile";
import { brandProfileUrl, type BrandProfileConfig } from "@/lib/profile/brand-profiles";
import { BrandPublicProfile } from "@/features/profile/BrandPublicProfile";
import { QrBox, ShareLinksSection, useProfileViews, type PanelTone } from "@/components/profile/ShareLinksSection";

interface Settings { is_public: boolean; searchable: boolean; show_fields: Record<string, boolean>; include_brands: string[] }
const EMPTY: Settings = { is_public: false, searchable: false, show_fields: {}, include_brands: [] };

const FIELDS: { key: string; label: string; def: boolean }[] = [
    { key: "avatar", label: "프로필 사진", def: true },
    { key: "bio", label: "소개", def: true },
    { key: "company", label: "소속", def: false },
    { key: "socialLinks", label: "SNS 링크", def: false },
];

const AUTO_HANDLE = /^u_[a-z0-9]{8,10}$/;

export function BrandProfilePanel({ cfg, renderSection }: {
    cfg: BrandProfileConfig;
    /** 미리보기에서 브랜드 섹션 그리기 */
    renderSection: (section: BrandProfileRow["section"]) => ReactNode;
}) {
    const { user, updateProfile } = useAuth();
    const [s, setS] = useState<Settings>(EMPTY);
    const [brands, setBrands] = useState<{ brand_id: string; brand_name: string }[]>([]);
    const [notice, setNotice] = useState("");
    const [preview, setPreview] = useState<BrandProfileRow | null>(null);
    const [qr, setQr] = useState(false);
    const [copied, setCopied] = useState(false);
    const [handleDraft, setHandleDraft] = useState("");
    const [handleMsg, setHandleMsg] = useState("");
    const views = useProfileViews(cfg.siteId);

    const tone: PanelTone = cfg.dark
        ? { text: "text-white", sub: "text-neutral-400", border: "border-neutral-800", field: "bg-black border border-neutral-700 text-white",
            button: { className: "text-white", style: { backgroundColor: cfg.accent } } }
        : { text: "text-neutral-900", sub: "text-neutral-500", border: "border-neutral-200", field: "bg-white border border-neutral-300",
            button: { className: "text-white", style: { backgroundColor: cfg.accent } } };

    const load = useCallback(async () => {
        if (!user) return;
        const sb = createClient();
        const [row, act] = await Promise.all([
            sb.from("member_brand_profile_settings").select("is_public, searchable, show_fields, include_brands")
                .eq("member_id", user.id).eq("brand_id", cfg.siteId).maybeSingle(),
            sb.rpc("my_activity_brands"),
        ]);
        setS(row.data ? { ...EMPTY, ...(row.data as Settings) } : EMPTY);
        setBrands(((act.data ?? []) as { brand_id: string; brand_name: string }[]).filter(b => b.brand_id !== cfg.siteId));
    }, [user, cfg.siteId]);
    useEffect(() => { load(); }, [load]);

    // 다른 화면의 '이 핸들 가져가기'(?handle=)
    useEffect(() => {
        if (typeof window === "undefined") return;
        const want = new URLSearchParams(window.location.search).get("handle")?.toLowerCase() ?? "";
        if (HANDLE_RE.test(want)) setHandleDraft(want);
    }, []);

    async function save(patch: Partial<Settings>) {
        if (!user) return;
        setNotice("");
        const next = { ...s, ...patch };
        const { error } = await createClient().from("member_brand_profile_settings").upsert({
            member_id: user.id, brand_id: cfg.siteId,
            is_public: next.is_public, searchable: next.searchable,
            show_fields: next.show_fields, include_brands: next.include_brands,
        }, { onConflict: "member_id,brand_id" });
        if (error) { setNotice(friendlyDbError(error, "설정을 저장하지 못했습니다.")); return; }
        setS(next);
    }

    async function saveHandle() {
        if (!user) return;
        setHandleMsg("");
        const h = handleDraft.trim().toLowerCase();
        if (!HANDLE_RE.test(h)) { setHandleMsg("3~20자, 영문 소문자·숫자·_ 만 사용할 수 있습니다"); return; }
        const check = await fetch(`/api/myverse/handle?check=${encodeURIComponent(h)}`).then(r => r.json()).catch(() => ({}));
        if (!(check as { available?: boolean }).available) { setHandleMsg("이미 쓰이고 있거나 쓸 수 없는 핸들입니다."); return; }
        const { error } = await createClient().from("members").update({ handle: h }).eq("id", user.id);
        if (error) { setHandleMsg(friendlyDbError(error, "핸들을 저장하지 못했습니다.")); return; }
        updateProfile({ handle: h });
        setHandleDraft("");
        window.history.replaceState(null, "", window.location.pathname);
    }

    async function openPreview() {
        setNotice("");
        const { data, error } = await createClient().rpc("preview_my_brand_profile", { p_brand: cfg.siteId });
        if (error || !data) { setNotice("미리보기를 불러오지 못했습니다."); return; }
        setPreview(data as BrandProfileRow);
    }

    if (!user) return null;
    const handle = user.handle;
    const needsHandle = !handle || AUTO_HANDLE.test(handle) || !!handleDraft;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const url = handle ? brandProfileUrl(origin, pathname, cfg, handle) : null;
    const field = (k: string, def: boolean) => s.show_fields[k] ?? def;

    return (
        <section className={`rounded-2xl border p-6 sm:p-8 space-y-8 ${tone.border}`}>
            <div>
                <h2 className={`text-lg font-semibold ${tone.text}`}>{cfg.name} 공개 프로필</h2>
                <p className={`text-sm mt-2 ${tone.sub}`}>
                    활동 기록과 인증서를 한 페이지로 보여 줄 수 있습니다. 공개할 항목은 직접 고르고, 연락처는 공개되지 않습니다.
                </p>
            </div>
            {notice && <p role="alert" className="text-sm text-red-500">{notice}</p>}

            {/* 핸들 */}
            {needsHandle && (
                <div className="space-y-2">
                    <p className={`text-sm font-medium ${tone.text}`}>프로필 주소에 쓸 핸들</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={tone.sub}>@</span>
                        <input value={handleDraft} onChange={e => setHandleDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))}
                            placeholder={handle && !AUTO_HANDLE.test(handle) ? handle : "my_handle"} className={`text-sm rounded-lg px-3 py-2 w-56 ${tone.field}`} />
                        <button onClick={saveHandle} className={`text-sm px-4 py-2 rounded-lg ${tone.button.className}`} style={tone.button.style}>정하기</button>
                    </div>
                    <p className={`text-xs ${handleMsg ? "text-red-500" : tone.sub}`}>{handleMsg || "핸들은 모든 Ten:One™ 서비스에서 같은 주소로 쓰입니다. 바꾼 뒤 7일 동안은 다시 바꿀 수 없습니다."}</p>
                </div>
            )}

            {/* 공개 */}
            <div className="space-y-3">
                <label className={`flex items-start gap-3 ${tone.text}`}>
                    <input type="checkbox" checked={s.is_public} onChange={() => save({ is_public: !s.is_public, searchable: s.is_public ? false : s.searchable })} className="mt-1" />
                    <span>
                        <span className="font-medium">프로필 공개</span>
                        <span className={`block text-xs mt-0.5 ${tone.sub}`}>끄면 아래 공유 링크를 받은 사람만 볼 수 있습니다.</span>
                    </span>
                </label>
                <label className={`flex items-start gap-3 ${s.is_public ? tone.text : `${tone.sub} opacity-60`}`}>
                    <input type="checkbox" checked={s.searchable} disabled={!s.is_public} onChange={() => save({ searchable: !s.searchable })} className="mt-1" />
                    <span>
                        <span className="font-medium">검색엔진(구글·네이버)에 노출</span>
                        <span className={`block text-xs mt-0.5 ${tone.sub}`}>끄면 주소를 아는 사람만 볼 수 있습니다.</span>
                    </span>
                </label>
            </div>

            {url && (
                <div className="flex flex-wrap items-center gap-2">
                    <a href={url} target="_blank" rel="noreferrer" className={`text-sm underline underline-offset-4 break-all ${tone.text}`}>{url.replace(/^https?:\/\//, "")}</a>
                    <button onClick={() => navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
                        className={`flex items-center gap-1 text-xs border px-2.5 py-1.5 rounded-lg ${tone.border} ${tone.sub}`}>
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} 복사
                    </button>
                    <button onClick={() => setQr(true)} disabled={!s.is_public} className={`flex items-center gap-1 text-xs border px-2.5 py-1.5 rounded-lg disabled:opacity-40 ${tone.border} ${tone.sub}`}>
                        <QrCode className="h-3 w-3" /> QR
                    </button>
                    <button onClick={openPreview} className={`flex items-center gap-1 text-xs border px-2.5 py-1.5 rounded-lg ${tone.border} ${tone.sub}`}>
                        <Eye className="h-3 w-3" /> 다른 사람에게 보이는 화면
                    </button>
                </div>
            )}
            {qr && url && <QrBox url={url} fileName={`${cfg.siteId}-${handle}-qr.png`} tone={tone} onClose={() => setQr(false)} />}

            {/* 보일 항목 */}
            <div className="space-y-3">
                <p className={`text-sm font-medium ${tone.text}`}>프로필에 보일 항목</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {FIELDS.map(f => (
                        <label key={f.key} className={`flex items-center gap-2 text-sm ${tone.text}`}>
                            <input type="checkbox" checked={field(f.key, f.def)} onChange={() => save({ show_fields: { ...s.show_fields, [f.key]: !field(f.key, f.def) } })} />
                            {f.label}
                        </label>
                    ))}
                </div>
                <p className={`text-xs ${tone.sub}`}>이름과 {cfg.name} 활동은 항상 보입니다. 이메일·연락처는 보이지 않습니다.</p>
            </div>

            {/* 다른 브랜드 활동 */}
            {brands.length > 0 && (
                <div className="space-y-3">
                    <p className={`text-sm font-medium ${tone.text}`}>함께 보여 줄 다른 활동</p>
                    <p className={`text-xs ${tone.sub}`}>체크하면 그 서비스의 활동(서비스 이름·역할·연도)을 이 프로필에 함께 보여 주는 데 동의하는 것입니다. 언제든 끌 수 있습니다.</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {brands.map(b => {
                            const on = s.include_brands.includes(b.brand_id);
                            return (
                                <label key={b.brand_id} className={`flex items-center gap-2 text-sm ${tone.text}`}>
                                    <input type="checkbox" checked={on}
                                        onChange={() => save({ include_brands: on ? s.include_brands.filter(x => x !== b.brand_id) : [...s.include_brands, b.brand_id] })} />
                                    {b.brand_name}
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            <ShareLinksSection scope={cfg.siteId} tone={tone} buildUrl={(h, t) => brandProfileUrl(origin, pathname, cfg, h, t)} />

            {views && (
                <p className={`text-xs flex items-center gap-1.5 ${tone.sub}`}>
                    <BarChart3 className="h-3.5 w-3.5" />
                    방문 최근 7일 {views.d7.toLocaleString()}회 · 30일 {views.d30.toLocaleString()}회 (누가 봤는지는 기록하지 않습니다)
                </p>
            )}

            {/* 미리보기 */}
            {preview && (
                <div className="fixed inset-0 z-[9990] bg-black/80 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
                    <div className={`max-w-4xl mx-auto my-8 rounded-2xl ${cfg.dark ? "bg-black text-white border border-neutral-800" : "bg-white text-neutral-900"}`}>
                        <div className="flex items-center justify-between px-6 pt-5">
                            <span className={`text-xs flex items-center gap-1.5 ${tone.sub}`}>
                                <Eye className="h-3.5 w-3.5" /> 다른 사람에게 보이는 화면 {preview.profile_visibility !== "public" && "(지금은 비공개 — 공유 링크로만 보입니다)"}
                            </span>
                            <button onClick={() => setPreview(null)} aria-label="닫기" className={tone.sub}><X className="h-5 w-5" /></button>
                        </div>
                        <div className="-mt-20">
                            <BrandPublicProfile row={preview} cfg={cfg} section={renderSection(preview.section)} />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
