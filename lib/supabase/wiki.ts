/**
 * Wiki Supabase CRUD 함수
 * library_items, library_bookmarks 테이블
 */
import { createClient } from './client';

const supabase = createClient();

// ── Library Items ──

export async function fetchLibraryItems(options?: {
    category?: string;
    source?: string;
    search?: string;
    limit?: number;
}) {
    let query = supabase.from('library_items').select('*, author:members(name)', { count: 'exact' });

    if (options?.category && options.category !== 'all') query = query.eq('category', options.category);
    if (options?.source && options.source !== 'all') query = query.eq('source', options.source);
    if (options?.search) query = query.ilike('title', `%${options.search}%`);

    query = query.order('created_at', { ascending: false });
    if (options?.limit) query = query.limit(options.limit);

    const { data, error, count } = await query;
    if (error) throw error;
    return { items: data || [], total: count || 0 };
}

export async function createLibraryItem(item: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('library_items')
        .insert(item)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateLibraryItem(id: string, updates: Record<string, unknown>) {
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
        .from('library_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteLibraryItem(id: string) {
    const { error } = await supabase.from('library_items').delete().eq('id', id);
    if (error) throw error;
}

// ── Bookmarks ──

export async function fetchBookmarks(memberId: string) {
    const { data, error } = await supabase
        .from('library_bookmarks')
        .select('*, item:library_items(*)')
        .eq('member_id', memberId);
    if (error) throw error;
    return data || [];
}

export async function addBookmark(memberId: string, itemId: string) {
    const { data, error } = await supabase
        .from('library_bookmarks')
        .insert({ member_id: memberId, item_id: itemId })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function removeBookmark(memberId: string, itemId: string) {
    const { error } = await supabase
        .from('library_bookmarks')
        .delete()
        .eq('member_id', memberId)
        .eq('item_id', itemId);
    if (error) throw error;
}

export async function isBookmarked(memberId: string, itemId: string) {
    const { data } = await supabase
        .from('library_bookmarks')
        .select('id')
        .eq('member_id', memberId)
        .eq('item_id', itemId)
        .single();
    return !!data;
}
