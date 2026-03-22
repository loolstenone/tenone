"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Plus, Pin, ChevronRight, X, Calendar } from "lucide-react";
import clsx from "clsx";

type AudienceType = '전체' | 'Staff' | 'Partner 이상' | 'Crew 이상' | 'Admin Only';
const audienceOptions: AudienceType[] = ['전체', 'Staff', 'Partner 이상', 'Crew 이상', 'Admin Only'];
const audienceBadge: Record<AudienceType, string> = {
    '전체': 'bg-neutral-100 text-neutral-500',
    'Staff': 'bg-blue-50 text-blue-600',
    'Partner 이상': 'bg-amber-50 text-amber-600',
    'Crew 이상': 'bg-green-50 text-green-600',
    'Admin Only': 'bg-red-50 text-red-500',
};

interface NoticePost {
    id: string;
    title: string;
    body: string;
    author: string;
    date: string;
    pinned?: boolean;
    noticeStart?: string;
    noticeEnd?: string;
    badge?: string;
    audience?: AudienceType;
}

function isNoticeActive(post: NoticePost): boolean {
    if (!post.noticeStart && !post.noticeEnd) return false;
    const today = new Date().toISOString().split('T')[0];
    if (post.noticeStart && today < post.noticeStart) return false;
    if (post.noticeEnd && today > post.noticeEnd) return false;
    return true;
}

const initialPosts: NoticePost[] = [
    {
        id: 'n-1', title: '2026년 1분기 GPR 자기 평가 마감 안내',
        body: '3월 31일까지 GPR 자기 평가를 완료해주세요. ERP > HR > GPR에서 진행할 수 있습니다.',
        author: 'Cheonil Jeon', date: '2026-03-15', pinned: true, badge: 'HR',
        noticeStart: '2026-03-15', noticeEnd: '2026-03-31',
    },
    {
        id: 'n-2', title: 'MADLeague 인사이트 투어링 참가자 모집',
        body: '4월 중 예정된 MADLeague 인사이트 투어링에 참가할 멤버를 모집합니다. 관심 있으신 분은 관리자에게 문의해주세요.',
        author: 'Cheonil Jeon', date: '2026-03-10', pinned: true, badge: '중요',
        noticeStart: '2026-03-10', noticeEnd: '2026-04-30',
    },
    {
        id: 'n-3', title: 'VRIEF 프레임워크 교육 일정 안내 (4월)',
        body: '4월 교육 일정을 안내드립니다. Wiki > Education에서 상세 일정을 확인하세요.',
        author: 'Cheonil Jeon', date: '2026-03-08', badge: '교육',
        noticeStart: '2026-03-08', noticeEnd: '2026-04-30',
    },
    {
        id: 'n-4', title: 'LUKI 2nd Single 관련 콘텐츠 가이드라인',
        body: 'LUKI 2nd Single 관련 콘텐츠 제작 시 브랜드 가이드라인을 준수해주세요.',
        author: 'Sarah Kim', date: '2026-03-05', badge: '공지',
        noticeStart: '2026-03-05', noticeEnd: '2026-04-05',
    },
];

