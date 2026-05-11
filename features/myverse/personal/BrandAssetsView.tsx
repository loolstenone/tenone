"use client";

// 브랜드 자산 관리 페이지 — 퍼스널 영역
// 로고/팔레트/타이포/태그라인/미션/이미지/링크 SSOT
// 명함·포트폴리오·@handle 페이지에서 공유 참조

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Star, ExternalLink, Loader2, Palette, Type, Image as ImageIcon, Link as LinkIcon, Sparkles, Target, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

interface BrandAsset {
    id: string;
    member_id: string;
    type: AssetType;
    title: string;
    description: string | null;
    file_url: string | null;
    thumbnail_url: string | null;
    data: Record<string, unknown>;
    category: string | null;
    order_index: number;
    is_primary: boolean;
    visibility: "private" | "friends" | "public";
    show_on_card: boolean;
    show_on_portfolio: boolean;
    created_at: string;
    updated_at: string;
}

type AssetType = "logo" | "palette" | "typography" | "image" | "template" | "link" | "tagline" | "mission";

const TYPE_META: Record<AssetType, { label: string; icon: typeof Palette; description: string }> = {
    logo:       { label: "로고",        icon: ImageIcon, description: "메인 로고, 서브 로고, 워드마크 등" },
    palette:    { label: "컬러 팔레트", icon: Palette,   description: "브랜드 컬러 — 메인·서브·강조" },
    typography: { label: "타이포그래피", icon: Type,     description: "헤딩·본문 폰트, 사이즈 스케일" },
    tagline:    { label: "태그라인",    icon: Sparkles,  description: "한 줄 슬로건·캐치프레이즈" },
    mission:    { label: "미션·비전",   icon: Target,    description: "내가 전하고 싶은 핵심 메시지" },
    image:      { label: "브랜드 이미지", icon: ImageIcon, description: "키비주얼·일러스트·패턴" },
    link:       { label: "외부 링크",   icon: LinkIcon,  description: "포트폴리오·SNS·웹사이트" },
    template:   { label: "템플릿",      icon: ImageIcon, description: "명함·문서·SNS 포맷" },
};

const TYPE_ORDER: AssetType[] = ["logo", "palette", "typography", "tagline", "mission", "image", "link", "template"];

