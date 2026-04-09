"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Check, X } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface BgClient {
    id: string;
    name: string;
    industry: string | null;
    created_at: string;
}

interface BgProduct {
    id: string;
    client_id: string;
    name: string;
    category: string;
    competitors: string[];
    target_keywords: string[];
    created_at: string;
}

const CATEGORIES = [
    "화장품/뷰티", "식품/음료", "패션/의류", "IT/가전", "건강/헬스케어",
    "교육", "금융", "여행/레저", "홈/인테리어", "자동차", "기타",
];

export default function GravityClientsPage() {
    const supabase = createClient();
    const router = useRouter();

    const [clients, setClients] = useState<BgClient[]>([]);
    const [products, setProducts] = useState<BgProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedClient, setExpandedClient] = useState<string | null>(null);

    // 클라이언트 추가 폼
    const [showClientForm, setShowClientForm] = useState(false);
    const [newClient, setNewClient] = useState({ name: "", industry: "" });
    const [savingClient, setSavingClient] = useState(false);

    // 제품 추가 폼
    const [showProductForm, setShowProductForm] = useState<string | null>(null); // client_id
    const [newProduct, setNewProduct] = useState({
        name: "", category: "", competitors: "", target_keywords: ""
    });
    const [savingProduct, setSavingProduct] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const [cRes, pRes] = await Promise.all([
            supabase.from("bg_clients").select("id, name, industry, created_at").order("created_at", { ascending: false }),
            supabase.from("bg_products").select("id, client_id, name, category, competitors, target_keywords, created_at").order("created_at", { ascending: false }),
        ]);
        setClients((cRes.data ?? []) as BgClient[]);
        setProducts((pRes.data ?? []).map((p: {
            id: string; client_id: string; name: string; category: string;
            competitors: string[] | null; target_keywords: string[] | null; created_at: string;
        }) => ({
            ...p,
            competitors: p.competitors ?? [],
            target_keywords: p.target_keywords ?? [],
        })));
        setLoading(false);
    }, [supabase]);

    useEffect(() => { load(); }, [load]);

    const addClient = async () => {
        if (!newClient.name.trim()) return;
        setSavingClient(true);
        const { error } = await supabase.from("bg_clients").insert({
            name: newClient.name.trim(),
            industry: newClient.industry.trim() || null,
        });
        setSavingClient(false);
        if (!error) {
            setNewClient({ name: "", industry: "" });
            setShowClientForm(false);
            await load();
        }
    };

    const addProduct = async (clientId: string) => {
        if (!newProduct.name.trim() || !newProduct.category) return;
        setSavingProduct(true);
        const { error } = await supabase.from("bg_products").insert({
            client_id: clientId,
            name: newProduct.name.trim(),
            category: newProduct.category,
            competitors: newProduct.competitors.split(",").map(s => s.trim()).filter(Boolean),
            target_keywords: newProduct.target_keywords.split(",").map(s => s.trim()).filter(Boolean),
        });
        setSavingProduct(false);
        if (!error) {
            setNewProduct({ name: "", category: "", competitors: "", target_keywords: "" });
            setShowProductForm(null);
            await load();
        }
    };

    const deleteClient = async (id: string) => {
        if (!confirm("클라이언트와 연결된 모든 제품이 삭제됩니다. 계속하시겠습니까?")) return;
        await supabase.from("bg_products").delete().eq("client_id", id);
        await supabase.from("bg_clients").delete().eq("id", id);
        await load();
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("제품을 삭제하시겠습니까?")) return;
        await supabase.from("bg_products").delete().eq("id", id);
        await load();
    };

    const clientProducts = (clientId: string) => products.filter(p => p.client_id === clientId);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PageHeader
                title="클라이언트 관리"
                description="Brand Gravity 클라이언트 및 제품 등록"
            >
                <button
                    onClick={() => router.push("/intra/gravity")}
                    className="text-xs border border-neutral-200 px-3 py-1.5 text-neutral-600 hover:border-neutral-400 transition-colors"
                >
                    ← 현황판
                </button>
                <button
                    onClick={() => setShowClientForm(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
                >
                    <Plus className="w-3 h-3" /> 클라이언트 추가
                </button>
            </PageHeader>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">

                    {/* 클라이언트 추가 폼 */}
                    {showClientForm && (
                        <div className="border border-amber-200 bg-amber-50 p-5">
                            <p className="text-sm font-semibold text-neutral-700 mb-4">새 클라이언트</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">회사명 *</label>
                                    <input
                                        value={newClient.name}
                                        onChange={e => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="예: 아모레퍼시픽"
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">업종</label>
                                    <input
                                        value={newClient.industry}
                                        onChange={e => setNewClient(prev => ({ ...prev, industry: e.target.value }))}
                                        placeholder="예: 화장품/뷰티"
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={addClient}
                                    disabled={savingClient || !newClient.name.trim()}
                                    className="flex items-center gap-1.5 text-xs px-4 py-2 bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-40 transition-colors"
                                >
                                    <Check className="w-3 h-3" /> {savingClient ? "저장 중..." : "저장"}
                                </button>
                                <button
                                    onClick={() => { setShowClientForm(false); setNewClient({ name: "", industry: "" }); }}
                                    className="flex items-center gap-1.5 text-xs px-4 py-2 border border-neutral-200 text-neutral-600 hover:border-neutral-400 transition-colors"
                                >
                                    <X className="w-3 h-3" /> 취소
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">로딩 중...</div>
                    ) : clients.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-neutral-200">
                            <p className="text-sm text-neutral-400 mb-3">등록된 클라이언트가 없습니다</p>
                            <button
                                onClick={() => setShowClientForm(true)}
                                className="text-xs text-amber-600 hover:underline"
                            >
                                첫 클라이언트 추가 →
                            </button>
                        </div>
                    ) : (
                        clients.map(client => {
                            const cProducts = clientProducts(client.id);
                            const isExpanded = expandedClient === client.id;
                            return (
                                <div key={client.id} className="border border-neutral-200 bg-white">
                                    {/* 클라이언트 헤더 */}
                                    <div className="flex items-center justify-between px-5 py-4">
                                        <button
                                            onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                                            className="flex items-center gap-3 flex-1 text-left"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-900">{client.name}</p>
                                                <p className="text-xs text-neutral-400">
                                                    {client.industry && <span>{client.industry} · </span>}
                                                    제품 {cProducts.length}개
                                                </p>
                                            </div>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400 ml-auto" /> : <ChevronDown className="w-4 h-4 text-neutral-400 ml-auto" />}
                                        </button>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => {
                                                    setExpandedClient(client.id);
                                                    setShowProductForm(client.id);
                                                }}
                                                className="flex items-center gap-1 text-[10px] px-2 py-1 border border-neutral-200 text-neutral-500 hover:border-neutral-400 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> 제품
                                            </button>
                                            <button
                                                onClick={() => deleteClient(client.id)}
                                                className="p-1.5 text-neutral-300 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 제품 목록 + 추가 폼 */}
                                    {isExpanded && (
                                        <div className="border-t border-neutral-100">
                                            {/* 제품 추가 폼 */}
                                            {showProductForm === client.id && (
                                                <div className="p-4 border-b border-neutral-100 bg-amber-50">
                                                    <p className="text-xs font-semibold text-neutral-600 mb-3">새 제품/브랜드</p>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div>
                                                            <label className="text-[10px] text-neutral-400 block mb-1">제품/브랜드명 *</label>
                                                            <input
                                                                value={newProduct.name}
                                                                onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                                                                placeholder="예: 라네즈"
                                                                className="w-full border border-neutral-200 px-2.5 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-neutral-400 block mb-1">카테고리 *</label>
                                                            <select
                                                                value={newProduct.category}
                                                                onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                                                                className="w-full border border-neutral-200 px-2.5 py-1.5 text-sm focus:outline-none focus:border-amber-400 bg-white"
                                                            >
                                                                <option value="">선택</option>
                                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-neutral-400 block mb-1">경쟁사 (쉼표 구분)</label>
                                                            <input
                                                                value={newProduct.competitors}
                                                                onChange={e => setNewProduct(prev => ({ ...prev, competitors: e.target.value }))}
                                                                placeholder="예: 헤라, 설화수, 이니스프리"
                                                                className="w-full border border-neutral-200 px-2.5 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-neutral-400 block mb-1">타겟 키워드 (쉼표 구분)</label>
                                                            <input
                                                                value={newProduct.target_keywords}
                                                                onChange={e => setNewProduct(prev => ({ ...prev, target_keywords: e.target.value }))}
                                                                placeholder="예: 수분크림, 올인원, 보습"
                                                                className="w-full border border-neutral-200 px-2.5 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => addProduct(client.id)}
                                                            disabled={savingProduct || !newProduct.name.trim() || !newProduct.category}
                                                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-40 transition-colors"
                                                        >
                                                            <Check className="w-3 h-3" /> {savingProduct ? "저장 중..." : "저장"}
                                                        </button>
                                                        <button
                                                            onClick={() => { setShowProductForm(null); setNewProduct({ name: "", category: "", competitors: "", target_keywords: "" }); }}
                                                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-neutral-200 text-neutral-500 hover:border-neutral-400 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" /> 취소
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {cProducts.length === 0 ? (
                                                <div className="px-5 py-6 text-center">
                                                    <p className="text-xs text-neutral-400">등록된 제품이 없습니다</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-neutral-50">
                                                    {cProducts.map(p => (
                                                        <div key={p.id} className="flex items-start justify-between px-5 py-3 hover:bg-neutral-50 group">
                                                            <div
                                                                className="flex-1 cursor-pointer"
                                                                onClick={() => router.push(`/intra/gravity/${p.id}`)}
                                                            >
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="text-sm font-medium text-neutral-800 group-hover:text-amber-600 transition-colors">
                                                                        {p.name}
                                                                    </p>
                                                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{p.category}</span>
                                                                </div>
                                                                {p.competitors.length > 0 && (
                                                                    <p className="text-[11px] text-neutral-400">
                                                                        경쟁사: {p.competitors.join(", ")}
                                                                    </p>
                                                                )}
                                                                {p.target_keywords.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                        {p.target_keywords.map(k => (
                                                                            <span key={k} className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600">{k}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => deleteProduct(p.id)}
                                                                className="p-1.5 text-neutral-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
