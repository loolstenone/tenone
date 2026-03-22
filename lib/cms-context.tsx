"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    CmsSite, CmsBoard, CmsBoardPost, CmsComment, CmsWidget,
    CmsPost, CmsChannel, CmsCategory,
    WidgetSortBy,
} from '@/types/cms';
import {
    initialSites, initialBoards, initialBoardPosts,
    initialComments, initialWidgets, initialPosts,
} from '@/lib/cms-data';

// ── Context 타입 정의 ──

interface CmsContextType {
    // Sites
    sites: CmsSite[];
    addSite: (site: CmsSite) => void;
    updateSite: (id: string, updates: Partial<CmsSite>) => void;
    deleteSite: (id: string) => void;
    getSiteById: (id: string) => CmsSite | undefined;

    // Boards
    boards: CmsBoard[];
    addBoard: (board: CmsBoard) => void;
    updateBoard: (id: string, updates: Partial<CmsBoard>) => void;
    deleteBoard: (id: string) => void;
    getBoardById: (id: string) => CmsBoard | undefined;
    getBoardsBySite: (siteId: string) => CmsBoard[];

    // Board Posts
    boardPosts: CmsBoardPost[];
    addBoardPost: (post: CmsBoardPost) => void;
    updateBoardPost: (id: string, updates: Partial<CmsBoardPost>) => void;
    deleteBoardPost: (id: string) => void;
    getBoardPostById: (id: string) => CmsBoardPost | undefined;
    getPostsByBoard: (boardId: string) => CmsBoardPost[];
    getPostsForWidget: (boardId: string, count: number, sortBy: WidgetSortBy) => CmsBoardPost[];

    // Comments
    comments: CmsComment[];
    addComment: (comment: CmsComment) => void;
    updateComment: (id: string, updates: Partial<CmsComment>) => void;
    deleteComment: (id: string) => void;
    getCommentsByPost: (postId: string) => CmsComment[];

    // Widgets
    widgets: CmsWidget[];
    addWidget: (widget: CmsWidget) => void;
    updateWidget: (id: string, updates: Partial<CmsWidget>) => void;
    deleteWidget: (id: string) => void;

