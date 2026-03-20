"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Plus, Pin, MessageSquare, ChevronRight, X, Calendar } from "lucide-react";
import clsx from "clsx";

type BoardType = 'notice' | 'free';

interface BoardPost {
    id: string;
    type: BoardType;
    title: string;
    body: string;
    author: string;
    date: string;
    pinned?: boolean;
    noticeStart?: string;  // 공지 시작일
    noticeEnd?: string;    // 공지 종료일
    comments: { author: string; body: string; date: string }[];
}

function isNoticeActive(post: BoardPost): boolean {
    if (post.type !== 'notice') return true;
    if (!post.noticeStart && !post.noticeEnd) return false; // 기간 미설정 시 안 보임
    const today = new Date().toISOString().split('T')[0];
    if (post.noticeStart && today < post.noticeStart) return false;
    if (post.noticeEnd && today > post.noticeEnd) return false;
    return true;
}

const initialPosts: BoardPost[] = [
    {
        id: 'bp-1', type: 'notice', title: '2026년 1분기 GPR 자기 평가 마감 안내',
        body: '3월 31일까지 GPR 자기 평가를 완료해주세요. ERP > HR > GPR에서 진행할 수 있습니다.',
        author: 'Cheonil Jeon', date: '2026-03-15', pinned: true,
        noticeStart: '2026-03-15', noticeEnd: '2026-03-31',
        comments: [{ author: 'Sarah Kim', body: '확인했습니다!', date: '2026-03-15' }],
    },
    {
        id: 'bp-2', type: 'notice', title: 'MADLeague 인사이트 투어링 참가자 모집',
        body: '4월 중 예정된 MADLeague 인사이트 투어링에 참가할 멤버를 모집합니다. 관심 있으신 분은 댓글로 신청해주세요.',
        author: 'Cheonil Jeon', date: '2026-03-10', pinned: true,
        noticeStart: '2026-03-10', noticeEnd: '2026-04-30',
        comments: [],
    },
    {
        id: 'bp-3', type: 'free', title: 'LUKI 2nd Single 어떻게 생각하세요?',
        body: '이번 싱글 콘셉트가 상당히 좋은 것 같습니다. 다들 의견 남겨주세요.',
        author: 'Sarah Kim', date: '2026-03-18',
        comments: [
            { author: '김준호', body: '저도 좋다고 생각합니다! MV 비주얼이 특히 좋았어요.', date: '2026-03-18' },
            { author: 'Cheonil Jeon', body: '다음 싱글 기획에 반영하겠습니다.', date: '2026-03-19' },
        ],
    },
    {
        id: 'bp-4', type: 'free', title: '금요일 점심 같이 드실 분',
        body: '이번 금요일 강남역 근처에서 점심 같이 하실 분 계신가요?',
        author: '김준호', date: '2026-03-19',
        comments: [],
    },
];

