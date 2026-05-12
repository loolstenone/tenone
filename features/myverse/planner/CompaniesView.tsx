"use client";

// 회사 엔티티 관리 페이지 — Person/Company 정규화 Stage 2
// myverse_companies 테이블 CRUD + 회사별 소속 인원 미리보기 + 자동완성으로 충분하지 않을 때 manual 관리.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Plus, Search, Loader2, Pencil, Trash2, ArrowLeft, Globe, Users as UsersIcon, X } from "lucide-react";

interface Company {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    logo_url: string | null;
    notes: string | null;
    color: string | null;
    is_archived: boolean;
    contact_count: number;
    created_at: string;
    updated_at: string;
}

interface ContactBrief {
    id: string;
    name: string;
    email: string | null;
    title: string | null;
}

export function CompaniesView() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [editing, setEditing] = useState<Company | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [members, setMembers] = useState<Record<string, ContactBrief[]>>({});
    const [loadingMembers, setLoadingMembers] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/myverse/companies", { cache: "no-store" });
        if (res.ok) {
            const d = await res.json();
            setCompanies(d.companies ?? []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = useMemo(() => {
        if (!q.trim()) return companies;
        const lc = q.toLowerCase();
        return companies.filter(c =>
            c.name.toLowerCase().includes(lc) ||
            (c.domain ?? "").toLowerCase().includes(lc) ||
            (c.industry ?? "").toLowerCase().includes(lc)
        );
    }, [companies, q]);

    async function loadMembers(companyId: string) {
        if (members[companyId]) return; // already loaded
        setLoadingMembers(true);
        try {
            const res = await fetch("/api/myverse/contacts", { cache: "no-store" });
            if (res.ok) {
                const d = await res.json();
                const brief = (d.contacts ?? [])
                    .filter((c: { company_id?: string | null }) => c.company_id === companyId)
                    .map((c: { id: string; name: string; email: string | null; title: string | null }) => ({
                        id: c.id, name: c.name, email: c.email, title: c.title,
                    }));
                setMembers(prev => ({ ...prev, [companyId]: brief }));
            }
        } finally {
            setLoadingMembers(false);
        }
    }

    function toggleExpand(id: string) {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            loadMembers(id);
        }
    }

    async function saveCompany(payload: Partial<Company> & { name: string }) {
        setSaving(true);
        try {
            const method = editing ? "PATCH" : "POST";
            const body = editing ? { id: editing.id, ...payload } : payload;
            const res = await fetch("/api/myverse/companies", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setEditing(null);
                setShowNew(false);
                await load();
            }
        } finally {
            setSaving(false);
        }
    }

    async function deleteCompany(id: string) {
        await fetch(`/api/myverse/companies?id=${id}`, { method: "DELETE" });
        setConfirmDeleteId(null);
        await load();
    }

    const totalContacts = useMemo(() => companies.reduce((s, c) => s + c.contact_count, 0), [companies]);

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-10 py-6 md:py-12">
            {/* 헤더 */}
            <div className="mb-6">
                <Link
                    href="/myverse/app/contacts"
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#6366F1] mb-3 transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" /> 연락처로 돌아가기
                </Link>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-[#6366F1]" />
                        <h1 className="font-serif text-2xl md:text-3xl text-neutral-900">회사</h1>
                        {!loading && (
                            <span className="text-xs text-neutral-500 ml-1">
                                {companies.length}개 회사 · 총 {totalContacts}명 소속
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setShowNew(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5]"
                    >
                        <Plus className="h-3.5 w-3.5" /> 새 회사
                    </button>
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                    연락처의 회사 정보를 엔티티로 관리합니다. 연락처 폼의 회사 입력으로 자동 추가도 가능합니다.
                </p>
            </div>

            {/* 검색 */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="회사명·도메인·산업군 검색"
                    className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#6366F1]"
                />
            </div>

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-dashed border-neutral-300 rounded-xl py-12 text-center">
                    <Building2 className="h-8 w-8 mx-auto text-neutral-200 mb-3" />
                    <p className="text-neutral-500">
                        {q ? `"${q}"에 해당하는 회사가 없습니다.` : "아직 등록된 회사가 없습니다."}
                    </p>
                    {!q && (
                        <p className="text-xs text-neutral-400 mt-1">새 회사를 추가하거나, 연락처 폼에서 회사를 입력하면 자동 생성됩니다.</p>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
                    {filtered.map(c => (
                        <div key={c.id}>
                            <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
                                {c.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={c.logo_url} alt={c.name} className="h-9 w-9 rounded-lg object-cover bg-neutral-100" />
                                ) : (
                                    <div
                                        className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                                        style={{ backgroundColor: c.color ?? "#6366F1" }}
                                    >
                                        {c.name[0]?.toUpperCase() ?? "?"}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => toggleExpand(c.id)}
                                    className="flex-1 min-w-0 text-left"
                                >
                                    <p className="text-sm font-medium text-neutral-900 truncate">{c.name}</p>
                                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                                        {c.domain && (
                                            <span className="inline-flex items-center gap-0.5">
                                                <Globe className="h-2.5 w-2.5" />
                                                {c.domain}
                                            </span>
                                        )}
                                        {c.industry && <span>· {c.industry}</span>}
                                        <span className="inline-flex items-center gap-0.5">
                                            <UsersIcon className="h-2.5 w-2.5" />
                                            {c.contact_count}명
                                        </span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setEditing(c)}
                                    className="p-1.5 text-neutral-400 hover:text-[#6366F1] rounded"
                                    title="편집"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteId(c.id)}
                                    className="p-1.5 text-neutral-400 hover:text-rose-500 rounded"
                                    title="삭제 (소속 연락처는 분리됨)"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            {expandedId === c.id && (
                                <div className="px-4 pb-3 pl-16 bg-neutral-50/60">
                                    {loadingMembers && !members[c.id] ? (
                                        <p className="text-[11px] text-neutral-400 py-2">불러오는 중…</p>
                                    ) : (members[c.id]?.length ?? 0) === 0 ? (
                                        <p className="text-[11px] text-neutral-400 py-2">소속된 연락처가 없습니다.</p>
                                    ) : (
                                        <ul className="space-y-1 py-2">
                                            {members[c.id].map(m => (
                                                <li key={m.id} className="flex items-center gap-2 text-xs text-neutral-700">
                                                    <span className="font-medium">{m.name}</span>
                                                    {m.title && <span className="text-neutral-500">· {m.title}</span>}
                                                    {m.email && <span className="text-neutral-400 font-mono text-[10px]">· {m.email}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* New/Edit 모달 */}
            {(showNew || editing) && (
                <CompanyEditModal
                    initial={editing}
                    saving={saving}
                    onClose={() => { setShowNew(false); setEditing(null); }}
                    onSave={saveCompany}
                />
            )}

            {/* 삭제 확인 */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmDeleteId(null)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-sm font-semibold text-neutral-900">회사 삭제</h3>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                            소속된 연락처({companies.find(c => c.id === confirmDeleteId)?.contact_count ?? 0}명)의 회사 연결만 해제됩니다.
                            연락처 자체는 유지됩니다.
                        </p>
                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs px-3 py-1.5 border border-neutral-200 rounded-md text-neutral-600 hover:bg-neutral-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => deleteCompany(confirmDeleteId)}
                                className="text-xs px-3 py-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CompanyEditModal({
    initial,
    saving,
    onClose,
    onSave,
}: {
    initial: Company | null;
    saving: boolean;
    onClose: () => void;
    onSave: (payload: { name: string; domain?: string | null; industry?: string | null; logo_url?: string | null; notes?: string | null; color?: string | null }) => void;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [domain, setDomain] = useState(initial?.domain ?? "");
    const [industry, setIndustry] = useState(initial?.industry ?? "");
    const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");
    const [notes, setNotes] = useState(initial?.notes ?? "");
    const [color, setColor] = useState(initial?.color ?? "#6366F1");

    const canSave = !!name.trim() && !saving;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">{initial ? "회사 편집" : "새 회사"}</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">회사명 *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ten:One"
                            className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">도메인</label>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="tenone.biz"
                            className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1] font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">산업군</label>
                        <input
                            type="text"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="브랜드 컨설팅"
                            className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">로고 URL</label>
                        <input
                            type="url"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://…"
                            className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1] font-mono text-xs"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">컬러</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={color ?? "#6366F1"}
                                onChange={(e) => setColor(e.target.value)}
                                className="h-9 w-12 border border-neutral-200 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={color ?? ""}
                                onChange={(e) => setColor(e.target.value)}
                                placeholder="#6366F1"
                                className="flex-1 text-sm font-mono border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1]"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">메모</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1] resize-none"
                        />
                    </div>
                </div>
                <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
                    <button onClick={onClose} className="text-xs px-3 py-1.5 border border-neutral-200 rounded-md text-neutral-600 hover:bg-neutral-50">취소</button>
                    <button
                        onClick={() => canSave && onSave({
                            name: name.trim(),
                            domain: domain.trim() || null,
                            industry: industry.trim() || null,
                            logo_url: logoUrl.trim() || null,
                            notes: notes.trim() || null,
                            color: color || null,
                        })}
                        disabled={!canSave}
                        className="text-xs px-3 py-1.5 bg-[#6366F1] text-white rounded-md hover:bg-[#4F46E5] disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}
