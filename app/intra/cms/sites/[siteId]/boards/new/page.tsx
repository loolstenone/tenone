"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useCms } from "@/lib/cms-context";
import {
    BoardTypeInfo, type BoardType, type SkinType, type BoardPermissionLevel,
    type BoardVisibility, type SortOrder, type CmsBoard,
} from "@/types/cms";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";

const inputClass = "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none bg-white";
const labelClass = "text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5";
const sectionClass = "border border-neutral-200 bg-white p-6 space-y-4";

const allBoardTypes: BoardType[] = ['general', 'notice', 'gallery', 'video', 'faq', 'qna', 'commerce', 'recruit', 'event'];
const allSkinTypes: SkinType[] = ['list', 'card', 'gallery', 'video'];
const skinLabel: Record<SkinType, string> = { list: "리스트", card: "카드", gallery: "갤러리", video: "영상" };
const permissionOptions: { value: BoardPermissionLevel; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'member', label: '회원' },
    { value: 'intra', label: '인트라' },
    { value: 'staff', label: '스태프' },
    { value: 'admin', label: '관리자' },
];
const visibilityOptions: { value: BoardVisibility; label: string }[] = [
    { value: 'public', label: '공개' },
    { value: 'intra', label: '인트라 전용' },
    { value: 'staff', label: '스태프 전용' },
];
const sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'pinned-first', label: '고정글 우선' },
];

function toSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/[가-힣]+/g, (match) => match)
        .replace(/[^a-z0-9가-힣]+/g, "-")
        .replace(/^-|-$/g, "");
}

