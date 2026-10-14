"use client";

// 인트라 Planner's 첫 화면 관리 — /api/intra/planners/home 호출 · 날짜 칸 변환
const API = "/api/intra/planners/home";
export type HomeKind = "banners" | "showcases";

export async function homeApi<T = Record<string, unknown>>(method: "GET" | "POST" | "PATCH" | "DELETE", kind: HomeKind, body?: Record<string, unknown>, id?: string): Promise<T> {
    const qs = method === "GET" || method === "DELETE" ? `?type=${kind}${id ? `&id=${id}` : ""}` : "";
    const res = await fetch(`${API}${qs}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify({ type: kind, ...body }) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error ?? "요청을 처리하지 못했습니다.");
    return data as T;
}

/** ISO → <input type="datetime-local"> 값 (한국 시간) */
export function toLocalInput(iso: string | null | undefined): string {
    if (!iso) return "";
    const d = new Date(iso);
    const kst = new Date(d.getTime() + 9 * 3600 * 1000);
    return kst.toISOString().slice(0, 16);
}

/** <input type="datetime-local"> 값(한국 시간) → ISO */
export function fromLocalInput(v: string): string | null {
    return v ? new Date(`${v}:00+09:00`).toISOString() : null;
}

/** 지금 사이트에 보이는지 — 공개 + 기간 안 */
export function liveState(item: { is_published: boolean; starts_at: string | null; ends_at: string | null }): { label: string; tone: "on" | "wait" | "off" } {
    if (!item.is_published) return { label: "비공개", tone: "off" };
    const now = Date.now();
    if (item.starts_at && Date.parse(item.starts_at) > now) return { label: `예약 · ${new Date(item.starts_at).toLocaleDateString("ko-KR")}부터`, tone: "wait" };
    if (item.ends_at && Date.parse(item.ends_at) <= now) return { label: "기간 끝남", tone: "off" };
    return { label: "노출 중", tone: "on" };
}
