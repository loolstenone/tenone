"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { CmsPost, CmsChannel, CmsCategory, CmsStatus } from '@/types/cms';
import { initialPosts } from '@/lib/cms-data';

interface CmsContextType {
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

export function CmsProvider({ children }: { children: ReactNode }) {
    const [posts, setPosts] = useState<CmsPost[]>(initialPosts);

    const addPost = (post: CmsPost) => {
        setPosts(prev => [post, ...prev]);
    };

    const updatePost = (id: string, updates: Partial<CmsPost>) => {
        setPosts(prev => prev.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : p
        ));
    };

    const deletePost = (id: string) => {
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    const getPostById = (id: string) => posts.find(p => p.id === id);

    const getPostsByChannel = (channel: CmsChannel) =>
        posts.filter(p => p.channels.includes(channel));

    const getPostsByCategory = (category: CmsCategory) =>
        posts.filter(p => p.category === category);

    const getPublishedByChannel = (channel: CmsChannel) =>
        posts.filter(p => p.status === 'Published' && p.channels.includes(channel))
            .sort((a, b) => b.date.localeCompare(a.date));

    return (
        <CmsContext.Provider value={{
            posts, addPost, updatePost, deletePost,
            getPostById, getPostsByChannel, getPostsByCategory, getPublishedByChannel
        }}>
            {children}
        </CmsContext.Provider>
    );
}

export function useCms() {
    const context = useContext(CmsContext);
    if (!context) throw new Error('useCms must be used within CmsProvider');
    return context;
}