export default function BoardPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<BoardPost[]>(initialPosts);
    const [activeTab, setActiveTab] = useState<'all' | BoardType>('all');
    const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Editor state
    const [editorType, setEditorType] = useState<BoardType>('free');
    const [editorTitle, setEditorTitle] = useState('');
    const [editorBody, setEditorBody] = useState('');
    const [editorNoticeStart, setEditorNoticeStart] = useState('');
    const [editorNoticeEnd, setEditorNoticeEnd] = useState('');

    // 공지는 기간 내에만 표시, 자유게시판은 항상 표시
    const visiblePosts = posts.filter(p => isNoticeActive(p));
    const filtered = activeTab === 'all' ? visiblePosts : visiblePosts.filter(p => p.type === activeTab);
    const sorted = [...filtered].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.date.localeCompare(a.date);
    });

    const handleSubmitPost = () => {
        if (!editorTitle.trim() || !editorBody.trim()) return;
        if (editorType === 'notice' && (!editorNoticeStart || !editorNoticeEnd)) {
            alert('공지사항은 공지 기간을 설정해야 합니다.');
            return;
        }
        const newPost: BoardPost = {
            id: `bp-${Date.now()}`,
            type: editorType,
            title: editorTitle,
            body: editorBody,
            author: user?.name || 'Unknown',
            date: new Date().toISOString().split('T')[0],
            pinned: editorType === 'notice',
            noticeStart: editorType === 'notice' ? editorNoticeStart : undefined,
            noticeEnd: editorType === 'notice' ? editorNoticeEnd : undefined,
            comments: [],
        };
        setPosts(prev => [newPost, ...prev]);
        setEditorTitle('');
        setEditorBody('');
        setEditorNoticeStart('');
        setEditorNoticeEnd('');
        setShowEditor(false);
    };

    const handleAddComment = () => {
        if (!newComment.trim() || !selectedPost) return;
        const comment = { author: user?.name || 'Unknown', body: newComment, date: new Date().toISOString().split('T')[0] };
        setPosts(prev => prev.map(p =>
            p.id === selectedPost.id ? { ...p, comments: [...p.comments, comment] } : p
        ));
        setSelectedPost(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
        setNewComment('');
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">게시판</h1>
                    <p className="text-sm text-neutral-500 mt-1">공지사항과 자유 게시판</p>
                </div>
                <button onClick={() => setShowEditor(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" /> 글쓰기
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-neutral-200">
                {[
                    { key: 'all', label: '전체' },
                    { key: 'notice', label: '공지사항' },
                    { key: 'free', label: '자유게시판' },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as 'all' | BoardType)}
                        className={clsx(
                            "px-5 py-2.5 text-sm border-b-2 transition-colors",
                            activeTab === tab.key
                                ? "border-neutral-900 text-neutral-900 font-medium"
                                : "border-transparent text-neutral-400 hover:text-neutral-700"
                        )}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Post list */}
            <div className="border border-neutral-200 divide-y divide-neutral-100">
                {sorted.map(post => (
                    <button key={post.id} onClick={() => setSelectedPost(post)}
                        className="w-full text-left px-5 py-4 hover:bg-neutral-50 transition-colors flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {post.pinned && <Pin className="h-3 w-3 text-neutral-900" />}
                                <span className={clsx("text-[10px] px-1.5 py-0.5 font-medium",
                                    post.type === 'notice' ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
                                )}>
                                    {post.type === 'notice' ? '공지' : '자유'}
                                </span>
                                <span className="text-sm font-medium text-neutral-900 truncate">{post.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <span>{post.author}</span>
                                <span>{post.date}</span>
                                {post.noticeStart && post.noticeEnd && (
                                    <span className="flex items-center gap-1 text-neutral-400">
                                        <Calendar className="h-3 w-3" /> {post.noticeStart} ~ {post.noticeEnd}
                                    </span>
                                )}
                                {post.comments.length > 0 && (
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" /> {post.comments.length}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
                    </button>
                ))}
                {sorted.length === 0 && (
                    <div className="px-5 py-12 text-center text-sm text-neutral-400">게시글이 없습니다.</div>
                )}
            </div>

            {/* Post detail modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
                        <div className="p-6 border-b border-neutral-100 flex items-start justify-between shrink-0">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={clsx("text-[10px] px-1.5 py-0.5 font-medium",
                                        selectedPost.type === 'notice' ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
                                    )}>
                                        {selectedPost.type === 'notice' ? '공지' : '자유'}
                                    </span>
                                    <span className="text-xs text-neutral-400">{selectedPost.date}</span>
                                </div>
                                <h2 className="text-xl font-bold">{selectedPost.title}</h2>
                                <p className="text-xs text-neutral-400 mt-1">{selectedPost.author}</p>
                                {selectedPost.noticeStart && selectedPost.noticeEnd && (
                                    <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> 공지 기간: {selectedPost.noticeStart} ~ {selectedPost.noticeEnd}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setSelectedPost(null)} className="text-neutral-400 hover:text-neutral-900 p-1">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap mb-8">
                                {selectedPost.body}
                            </div>

                            {/* Comments */}
                            <div className="border-t border-neutral-100 pt-6">
                                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-neutral-400" />
                                    댓글 {selectedPost.comments.length}
                                </h3>
                                <div className="space-y-4 mb-6">
                                    {selectedPost.comments.map((c, i) => (
                                        <div key={i} className="bg-neutral-50 p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-neutral-700">{c.author}</span>
                                                <span className="text-[10px] text-neutral-400">{c.date}</span>
                                            </div>
                                            <p className="text-sm text-neutral-600">{c.body}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={newComment} onChange={e => setNewComment(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                                        className="flex-1 border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
                                        placeholder="댓글을 입력하세요..." />
                                    <button onClick={handleAddComment}
                                        className="px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors shrink-0">
                                        등록
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New post editor */}
            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold">새 글 작성</h2>
                            <button onClick={() => setShowEditor(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">분류</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditorType('notice')}
                                        className={clsx("px-4 py-2 text-sm border transition-colors",
                                            editorType === 'notice' ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                        )}>공지사항</button>
                                    <button onClick={() => setEditorType('free')}
                                        className={clsx("px-4 py-2 text-sm border transition-colors",
                                            editorType === 'free' ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                        )}>자유게시판</button>
                                </div>
                            </div>
                            {editorType === 'notice' && (
                                <div>
                                    <label className="text-sm font-medium text-neutral-700 block mb-1">공지 기간 <span className="text-red-400">*</span></label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="date" value={editorNoticeStart} onChange={e => setEditorNoticeStart(e.target.value)}
                                            className="border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                                        <input type="date" value={editorNoticeEnd} onChange={e => setEditorNoticeEnd(e.target.value)}
                                            className="border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1">기간 내에만 게시판과 노출 채널에 표시됩니다.</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">제목</label>
                                <input value={editorTitle} onChange={e => setEditorTitle(e.target.value)}
                                    className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
                                    placeholder="제목을 입력하세요" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">내용</label>
                                <textarea value={editorBody} onChange={e => setEditorBody(e.target.value)}
                                    className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none resize-none"
                                    rows={6} placeholder="내용을 입력하세요" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
                            <button onClick={() => setShowEditor(false)}
                                className="px-5 py-2.5 text-sm text-neutral-500 hover:text-neutral-900">취소</button>
                            <button onClick={handleSubmitPost}
                                className="px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
