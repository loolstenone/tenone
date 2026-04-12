"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface IntakeData {
    id?: string;
    status: string;
    // A. 브랜드 기본 정보
    brand_name: string;
    launch_date: string;
    category: string;
    usp: string[];
    website_url: string;
    annual_revenue: string;
    // B. 경쟁 환경
    competitors: string[];
    why_lose: string;
    why_win: string;
    market_position: string;
    // C. 소비자·판매 현황
    target_demographic: string;
    discovery_channels: string;
    purchase_comparison: string;
    sales_channels: string;
    customer_count: string;
    top_complaints: string[];
    // D. 디지털 현황
    blog_urls: string[];
    sns_accounts: Record<string, string>;
    store_urls: string[];
    existing_research: string;
    current_marketing: string;
    wiki_registered: boolean;
    // E. 기대 사항
    analysis_goals: string;
    budget_range: string;
    desired_timeline: string;
}

const EMPTY: IntakeData = {
    status: "pending",
    brand_name: "", launch_date: "", category: "", usp: ["", "", ""],
    website_url: "", annual_revenue: "",
    competitors: ["", "", ""], why_lose: "", why_win: "", market_position: "",
    target_demographic: "", discovery_channels: "", purchase_comparison: "",
    sales_channels: "", customer_count: "", top_complaints: ["", "", ""],
    blog_urls: [""], sns_accounts: {}, store_urls: [""],
    existing_research: "", current_marketing: "", wiki_registered: false,
    analysis_goals: "", budget_range: "", desired_timeline: "",
};

function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">{label}</label>
            {desc && <p className="text-[10px] text-neutral-400">{desc}</p>}
            {children}
        </div>
    );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-neutral-200 text-sm focus:outline-none focus:border-amber-400"
        />
    );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
    return (
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 py-2 border border-neutral-200 text-sm focus:outline-none focus:border-amber-400 resize-none"
        />
    );
}