    // Legacy (하위 호환 - newsroom/works 페이지)
    posts: CmsPost[];
    addPost: (post: CmsPost) => void;
    updatePost: (id: string, updates: Partial<CmsPost>) => void;
    deletePost: (id: string) => void;
    getPostById: (id: string) => CmsPost | undefined;
    getPostsByChannel: (channel: CmsChannel) => CmsPost[];
    getPostsByCategory: (category: CmsCategory) => CmsPost[];
    getPublishedByChannel: (channel: CmsChannel) => CmsPost[];
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

// ── Provider ──

export function CmsProvider({ children }: { children: ReactNode }) {
    const [sites, setSites] = useState<CmsSite[]>(initialSites);
    const [boards, setBoards] = useState<CmsBoard[]>(initialBoards);
    const [boardPosts, setBoardPosts] = useState<CmsBoardPost[]>(initialBoardPosts);
    const [comments, setComments] = useState<CmsComment[]>(initialComments);
    const [widgets, setWidgets] = useState<CmsWidget[]>(initialWidgets);
    const [posts, setPosts] = useState<CmsPost[]>(initialPosts);

    const now = () => new Date().toISOString().split('T')[0];

    // ── Sites ──

    const addSite = useCallback((site: CmsSite) => {
        setSites(prev => [site, ...prev]);
    }, []);

    const updateSite = useCallback((id: string, updates: Partial<CmsSite>) => {
        setSites(prev => prev.map(s =>
            s.id === id ? { ...s, ...updates, updatedAt: now() } : s
        ));
    }, []);

    const deleteSite = useCallback((id: string) => {
        setSites(prev => prev.filter(s => s.id !== id));
    }, []);

    const getSiteById = useCallback((id: string) => {
        return sites.find(s => s.id === id);
    }, [sites]);

    // ── Boards ──

    const addBoard = useCallback((board: CmsBoard) => {
        setBoards(prev => [board, ...prev]);
    }, []);

    const updateBoard = useCallback((id: string, updates: Partial<CmsBoard>) => {
        setBoards(prev => prev.map(b =>
            b.id === id ? { ...b, ...updates, updatedAt: now() } : b
        ));
    }, []);

    const deleteBoard = useCallback((id: string) => {
        setBoards(prev => prev.filter(b => b.id !== id));
    }, []);

    const getBoardById = useCallback((id: string) => {
        return boards.find(b => b.id === id);
    }, [boards]);

    const getBoardsBySite = useCallback((siteId: string) => {
        return boards.filter(b => b.siteId === siteId);
    }, [boards]);

    // ── Board Posts ──

    const addBoardPost = useCallback((post: CmsBoardPost) => {
        setBoardPosts(prev => [post, ...prev]);
    }, []);

    const updateBoardPost = useCallback((id: string, updates: Partial<CmsBoardPost>) => {
        setBoardPosts(prev => prev.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: now() } : p
        ));
    }, []);

    const deleteBoardPost = useCallback((id: string) => {
        setBoardPosts(prev => prev.filter(p => p.id !== id));
    }, []);

    const getBoardPostById = useCallback((id: string) => {
        return boardPosts.find(p => p.id === id);
    }, [boardPosts]);

    const getPostsByBoard = useCallback((boardId: string) => {
        return boardPosts.filter(p => p.boardId === boardId);
    }, [boardPosts]);

    const getPostsForWidget = useCallback((boardId: string, count: number, sortBy: WidgetSortBy) => {
        const published = boardPosts.filter(
            p => p.boardId === boardId && p.status === 'published'
        );

        let sorted: CmsBoardPost[];
        switch (sortBy) {
            case 'views':
                sorted = [...published].sort((a, b) => b.viewCount - a.viewCount);
                break;
            case 'recommended':
                sorted = published
                    .filter(p => p.isRecommended)
                    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
                break;
            case 'latest':
            default:
                sorted = [...published].sort(
                    (a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
                );
                break;
        }

        return sorted.slice(0, count);
    }, [boardPosts]);

    // ── Comments ──

    const addComment = useCallback((comment: CmsComment) => {
        setComments(prev => [comment, ...prev]);
    }, []);

    const updateComment = useCallback((id: string, updates: Partial<CmsComment>) => {
        setComments(prev => prev.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: now() } : c
        ));
    }, []);

    const deleteComment = useCallback((id: string) => {
        setComments(prev => prev.filter(c => c.id !== id));
    }, []);

    const getCommentsByPost = useCallback((postId: string) => {
        return comments.filter(c => c.postId === postId);
    }, [comments]);

    // ── Widgets ──

    const addWidget = useCallback((widget: CmsWidget) => {
        setWidgets(prev => [widget, ...prev]);
    }, []);

    const updateWidget = useCallback((id: string, updates: Partial<CmsWidget>) => {
        setWidgets(prev => prev.map(w =>
            w.id === id ? { ...w, ...updates } : w
        ));
    }, []);

    const deleteWidget = useCallback((id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    }, []);

    // ── Legacy (하위 호환) ──

    const addPost = useCallback((post: CmsPost) => {
        setPosts(prev => [post, ...prev]);
    }, []);

    const updatePost = useCallback((id: string, updates: Partial<CmsPost>) => {
        setPosts(prev => prev.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: now() } : p
        ));
    }, []);

    const deletePost = useCallback((id: string) => {
        setPosts(prev => prev.filter(p => p.id !== id));
    }, []);

    const getPostById = useCallback((id: string) => {
        return posts.find(p => p.id === id);
    }, [posts]);

    const getPostsByChannel = useCallback((channel: CmsChannel) => {
        return posts.filter(p => p.channels.includes(channel));
    }, [posts]);

    const getPostsByCategory = useCallback((category: CmsCategory) => {
        return posts.filter(p => p.category === category);
    }, [posts]);

    const getPublishedByChannel = useCallback((channel: CmsChannel) => {
        return posts
            .filter(p => p.status === 'Published' && p.channels.includes(channel))
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [posts]);

    // ── Render ──

    return (
        <CmsContext.Provider value={{
            // Sites
            sites, addSite, updateSite, deleteSite, getSiteById,
            // Boards
            boards, addBoard, updateBoard, deleteBoard, getBoardById, getBoardsBySite,
            // Board Posts
            boardPosts, addBoardPost, updateBoardPost, deleteBoardPost,
            getBoardPostById, getPostsByBoard, getPostsForWidget,
            // Comments
            comments, addComment, updateComment, deleteComment, getCommentsByPost,
            // Widgets
            widgets, addWidget, updateWidget, deleteWidget,
            // Legacy
            posts, addPost, updatePost, deletePost,
            getPostById, getPostsByChannel, getPostsByCategory, getPublishedByChannel,
        }}>
            {children}
        </CmsContext.Provider>
    );
}

// ── Hook ──

export function useCms() {
    const context = useContext(CmsContext);
    if (!context) throw new Error('useCms must be used within CmsProvider');
    return context;
}
