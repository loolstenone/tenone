import { createClient } from './client';
import type { LibraryItem, LibraryBookmark, LibrarySource } from '@/types/library';

const supabase = createClient();

// ── Helper: DB row → Frontend type ──────────────────
function rowToLibraryItem(r: Record<string, unknown>): LibraryItem {
  return {
    id: r.id as string,
    title: (r.title as string) || '',
    description: (r.description as string) || '',
    category: (r.category as LibraryItem['category']) || '기타',
    source: (r.source as LibraryItem['source']) || 'cms',
    format: (r.format as LibraryItem['format']) || 'OTHER',
    fileUrl: (r.file_url as string) || undefined,
    fileSize: (r.file_size as string) || undefined,
    tags: (r.tags as string[]) || [],
    author: (r.author as string) || '',
    authorId: (r.author_id as string) || '',
    createdAt: ((r.created_at as string)?.split('T')[0]) || '',
    updatedAt: ((r.updated_at as string)?.split('T')[0]) || '',
    permission: (r.permission as LibraryItem['permission']) || 'all',
    projectCode: (r.project_code as string) || undefined,
    projectName: (r.project_name as string) || undefined,
    bookmarkCount: Number(r.bookmark_count) || 0,
    viewCount: Number(r.view_count) || 0,
  };
}

function rowToBookmark(r: Record<string, unknown>): LibraryBookmark {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    itemId: r.item_id as string,
    source: (r.source as LibraryBookmark['source']) || 'cms',
    createdAt: ((r.created_at as string)?.split('T')[0]) || '',
  };
}

// ── Fetch ──────────────────
export async function fetchLibraryItems(opts?: {
  source?: LibrarySource;
  authorId?: string;
  limit?: number;
}): Promise<LibraryItem[]> {
  let q = supabase.from('library_items').select('*').order('updated_at', { ascending: false });
  if (opts?.source) q = q.eq('source', opts.source);
  if (opts?.authorId) q = q.eq('author_id', opts.authorId);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data || []).map(rowToLibraryItem);
}

export async function fetchLibraryBookmarks(userId: string): Promise<LibraryBookmark[]> {
  const { data } = await supabase
    .from('library_bookmarks')
    .select('*')
    .eq('user_id', userId);
  return (data || []).map(rowToBookmark);
}

// ── Mutations ──────────────────
export async function createLibraryItem(item: Omit<LibraryItem, 'bookmarkCount' | 'viewCount'>) {
  const { data, error } = await supabase.from('library_items').insert({
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    source: item.source,
    format: item.format,
    file_url: item.fileUrl || null,
    file_size: item.fileSize || null,
    tags: item.tags,
    author: item.author,
    author_id: item.authorId,
    permission: item.permission,
    project_code: item.projectCode || null,
    project_name: item.projectName || null,
  }).select().single();
  return { data: data ? rowToLibraryItem(data) : null, error };
}

export async function deleteLibraryItem(id: string) {
  return supabase.from('library_items').delete().eq('id', id);
}

export async function toggleLibraryBookmark(userId: string, itemId: string, source: LibrarySource) {
  const { data: existing } = await supabase
    .from('library_bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', itemId)
    .maybeSingle();

  if (existing) {
    await supabase.from('library_bookmarks').delete().eq('id', existing.id);
    return { bookmarked: false };
  } else {
    await supabase.from('library_bookmarks').insert({
      user_id: userId,
      item_id: itemId,
      source,
    });
    return { bookmarked: true };
  }
}