export default function IntakePage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const productId = params.productId as string;

    const [data, setData] = useState<IntakeData>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [shareToken, setShareToken] = useState<string | null>(null);

    const load = useCallback(async () => {
        const { data: existing } = await supabase
            .from("bg_intake_responses")
            .select("*")
            .eq("product_id", productId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (existing) {
            setData({ ...EMPTY, ...existing });
            setShareToken(existing.token);
        } else {
            // 제품 정보로 프리필
            const { data: prod } = await supabase
                .from("bg_products")
                .select("name, category, competitors, target_keywords, site_url, bg_clients(name)")
                .eq("id", productId)
                .single();
            if (prod) {
                const comps = (prod.competitors as string[] | null) ?? [];
                setData(d => ({
                    ...d,
                    brand_name: prod.name || "",
                    category: prod.category || "",
                    competitors: comps.length > 0 ? [...comps, ...Array(Math.max(0, 3 - comps.length)).fill("")] : ["", "", ""],
                    website_url: (prod.site_url as string) || "",
                }));
            }
        }
        setLoading(false);
    }, [supabase, productId]);

    useEffect(() => { load(); }, [load]);

    const update = (field: keyof IntakeData, value: unknown) => {
        setData(d => ({ ...d, [field]: value }));
        setSaved(false);
    };

    const updateArray = (field: keyof IntakeData, idx: number, value: string) => {
        setData(d => {
            const arr = [...(d[field] as string[])];
            arr[idx] = value;
            return { ...d, [field]: arr };
        });
        setSaved(false);
    };

    const save = async () => {
        setSaving(true);
        const token = shareToken || crypto.randomUUID().slice(0, 12);

        const payload = {
            product_id: productId,
            token,
            status: data.status === "pending" ? "sent" : data.status,
            brand_name: data.brand_name,
            launch_date: data.launch_date,
            category: data.category,
            usp: data.usp.filter(u => u),
            website_url: data.website_url,
            annual_revenue: data.annual_revenue,
            competitors: data.competitors.filter(c => c),
            why_lose: data.why_lose,
            why_win: data.why_win,
            market_position: data.market_position,
            target_demographic: data.target_demographic,
            discovery_channels: data.discovery_channels,
            purchase_comparison: data.purchase_comparison,
            sales_channels: data.sales_channels,
            customer_count: data.customer_count,
            top_complaints: data.top_complaints.filter(c => c),
            blog_urls: data.blog_urls.filter(u => u),
            sns_accounts: data.sns_accounts,
            store_urls: data.store_urls.filter(u => u),
            existing_research: data.existing_research,
            current_marketing: data.current_marketing,
            wiki_registered: data.wiki_registered,
            analysis_goals: data.analysis_goals,
            budget_range: data.budget_range,
            desired_timeline: data.desired_timeline,
        };

        if (data.id) {
            await supabase.from("bg_intake_responses").update(payload).eq("id", data.id);
        } else {
            const { data: inserted } = await supabase.from("bg_intake_responses").insert(payload).select("id").single();
            if (inserted) setData(d => ({ ...d, id: inserted.id }));
        }

        setShareToken(token);
        setSaving(false);
        setSaved(true);
    };

    const copyShareLink = () => {
        if (shareToken) {
            navigator.clipboard.writeText(`${window.location.origin}/brandgravity/intake/${shareToken}`);
        }
    };

    if (loading) return <div className="flex-1 flex items-center justify-center text-sm text-neutral-400">로딩 중...</div>;

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PageHeader title="사전 질문서" description="Brand Gravity 분석을 위한 클라이언트 사전 조사">
                <button onClick={() => router.push(`/intra/gravity/${productId}`)}
                    className="flex items-center gap-1.5 text-xs border border-neutral-200 px-3 py-1.5 text-neutral-600 hover:border-neutral-400 transition-colors">
                    <ArrowLeft className="w-3 h-3" /> 돌아가기
                </button>
            </PageHeader>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* 공유 링크 */}
                    {shareToken && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-xs">
                            <ExternalLink className="w-3 h-3 text-amber-500" />
                            <span className="text-neutral-600">클라이언트 공유 링크:</span>
                            <code className="bg-white px-2 py-0.5 border text-neutral-700 flex-1 truncate">
                                {`${typeof window !== "undefined" ? window.location.origin : ""}/brandgravity/intake/${shareToken}`}
                            </code>
                            <button onClick={copyShareLink} className="text-amber-600 hover:text-amber-800">
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {/* A. 브랜드 기본 정보 */}
                    <section>
                        <h3 className="text-sm font-semibold text-neutral-800 mb-4 pb-2 border-b">A. 브랜드 기본 정보</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="브랜드명 + 제품명"><Input value={data.brand_name} onChange={v => update("brand_name", v)} /></Field>
                            <Field label="런칭 시점"><Input value={data.launch_date} onChange={v => update("launch_date", v)} placeholder="예: 2018년" /></Field>
                            <Field label="카테고리"><Input value={data.category} onChange={v => update("category", v)} placeholder="예: 여성위생용품" /></Field>
                            <Field label="공식 웹사이트 URL"><Input value={data.website_url} onChange={v => update("website_url", v)} placeholder="https://" /></Field>
                            <div className="col-span-2">
                                <Field label="핵심 차별화 포인트 (USP)" desc="3가지">
                                    <div className="space-y-2">
                                        {data.usp.map((u, i) => (
                                            <Input key={i} value={u} onChange={v => updateArray("usp", i, v)} placeholder={`USP ${i + 1}`} />
                                        ))}
                                    </div>
                                </Field>
                            </div>
                            <Field label="연매출 규모 (선택)"><Input value={data.annual_revenue} onChange={v => update("annual_revenue", v)} placeholder="예: 17억원" /></Field>
                        </div>
                    </section>

                    {/* B. 경쟁 환경 */}
                    <section>
                        <h3 className="text-sm font-semibold text-neutral-800 mb-4 pb-2 border-b">B. 경쟁 환경</h3>
                        <div className="space-y-4">
                            <Field label="직접 경쟁사 (3~5개)">
                                <div className="grid grid-cols-3 gap-2">
                                    {data.competitors.map((c, i) => (
                                        <Input key={i} value={c} onChange={v => updateArray("competitors", i, v)} placeholder={`경쟁사 ${i + 1}`} />
                                    ))}
                                </div>
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="경쟁에서 지는 이유"><Textarea value={data.why_lose} onChange={v => update("why_lose", v)} /></Field>
                                <Field label="경쟁에서 이기는 이유"><Textarea value={data.why_win} onChange={v => update("why_win", v)} /></Field>
                            </div>
                            <Field label="시장 내 위치">
                                <div className="flex gap-2">
                                    {["leader", "challenger", "niche", "new"].map(pos => (
                                        <button key={pos} onClick={() => update("market_position", pos)}
                                            className={`px-3 py-1.5 text-xs border transition-colors ${data.market_position === pos ? "bg-amber-500 text-white border-amber-500" : "border-neutral-200 text-neutral-500 hover:border-neutral-400"}`}>
                                            {{ leader: "선두", challenger: "도전", niche: "니치", new: "신규" }[pos]}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        </div>
                    </section>

                    {/* C. 소비자·판매 현황 */}
                    <section>
                        <h3 className="text-sm font-semibold text-neutral-800 mb-4 pb-2 border-b">C. 소비자·판매 현황</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="주 고객 연령대·성별"><Input value={data.target_demographic} onChange={v => update("target_demographic", v)} placeholder="예: 35~45세 여성" /></Field>
                            <Field label="고객이 제품을 어떻게 알게 되나?"><Input value={data.discovery_channels} onChange={v => update("discovery_channels", v)} /></Field>
                            <Field label="구매 전 뭘 비교하나?"><Input value={data.purchase_comparison} onChange={v => update("purchase_comparison", v)} /></Field>
                            <Field label="주요 판매 채널"><Input value={data.sales_channels} onChange={v => update("sales_channels", v)} placeholder="예: 쿠팡 60%, 네이버 30%" /></Field>
                            <Field label="기존 고객 수 / 재구매율"><Input value={data.customer_count} onChange={v => update("customer_count", v)} /></Field>
                            <div className="col-span-2">
                                <Field label="고객 불만 TOP 3">
                                    <div className="grid grid-cols-3 gap-2">
                                        {data.top_complaints.map((c, i) => (
                                            <Input key={i} value={c} onChange={v => updateArray("top_complaints", i, v)} placeholder={`불만 ${i + 1}`} />
                                        ))}
                                    </div>
                                </Field>
                            </div>
                        </div>
                    </section>

                    {/* D. 디지털 현황 */}
                    <section>
                        <h3 className="text-sm font-semibold text-neutral-800 mb-4 pb-2 border-b">D. 디지털 현황</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="블로그/콘텐츠 URL"><Input value={data.blog_urls[0] || ""} onChange={v => updateArray("blog_urls", 0, v)} placeholder="https://" /></Field>
                            <Field label="네이버/쿠팡 스토어 URL"><Input value={data.store_urls[0] || ""} onChange={v => updateArray("store_urls", 0, v)} placeholder="https://" /></Field>
                            <Field label="현재 마케팅 활동"><Textarea value={data.current_marketing} onChange={v => update("current_marketing", v)} rows={2} /></Field>
                            <Field label="기존 소비자 조사 자료"><Textarea value={data.existing_research} onChange={v => update("existing_research", v)} rows={2} /></Field>
                            <Field label="위키피디아/나무위키 등록 여부">
                                <button onClick={() => update("wiki_registered", !data.wiki_registered)}
                                    className={`px-3 py-1.5 text-xs border transition-colors ${data.wiki_registered ? "bg-emerald-500 text-white border-emerald-500" : "border-neutral-200 text-neutral-500"}`}>
                                    {data.wiki_registered ? "등록됨" : "미등록"}
                                </button>
                            </Field>
                        </div>
                    </section>

                    {/* E. 기대 사항 */}
                    <section>
                        <h3 className="text-sm font-semibold text-neutral-800 mb-4 pb-2 border-b">E. 기대 사항</h3>
                        <div className="space-y-4">
                            <Field label="이번 분석에서 알고 싶은 것"><Textarea value={data.analysis_goals} onChange={v => update("analysis_goals", v)} /></Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="예산 범위"><Input value={data.budget_range} onChange={v => update("budget_range", v)} /></Field>
                                <Field label="희망 납기"><Input value={data.desired_timeline} onChange={v => update("desired_timeline", v)} placeholder="예: 1주일" /></Field>
                            </div>
                        </div>
                    </section>

                    {/* 저장 버튼 */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                        <button onClick={save} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 transition-colors">
                            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                            {saving ? "저장 중..." : saved ? "저장 완료" : "저장"}
                        </button>
                        {saved && <span className="text-[11px] text-emerald-600">클라이언트 공유 링크가 생성되었습니다</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
