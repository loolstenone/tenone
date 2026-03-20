"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Plus, MessageSquare, ChevronRight, X } from "lucide-react";

interface FreePost {
    id: string;
    title: string;
    body: string;
    author: string;
    date: string;
    comments: { author: string; body: string; date: string }[];
}

const initialPosts: FreePost[] = [
    {
        id: 'f-1', title: 'LUKI 2nd Single 어떻게 생각하세요?',
        body: '이번 싱글 콘셉트가 상당히 좋은 것 같습니다. 다들 의견 남겨주세요.',
        author: 'Sarah Kim', date: '2026-03-18',
        comments: [
            { author: '김준호', body: '저도 좋다고 생각합니다! MV 비주얼이 특히 좋았어요.', date: '2026-03-18' },
            { author: 'Cheonil Jeon', body: '다음 싱글 기획에 반영하겠습니다.', date: '2026-03-19' },
        ],
    },
    {
        id: 'f-2', title: '금요일 점심 같이 드실 분',
        body: '이번 금요일 강남역 근처에서 점심 같이 하실 분 계신가요?',
        author: '김준호', date: '2026-03-19',
        comments: [],
    },
    {
        id: 'f-3', title: '재택근무 팁 공유합니다',
        body: '재택근무할 때 집중력 높이는 방법들 공유합니다.\n\n1. 업무 시작 전 루틴 만들기\n2. 포모도로 기법 활용\n3. 업무 전용 공간 확보\n4. 점심 후 짧은 산책',
        author: 'Sarah Kim', date: '2026-03-17',
        comments: [{ author: 'Cheonil Jeon', body: '좋은 팁이네요! 저도 포모도로 써보겠습니다.', date: '2026-03-17' }],
    },
];

export default function FreeBoardPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<FreePost[]>(initialPosts);
    const [selectedPost, setSelectedPost] = useState<FreePost | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [editorTitle, setEditorTitle] = useState('');
    const [editorBody, setEditorBody] = useState('');

    const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

    const handleSubmit = () => {
        if (!editorTitle.trim() || !editorBody.trim()) return;
        const newPost: FreePost = {
            id: `f-${Date.now()}`, title: editorTitle, body: editorBody,
            author: user?.name || 'Unknown', date: new Date().toISOString().split('T')[0],
            comments: [],
        };
        setPosts(prev => [newPost, ...prev]);
        setEditorTitle(''); setEditorBody('');
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
                    <h1 className="text-2xl font-bold">자유게시판</h1>
                    <p className="text-sm text-neutral-500 mt-1">자유롭게 소통하는 공간</p>
                </div>
                <button onClick={() => setShowEditor(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" /> 글쓰기
                </button>
            </div>

            <div className="border border-neutral-200 divide-y divide-neutral-100">
                {sorted.map(post => (
                    <button key={post.id} onClick={() => setSelectedPost(post)}
                        className="w-full text-left px-5 py-4 hover:bg-neutral-50 transition-colors flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate mb-1">{post.title}</p>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <span>{post.author}</span>
                                <span>{post.date}</span>
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
            </div>

            {/* Detail modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl">
                        <div className="p-6 border-b border-neutral-100 flex items-start justify-between shrink-0">
                            <div>
                                <p className="text-xs text-neutral-400 mb-2">{selectedPost.date}</p>
                                <h2 className="text-xl font-bold">{selectedPost.title}</h2>
                                <p className="text-xs text-neutral-400 mt-1">{selectedPost.author}</p>
                            </div>
                            <button onClick={() => setSelectedPost(null)} className="text-neutral-400 hover:text-neutral-900 p-1">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap mb-8">
                                {selectedPost.body}
                            </div>
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

            {/* Editor modal */}
            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold">글쓰기</h2>
                            <button onClick={() => setShowEditor(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
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
                                    rows={8} placeholder="내용을 입력하세요" />
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
