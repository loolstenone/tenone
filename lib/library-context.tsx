"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { LibraryItem, LibraryBookmark, LibrarySource, LibraryCategory, LibraryPermission } from '@/types/library';
import { initialLibraryItems, initialBookmarks } from '@/lib/library-data';
import type { AccountType } from '@/types/auth';

/** accountType → 볼 수 있는 permission 레벨 */
const permissionAccess: Record<AccountType, LibraryPermission[]> = {
    staff: ['all', 'partner', 'staff', 'admin'],
    partner: ['all', 'partner'],
    'junior-partner': ['all', 'partner'],
    crew: ['all'],
    member: ['all'],
};

function canViewItem(item: LibraryItem, accountType: AccountType): boolean {
    // admin 권한은 staff 중 Admin role만 볼 수 있음
    if (item.permission === 'admin' && accountType !== 'staff') return false;
    return permissionAccess[accountType]?.includes(item.permission) ?? false;
}

const BOOKMARKS_KEY = 'tenone_library_bookmarks';
const ITEMS_KEY = 'tenone_library_items';

interface LibraryContextType {
    items: LibraryItem[];
    bookmarks: LibraryBookmark[];
    addItem: (item: LibraryItem) => void;
    updateItem: (id: string, updates: Partial<LibraryItem>) => void;
    deleteItem: (id: string) => void;
    toggleBookmark: (userId: string, itemId: string, source: LibrarySource) => void;
    isBookmarked: (userId: string, itemId: string) => boolean;
    getMyLibrary: (userId: string) => LibraryItem[];
    getWikiBookmarks: (userId: string) => LibraryItem[];
    getAllBookmarkedItems: (userId: string) => LibraryItem[];
    getBySource: (source: LibrarySource, accountType?: AccountType) => LibraryItem[];
    getByCategory: (category: LibraryCategory) => LibraryItem[];
    filterByPermission: (items: LibraryItem[], accountType: AccountType) => LibraryItem[];
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<LibraryItem[]>(() => {
        if (typeof window === 'undefined') return initialLibraryItems;
        const saved = localStorage.getItem(ITEMS_KEY);
        if (saved) {
            const savedItems: LibraryItem[] = JSON.parse(saved);
            // 사용자 추가 아이템(my-로 시작하는 동적 ID) + 초기 데이터 병합
            const userItems = savedItems.filter(i => !initialLibraryItems.find(init => init.id === i.id));
            return [...userItems, ...initialLibraryItems];
        }
        return initialLibraryItems;
    });
    const [bookmarks, setBookmarks] = useState<LibraryBookmark[]>(() => {
        if (typeof window === 'undefined') return initialBookmarks;
        const saved = localStorage.getItem(BOOKMARKS_KEY);
        return saved ? JSON.parse(saved) : initialBookmarks;
    });

    // localStorage 동기화
    useEffect(() => {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((item: LibraryItem) => {
        setItems(prev => [item, ...prev]);
    }, []);

    const updateItem = useCallback((id: string, updates: Partial<LibraryItem>) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : i));
    }, []);

    const deleteItem = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const toggleBookmark = useCallback((userId: string, itemId: string, source: LibrarySource) => {
        setBookmarks(prev => {
            const existing = prev.find(b => b.userId === userId && b.itemId === itemId);
            if (existing) {
                return prev.filter(b => b.id !== existing.id);
            }
            const newBm: LibraryBookmark = {
                id: `bm-${Date.now()}`,
                userId,
                itemId,
                source,
                createdAt: new Date().toISOString().split('T')[0],
            };
            return [...prev, newBm];
        });
    }, []);

    const isBookmarked = useCallback((userId: string, itemId: string) => {
        return bookmarks.some(b => b.userId === userId && b.itemId === itemId);
    }, [bookmarks]);

    const getMyLibrary = useCallback((userId: string) => {
        return items.filter(i => i.source === 'myverse' && i.authorId === userId);
    }, [items]);

    const getWikiBookmarks = useCallback((userId: string) => {
        const bmIds = bookmarks.filter(b => b.userId === userId && b.source === 'wiki').map(b => b.itemId);
        return items.filter(i => bmIds.includes(i.id));
    }, [items, bookmarks]);

    const getAllBookmarkedItems = useCallback((userId: string) => {
        const bmIds = bookmarks.filter(b => b.userId === userId).map(b => b.itemId);
        return items.filter(i => bmIds.includes(i.id));
    }, [items, bookmarks]);

    const getBySource = useCallback((source: LibrarySource, accountType?: AccountType) => {
        const sourceItems = items.filter(i => i.source === source);
        if (!accountType) return sourceItems;
        return sourceItems.filter(i => canViewItem(i, accountType));
    }, [items]);

    const getByCategory = useCallback((category: LibraryCategory) => {
        return items.filter(i => i.category === category);
    }, [items]);

    const filterByPermission = useCallback((itemList: LibraryItem[], accountType: AccountType) => {
        return itemList.filter(i => canViewItem(i, accountType));
    }, []);

    return (
        <LibraryContext.Provider value={{
            items, bookmarks, addItem, updateItem, deleteItem,
            toggleBookmark, isBookmarked, getMyLibrary, getWikiBookmarks, getAllBookmarkedItems,
            getBySource, getByCategory, filterByPermission,
        }}>
            {children}
        </LibraryContext.Provider>
    );
}

export function useLibrary() {
    const context = useContext(LibraryContext);
    if (!context) throw new Error('useLibrary must be used within LibraryProvider');
    return context;
}