export default function NoticePage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<NoticePost[]>(initialPosts);
    const [selectedPost, setSelectedPost] = useState<NoticePost | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editorTitle, setEditorTitle] = useState('');
    const [editorBody, setEditorBody] = useState('');
    const [editorBadge, setEditorBadge] = useState('공지');
    const [editorNoticeStart, setEditorNoticeStart] = useState('');
    const [editorNoticeEnd, setEditorNoticeEnd] = useState('');
    const [editorAudience, setEditorAudience] = useState<AudienceType>('전체');

    const visiblePosts = posts.filter(isNoticeActive);
    const sorted = [...visiblePosts].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.date.localeCompare(a.date);
    });

    const handleSubmit = () => {
        if (!editorTitle.trim() || !editorBody.trim()) return;
        if (!editorNoticeStart || !editorNoticeEnd) {
            alert('공지 기간을 설정해야 합니다.');
            return;
        }
        const newPost: NoticePost = {
            id: `n-${Date.now()}`, title: editorTitle, body: editorBody,
            author: user?.name || 'Unknown', date: new Date().toISOString().split('T')[0],
            pinned: true, badge: editorBadge,
            noticeStart: editorNoticeStart, noticeEnd: editorNoticeEnd,
            audience: editorAudience,
        };
        setPosts(prev => [newPost, ...prev]);
        setEditorTitle(''); setEditorBody(''); setEditorNoticeStart(''); setEditorNoticeEnd(''); setEditorAudience('전체');
        setShowEditor(false);
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">공지사항</h1>
                    <p className="text-sm text-neutral-500 mt-1">사내 공지 및 안내</p>
                </div>
                <button onClick={() => setShowEditor(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" /> 공지 등록
                </button>
            </div>

            <div className="border border-neutral-200 divide-y divide-neutral-100">
                {sorted.map(post => (
                    <button key={post.id} onClick={() => setSelectedPost(post)}
                        className="w-full text-left px-5 py-4 hover:bg-neutral-50 transition-colors flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {post.pinned && <Pin className="h-3 w-3 text-neutral-900" />}
                                {post.badge && (
                                    <span className="text-xs px-1.5 py-0.5 bg-neutral-900 text-white font-medium">{post.badge}</span>
                                )}
                                <span className="text-sm font-medium text-neutral-900 truncate">{post.title}</span>
                                {post.audience && post.audience !== '전체' && (
                                    <span className={`text-[10px] px-1.5 py-0.5 ${audienceBadge[post.audience]}`}>{post.audience}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <span>{post.author}</span>
                                <span>{post.date}</span>
                                {post.noticeStart && post.noticeEnd && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {post.noticeStart} ~ {post.noticeEnd}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
                    </button>
                ))}
                {sorted.length === 0 && (
                    <div className="px-5 py-12 text-center text-sm text-neutral-400">등록된 공지가 없습니다.</div>
                )}
            </div>

            {/* Detail modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
                        <div className="p-6 border-b border-neutral-100 flex items-start justify-between shrink-0">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {selectedPost.badge && (
                                        <span className="text-xs px-1.5 py-0.5 bg-neutral-900 text-white font-medium">{selectedPost.badge}</span>
                                    )}
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
                            <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                                {selectedPost.body}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor modal */}
            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold">공지 등록</h2>
                            <button onClick={() => setShowEditor(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">분류</label>
                                <div className="flex gap-2">
                                    {['공지', '중요', 'HR', '교육', '일정'].map(b => (
                                        <button key={b} onClick={() => setEditorBadge(b)}
                                            className={clsx("px-3 py-1.5 text-xs border transition-colors",
                                                editorBadge === b ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                            )}>{b}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">공개 대상</label>
                                <div className="flex gap-2 flex-wrap">
                                    {audienceOptions.map(a => (
                                        <button key={a} onClick={() => setEditorAudience(a)}
                                            className={clsx("px-3 py-1.5 text-xs border transition-colors",
                                                editorAudience === a ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                            )}>{a}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">공지 기간 <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" value={editorNoticeStart} onChange={e => setEditorNoticeStart(e.target.value)}
                                        className="border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                                    <input type="date" value={editorNoticeEnd} onChange={e => setEditorNoticeEnd(e.target.value)}
                                        className="border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                                </div>
                                <p className="text-xs text-neutral-400 mt-1">기간 내에만 노출됩니다.</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">제목</label>
                                <input value={editorTitle} onChange={e => setEditorTitle(e.target.value)}
                                    className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
                                    placeholder="공지 제목" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">내용</label>
                                <textarea value={editorBody} onChange={e => setEditorBody(e.target.value)}
                                    className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none resize-none"
                                    rows={6} placeholder="공지 내용" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
                            <button onClick={() => setShowEditor(false)}
                                className="px-5 py-2.5 text-sm text-neutral-500 hover:text-neutral-900">취소</button>
                            <button onClick={handleSubmit}
                                className="px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
