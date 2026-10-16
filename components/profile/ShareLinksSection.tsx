"use client";

/**
 * 기한 있는 공유 링크 + QR (본인만) — 유니버스 프로필·브랜드 프로필 공용
 * 토큰은 만들 때 한 번만 보이고 DB에는 해시만 (create_profile_share_link). 회수 = revoke_profile_share_link
 * scope = 'universe' 또는 브랜드 slug — 그 범위 프로필에서만 열린다
 */
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Link2, QrCode, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyDbError } from "@/lib/profile/public-profile";

interface ShareLink { id: string; label: string | null; expires_at: string; revoked_at: string | null; view_count: number }

export interface PanelTone {
    text: string;
    sub: string;
    border: string;
    /** 주 버튼 */
    button: { className: string; style?: React.CSSProperties };
    field: string;
}

const DAY_OPTIONS = [1, 7, 30];

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

/** QR 이미지 + 저장 — 공개 주소·공유 링크 모두 */
export function QrBox({ url, fileName, tone, onClose }: { url: string; fileName: string; tone: PanelTone; onClose: () => void }) {
    const [src, setSrc] = useState<string | null>(null);
    useEffect(() => { QRCode.toDataURL(url, { width: 220, margin: 1 }).then(setSrc).catch(() => setSrc(null)); }, [url]);
    if (!src) return null;
    return (
        <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
            <img src={src} alt="프로필 QR 코드" width={220} height={220} className="rounded-lg bg-white p-2" />
            <div className="flex gap-3">
                <a href={src} download={fileName} className={`text-[11px] underline ${tone.sub}`}>이미지 저장</a>
                <button onClick={onClose} className={`text-[11px] underline ${tone.sub}`}>닫기</button>
            </div>
        </div>
    );
}

