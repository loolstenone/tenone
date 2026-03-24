"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    BumsSite, BumsBoard, BumsBoardPost, BumsComment, BumsWidget,
    CmsPost, CmsChannel, CmsCategory,
    WidgetSortBy,
} from '@/types/bums';
import {
    initialSites, initialBoards, initialBoardPosts,
    initialComments, initialWidgets, initialPosts,
} from '@/lib/bums-data';
import * as db from '@/lib/supabase/bums';

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

    // DB 통합 조회 (퍼블릭용)
    getPublishedByBoardSlug: (siteSlug: string, boardSlug: string, limit?: number) => BumsBoardPost[];

    // DB 상태
    isDbConnected: boolean;
    refreshFromDb: () => Promise<void>;
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
    const [isDbConnected, setIsDbConnected] = useState(false);

    const now = () => new Date().toISOString().split('T')[0];

    // ── 초기화: Supabase에서 데이터 로드 (실패 시 Mock 유지) ──
    const refreshFromDb = useCallback(async () => {
        try {
            const [dbSites, dbBoards, dbPostsResult, dbWidgets] = await Promise.all([
                db.fetchSites(),
                db.fetchBoards(),
                db.fetchPosts({ limit: 500 }),
                db.fetchWidgets(),
            ]);

            // DB에 데이터가 있으면 사용, 없으면 Mock 유지
            if (dbSites.length > 0) setSites(dbSites as BumsSite[]);
            if (dbBoards.length > 0) setBoards(dbBoards as BumsBoard[]);
            if (dbPostsResult.posts.length > 0) setBoardPosts(dbPostsResult.posts as BumsBoardPost[]);
            if (dbWidgets.length > 0) setWidgets(dbWidgets as BumsWidget[]);

            setIsDbConnected(true);
            console.log('[BUMS] DB connected:', dbSites.length, 'sites,', dbBoards.length, 'boards,', dbPostsResult.posts.length, 'posts');
        } catch (err) {
            console.warn('[BUMS] DB connection failed, using mock data:', err);
            setIsDbConnected(false);
        }
    }, []);

    useEffect(() => {
        refreshFromDb();
    }, [refreshFromDb]);

    // ── Sites ──

    const addSite = useCallback(async (site: BumsSite) => {
        setSites(prev => [site, ...prev]);
        try {
            await db.upsertSite(site as unknown as Record<string, unknown>);
        } catch (err) {
            console.warn('[BUMS] addSite DB failed:', err);
        }
    }, []);

    const updateSite = useCallback(async (id: string, updates: Partial<BumsSite>) => {
        setSites(prev => prev.map(s =>
            s.id === id ? { ...s, ...updates, updatedAt: now() } : s
        ));
        try {
            await db.upsertSite({ id, ...updates } as unknown as Record<string, unknown>);
        } catch (err) {
            console.warn('[BUMS] updateSite DB failed:', err);
        }
    }, []);

    const deleteSite = useCallback((id: string) => {
        setSites(prev => prev.filter(s => s.id !== id));
    }, []);

    const getSiteById = useCallback((id: string) => {
        return sites.find(s => s.id === id);
    }, [sites]);

    // ── Boards ──

    const addBoard = useCallback(async (board: BumsBoard) => {
        setBoards(prev => [board, ...prev]);
        try {
            await db.upsertBoard(board as unknown as Record<string, unknown>);
        } catch (err) {
            console.warn('[BUMS] addBoard DB failed:', err);
        }
    }, []);

    const updateBoard = useCallback(async (id: string, updates: Partial<BumsBoard>) => {
        setBoards(prev => prev.map(b =>
            b.id === id ? { ...b, ...updates, updatedAt: now() } : b
        ));
        try {
            await db.upsertBoard({ id, ...updates } as unknown as Record<string, unknown>);
        } catch (err) {
            console.warn('[BUMS] updateBoard DB failed:', err);
        }
    }, []);

    const deleteBoard = useCallback(async (id: string) => {
        setBoards(prev => prev.filter(b => b.id !== id));
        try {
            await db.deleteBoard(id);
        } catch (err) {
            console.warn('[BUMS] deleteBoard DB failed:', err);
        }
    }, []);

    const getBoardById = useCallback((id: string) => {
        return boards.find(b => b.id === id);
    }, [boards]);

    const getBoardsBySite = useCallback((siteId: string) => {
        return boards.filter(b => b.siteId === siteId);
    }, [boards]);

    // ── Board Posts ──

    const addBoardPost = useCallback(async (post: BumsBoardPost) => {
        setBoardPosts(prev => [post, ...prev]);
        try {
            await db.createPost(post as unknown as Record<string, unknown>);
            console.log('[BUMS] Post saved to DB:', post.title);
        } catch (err) {
            console.warn('[BUMS] addBoardPost DB failed:', err);
        }
    }, []);

    const updateBoardPost = useCallback(async (id: string, updates: Partial<BumsBoardPost>) => {
        setBoardPosts(prev => prev.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: now() } : p
        ));
        try {
            await db.updatePost(id, updates as unknown as Record<string, unknown>);
        } catch (err) {
            console.warn('[BUMS] updateBoardPost DB failed:', err);
        }
    }, []);

    const deleteBoardPost = useCallback(async (id: string) => {
        setBoardPosts(prev => prev.filter(p => p.id !== id));
        try {
            await db.deletePost(id);
        } catch (err) {
            console.warn('[BUMS] deleteBoardPost DB failed:', err);
        }
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

    const addComment = useCallback(async (comment: BumsComment) => {
        setComments(prev => [comment, ...prev]);
        try {
            await db.createComment(comment as unknown as Record<string, unknown>);
        } catch (err) {
            console.warn('[BUMS] addComment DB failed:', err);
        }
    }, []);

    const updateComment = useCallback((id: string, updates: Partial<BumsComment>) => {
        setComments(prev => prev.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: now() } : c
        ));
    }, []);

    const deleteComment = useCallback(async (id: string) => {
        setComments(prev => prev.filter(c => c.id !== id));
        try {
            await db.deleteComment(id);
        } catch (err) {
            console.warn('[BUMS] deleteComment DB failed:', err);
        }
    }, []);

    const getCommentsByPost = useCallback((postId: string) => {
        return comments.filter(c => c.postId === postId);
    }, [comments]);

    // ── Widgets ──

    const addWidget = useCallback(async (widget: BumsWidget) => {
        setWidgets(prev => [widget, ...prev]);
        try {
            await db.upsertWidget(widget as unknown as Record<string, unknown>);
        } catch (err) {
            console.warn('[BUMS] addWidget DB failed:', err);
        }
    }, []);

    const updateWidget = useCallback(async (id: string, updates: Partial<BumsWidget>) => {
        setWidgets(prev => prev.map(w =>
            w.id === id ? { ...w, ...updates } : w
        ));
        try {
            await db.upsertWidget({ id, ...updates } as unknown as Record<string, unknown>);
        } catch (err) {
            console.warn('[BUMS] updateWidget DB failed:', err);
        }
    }, []);

    const deleteWidget = useCallback(async (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
        try {
            await db.deleteWidget(id);
        } catch (err) {
            console.warn('[BUMS] deleteWidget DB failed:', err);
        }
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

    // ── DB 통합 조회 (퍼블릭용) ──

    const getPublishedByBoardSlug = useCallback((siteSlug: string, boardSlug: string, limit?: number) => {
        const site = sites.find(s => s.slug === siteSlug);
        if (!site) return [];
        const board = boards.find(b => b.siteId === site.id && b.slug === boardSlug);
        if (!board) return [];
        const published = boardPosts
            .filter(p => p.boardId === board.id && p.status === 'published')
            .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
        return limit ? published.slice(0, limit) : published;
    }, [sites, boards, boardPosts]);

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
            // DB 통합
            getPublishedByBoardSlug,
            // DB 상태
            isDbConnected, refreshFromDb,
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
