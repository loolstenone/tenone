"use client";

/**
 * 인트라 — HeRo 기업 서비스 신청 (2026-10-13)
 * 팀 진단 · 인재 풀 리포트 · 헤드헌팅 — 사이트 메뉴명 그대로 (lib/hero/business-services.ts)
 */
import { useCallback, useEffect, useState } from "react";
import { BUSINESS_REQUEST_STATUS, BUSINESS_SERVICES, type BusinessServiceKey } from "@/lib/hero/business-services";

interface Req {
    id: string; service: BusinessServiceKey; company: string; contact: string; email: string | null; phone: string | null;
    role: string | null; detail: Record<string, string>; status: string; admin_note: string | null; created_at: string;
}

export default function IntraHeroBusinessRequestsPage() {
    const [items, setItems] = useState<Req[]>([]);
    const [service, setService] = useState<"all" | BusinessServiceKey>("all");
    const [status, setStatus] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [note, setNote] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/intra/hero/business-requests?service=${service}&status=${status}`);
        const d = await res.json();
        setItems(d.items ?? []);
        setLoading(false);
    }, [service, status]);

    // 인트라 메뉴(사이트 메뉴명 그대로 — 팀 진단·인재 풀 리포트·헤드헌팅)가 ?service= 로 들어온다
    useEffect(() => {
        const q = new URLSearchParams(window.location.search).get("service");
        if (q && q in BUSINESS_SERVICES) setService(q as BusinessServiceKey);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function save(id: string, body: Record<string, unknown>) {
        await fetch("/api/intra/hero/business-requests", {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }),
        });
        await load();
    }

    const tab = (on: boolean) => `px-3 py-1.5 rounded text-sm font-medium transition-colors ${on ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">{service === "all" ? "기업 서비스 신청" : `${BUSINESS_SERVICES[service].label} 신청`}</h1>
                <p className="text-neutral-400 text-sm mt-1">팀 진단 · 인재 풀 리포트 · 헤드헌팅 신청. 신청자에게 이메일로 연락해 진행합니다.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
                <button className={tab(service === "all")} onClick={() => setService("all")}>전체</button>
                {Object.values(BUSINESS_SERVICES).map(s => <button key={s.key} className={tab(service === s.key)} onClick={() => setService(s.key)}>{s.label}</button>)}
            </div>
            <div className="flex gap-2 flex-wrap">
                <button className={tab(status === "all")} onClick={() => setStatus("all")}>전체 상태</button>
                {Object.entries(BUSINESS_REQUEST_STATUS).map(([k, l]) => <button key={k} className={tab(status === k)} onClick={() => setStatus(k)}>{l}</button>)}
            </div>

            {loading ? (
                <div className="text-neutral-500 text-sm py-12 text-center">불러오는 중...</div>
            ) : items.length === 0 ? (
                <div className="text-neutral-500 text-sm py-12 text-center">신청이 없습니다.</div>
            ) : (
                <div className="space-y-2">
                    {items.map(r => (
                        <div key={r.id} className="bg-neutral-900 border border-neutral-800 rounded-lg">
                            <button className="w-full text-left p-4" onClick={() => { setOpenId(openId === r.id ? null : r.id); setNote(r.admin_note ?? ""); }}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-xs text-neutral-500">{BUSINESS_SERVICES[r.service]?.label} · {BUSINESS_REQUEST_STATUS[r.status] ?? r.status}</p>
                                        <p className="font-medium text-white truncate">{r.company} — {r.contact}{r.role && ` (${r.role})`}</p>
                                    </div>
                                    <span className="text-xs text-neutral-500 shrink-0">{new Date(r.created_at).toLocaleDateString("ko-KR")}</span>
                                </div>
                            </button>
                            {openId === r.id && (
                                <div className="px-4 pb-4 pt-4 border-t border-neutral-800 space-y-3 text-sm">
                                    <p className="text-neutral-400">연락: <span className="text-neutral-200">{r.email} {r.phone && `· ${r.phone}`}</span></p>
                                    {BUSINESS_SERVICES[r.service]?.fields.map(f => r.detail?.[f.key] ? (
                                        <div key={f.key}>
                                            <p className="text-xs text-neutral-500">{f.label}</p>
                                            <p className="text-neutral-200 whitespace-pre-line">{r.detail[f.key]}</p>
                                        </div>
                                    ) : null)}
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.entries(BUSINESS_REQUEST_STATUS).map(([k, l]) => (
                                            <button key={k} className={tab(r.status === k)} onClick={() => save(r.id, { status: k })}>{l}</button>
                                        ))}
                                    </div>
                                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="운영 메모"
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white text-sm" />
                                    <button onClick={() => save(r.id, { adminNote: note })} className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded text-sm hover:bg-neutral-700">메모 저장</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
