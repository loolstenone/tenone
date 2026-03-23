"use client";

import { useState, useEffect } from "react";
import { useBums } from "@/lib/bums-context";
import {
    BoardTypeInfo,
    type BoardType,
    type BoardPermissionLevel,
    type SortOrder,
    type CmsBoardCategory,
    type SecretPostMode,
    type NewBadgeDuration,
    type WriteButtonDisplay,
    type CommentOrder,
    type AuthorDisplayType,
    type BoardLayout,
    type BoardOptionSettings,
    type BoardDesignSettings,
} from "@/types/bums";
import { X, Plus } from "lucide-react";

// ── Props ──

interface BoardSettingsModalProps {
    boardId: string;
    siteId: string;
    isOpen: boolean;
    onClose: () => void;
}

// ── 상수 ──

const allBoardTypes: BoardType[] = ['general', 'notice', 'gallery', 'video', 'faq', 'qna', 'commerce', 'recruit', 'event'];

const permissionOptions: { value: BoardPermissionLevel; label: string }[] = [
    { value: 'all', label: '모든 사용자' },
    { value: 'member', label: '로그인 사용자' },
    { value: 'intra', label: '내부 구성원' },
    { value: 'staff', label: '직원' },
    { value: 'admin', label: '관리자' },
];

const secretModeOptions: { value: SecretPostMode; label: string }[] = [
    { value: 'disabled', label: '사용안함' },
    { value: 'optional', label: '작성자가 선택 가능' },
    { value: 'always', label: '항상 비밀글' },
];

const sortOptions: { value: SortOrder; label: string }[] = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'pinned-first', label: '고정글 우선' },
];

const newBadgeOptions: { value: NewBadgeDuration; label: string }[] = [
    { value: 0, label: '사용안함' },
    { value: 1, label: '1일' },
    { value: 3, label: '3일' },
    { value: 7, label: '7일' },
    { value: 14, label: '14일' },
    { value: 30, label: '30일' },
];

const writeButtonOptions: { value: WriteButtonDisplay; label: string }[] = [
    { value: 'always', label: '항상 표시' },
    { value: 'logged-in', label: '로그인시' },
    { value: 'hidden', label: '숨김' },
];

const commentOrderOptions: { value: CommentOrder; label: string }[] = [
    { value: 'asc', label: '등록순' },
    { value: 'desc', label: '최신순' },
];

const authorDisplayOptions: { value: AuthorDisplayType; label: string }[] = [
    { value: 'nickname', label: '닉네임' },
    { value: 'name', label: '이름' },
    { value: 'id', label: '아이디' },
    { value: 'anonymous', label: '익명' },
];

type LayoutGroup = 'list' | 'grid' | 'masonry';

const layoutOptions: Record<LayoutGroup, { value: BoardLayout; label: string }[]> = {
    list: [
        { value: 'list-thumb', label: '썸네일' },
        { value: 'list-detail', label: '상세' },
        { value: 'list-image', label: '이미지' },
        { value: 'list-text', label: '텍스트' },
    ],
    grid: [
        { value: 'grid-thumb-text', label: '썸네일+텍스트' },
        { value: 'grid-text-thumb', label: '텍스트+썸네일' },
        { value: 'grid-image', label: '이미지' },
        { value: 'grid-text', label: '텍스트' },
    ],
    masonry: [
        { value: 'masonry-thumb-text', label: '썸네일+텍스트' },
        { value: 'masonry-image', label: '이미지' },
        { value: 'masonry-full', label: '풀' },
        { value: 'masonry-text', label: '텍스트' },
    ],
};

// ── 스타일 ──

const inputCls = "border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none bg-white";
const selectCls = `${inputCls} appearance-none`;
const labelW = "w-[100px] shrink-0 text-sm text-neutral-500 pt-2";
const rowCls = "flex gap-4 py-4 border-b border-neutral-100 px-5";

// ── 레이아웃 아이콘 ──

