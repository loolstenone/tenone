"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    BumsSite, BumsBoard, BumsBoardPost, BumsComment, BumsWidget,
    CmsPost, CmsChannel, CmsCategory,
    WidgetSortBy,
} from '@/types/bums';
import {
    initialSites, initialBoards, initialBoardPosts,
    initialComments, initialWidgets, initialPosts,
} from '@/lib/bums-data';

// ── Context 타입 정의 ──

interface BumsContextType {
    // Sites
    sites: BumsSite[];
    addSite: (site: BumsSite) => void;
    updateSite: (id: string, updates: Partial<BumsSite>) => void;
    deleteSite: (id: string) => void;
    getSiteById: (id: string) => BumsSite | undefined;

    // Boards
    boards: BumsBoard[];
    addBoard: (board: BumsBoard) => void;
    updateBoard: (id: string, updates: Partial<BumsBoard>) => void;
    deleteBoard: (id: string) => void;
    getBoardById: (id: string) => BumsBoard | undefined;
    getBoardsBySite: (siteId: string) => BumsBoard[];

    // Board Posts
    boardPosts: BumsBoardPost[];
    addBoardPost: (post: BumsBoardPost) => void;
    updateBoardPost: (id: string, updates: Partial<BumsBoardPost>) => void;
    deleteBoardPost: (id: string) => void;
    getBoardPostById: (id: string) => BumsBoardPost | undefined;
    getPostsByBoard: (boardId: string) => BumsBoardPost[];
    getPostsForWidget: (boardId: string, count: number, sortBy: WidgetSortBy) => BumsBoardPost[];

    // Comments
    comments: BumsComment[];
    addComment: (comment: BumsComment) => void;
    updateComment: (id: string, updates: Partial<BumsComment>) => void;
    deleteComment: (id: string) => void;
    getCommentsByPost: (postId: string) => BumsComment[];

    // Widgets
    widgets: BumsWidget[];
    addWidget: (widget: BumsWidget) => void;
    updateWidget: (id: string, updates: Partial<BumsWidget>) => void;
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

const BumsContext = createContext<BumsContextType | undefined>(undefined);

// ── Provider ──

export function BumsProvider({ children }: { children: ReactNode }) {
    const [sites, setSites] = useState<BumsSite[]>(initialSites);
    const [boards, setBoards] = useState<BumsBoard[]>(initialBoards);
    const [boardPosts, setBoardPosts] = useState<BumsBoardPost[]>(initialBoardPosts);
    const [comments, setComments] = useState<BumsComment[]>(initialComments);
    const [widgets, setWidgets] = useState<BumsWidget[]>(initialWidgets);
    const [posts, setPosts] = useState<CmsPost[]>(initialPosts);

    const now = () => new Date().toISOString().split('T')[0];

    // ── Sites ──

    const addSite = useCallback((site: BumsSite) => {
        setSites(prev => [site, ...prev]);
    }, []);

    const updateSite = useCallback((id: string, updates: Partial<BumsSite>) => {
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

    const addBoard = useCallback((board: BumsBoard) => {
        setBoards(prev => [board, ...prev]);
    }, []);

    const updateBoard = useCallback((id: string, updates: Partial<BumsBoard>) => {
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

    const addBoardPost = useCallback((post: BumsBoardPost) => {
        setBoardPosts(prev => [post, ...prev]);
    }, []);

    const updateBoardPost = useCallback((id: string, updates: Partial<BumsBoardPost>) => {
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

        let sorted: BumsBoardPost[];
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

    const addComment = useCallback((comment: BumsComment) => {
        setComments(prev => [comment, ...prev]);
    }, []);

    const updateComment = useCallback((id: string, updates: Partial<BumsComment>) => {
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

    const addWidget = useCallback((widget: BumsWidget) => {
        setWidgets(prev => [widget, ...prev]);
    }, []);

    const updateWidget = useCallback((id: string, updates: Partial<BumsWidget>) => {
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
        <BumsContext.Provider value={{
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
        </BumsContext.Provider>
    );
}

// ── Hook ──

export function useBums() {
    const context = useContext(BumsContext);
    if (!context) throw new Error('useBums must be used within BumsProvider');
    return context;
}