export default function CreateBoardPage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = use(params);
    const router = useRouter();
    const { addBoard } = useCms();

    const [form, setForm] = useState({
        name: "",
        slug: "",
        boardType: "general" as BoardType,
        skinType: "list" as SkinType,
        description: "",
        visibility: "public" as BoardVisibility,
        readPermission: "all" as BoardPermissionLevel,
        writePermission: "member" as BoardPermissionLevel,
        commentPermission: "member" as BoardPermissionLevel,
        allowComments: true,
        allowAttachments: true,
        allowSecretPost: false,
        allowSecretComment: false,
        allowScheduledPost: false,
        postsPerPage: 20,
        sortOrder: "latest" as SortOrder,
    });

    const handleNameChange = (name: string) => {
        setForm(p => ({ ...p, name, slug: toSlug(name) }));
    };

    const handleCreate = () => {
        if (!form.name.trim()) return;
        const now = new Date().toISOString().split("T")[0];
        const board: CmsBoard = {
            id: `board-${Date.now()}`,
            siteId,
            name: form.name,
            slug: form.slug || toSlug(form.name),
            description: form.description,
            boardType: form.boardType,
            skinType: form.skinType,
            visibility: form.visibility,
            readPermission: form.readPermission,
            writePermission: form.writePermission,
            commentPermission: form.commentPermission,
            allowComments: form.allowComments,
            allowAttachments: form.allowAttachments,
            allowSecretPost: form.allowSecretPost,
            allowSecretComment: form.allowSecretComment,
            allowScheduledPost: form.allowScheduledPost,
            useCategories: false,
            categories: [],
            postsPerPage: form.postsPerPage,
            sortOrder: form.sortOrder,
            listPermission: form.readPermission,
            options: {
                secretPostMode: 'optional', secretRequirePassword: false, secretHideTitle: false,
                secretRequirePasswordOnView: false, newBadgeDuration: 1, writeButtonDisplay: 'always',
                commentOrder: 'asc', allowFeaturedImage: true, allowTimeRestriction: false,
                authorDisplayType: 'nickname', titleTemplateLocked: false, bodyPlaceholder: '',
            },
            design: {
                showBoardName: true, showTotalCount: true, showProfileImage: true, showSearchBar: true, showLightbox: true,
                showAuthor: true, showDate: true, showNumber: true, showCategory: false, showViews: true,
                showCommentCount: true, showLikes: true, showShare: true, showPrint: true,
                rowsPerPage: 10, rowSpacing: 20, pinNoticeOnAllPages: false, titleFontSize: 14, metaFontSize: 12,
                layout: 'list-thumb',
            },
            createdAt: now,
            updatedAt: now,
        };
        addBoard(board);
        router.push(`/intra/cms/sites/${siteId}`);
    };

    const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
        <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" onClick={() => onChange(!checked)}
                className={clsx(
                    "relative w-9 h-5 rounded-full transition-colors",
                    checked ? "bg-neutral-900" : "bg-neutral-200"
                )}>
                <span className={clsx(
                    "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                    checked && "translate-x-4"
                )} />
            </button>
            <span className="text-sm text-neutral-700">{label}</span>
        </label>
    );

    return (
        <div className="space-y-6">
            <div>
                <button onClick={() => router.push(`/intra/cms/sites/${siteId}`)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 mb-4 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> 사이트로 돌아가기
                </button>
                <h2 className="text-2xl font-bold">게시판 만들기</h2>
                <p className="mt-1 text-sm text-neutral-500">새 게시판을 생성합니다</p>
            </div>

            {/* 기본 정보 */}
            <div className={sectionClass}>
                <h3 className="text-sm font-semibold mb-2">기본 정보</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>게시판 이름</label>
                        <input value={form.name} onChange={e => handleNameChange(e.target.value)}
                            placeholder="예: 뉴스룸" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>슬러그</label>
                        <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                            placeholder="자동 생성" className={inputClass} />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>설명</label>
                    <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="게시판 설명 (선택)" className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>게시판 유형</label>
                    <select value={form.boardType}
                        onChange={e => setForm(p => ({ ...p, boardType: e.target.value as BoardType }))}
                        className={inputClass}>
                        {allBoardTypes.map(bt => (
                            <option key={bt} value={bt}>{BoardTypeInfo[bt].label} — {BoardTypeInfo[bt].description}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>스킨 타입</label>
                    <div className="flex gap-3">
                        {allSkinTypes.map(st => (
                            <label key={st} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="skinType" value={st}
                                    checked={form.skinType === st}
                                    onChange={() => setForm(p => ({ ...p, skinType: st }))}
                                    className="accent-neutral-900" />
                                <span className="text-sm">{skinLabel[st]}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* 접근 설정 */}
            <div className={sectionClass}>
                <h3 className="text-sm font-semibold mb-2">접근 설정</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>공개 범위</label>
                        <select value={form.visibility}
                            onChange={e => setForm(p => ({ ...p, visibility: e.target.value as BoardVisibility }))}
                            className={inputClass}>
                            {visibilityOptions.map(v => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>읽기 권한</label>
                        <select value={form.readPermission}
                            onChange={e => setForm(p => ({ ...p, readPermission: e.target.value as BoardPermissionLevel }))}
                            className={inputClass}>
                            {permissionOptions.map(v => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>쓰기 권한</label>
                        <select value={form.writePermission}
                            onChange={e => setForm(p => ({ ...p, writePermission: e.target.value as BoardPermissionLevel }))}
                            className={inputClass}>
                            {permissionOptions.map(v => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>댓글 권한</label>
                        <select value={form.commentPermission}
                            onChange={e => setForm(p => ({ ...p, commentPermission: e.target.value as BoardPermissionLevel }))}
                            className={inputClass}>
                            {permissionOptions.map(v => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 기능 설정 */}
            <div className={sectionClass}>
                <h3 className="text-sm font-semibold mb-2">기능 설정</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Toggle checked={form.allowComments} onChange={v => setForm(p => ({ ...p, allowComments: v }))} label="댓글 허용" />
                    <Toggle checked={form.allowAttachments} onChange={v => setForm(p => ({ ...p, allowAttachments: v }))} label="첨부파일 허용" />
                    <Toggle checked={form.allowSecretPost} onChange={v => setForm(p => ({ ...p, allowSecretPost: v }))} label="비밀글 허용" />
                    <Toggle checked={form.allowSecretComment} onChange={v => setForm(p => ({ ...p, allowSecretComment: v }))} label="비밀 댓글 허용" />
                    <Toggle checked={form.allowScheduledPost} onChange={v => setForm(p => ({ ...p, allowScheduledPost: v }))} label="예약 발행 허용" />
                </div>
            </div>

            {/* 표시 설정 */}
            <div className={sectionClass}>
                <h3 className="text-sm font-semibold mb-2">표시 설정</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>페이지당 게시글 수</label>
                        <input type="number" value={form.postsPerPage} min={5} max={100}
                            onChange={e => setForm(p => ({ ...p, postsPerPage: parseInt(e.target.value) || 20 }))}
                            className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>정렬 순서</label>
                        <select value={form.sortOrder}
                            onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value as SortOrder }))}
                            className={inputClass}>
                            {sortOptions.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button onClick={() => router.push(`/intra/cms/sites/${siteId}`)}
                    className="px-6 py-2.5 text-sm border border-neutral-200 hover:bg-neutral-50 transition-colors">
                    취소
                </button>
                <button onClick={handleCreate}
                    className="px-6 py-2.5 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                    만들기
                </button>
            </div>
        </div>
    );
}
