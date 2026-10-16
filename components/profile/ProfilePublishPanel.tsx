"use client";

/**
 * 공개·공유 관리 (본인만) — Universe Profile
 *
 * - 검색 노출: 공개와 별도 동의. 기본 끔(noindex)
 * - 공개 주소 QR
 * - 기한 있는 공유 링크: 비공개여도 링크를 받은 사람만 볼 수 있다. 토큰은 만들 때 한 번만 보이고 DB에는 해시만 (언제든 회수)
 * - 방문 수: 하루 단위 집계만 (누가 봤는지는 남기지 않는다)
 * 규칙(만 14세 확인·운영 숨김·10개 제한 등)은 DB 함수가 강제한다 — sql/profile-p1-core.sql
 */
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { BarChart3, Check, Copy, Link2, QrCode, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { friendlyDbError, publicProfileUrl } from "@/lib/profile/public-profile";

interface ShareLink {
    id: string;
    label: string | null;
    expires_at: string;
    revoked_at: string | null;
    view_count: number;
    created_at: string;
}

const DAY_OPTIONS = [
    { days: 1, label: "1일" },
    { days: 7, label: "7일" },
    { days: 30, label: "30일" },
];

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export function ProfilePublishPanel() {
    const { user } = useAuth();
    const [searchable, setSearchable] = useState(false);
    const [links, setLinks] = useState<ShareLink[]>([]);
    const [views, setViews] = useState<{ d7: number; d30: number } | null>(null);
    const [qr, setQr] = useState<string | null>(null);
    const [days, setDays] = useState(7);
    const [label, setLabel] = useState("");
    const [newLink, setNewLink] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);

    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.tenone.biz";
    const isPublic = user?.profileVisibility === "public";
    const handle = user?.handle;

    const load = useCallback(async () => {
        if (!user) return;
        const sb = createClient();
        const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
        const [me, ls, vs] = await Promise.all([
            sb.from("members").select("profile_searchable").eq("id", user.id).maybeSingle(),
            sb.from("profile_share_links").select("id, label, expires_at, revoked_at, view_count, created_at")
                .order("created_at", { ascending: false }).limit(20),
            sb.from("profile_view_daily").select("day, views").eq("scope", "universe").gte("day", since),
        ]);
        setSearchable(!!me.data?.profile_searchable);
        setLinks((ls.data ?? []) as ShareLink[]);
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        const rows = (vs.data ?? []) as { day: string; views: number }[];
        setViews({
            d30: rows.reduce((n, r) => n + r.views, 0),
            d7: rows.filter(r => r.day >= weekAgo).reduce((n, r) => n + r.views, 0),
        });
    }, [user]);

    useEffect(() => { load(); }, [load]);

    async function toggleSearchable() {
        if (!user) return;
        setNotice("");
        const next = !searchable;
        const { error } = await createClient().from("members").update({ profile_searchable: next }).eq("id", user.id);
        if (error) { setNotice(friendlyDbError(error, "검색 노출 설정을 바꾸지 못했습니다.")); return; }
        setSearchable(next);
    }

    async function showQr(url: string) {
        setQr(await QRCode.toDataURL(url, { width: 220, margin: 1 }));
    }

    async function createLink() {
        setBusy(true); setNotice(""); setNewLink(null);
        const { data, error } = await createClient().rpc("create_profile_share_link", { p_days: days, p_label: label || null });
        setBusy(false);
        if (error || !data) { setNotice(friendlyDbError(error, "공유 링크를 만들지 못했습니다.")); return; }
        const d = data as { token: string; handle: string };
        setNewLink(publicProfileUrl(origin, d.handle, d.token));
        setLabel("");
        load();
    }

    async function revoke(id: string) {
        setNotice("");
        const { error } = await createClient().rpc("revoke_profile_share_link", { p_id: id });
        if (error) { setNotice("링크를 회수하지 못했습니다."); return; }
        load();
    }

    function copy(text: string, key: string) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        });
    }

    if (!user) return null;
    const now = Date.now();
    const active = links.filter(l => !l.revoked_at && new Date(l.expires_at).getTime() > now);
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

            {/* 공개 주소 · QR · 검색 노출 */}
            {publicUrl && (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <code className="text-xs tn-text bg-neutral-100 dark:bg-neutral-800 rounded-lg px-3 py-1.5 break-all">{publicUrl.replace(/^https?:\/\//, "")}</code>
                        <button onClick={() => copy(publicUrl, "public")} className="flex items-center gap-1 text-[11px] tn-text-sub border tn-border px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            {copied === "public" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} 주소 복사
                        </button>
                        <button onClick={() => showQr(publicUrl)} disabled={!isPublic} title={isPublic ? "" : "비공개일 때는 공유 링크로 QR을 만드세요"}
                            className="flex items-center gap-1 text-[11px] tn-text-sub border tn-border px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40">
                            <QrCode className="h-3 w-3" /> QR
                        </button>
                    </div>
                    <label className={`flex items-start gap-2 text-xs ${isPublic ? "tn-text" : "tn-text-sub opacity-60"}`}>
                        <input type="checkbox" checked={searchable} disabled={!isPublic} onChange={toggleSearchable} className="mt-0.5" />
                        <span>
                            <Search className="inline h-3 w-3 mr-1" />검색엔진(구글·네이버)에 내 프로필 노출
                            <span className="block tn-text-sub mt-0.5">끄면 주소를 아는 사람만 볼 수 있습니다. 공개일 때만 켤 수 있습니다.</span>
                        </span>
                    </label>
                </div>
            )}

            {qr && (
                <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
                    <img src={qr} alt="프로필 QR 코드" width={220} height={220} className="rounded-lg border tn-border bg-white p-2" />
                    <div className="flex gap-2">
                        <a href={qr} download={`profile-${handle}-qr.png`} className="text-[11px] tn-text-sub underline">이미지 저장</a>
                        <button onClick={() => setQr(null)} className="text-[11px] tn-text-sub underline">닫기</button>
                    </div>
                </div>
            )}

            {/* 기한 있는 공유 링크 */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold tn-text flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" /> 기한 있는 공유 링크</h3>
                <p className="text-[11px] tn-text-sub">지원·제안할 때처럼 특정 사람에게만 보여 줄 때 씁니다. 기한이 지나거나 회수하면 열리지 않습니다.</p>
                <div className="flex flex-wrap items-center gap-2">
                    <input value={label} onChange={e => setLabel(e.target.value.slice(0, 40))} placeholder="메모 (예: ○○사 지원)"
                        className="text-xs tn-text bg-transparent border tn-border rounded-lg px-3 py-1.5 w-48" />
                    <select value={days} onChange={e => setDays(Number(e.target.value))} className="text-xs tn-text bg-transparent border tn-border rounded-lg px-2 py-1.5">
                        {DAY_OPTIONS.map(o => <option key={o.days} value={o.days}>{o.label}</option>)}
                    </select>
                    <button onClick={createLink} disabled={busy || !handle}
                        className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 disabled:opacity-40">
                        링크 만들기
                    </button>
                </div>
                {newLink && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-2">
                        <p className="text-[11px] text-amber-800 dark:text-amber-300">이 주소는 지금 한 번만 보입니다. 복사해 두세요.</p>
                        <code className="block text-[11px] break-all tn-text">{newLink}</code>
                        <div className="flex gap-2">
                            <button onClick={() => copy(newLink, "new")} className="flex items-center gap-1 text-[11px] tn-text-sub border tn-border px-2.5 py-1 rounded-lg">
                                {copied === "new" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} 복사
                            </button>
                            <button onClick={() => showQr(newLink)} className="flex items-center gap-1 text-[11px] tn-text-sub border tn-border px-2.5 py-1 rounded-lg">
                                <QrCode className="h-3 w-3" /> QR
                            </button>
                        </div>
                    </div>
                )}
                {active.length > 0 && (
                    <ul className="divide-y tn-border border tn-border rounded-xl">
                        {active.map(l => (
                            <li key={l.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                                <div className="min-w-0">
                                    <p className="tn-text truncate">{l.label || "메모 없음"}</p>
                                    <p className="text-[11px] tn-text-sub">{fmtDate(l.expires_at)}까지 · 열람 {l.view_count}회</p>
                                </div>
                                <button onClick={() => revoke(l.id)} className="flex items-center gap-1 text-[11px] text-red-600 hover:underline shrink-0">
                                    <Trash2 className="h-3 w-3" /> 회수
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 방문 수 */}
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
