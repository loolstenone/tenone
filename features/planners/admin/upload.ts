"use client";

import { createClient } from "@/lib/supabase/client";

// 인트라 플래너스 PAD 관리 — 브라우저 → Storage 직접 업로드 (서명 URL은 /api/intra/planners/files 가 직원에게만 준다)
const API = "/api/intra/planners/files";

export interface UploadedFile { path: string; name: string; size: number; type: string; publicUrl: string | null }

export async function uploadPlannersAsset(file: File, target: "file" | "media"): Promise<UploadedFile> {
    const prep = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prepare", target, file: { name: file.name, size: file.size, type: file.type } }),
    });
    const p = await prep.json().catch(() => ({}));
    if (!prep.ok) throw new Error(p.error ?? "업로드를 준비하지 못했습니다.");
    const { error } = await createClient().storage.from(p.bucket).uploadToSignedUrl(p.path, p.token, file, { contentType: file.type || undefined });
    if (error) throw new Error(error.message);
    return { path: p.path, name: file.name, size: file.size, type: file.type, publicUrl: p.publicUrl };
}

export async function plannersApi<T = Record<string, unknown>>(method: "GET" | "POST" | "PATCH" | "DELETE", query = "", body?: unknown): Promise<T> {
    const res = await fetch(`${API}${query}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error ?? "요청을 처리하지 못했습니다.");
    return data as T;
}
