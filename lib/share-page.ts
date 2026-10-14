// 현재 페이지 공유 — 유틸리티바·모바일 메뉴 공용. Web Share → 클립보드 → textarea 복사 순
export async function shareCurrentPage(): Promise<"shared" | "copied" | "failed"> {
    if (typeof window === "undefined") return "failed";
    const url = window.location.href;
    try {
        if (navigator.share) {
            await navigator.share({ title: document.title, url });
            return "shared";
        }
        await navigator.clipboard.writeText(url);
        return "copied";
    } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return "failed"; // 사용자가 공유 창을 닫음
        try {
            const el = document.createElement("textarea");
            el.value = url;
            el.style.position = "fixed";
            el.style.opacity = "0";
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            return "copied";
        } catch {
            return "failed";
        }
    }
}