export function BrandAssetsView() {
    const [assets, setAssets] = useState<BrandAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingType, setAddingType] = useState<AssetType | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/myverse/brand-assets");
        if (res.ok) {
            const json = await res.json();
            setAssets(json.assets ?? []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { void load(); }, [load]);

    async function createAsset(type: AssetType, draft: Partial<BrandAsset>) {
        const res = await fetch("/api/myverse/brand-assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, ...draft }),
        });
        if (res.ok) {
            await load();
            setAddingType(null);
        } else {
            const j = await res.json().catch(() => ({}));
            alert(`추가 실패: ${j.error ?? res.status}`);
        }
    }

    async function updateAsset(id: string, patch: Partial<BrandAsset>) {
        // optimistic
        setAssets(prev => prev.map(a => a.id === id ? { ...a, ...patch } as BrandAsset : a));
        const res = await fetch("/api/myverse/brand-assets", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...patch }),
        });
        if (!res.ok) await load();
    }

    async function deleteAsset(id: string) {
        if (!confirm("이 자산을 삭제할까요?")) return;
        setAssets(prev => prev.filter(a => a.id !== id));
        await fetch(`/api/myverse/brand-assets?id=${id}`, { method: "DELETE" });
    }

    const grouped: Record<AssetType, BrandAsset[]> = {
        logo: [], palette: [], typography: [], image: [], template: [], link: [], tagline: [], mission: [],
    };
    for (const a of assets) grouped[a.type]?.push(a);

    if (loading) {
        return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <header className="mb-6">
                <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest text-neutral-400">
                    <Sparkles className="h-3 w-3" /> Brand Assets
                </div>
                <h1 className="text-2xl font-serif text-neutral-900 myverse-dark:text-neutral-100 mb-1">브랜드 자산</h1>
                <p className="text-sm text-neutral-500">
                    로고·컬러·문구를 한 곳에 모아두면 명함·포트폴리오·내 페이지에서 자동으로 사용됩니다.
                </p>
            </header>

            <div className="space-y-6">
                {TYPE_ORDER.map(type => {
                    const meta = TYPE_META[type];
                    const items = grouped[type];
                    const Icon = meta.icon;
                    return (
                        <section key={type} className="bg-white myverse-dark:bg-[#0D0D15] border border-neutral-200 myverse-dark:border-white/8 rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 myverse-dark:text-neutral-100">
                                        <Icon className="h-4 w-4 text-[#6366F1]" />
                                        {meta.label}
                                        {items.length > 0 && (
                                            <span className="text-[10px] text-neutral-400 font-normal">{items.length}</span>
                                        )}
                                    </h2>
                                    <p className="text-[11px] text-neutral-400 mt-0.5">{meta.description}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAddingType(type)}
                                    className="shrink-0 text-xs text-[#6366F1] hover:bg-[#6366F1]/10 rounded-md px-2 py-1 flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> 추가
                                </button>
                            </div>

                            {/* 자산 목록 */}
                            {items.length === 0 ? (
                                <p className="text-xs text-neutral-400 py-3 text-center bg-neutral-50 myverse-dark:bg-white/5 rounded-md">
                                    아직 없습니다. 위 [추가] 버튼으로 만드세요.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {items.map(asset => (
                                        <AssetCard
                                            key={asset.id}
                                            asset={asset}
                                            onUpdate={patch => updateAsset(asset.id, patch)}
                                            onDelete={() => deleteAsset(asset.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* 추가 폼 */}
                            {addingType === type && (
                                <AddForm
                                    type={type}
                                    onSubmit={draft => createAsset(type, draft)}
                                    onCancel={() => setAddingType(null)}
                                />
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}

/** 개별 자산 카드 — 타입별 표시 + visibility/대표 토글 */
function AssetCard({ asset, onUpdate, onDelete }: {
    asset: BrandAsset;
    onUpdate: (patch: Partial<BrandAsset>) => void;
    onDelete: () => void;
}) {
    return (
        <div className="border border-neutral-200 myverse-dark:border-white/8 rounded-lg p-3 flex items-start gap-3">
            {/* 좌측 프리뷰 */}
            <AssetPreview asset={asset} />

            {/* 중앙 정보 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-medium text-neutral-900 myverse-dark:text-neutral-100 truncate">{asset.title}</h3>
                    {asset.is_primary && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-px rounded bg-amber-50 text-amber-600">
                            대표
                        </span>
                    )}
                </div>
                {asset.description && (
                    <p className="text-xs text-neutral-500 line-clamp-2">{asset.description}</p>
                )}
                {asset.type === "link" && asset.data && typeof (asset.data as { url?: string }).url === "string" && (
                    <a
                        href={(asset.data as { url: string }).url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-[11px] text-[#6366F1] hover:underline"
                    >
                        {(asset.data as { url: string }).url}
                        <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                )}
            </div>

            {/* 우측 액션 */}
            <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={() => onUpdate({ is_primary: !asset.is_primary })}
                        title={asset.is_primary ? "대표 해제" : "대표 지정"}
                        className={`p-1 rounded transition-colors ${
                            asset.is_primary ? "text-amber-500 hover:bg-amber-50" : "text-neutral-300 hover:text-amber-500"
                        }`}
                    >
                        <Star className="h-3.5 w-3.5" fill={asset.is_primary ? "currentColor" : "none"} />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="p-1 rounded text-neutral-300 hover:text-rose-500 transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
                {/* 노출 토글 */}
                <div className="flex items-center gap-1.5">
                    <ToggleChip
                        active={asset.show_on_card}
                        label="명함"
                        onClick={() => onUpdate({ show_on_card: !asset.show_on_card })}
                    />
                    <ToggleChip
                        active={asset.show_on_portfolio}
                        label="포폴"
                        onClick={() => onUpdate({ show_on_portfolio: !asset.show_on_portfolio })}
                    />
                </div>
            </div>
        </div>
    );
}

function ToggleChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                active
                    ? "bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30"
                    : "text-neutral-300 border-neutral-200 hover:text-neutral-500"
            }`}
        >
            {label}
        </button>
    );
}

/** 타입별 시각 프리뷰 */
function AssetPreview({ asset }: { asset: BrandAsset }) {
    if (asset.type === "palette") {
        const colors = (asset.data?.colors as Array<{ hex?: string }> | undefined) ?? [];
        return (
            <div className="shrink-0 flex gap-0.5 h-12 w-12 rounded overflow-hidden border border-neutral-200">
                {colors.length > 0 ? (
                    colors.slice(0, 4).map((c, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: c.hex ?? "#ccc" }} />
                    ))
                ) : (
                    <div className="flex-1 bg-neutral-100 flex items-center justify-center text-[8px] text-neutral-400">
                        empty
                    </div>
                )}
            </div>
        );
    }
    if (asset.file_url || asset.thumbnail_url) {
        return (
            <div className="shrink-0 h-12 w-12 rounded overflow-hidden border border-neutral-200 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.thumbnail_url ?? asset.file_url ?? ""} alt="" className="w-full h-full object-cover" />
            </div>
        );
    }
    if (asset.type === "tagline" || asset.type === "mission") {
        const text = (asset.data?.text as string | undefined) ?? asset.description ?? "";
        return (
            <div className="shrink-0 h-12 w-12 rounded bg-gradient-to-br from-[#6366F1]/10 to-[#A855F7]/10 flex items-center justify-center text-[18px]">
                {asset.type === "tagline" ? "✦" : "◎"}
            </div>
        );
    }
    if (asset.type === "typography") {
        return (
            <div className="shrink-0 h-12 w-12 rounded border border-neutral-200 bg-neutral-50 flex items-center justify-center text-lg font-bold text-neutral-700">
                Aa
            </div>
        );
    }
    return (
        <div className="shrink-0 h-12 w-12 rounded border border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-neutral-300" />
        </div>
    );
}

/** 추가 폼 — 타입에 따라 다른 입력 UI */
function AddForm({ type, onSubmit, onCancel }: {
    type: AssetType;
    onSubmit: (draft: Partial<BrandAsset>) => void;
    onCancel: () => void;
}) {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [text, setText] = useState("");
    const [colors, setColors] = useState<string[]>(["#6366F1"]);
    const [fileUrl, setFileUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    async function handleFileUpload(file: File) {
        if (!user?.id) return;
        setUploading(true);
        try {
            const supabase = createClient();
            const ext = file.name.split(".").pop() ?? "png";
            const filePath = `${user.id}/${type}-${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from("brand-assets").upload(filePath, file, {
                upsert: true, contentType: file.type,
            });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from("brand-assets").getPublicUrl(filePath);
            setFileUrl(publicUrl);
        } catch (e) {
            console.error("[brand-assets upload]", e);
            alert("업로드 실패");
        } finally {
            setUploading(false);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        const draft: Partial<BrandAsset> = { title: title.trim(), description: description || null };
        if (type === "link") {
            draft.data = { url } as unknown as Record<string, unknown>;
        } else if (type === "tagline" || type === "mission") {
            draft.data = { text } as unknown as Record<string, unknown>;
        } else if (type === "palette") {
            draft.data = { colors: colors.map(hex => ({ hex })) } as unknown as Record<string, unknown>;
        } else if (type === "logo" || type === "image" || type === "template") {
            draft.file_url = fileUrl || null;
        }
        onSubmit(draft);
    }

    return (
        <form onSubmit={submit} className="mt-3 p-3 border border-dashed border-[#6366F1]/30 rounded-lg space-y-2 bg-[#6366F1]/5">
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={`${TYPE_META[type].label} 이름`}
                autoFocus
                required
                className="w-full text-sm border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1] bg-white"
            />
            <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="설명 (선택)"
                className="w-full text-xs border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1] bg-white"
            />

            {/* 타입별 추가 입력 */}
            {type === "link" && (
                <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1] bg-white"
                />
            )}
            {(type === "tagline" || type === "mission") && (
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={type === "tagline" ? "한 줄로 표현하면…" : "내가 전하고 싶은 핵심 메시지"}
                    rows={2}
                    className="w-full text-xs border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1] bg-white resize-none"
                />
            )}
            {type === "palette" && (
                <div className="flex flex-wrap gap-1.5">
                    {colors.map((c, i) => (
                        <div key={i} className="flex items-center gap-1 bg-white border border-neutral-200 rounded px-1.5 py-0.5">
                            <input
                                type="color"
                                value={c}
                                onChange={e => setColors(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                                className="h-5 w-5 cursor-pointer border-none p-0"
                            />
                            <input
                                type="text"
                                value={c}
                                onChange={e => setColors(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                                className="text-[11px] font-mono w-16 focus:outline-none"
                            />
                            {colors.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setColors(prev => prev.filter((_, j) => j !== i))}
                                    className="text-neutral-300 hover:text-rose-500"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setColors(prev => [...prev, "#000000"])}
                        className="text-[11px] text-[#6366F1] hover:bg-[#6366F1]/10 rounded px-2 py-0.5"
                    >
                        + 색
                    </button>
                </div>
            )}
            {(type === "logo" || type === "image" || type === "template") && (
                <div className="space-y-2">
                    {/* 파일 업로드 */}
                    <label className={`flex items-center gap-2 cursor-pointer text-xs px-2 py-2 border border-dashed border-neutral-300 rounded-md hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/svg+xml,image/webp,image/gif"
                            className="hidden"
                            onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) void handleFileUpload(f);
                            }}
                        />
                        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        <span className="text-neutral-600">{uploading ? "업로드 중…" : "이미지 파일 업로드 (최대 5MB)"}</span>
                    </label>
                    {/* URL 입력 또는 업로드 결과 표시 */}
                    <input
                        type="url"
                        value={fileUrl}
                        onChange={e => setFileUrl(e.target.value)}
                        placeholder="또는 URL 직접 입력"
                        className="w-full text-xs border border-neutral-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-[#6366F1] bg-white"
                    />
                    {/* 미리보기 */}
                    {fileUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fileUrl} alt="" className="max-h-20 rounded border border-neutral-200 bg-white" />
                    )}
                </div>
            )}

            <div className="flex justify-end gap-1.5">
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs px-3 py-1 rounded text-neutral-500 hover:bg-neutral-100"
                >
                    취소
                </button>
                <button
                    type="submit"
                    className="text-xs px-3 py-1 rounded bg-[#6366F1] text-white hover:bg-[#4F46E5]"
                >
                    추가
                </button>
            </div>
        </form>
    );
}