export function ShareLinksSection({ scope, buildUrl, tone, onChanged }: {
    scope: string;
    /** 핸들·토큰 → 열 주소 */
    buildUrl: (handle: string, token: string) => string;
    tone: PanelTone;
    onChanged?: () => void;
}) {
    const [links, setLinks] = useState<ShareLink[]>([]);
    const [days, setDays] = useState(7);
    const [label, setLabel] = useState("");
    const [newLink, setNewLink] = useState<{ id: string; url: string } | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        const { data } = await createClient().from("profile_share_links")
            .select("id, label, expires_at, revoked_at, view_count")
            .eq("scope", scope).order("created_at", { ascending: false }).limit(20);
        setLinks((data ?? []) as ShareLink[]);
    }, [scope]);
    useEffect(() => { load(); }, [load]);

    async function create() {
        setBusy(true); setNotice(""); setNewLink(null); setQrUrl(null);
        const { data, error } = await createClient().rpc("create_profile_share_link", { p_days: days, p_label: label || null, p_scope: scope });
        setBusy(false);
        if (error || !data) { setNotice(friendlyDbError(error, "공유 링크를 만들지 못했습니다.")); return; }
        const d = data as { id: string; token: string; handle: string };
        setNewLink({ id: d.id, url: buildUrl(d.handle, d.token) });
        setLabel("");
        load(); onChanged?.();
    }

    async function revoke(id: string) {
        setNotice("");
        const { error } = await createClient().rpc("revoke_profile_share_link", { p_id: id });
        if (error) { setNotice("링크를 회수하지 못했습니다."); return; }
        // 방금 만든 링크를 회수했으면 '한 번만 보이는' 주소·QR도 치운다 (닫힌 주소가 남아 있으면 아직 쓸 수 있는 것처럼 보인다)
        if (newLink?.id === id) { setNewLink(null); setQrUrl(null); }
        load();
    }

    const now = Date.now();
    const active = links.filter(l => !l.revoked_at && new Date(l.expires_at).getTime() > now);

    return (
        <div className="space-y-3">
            <h3 className={`text-xs font-semibold flex items-center gap-1.5 ${tone.text}`}><Link2 className="h-3.5 w-3.5" /> 기한 있는 공유 링크</h3>
            <p className={`text-[11px] leading-relaxed ${tone.sub}`}>지원·제안처럼 특정 사람에게만 보여 줄 때. 비공개여도 열리고, 기한이 지나거나 회수하면 닫힙니다.</p>
            {notice && <p role="alert" className="text-xs text-red-500">{notice}</p>}
            <div className="space-y-2">
                <input value={label} onChange={e => setLabel(e.target.value.slice(0, 40))} placeholder="메모 (예: ○○사 지원)"
                    className={`w-full text-xs rounded-lg px-3 py-2 ${tone.field}`} />
                <div className="flex gap-2">
                    {/* 옵션 목록은 브라우저가 흰 바탕으로 그린다 — 글자색을 직접 정해야 어두운 화면에서도 보인다 */}
                    <select value={days} onChange={e => setDays(Number(e.target.value))} className={`text-xs rounded-lg px-2 py-2 ${tone.field}`}>
                        {DAY_OPTIONS.map(d => <option key={d} value={d} className="bg-white text-neutral-900">{d}일 동안</option>)}
                    </select>
                    <button onClick={create} disabled={busy} className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-40 ${tone.button.className}`} style={tone.button.style}>
                        링크 만들기
                    </button>
                </div>
            </div>
            {newLink && (
                <div className="rounded-xl border border-amber-400/60 p-3 space-y-2">
                    <p className="text-[11px] text-amber-500">이 주소는 지금 한 번만 보입니다. 복사해 두세요.</p>
                    <code className={`block text-[11px] break-all ${tone.text}`}>{newLink.url}</code>
                    <div className="flex gap-2">
                        <button onClick={() => navigator.clipboard.writeText(newLink.url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
                            className={`flex items-center gap-1 text-[11px] border px-2.5 py-1 rounded-lg ${tone.border} ${tone.sub}`}>
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} 복사
                        </button>
                        <button onClick={() => setQrUrl(newLink.url)} className={`flex items-center gap-1 text-[11px] border px-2.5 py-1 rounded-lg ${tone.border} ${tone.sub}`}>
                            <QrCode className="h-3 w-3" /> QR
                        </button>
                    </div>
                </div>
            )}
            {qrUrl && <QrBox url={qrUrl} fileName="profile-share-qr.png" tone={tone} onClose={() => setQrUrl(null)} />}
            {active.length > 0 && (
                <ul className={`divide-y border rounded-xl ${tone.border}`}>
                    {active.map(l => (
                        <li key={l.id} className={`flex items-center justify-between gap-3 px-3 py-2 text-xs border-inherit ${tone.border}`}>
                            <div className="min-w-0">
                                <p className={`truncate ${tone.text}`}>{l.label || "메모 없음"}</p>
                                <p className={`text-[11px] ${tone.sub}`}>{fmtDate(l.expires_at)}까지 · 열람 {l.view_count}회</p>
                            </div>
                            <button onClick={() => revoke(l.id)} className="flex items-center gap-1 text-[11px] text-red-500 hover:underline shrink-0">
                                <Trash2 className="h-3 w-3" /> 회수
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/** 최근 7일·30일 방문 수 (하루 집계만) */
export function useProfileViews(scope: string) {
    const [views, setViews] = useState<{ d7: number; d30: number } | null>(null);
    useEffect(() => {
        const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        createClient().from("profile_view_daily").select("day, views").eq("scope", scope).gte("day", since)
            .then(({ data }: { data: { day: string; views: number }[] | null }) => {
                const rows = (data ?? []) as { day: string; views: number }[];
                setViews({
                    d30: rows.reduce((n, r) => n + r.views, 0),
                    d7: rows.filter(r => r.day >= weekAgo).reduce((n, r) => n + r.views, 0),
                });
            });
    }, [scope]);
    return views;
}