function LayoutIcon({ layout, selected }: { layout: BoardLayout; selected: boolean }) {
    const base = "w-full h-16 rounded";
    const isList = layout.startsWith('list-');
    const isGrid = layout.startsWith('grid-');

    if (isList) {
        return (
            <div className={`${base} flex flex-col gap-1 p-2`}>
                {[0, 1, 2].map(i => (
                    <div key={i} className="flex gap-1.5 items-center">
                        {layout !== 'list-text' && (
                            <div className={`w-5 h-3 rounded-sm ${selected ? 'bg-blue-300' : 'bg-neutral-200'}`} />
                        )}
                        <div className="flex-1 h-1.5 rounded-full"
                            style={{ backgroundColor: selected ? '#bfdbfe' : '#e5e5e5' }} />
                    </div>
                ))}
            </div>
        );
    }

    if (isGrid) {
        const showThumb = layout !== 'grid-text';
        return (
            <div className={`${base} grid grid-cols-2 gap-1 p-2`}>
                {[0, 1].map(i => (
                    <div key={i} className="flex flex-col gap-0.5">
                        {showThumb && (
                            <div className={`w-full h-6 rounded-sm ${selected ? 'bg-blue-300' : 'bg-neutral-200'}`} />
                        )}
                        <div className={`w-full h-1.5 rounded-full ${selected ? 'bg-blue-200' : 'bg-neutral-200'}`} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={`${base} flex gap-1 p-2`}>
            <div className={`flex-1 rounded-sm ${selected ? 'bg-blue-300' : 'bg-neutral-200'}`}
                style={{ height: layout === 'masonry-full' ? '100%' : '70%' }} />
            <div className={`flex-1 rounded-sm ${selected ? 'bg-blue-200' : 'bg-neutral-200'}`}
                style={{ height: '50%' }} />
        </div>
    );
}

// ── 메인 컴포넌트 ──

export function BoardSettingsModal({ boardId, siteId, isOpen, onClose }: BoardSettingsModalProps) {
    const { getBoardById, updateBoard } = useBums();
    const board = getBoardById(boardId);

    const [tab, setTab] = useState<'settings' | 'design'>('settings');

    // 설정 탭 state
    const [name, setName] = useState('');
    const [boardType, setBoardType] = useState<BoardType>('general');
    const [useCategories, setUseCategories] = useState(false);
    const [categories, setCategories] = useState<CmsBoardCategory[]>([]);
    const [newCatName, setNewCatName] = useState('');
    const [options, setOptions] = useState<BoardOptionSettings>({
        secretPostMode: 'optional', secretRequirePassword: false, secretHideTitle: false,
        secretRequirePasswordOnView: false, newBadgeDuration: 1, writeButtonDisplay: 'always',
        commentOrder: 'asc', allowFeaturedImage: true, allowTimeRestriction: false,
        authorDisplayType: 'nickname', titleTemplateLocked: false, bodyPlaceholder: '',
    });
    const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
    const [listPermission, setListPermission] = useState<BoardPermissionLevel>('all');
    const [readPermission, setReadPermission] = useState<BoardPermissionLevel>('all');
    const [writePermission, setWritePermission] = useState<BoardPermissionLevel>('staff');
    const [commentPermission, setCommentPermission] = useState<BoardPermissionLevel>('member');
    const [allowAttachments, setAllowAttachments] = useState(true);
    const [allowScheduledPost, setAllowScheduledPost] = useState(false);
    const [allowSecretComment, setAllowSecretComment] = useState(false);

    // 디자인 탭 state
    const [design, setDesign] = useState<BoardDesignSettings>({
        showBoardName: true, showTotalCount: true, showProfileImage: true, showSearchBar: true, showLightbox: true,
        showAuthor: true, showDate: true, showNumber: true, showCategory: false, showViews: true,
        showCommentCount: true, showLikes: true, showShare: true, showPrint: true,
        rowsPerPage: 10, rowSpacing: 20, pinNoticeOnAllPages: false, titleFontSize: 14, metaFontSize: 12,
        layout: 'list-thumb',
    });

    // isOpen 시 board 데이터로 초기화
    useEffect(() => {
        if (isOpen && board) {
            setTab('settings');
            setName(board.name);
            setBoardType(board.boardType);
            setUseCategories(board.useCategories);
            setCategories(board.categories ? [...board.categories] : []);
            setNewCatName('');
            setOptions(board.options ?? {
                secretPostMode: 'optional', secretRequirePassword: false, secretHideTitle: false,
                secretRequirePasswordOnView: false, newBadgeDuration: 1, writeButtonDisplay: 'always',
                commentOrder: 'asc', allowFeaturedImage: true, allowTimeRestriction: false,
                authorDisplayType: 'nickname', titleTemplateLocked: false, bodyPlaceholder: '',
            });
            setSortOrder(board.sortOrder ?? 'latest');
            setListPermission(board.listPermission);
            setReadPermission(board.readPermission);
            setWritePermission(board.writePermission);
            setCommentPermission(board.commentPermission);
            setAllowAttachments(board.allowAttachments);
            setAllowScheduledPost(board.allowScheduledPost);
            setAllowSecretComment(board.allowSecretComment);
            setDesign(board.design ?? {
                showBoardName: true, showTotalCount: true, showProfileImage: true, showSearchBar: true, showLightbox: true,
                showAuthor: true, showDate: true, showNumber: true, showCategory: false, showViews: true,
                showCommentCount: true, showLikes: true, showShare: true, showPrint: true,
                rowsPerPage: 10, rowSpacing: 20, pinNoticeOnAllPages: false, titleFontSize: 14, metaFontSize: 12,
                layout: 'list-thumb',
            });
        }
    }, [isOpen, boardId, board]);

    if (!isOpen) return null;

    if (!board) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white rounded-2xl p-8 shadow-2xl mx-4">
                    <p className="text-neutral-400">게시판을 찾을 수 없습니다</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 text-sm border border-neutral-200 hover:bg-neutral-50">닫기</button>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        updateBoard(boardId, {
            name, boardType, useCategories, categories, sortOrder,
            listPermission, readPermission, writePermission, commentPermission,
            allowAttachments, allowScheduledPost,
            allowSecretPost: options.secretPostMode !== 'disabled',
            allowSecretComment, options, design,
        });
        onClose();
    };

    const addCategory = () => {
        if (!newCatName.trim()) return;
        const cat: CmsBoardCategory = {
            id: `cat-${Date.now()}`,
            name: newCatName.trim(),
            slug: newCatName.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-'),
            order: categories.length + 1,
        };
        setCategories(prev => [...prev, cat]);
        setNewCatName('');
    };

    const removeCategory = (catId: string) => {
        setCategories(prev => prev.filter(c => c.id !== catId).map((c, i) => ({ ...c, order: i + 1 })));
    };

    const updateOpt = <K extends keyof BoardOptionSettings>(key: K, value: BoardOptionSettings[K]) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const updateDesign = <K extends keyof BoardDesignSettings>(key: K, value: BoardDesignSettings[K]) => {
        setDesign(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white shadow-2xl mx-4 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
                    <h3 className="text-lg font-semibold">&ldquo;{board.name}&rdquo; 설정</h3>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-200 px-6 shrink-0">
                    <button
                        onClick={() => setTab('settings')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'settings' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
                        게시판 설정
                    </button>
                    <button
                        onClick={() => setTab('design')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'design' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
                        디자인
                    </button>
                </div>

                {/* Content (scrollable) */}
                <div className="flex-1 overflow-y-auto">
                    {/* ════════════ Tab 1: 게시판 설정 ════════════ */}
                    {tab === 'settings' && (
                        <div>
                            <div className={rowCls}>
                                <span className={labelW}>게시판 이름</span>
                                <input value={name} onChange={e => setName(e.target.value)} className={`${inputCls} flex-1`} />
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>게시판 유형</span>
                                <select value={boardType} onChange={e => setBoardType(e.target.value as BoardType)} className={`${selectCls} flex-1`}>
                                    {allBoardTypes.map(bt => (
                                        <option key={bt} value={bt}>{BoardTypeInfo[bt].label} — {BoardTypeInfo[bt].description}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>카테고리</span>
                                <div className="flex-1 space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={useCategories} onChange={e => setUseCategories(e.target.checked)} className="accent-neutral-900" />
                                        <span className="text-sm">사용함</span>
                                    </label>
                                    {useCategories && (
                                        <div className="space-y-1.5 mt-2">
                                            {categories.map(cat => (
                                                <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded text-sm">
                                                    <span className="flex-1">{cat.name}</span>
                                                    <button onClick={() => removeCategory(cat.id)} className="text-neutral-400 hover:text-red-500">
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="flex gap-2 mt-1">
                                                <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                                                    placeholder="카테고리 이름" className={`${inputCls} flex-1 text-xs`}
                                                    onKeyDown={e => e.key === 'Enter' && addCategory()} />
                                                <button onClick={addCategory} className="px-3 py-1.5 text-xs border border-neutral-200 hover:bg-neutral-50 flex items-center gap-1">
                                                    <Plus className="h-3 w-3" /> 추가
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>비밀글</span>
                                <div className="flex-1 space-y-2">
                                    <select value={options.secretPostMode} onChange={e => updateOpt('secretPostMode', e.target.value as SecretPostMode)} className={`${selectCls} w-full max-w-[240px]`}>
                                        {secretModeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    {options.secretPostMode !== 'disabled' && (
                                        <div className="pl-4 space-y-1.5 text-sm text-neutral-700">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={options.secretRequirePassword} onChange={e => updateOpt('secretRequirePassword', e.target.checked)} className="accent-neutral-900" />
                                                비밀글 작성시 회원도 비밀번호 입력
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={options.secretHideTitle} onChange={e => updateOpt('secretHideTitle', e.target.checked)} className="accent-neutral-900" />
                                                비밀글 제목은 &quot;비밀글입니다&quot;로 항상 표시하기
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={allowSecretComment} onChange={e => setAllowSecretComment(e.target.checked)} className="accent-neutral-900" />
                                                비밀댓글 허용
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={options.secretRequirePasswordOnView} onChange={e => updateOpt('secretRequirePasswordOnView', e.target.checked)} className="accent-neutral-900" />
                                                비밀글 조회시 항상 비밀번호 입력받기
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>옵션</span>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">게시물 정렬</span>
                                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value as SortOrder)} className={`${selectCls} w-full`}>
                                            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">NEW 표시기한</span>
                                        <select value={options.newBadgeDuration} onChange={e => updateOpt('newBadgeDuration', Number(e.target.value) as NewBadgeDuration)} className={`${selectCls} w-full`}>
                                            {newBadgeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">글쓰기 버튼</span>
                                        <select value={options.writeButtonDisplay} onChange={e => updateOpt('writeButtonDisplay', e.target.value as WriteButtonDisplay)} className={`${selectCls} w-full`}>
                                            {writeButtonOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">댓글 표시</span>
                                        <select value={options.commentOrder} onChange={e => updateOpt('commentOrder', e.target.value as CommentOrder)} className={`${selectCls} w-full`}>
                                            {commentOrderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>권한</span>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">목록</span>
                                        <select value={listPermission} onChange={e => setListPermission(e.target.value as BoardPermissionLevel)} className={`${selectCls} w-full`}>
                                            {permissionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">읽기</span>
                                        <select value={readPermission} onChange={e => setReadPermission(e.target.value as BoardPermissionLevel)} className={`${selectCls} w-full`}>
                                            {permissionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">글 작성</span>
                                        <select value={writePermission} onChange={e => setWritePermission(e.target.value as BoardPermissionLevel)} className={`${selectCls} w-full`}>
                                            {permissionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">댓글</span>
                                        <select value={commentPermission} onChange={e => setCommentPermission(e.target.value as BoardPermissionLevel)} className={`${selectCls} w-full`}>
                                            {permissionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>글쓰기</span>
                                <div className="flex-1 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-700">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={options.allowFeaturedImage} onChange={e => updateOpt('allowFeaturedImage', e.target.checked)} className="accent-neutral-900" />
                                        대표 이미지 지정
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={options.allowTimeRestriction} onChange={e => updateOpt('allowTimeRestriction', e.target.checked)} className="accent-neutral-900" />
                                        시간 제한
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={allowScheduledPost} onChange={e => setAllowScheduledPost(e.target.checked)} className="accent-neutral-900" />
                                        예약 발행
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={allowAttachments} onChange={e => setAllowAttachments(e.target.checked)} className="accent-neutral-900" />
                                        첨부파일
                                    </label>
                                </div>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>작성자 표시</span>
                                <select value={options.authorDisplayType} onChange={e => updateOpt('authorDisplayType', e.target.value as AuthorDisplayType)} className={`${selectCls} w-full max-w-[200px]`}>
                                    {authorDisplayOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>제목 양식</span>
                                <div className="flex-1 space-y-2">
                                    <input value={options.titleTemplate ?? ''} onChange={e => updateOpt('titleTemplate', e.target.value)}
                                        placeholder="예: [공지] " className={`${inputCls} w-full max-w-[300px]`} />
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-700">
                                        <input type="checkbox" checked={options.titleTemplateLocked} onChange={e => updateOpt('titleTemplateLocked', e.target.checked)} className="accent-neutral-900" />
                                        수정 불가
                                    </label>
                                </div>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>본문 안내</span>
                                <input value={options.bodyPlaceholder ?? ''} onChange={e => updateOpt('bodyPlaceholder', e.target.value)}
                                    placeholder="본문 입력 안내 문구" className={`${inputCls} flex-1`} />
                            </div>
                        </div>
                    )}

                    {/* ════════════ Tab 2: 디자인 ════════════ */}
                    {tab === 'design' && (
                        <div>
                            <div className={rowCls}>
                                <span className={labelW}>구성 요소</span>
                                <div className="flex-1 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-700">
                                    {([
                                        ['showBoardName', '게시판 이름'],
                                        ['showTotalCount', '전체 글 수'],
                                        ['showProfileImage', '프로필 이미지'],
                                        ['showSearchBar', '검색창'],
                                        ['showLightbox', '라이트박스'],
                                    ] as const).map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={design[key]} onChange={e => updateDesign(key, e.target.checked)} className="accent-neutral-900" />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>리스트 항목</span>
                                <div className="flex-1 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-700">
                                    {([
                                        ['showAuthor', '글쓴이'], ['showDate', '작성시각'], ['showNumber', '글번호'],
                                        ['showCategory', '카테고리'], ['showViews', '조회수'], ['showCommentCount', '댓글수'],
                                        ['showLikes', '좋아요'], ['showShare', '공유'], ['showPrint', '인쇄'],
                                    ] as const).map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={design[key]} onChange={e => updateDesign(key, e.target.checked)} className="accent-neutral-900" />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>리스트</span>
                                <div className="flex-1 flex flex-wrap items-center gap-4">
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">줄 수</span>
                                        <input type="number" value={design.rowsPerPage} min={1} max={100}
                                            onChange={e => updateDesign('rowsPerPage', parseInt(e.target.value) || 10)} className={`${inputCls} w-20`} />
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">간격</span>
                                        <div className="flex items-center gap-1">
                                            <input type="number" value={design.rowSpacing} min={0} max={100}
                                                onChange={e => updateDesign('rowSpacing', parseInt(e.target.value) || 0)} className={`${inputCls} w-20`} />
                                            <span className="text-xs text-neutral-400">px</span>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-700 pt-4">
                                        <input type="checkbox" checked={design.pinNoticeOnAllPages}
                                            onChange={e => updateDesign('pinNoticeOnAllPages', e.target.checked)} className="accent-neutral-900" />
                                        공지 고정
                                    </label>
                                </div>
                            </div>

                            <div className={rowCls}>
                                <span className={labelW}>텍스트</span>
                                <div className="flex-1 flex flex-wrap items-center gap-4">
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">제목</span>
                                        <div className="flex items-center gap-1">
                                            <input type="number" value={design.titleFontSize} min={10} max={32}
                                                onChange={e => updateDesign('titleFontSize', parseInt(e.target.value) || 14)} className={`${inputCls} w-20`} />
                                            <span className="text-xs text-neutral-400">px</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-400 block mb-1">메타 정보</span>
                                        <div className="flex items-center gap-1">
                                            <input type="number" value={design.metaFontSize} min={8} max={24}
                                                onChange={e => updateDesign('metaFontSize', parseInt(e.target.value) || 12)} className={`${inputCls} w-20`} />
                                            <span className="text-xs text-neutral-400">px</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 레이아웃 */}
                            <div className="py-4 px-5">
                                <span className="text-sm text-neutral-500 mb-4 block">레이아웃</span>
                                {(Object.entries(layoutOptions) as [LayoutGroup, typeof layoutOptions['list']][]).map(([group, opts]) => (
                                    <div key={group} className="flex gap-4 mb-4">
                                        <span className="w-[80px] shrink-0 text-xs text-neutral-400 pt-2">
                                            {group === 'list' ? '리스트' : group === 'grid' ? '그리드' : 'Masonry'}
                                        </span>
                                        <div className="flex-1 grid grid-cols-4 gap-2">
                                            {opts.map(opt => {
                                                const selected = design.layout === opt.value;
                                                return (
                                                    <button key={opt.value}
                                                        onClick={() => updateDesign('layout', opt.value)}
                                                        className={`border-2 rounded-lg p-2 transition-colors ${selected ? 'border-blue-500 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                                                        <LayoutIcon layout={opt.value} selected={selected} />
                                                        <span className={`text-xs block mt-1 text-center ${selected ? 'text-blue-600 font-medium' : 'text-neutral-500'}`}>
                                                            {opt.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer (sticky) */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200 shrink-0 bg-white rounded-b-2xl">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm border border-neutral-200 hover:bg-neutral-50 transition-colors rounded-lg">
                        취소
                    </button>
                    <button onClick={handleSave}
                        className="px-5 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors rounded-lg">
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}
