"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { MyProfileCard } from "@/components/MyProfileCard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    FileText, Bookmark, Settings, LogOut, ChevronRight, Eye,
    ShoppingBag, Plus, Pencil, Trash2, Package,
} from "lucide-react";
import { CapabilitySection } from "@/components/CapabilitySection";
import {
    getMyCreatorProfile,
    getProductsByCreator,
    deleteProduct,
    type JakkaCreator,
    type JakkaProduct,
} from "@/lib/supabase/jakka";

interface MyPost {
    id: string; board: string; title: string; view_count: number; comment_count: number; created_at: string;
}

export default function JakkaMyPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const [myPosts, setMyPosts] = useState<MyPost[]>([]);
    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [myProducts, setMyProducts] = useState<JakkaProduct[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"posts" | "products" | "bookmarks" | "settings">("posts");

    useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/login"); }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!user?.id) return;
        fetch(`/api/board/posts?site=jakka&limit=20&status=published`).then(r => r.json()).then(d => setMyPosts(d.posts || [])).catch(() => {});
        getMyCreatorProfile(user.authId ?? user.id).then(setCreator);
    }, [user?.id]);

    useEffect(() => {
        if (activeTab !== "products" || !creator) return;
        setProductsLoading(true);
        getProductsByCreator(creator.id, true).then((data) => {
            setMyProducts(data);
            setProductsLoading(false);
        });
    }, [activeTab, creator]);

    async function handleDeleteProduct(productId: string) {
        if (!confirm("상품을 삭제하면 복구할 수 없습니다. 삭제할까요?")) return;
        setDeletingId(productId);
        const ok = await deleteProduct(productId);
        if (ok) setMyProducts((prev) => prev.filter((p) => p.id !== productId));
        setDeletingId(null);
    }

    if (isLoading || !isAuthenticated) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950">
            <div className="h-6 w-6 border-2 border-[#D4D4D4]/20 border-t-[#D4D4D4] rounded-full animate-spin" />
        </div>
    );

    const tabs = [
        { id: "posts" as const, label: "내 게시글", icon: FileText, count: myPosts.length },
        ...(creator ? [{ id: "products" as const, label: "내 상품", icon: ShoppingBag, count: undefined }] : []),
        { id: "bookmarks" as const, label: "북마크", icon: Bookmark, count: 0 },
        { id: "settings" as const, label: "설정", icon: Settings },
    ];

    const statusLabel: Record<string, string> = {
        active: "판매 중",
        sold_out: "품절",
        hidden: "숨김",
    };
    const statusColor: Record<string, string> = {
        active: "text-green-600",
        sold_out: "text-neutral-400",
        hidden: "text-amber-600",
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-neutral-950 text-neutral-100">
            <div className="max-w-4xl mx-auto">
                <MyProfileCard accentColor="#D4D4D4" siteBadge="Jakka" />
                {user?.id && <CapabilitySection memberId={user.id} brandId="jakka" className="mb-6" />}

                <div className="flex items-center gap-1 mb-8 border-b border-neutral-800 overflow-x-auto scrollbar-none">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`shrink-0 flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${activeTab === tab.id ? "border-[#D4D4D4] text-[#D4D4D4]" : "border-transparent text-neutral-500 hover:text-neutral-400"}`}>
                            <tab.icon className="h-4 w-4" /> {tab.label}
                            {tab.count !== undefined && <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-600">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {activeTab === "posts" && (
                    <div className="divide-y divide-neutral-800">
                        {myPosts.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500">
                                <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">아직 작성한 게시글이 없습니다.</p>
                            </div>
                        ) : myPosts.map(post => (
                            <div key={post.id} className="py-4 flex items-center justify-between hover:opacity-80 cursor-pointer">
                                <div>
                                    <p className="font-medium text-sm">{post.title}</p>
                                    <div className="flex gap-3 mt-1 text-xs text-neutral-500">
                                        <span>{post.board}</span>
                                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.view_count}</span>
                                        <span>{post.created_at?.substring(0, 10)}</span>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-neutral-600" />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "products" && (
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-sm text-neutral-400">{myProducts.length}개 상품</p>
                            <Link
                                href="/jakka/market/upload"
                                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#D4D4D4] border border-[#D4D4D4]/40 px-3 py-1.5 hover:border-[#D4D4D4] transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                새 상품 등록
                            </Link>
                        </div>

                        {productsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 bg-neutral-800 animate-pulse" />
                                ))}
                            </div>
                        ) : myProducts.length === 0 ? (
                            <div className="py-16 text-center text-neutral-500">
                                <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm mb-4">등록된 상품이 없습니다.</p>
                                <Link
                                    href="/jakka/market/upload"
                                    className="text-[12px] text-[#D4D4D4] underline underline-offset-2"
                                >
                                    첫 상품 등록하기
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-800">
                                {myProducts.map((product) => (
                                    <div key={product.id} className="py-4 flex items-center gap-3">
                                        {/* 썸네일 */}
                                        <div className="w-14 h-14 shrink-0 bg-neutral-800 overflow-hidden">
                                            {product.thumb_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={product.thumb_url} alt={product.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-neutral-600" />
                                                </div>
                                            )}
                                        </div>

                                        {/* 정보 */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-neutral-100 truncate">{product.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-neutral-500">{product.category}</span>
                                                <span className="text-neutral-700">·</span>
                                                <span className={`text-xs font-bold ${statusColor[product.status] ?? "text-neutral-400"}`}>
                                                    {statusLabel[product.status] ?? product.status}
                                                </span>
                                                {product.stock !== null && (
                                                    <span className="text-xs text-neutral-500">재고 {product.stock}개</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                {product.currency === "ETH"
                                                    ? `${product.price} ETH`
                                                    : `${Number(product.price).toLocaleString()}원`}
                                                {product.sold_count > 0 && ` · ${product.sold_count}개 판매`}
                                            </p>
                                        </div>

                                        {/* 액션 */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Link
                                                href={`/jakka/market/${product.id}`}
                                                className="p-2 text-neutral-500 hover:text-neutral-300 transition-colors"
                                                title="상세 보기"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={`/jakka/market/edit/${product.id}`}
                                                className="p-2 text-neutral-500 hover:text-neutral-300 transition-colors"
                                                title="수정"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                disabled={deletingId === product.id}
                                                className="p-2 text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-40"
                                                title="삭제"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "bookmarks" && (
                    <div className="py-16 text-center text-neutral-500">
                        <Bookmark className="h-8 w-8 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">북마크가 없습니다.</p>
                    </div>
                )}
                {activeTab === "settings" && (
                    <div className="space-y-4">
                        <button onClick={() => { logout(); router.push("/"); }}
                            className="w-full flex items-center gap-3 p-4 rounded-lg bg-neutral-800 text-red-400 hover:opacity-80 transition-opacity">
                            <LogOut className="h-5 w-5" /><span className="text-sm">로그아웃</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
