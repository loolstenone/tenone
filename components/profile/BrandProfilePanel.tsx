"use client";

/**
 * 브랜드 공개 프로필 설정 (본인만) — 브랜드 마이페이지 오른쪽에 떠 있는 패널. 예: /madleague/my → www.madleague.net/@핸들
 * 유니버스 공개 설정(ProfileVisibilityRail)과 같은 순서·같은 부품 (RailParts) — 2026-10-16 개편
 *   ① 공개 여부·미리보기   ② 프로필 주소(핸들 — 유니버스 하나)   ③ 보일 항목·다른 활동·검색 노출   ④ 공유   ⑤ 방문 수
 *
 * - 공개·검색 노출·보일 항목·함께 보여 줄 다른 브랜드 활동 → member_brand_profile_settings (본인 행만, RLS)
 *   다른 브랜드 활동은 켜기 = 그 브랜드 활동을 이 프로필에 보여 주는 데 동의 (include_consent_at 기록 — 계약 4·제18조)
 * - 미리보기 = 서버가 실제로 내보내는 값 (preview_my_brand_profile)
 * 규칙(만 14세·가입한 브랜드만·운영 숨김)은 DB 트리거가 강제한다 — sql/profile-p2-brand.sql
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BarChart3, Check, Copy, ExternalLink, Eye, QrCode, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { friendlyDbError, type BrandProfileRow } from "@/lib/profile/public-profile";
import { brandProfileUrl, type BrandProfileConfig } from "@/lib/profile/brand-profiles";
import { BrandPublicProfile } from "@/features/profile/BrandPublicProfile";
import { QrBox, ShareLinksSection, useProfileViews, type PanelTone } from "@/components/profile/ShareLinksSection";
import { HandleEditor, RailSection, RailSwitch, type SwitchColors } from "@/components/profile/RailParts";

interface Settings { is_public: boolean; searchable: boolean; show_fields: Record<string, boolean>; include_brands: string[] }
const EMPTY: Settings = { is_public: false, searchable: false, show_fields: {}, include_brands: [] };

const FIELDS: { key: string; label: string; def: boolean }[] = [
    { key: "avatar", label: "프로필 사진", def: true },
    { key: "bio", label: "소개", def: true },
    { key: "company", label: "소속", def: false },
    { key: "socialLinks", label: "SNS 링크", def: false },
];

export function BrandProfilePanel({ cfg, renderSection }: {
    cfg: BrandProfileConfig;
    /** 미리보기에서 브랜드 섹션 그리기 */
    renderSection: (section: BrandProfileRow["section"]) => ReactNode;
}) {
    const { user } = useAuth();
    const [s, setS] = useState<Settings>(EMPTY);
    const [brands, setBrands] = useState<{ brand_id: string; brand_name: string }[]>([]);
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);
    const [preview, setPreview] = useState<BrandProfileRow | null>(null);
    const [qr, setQr] = useState(false);
    const [copied, setCopied] = useState(false);
    const views = useProfileViews(cfg.siteId);

    const tone: PanelTone = cfg.dark
        ? { text: "text-white", sub: "text-neutral-400", border: "border-neutral-800", field: "bg-black border border-neutral-700 text-white",
            button: { className: "text-white", style: { backgroundColor: cfg.accent } } }
        : { text: "text-neutral-900", sub: "text-neutral-500", border: "border-neutral-200", field: "bg-white border border-neutral-300",
            button: { className: "text-white", style: { backgroundColor: cfg.accent } } };
    const switchColors: SwitchColors = cfg.dark
        ? { on: cfg.accent, off: "#404040", knob: "#ffffff" }
        : { on: cfg.accent, off: "#d4d4d4", knob: "#ffffff" };

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

    async function save(patch: Partial<Settings>) {
        if (!user) return;
        setBusy(true); setNotice("");
        const next = { ...s, ...patch };
        const { error } = await createClient().from("member_brand_profile_settings").upsert({
            member_id: user.id, brand_id: cfg.siteId,
            is_public: next.is_public, searchable: next.searchable,
            show_fields: next.show_fields, include_brands: next.include_brands,
        }, { onConflict: "member_id,brand_id" });
        setBusy(false);
        if (error) { setNotice(friendlyDbError(error, "설정을 저장하지 못했습니다.")); return; }
        setS(next);
    }

    async function openPreview() {
        setNotice("");
        const { data, error } = await createClient().rpc("preview_my_brand_profile", { p_brand: cfg.siteId });
        if (error || !data) { setNotice("미리보기를 불러오지 못했습니다."); return; }
        setPreview(data as BrandProfileRow);
    }

    if (!user) return null;
    const handle = user.handle;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const url = handle ? brandProfileUrl(origin, pathname, cfg, handle) : null;
    const prefix = brandProfileUrl(origin, pathname, cfg, "").replace(/^https?:\/\/(www\.)?/, "");
    const field = (k: string, def: boolean) => s.show_fields[k] ?? def;

    const row = (key: string, label: string, on: boolean, onClick: () => void, aria: string, disabled = false) => (
        <li key={key} className="flex items-center justify-between gap-3">
            <span className={`text-sm ${tone.text}`}>{label}</span>
            <RailSwitch on={on} onClick={onClick} disabled={busy || disabled} label={aria} colors={switchColors} />
        </li>
    );

    return (
        <>
            {preview && (
                <div className="fixed inset-0 z-[9990] bg-black/80 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) setPreview(null); }}>
                    <div className={`max-w-4xl mx-auto my-8 rounded-2xl ${cfg.dark ? "bg-black text-white border border-neutral-800" : "bg-white text-neutral-900"}`}>
                        <div className="flex items-center justify-between px-6 pt-5">
                            <span className={`text-xs flex items-center gap-1.5 ${tone.sub}`}>
                                <Eye className="h-3.5 w-3.5" />
                                {s.is_public ? "다른 사람이 보는 화면입니다" : "공개로 바꾸면 다른 사람에게 이렇게 보입니다 (지금은 비공개)"}
                            </span>
                            <button onClick={() => setPreview(null)} aria-label="닫기" className={tone.sub}><X className="h-5 w-5" /></button>
                        </div>
                        <div className="-mt-20">
                            <BrandPublicProfile row={preview} cfg={cfg} section={renderSection(preview.section)} />
                        </div>
                    </div>
                </div>
            )}

            <aside className={`rounded-2xl border p-5 ${tone.border} ${cfg.dark ? "bg-neutral-950" : "bg-white"}`}>
                {notice && <p role="alert" className="mb-4 text-xs text-red-500 leading-relaxed">{notice}</p>}
                <div>
                    <RailSection title={`${cfg.name} 공개 프로필`} tone={tone}>
                        <p className={`text-[11px] leading-relaxed mb-3 ${tone.sub}`}>
                            {cfg.name} 활동과 인증서를 한 페이지로 보여 줍니다. 비공개면 나만 볼 수 있습니다.
                        </p>
                        <ul>{row("public", s.is_public ? "공개 중" : "비공개", s.is_public,
                            () => save({ is_public: !s.is_public, searchable: s.is_public ? false : s.searchable }), "프로필 공개")}</ul>
                        <button onClick={openPreview}
                            className={`mt-3 w-full flex items-center justify-center gap-1.5 text-xs border rounded-lg py-2 hover:opacity-80 ${tone.border} ${tone.text}`}>
                            <Eye className="h-3.5 w-3.5" /> 다른 사람에게 보이는 화면
                        </button>
                    </RailSection>

                    <RailSection title="프로필 주소" tone={tone}>
                        <HandleEditor tone={tone} displayPrefix={prefix} onError={setNotice} />
                    </RailSection>

                    <RailSection title="보일 항목" tone={tone}>
                        <p className={`text-[11px] leading-relaxed mb-3 ${tone.sub}`}>
                            이름과 {cfg.name} 활동은 항상 보입니다. 이메일·연락처는 보이지 않습니다.
                        </p>
                        <ul className="space-y-2.5">
                            {FIELDS.map(f => row(f.key, f.label, field(f.key, f.def),
                                () => save({ show_fields: { ...s.show_fields, [f.key]: !field(f.key, f.def) } }), `${f.label} 보이기`))}
                        </ul>
                        {brands.length > 0 && (
                            <>
                                <p className={`text-[11px] mt-4 mb-2.5 leading-relaxed ${tone.sub}`}>
                                    다른 서비스 활동 — 켜면 그 서비스 이름·역할·연도를 이 프로필에 함께 보여 주는 데 동의하는 것입니다.
                                </p>
                                <ul className="space-y-2.5">
                                    {brands.map(b => {
                                        const on = s.include_brands.includes(b.brand_id);
                                        return row(b.brand_id, b.brand_name, on,
                                            () => save({ include_brands: on ? s.include_brands.filter(x => x !== b.brand_id) : [...s.include_brands, b.brand_id] }),
                                            `${b.brand_name} 활동 보이기`);
                                    })}
                                </ul>
                            </>
                        )}
                        <div className={`flex items-start justify-between gap-3 mt-4 pt-4 border-t ${tone.border}`}>
                            <span className={`text-sm ${s.is_public ? tone.text : tone.sub}`}>
                                검색엔진에 노출
                                <span className={`block text-[11px] mt-0.5 leading-relaxed ${tone.sub}`}>구글·네이버 검색에 나옵니다. 공개일 때만 켤 수 있습니다.</span>
                            </span>
                            <RailSwitch on={s.is_public && s.searchable} onClick={() => save({ searchable: !s.searchable })}
                                disabled={busy || !s.is_public} label="검색엔진 노출" colors={switchColors} />
                        </div>
                    </RailSection>

                    <RailSection title="공유" tone={tone}>
                        {s.is_public && url ? (
                            <div className="space-y-3 mb-5">
                                <div className="flex gap-2">
                                    <button onClick={() => navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
                                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs border rounded-lg py-2 ${tone.border} ${tone.text}`}>
                                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} 주소 복사
                                    </button>
                                    <button onClick={() => setQr(v => !v)} className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-2 ${tone.border} ${tone.text}`}>
                                        <QrCode className="h-3.5 w-3.5" /> QR
                                    </button>
                                    <a href={url} target="_blank" rel="noopener noreferrer" aria-label="공개 페이지 열기"
                                        className={`flex items-center border rounded-lg px-3 py-2 ${tone.border} ${tone.text}`}><ExternalLink className="h-3.5 w-3.5" /></a>
                                </div>
                                {qr && <QrBox url={url} fileName={`${cfg.siteId}-${handle}-qr.png`} tone={tone} onClose={() => setQr(false)} />}
                            </div>
                        ) : (
                            <p className={`text-[11px] leading-relaxed mb-5 ${tone.sub}`}>비공개라 주소를 알려 줘도 열리지 않습니다. 특정 사람에게만 보여 주려면 아래 링크를 쓰세요.</p>
                        )}
                        <ShareLinksSection scope={cfg.siteId} tone={tone} buildUrl={(h, t) => brandProfileUrl(origin, pathname, cfg, h, t)} />
                    </RailSection>
                </div>

                {views && (
                    <p className={`pt-4 border-t text-[11px] flex items-center gap-1.5 ${tone.border} ${tone.sub}`}>
                        <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                        방문 7일 {views.d7.toLocaleString()} · 30일 {views.d30.toLocaleString()} (누가 봤는지는 남기지 않습니다)
                    </p>
                )}
            </aside>
        </>
    );
}
