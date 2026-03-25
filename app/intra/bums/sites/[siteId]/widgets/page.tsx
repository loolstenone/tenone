"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
type BumsWidget = { displayStyle: "list" | "card" | "thumbnail"; sortBy: "latest" | "views" | "recommended" };
import { ArrowLeft, Plus, Trash2, Eye, LayoutGrid, List, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";

const inputClass = "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none bg-white rounded";
const labelClass = "text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5";

const displayStyleLabel: Record<string, string> = { list: "리스트", card: "카드", thumbnail: "썸네일" };
const displayStyleIcon: Record<string, typeof List> = { list: List, card: LayoutGrid, thumbnail: ImageIcon };
const sortByLabel: Record<string, string> = { latest: "최신순", views: "조회순", recommended: "추천순" };

export default function WidgetsPage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = use(params);
    const router = useRouter();
    const site: any = null;
    const boards: any[] = [];
    const widgets: any[] = [];
    const addWidget = (_w: any) => {};
    const deleteWidget = (_id: string) => {};
    const getPostsForWidget = (_boardId: string, _count: number, _sort: string): any[] => [];
    const siteWidgets = widgets.filter((w: any) => boards.some((b: any) => b.id === w.boardId));

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: "",
        boardId: "",
        displayCount: 5,
        displayStyle: "list" as BumsWidget["displayStyle"],
        sortBy: "latest" as BumsWidget["sortBy"],
        showDate: true,
        showAuthor: true,
        showImage: false,
    });

    if (!site) {
        return <div className="py-20 text-center text-neutral-400">사이트를 찾을 수 없습니다</div>;
    }

    const handleAdd = () => {
        if (!form.name || !form.boardId) return;
        addWidget({
            id: `widget-${Date.now()}`,
            ...form,
        });
        setForm({ name: "", boardId: "", displayCount: 5, displayStyle: "list", sortBy: "latest", showDate: true, showAuthor: true, showImage: false });
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button onClick={() => router.push(`/intra/bums/sites/${siteId}`)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 mb-4 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> {site.name}
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">위젯 관리</h2>
                        <p className="text-sm text-neutral-500 mt-1">게시판 글을 사이트 페이지에 노출하는 위젯</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800 transition-colors">
                        <Plus className="h-4 w-4" /> 위젯 추가
                    </button>
                </div>
            </div>

            {/* Add Widget Form */}
            {showForm && (
                <div className="border border-neutral-200 bg-white p-6 rounded-lg space-y-4">
                    <h3 className="text-sm font-semibold">새 위젯</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className={labelClass}>위젯 이름</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="예: 최신 공지사항" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>게시판</label>
                            <select value={form.boardId} onChange={e => setForm({ ...form, boardId: e.target.value })}
                                className={inputClass}>
                                <option value="">게시판 선택</option>
                                {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>표시 수</label>
                            <input type="number" min={1} max={20} value={form.displayCount}
                                onChange={e => setForm({ ...form, displayCount: parseInt(e.target.value) || 5 })}
                                className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>스타일</label>
                            <select value={form.displayStyle} onChange={e => setForm({ ...form, displayStyle: e.target.value as BumsWidget["displayStyle"] })}
                                className={inputClass}>
                                {Object.entries(displayStyleLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>정렬</label>
                            <select value={form.sortBy} onChange={e => setForm({ ...form, sortBy: e.target.value as BumsWidget["sortBy"] })}
                                className={inputClass}>
                                {Object.entries(sortByLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.showDate} onChange={e => setForm({ ...form, showDate: e.target.checked })} />
                            날짜 표시
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.showAuthor} onChange={e => setForm({ ...form, showAuthor: e.target.checked })} />
                            작성자 표시
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.showImage} onChange={e => setForm({ ...form, showImage: e.target.checked })} />
                            이미지 표시
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleAdd}
                            className="bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800 transition-colors">
                            추가
                        </button>
                        <button onClick={() => setShowForm(false)}
                            className="border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 transition-colors">
                            취소
                        </button>
                    </div>
                </div>
            )}

            {/* Widget List */}
            {siteWidgets.length === 0 && !showForm ? (
                <div className="border border-neutral-200 bg-white px-6 py-12 text-center text-neutral-400 text-sm rounded-lg">
                    등록된 위젯이 없습니다. 위젯을 추가하여 게시판 글을 사이트에 노출하세요.
                </div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {siteWidgets.map(widget => {
                        const board = boards.find(b => b.id === widget.boardId);
                        const posts = getPostsForWidget(widget.boardId, widget.displayCount, widget.sortBy);
                        const StyleIcon = displayStyleIcon[widget.displayStyle] || List;

                        return (
                            <div key={widget.id} className="border border-neutral-200 bg-white rounded-lg overflow-hidden">
                                {/* 위젯 헤더 */}
                                <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                                    <div className="flex items-center gap-2">
                                        <StyleIcon className="h-4 w-4 text-neutral-500" />
                                        <span className="font-medium text-sm">{widget.name}</span>
                                        <span className="text-xs text-neutral-400">({board?.name})</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-neutral-400 mr-2">
                                            {displayStyleLabel[widget.displayStyle]} · {sortByLabel[widget.sortBy]} · {widget.displayCount}개
                                        </span>
                                        <button onClick={() => deleteWidget(widget.id)}
                                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* 위젯 미리보기 */}
                                <div className="p-4">
                                    {posts.length === 0 ? (
                                        <p className="text-xs text-neutral-400 text-center py-4">표시할 게시글이 없습니다</p>
                                    ) : widget.displayStyle === "list" ? (
                                        <div className="space-y-2">
                                            {posts.map(p => (
                                                <div key={p.id} className="flex items-center justify-between text-sm py-1 border-b border-neutral-50 last:border-0">
                                                    <span className="truncate flex-1">{p.title}</span>
                                                    <div className="flex items-center gap-3 text-xs text-neutral-400 shrink-0 ml-4">
                                                        {widget.showAuthor && <span>{p.authorName}</span>}
                                                        {widget.showDate && <span>{p.publishedAt ?? p.createdAt}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : widget.displayStyle === "card" ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {posts.map(p => (
                                                <div key={p.id} className="border border-neutral-100 rounded p-3">
                                                    {widget.showImage && (
                                                        <div className="aspect-video bg-neutral-100 rounded mb-2 flex items-center justify-center">
                                                            <ImageIcon className="h-5 w-5 text-neutral-300" />
                                                        </div>
                                                    )}
                                                    <p className="text-xs font-medium truncate">{p.title}</p>
                                                    {widget.showDate && <p className="text-[10px] text-neutral-400 mt-1">{p.publishedAt ?? p.createdAt}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2">
                                            {posts.map(p => (
                                                <div key={p.id} className="aspect-square bg-neutral-100 rounded flex items-center justify-center relative overflow-hidden">
                                                    <ImageIcon className="h-6 w-6 text-neutral-300" />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                                                        <p className="text-[9px] text-white truncate">{p.title}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
