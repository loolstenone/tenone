"use client";

/**
 * 공개·공유 관리 (본인만) — Universe Profile (tenone.biz/@핸들)
 *
 * - 검색 노출: 공개와 별도 동의. 기본 끔(noindex)
 * - 공개 주소 · QR
 * - 기한 있는 공유 링크 (ShareLinksSection, scope 'universe')
 * - 방문 수: 하루 단위 집계만 (누가 봤는지는 남기지 않는다)
 * 규칙(만 14세 확인·운영 숨김·10개 제한 등)은 DB가 강제한다 — sql/profile-p1-core.sql
 */
import { useEffect, useState } from "react";
import { BarChart3, Check, Copy, QrCode, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { friendlyDbError, publicProfileUrl } from "@/lib/profile/public-profile";
import { QrBox, ShareLinksSection, useProfileViews, type PanelTone } from "@/components/profile/ShareLinksSection";

const TONE: PanelTone = {
    text: "tn-text",
    sub: "tn-text-sub",
    border: "tn-border",
    button: { className: "tn-btn-primary" },
    field: "tn-text bg-transparent border tn-border",
};

export function ProfilePublishPanel() {
    const { user } = useAuth();
    const [searchable, setSearchable] = useState(false);
    const [qr, setQr] = useState(false);
    const [copied, setCopied] = useState(false);
    const [notice, setNotice] = useState("");
    const views = useProfileViews("universe");

    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.tenone.biz";
    const isPublic = user?.profileVisibility === "public";
    const handle = user?.handle;

    useEffect(() => {
        if (!user) return;
        createClient().from("members").select("profile_searchable").eq("id", user.id).maybeSingle()
            .then(({ data }: { data: { profile_searchable?: boolean } | null }) => setSearchable(!!data?.profile_searchable));
    }, [user]);

    async function toggleSearchable() {
        if (!user) return;
        setNotice("");
        const next = !searchable;
        const { error } = await createClient().from("members").update({ profile_searchable: next }).eq("id", user.id);
        if (error) { setNotice(friendlyDbError(error, "검색 노출 설정을 바꾸지 못했습니다.")); return; }
        setSearchable(next);
    }

    if (!user) return null;
    const publicUrl = handle ? publicProfileUrl(origin, handle) : null;

    return (
        <div className="rounded-2xl border tn-border tn-surface p-6 space-y-6">
            <div>
                <h2 className="text-sm font-semibold tn-text">공개와 공유</h2>
                <p className="text-xs tn-text-sub mt-1">
                    {isPublic ? "프로필이 공개되어 있습니다. 공개 범위 설정에서 켠 항목만 보입니다." : "프로필이 비공개입니다. 아래 공유 링크를 받은 사람만 볼 수 있습니다."}
                    {" "}연락처는 어떤 경우에도 보이지 않습니다.
                </p>
            </div>

            {notice && <p role="alert" className="text-xs text-red-600">{notice}</p>}

            {publicUrl && (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <code className="text-xs tn-text tn-bg-alt rounded-lg px-3 py-1.5 break-all">{publicUrl.replace(/^https?:\/\//, "")}</code>
                        <button onClick={() => navigator.clipboard.writeText(publicUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
                            className="flex items-center gap-1 text-[11px] tn-text-sub border tn-border px-2.5 py-1.5 rounded-lg">
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} 주소 복사
                        </button>
                        <button onClick={() => setQr(true)} disabled={!isPublic} title={isPublic ? "" : "비공개일 때는 공유 링크로 QR을 만드세요"}
                            className="flex items-center gap-1 text-[11px] tn-text-sub border tn-border px-2.5 py-1.5 rounded-lg disabled:opacity-40">
                            <QrCode className="h-3 w-3" /> QR
                        </button>
                    </div>
                    {qr && <QrBox url={publicUrl} fileName={`profile-${handle}-qr.png`} tone={TONE} onClose={() => setQr(false)} />}
                    <label className={`flex items-start gap-2 text-xs ${isPublic ? "tn-text" : "tn-text-sub opacity-60"}`}>
                        <input type="checkbox" checked={searchable} disabled={!isPublic} onChange={toggleSearchable} className="mt-0.5" />
                        <span>
                            <Search className="inline h-3 w-3 mr-1" />검색엔진(구글·네이버)에 내 프로필 노출
                            <span className="block tn-text-sub mt-0.5">끄면 주소를 아는 사람만 볼 수 있습니다. 공개일 때만 켤 수 있습니다.</span>
                        </span>
                    </label>
                </div>
            )}

            <ShareLinksSection scope="universe" tone={TONE} buildUrl={(h, t) => publicProfileUrl(origin, h, t)} />

            {views && (
                <p className="text-xs tn-text-sub flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" />
                    공개 프로필 방문 최근 7일 {views.d7.toLocaleString()}회 · 30일 {views.d30.toLocaleString()}회
                    <span className="text-[11px]">(누가 봤는지는 기록하지 않습니다)</span>
                </p>
            )}
        </div>
    );
}
