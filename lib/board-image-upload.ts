/**
 * 게시판 이미지 업로드 (브라우저)
 * - 업로드 전 브라우저에서 축소·압축 → Vercel 요청 한도(4.5MB)·서버 한도(5MB) 안으로
 * - 실패 시 base64로 본문에 넣지 않는다 (글 저장 요청이 한도를 넘어 저장 자체가 실패함) → 에러를 던짐
 */

const MAX_DIMENSION = 2000;
const QUALITY = 0.85;
const SKIP_BELOW_BYTES = 800 * 1024;  // 작은 파일은 그대로
const SERVER_LIMIT = 4 * 1024 * 1024;
const TARGET_BYTES = 3 * 1024 * 1024;

async function compressImage(file: File): Promise<File> {
    // GIF(애니메이션)·SVG는 캔버스로 바꾸면 손상 → 그대로
    if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
    if (file.size <= SKIP_BELOW_BYTES) return file;

    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) return file;

    // 한도 안에 들 때까지 단계적으로 축소
    let blob: Blob | null = null;
    for (const [maxDim, quality] of [[MAX_DIMENSION, QUALITY], [1600, 0.75], [1280, 0.65], [1024, 0.6]] as const) {
        const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", quality));
        if (blob && blob.size <= TARGET_BYTES) break;
    }
    bitmap.close();

    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
}

/** 이미지 업로드 → 공개 URL. 실패 시 사용자에게 보여줄 메시지로 Error */
export async function uploadBoardImage(file: File, site: string): Promise<string> {
    if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 올릴 수 있습니다.");
    const optimized = await compressImage(file);
    if (optimized.size > SERVER_LIMIT) throw new Error("이미지가 너무 큽니다. 4MB 이하로 줄여서 올려 주세요.");

    const fd = new FormData();
    fd.append("file", optimized);
    fd.append("site", site);
    const res = await fetch("/api/board/upload", { method: "POST", body: fd });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(res.status === 401 ? "로그인이 필요합니다." : body.error || "이미지 업로드에 실패했습니다.");
    }
    const { url } = await res.json();
    return url as string;
}

/** 본문에 base64로 들어간 이미지를 업로드해 URL로 교체 (저장 요청 크기 한도 대비) */
export async function uploadInlineImages(html: string, site: string): Promise<string> {
    if (!html.includes("data:image/")) return html;
    const srcs = Array.from(new Set(Array.from(html.matchAll(/src=["'](data:image\/[a-z+]+;base64,[^"']+)["']/gi), m => m[1])));
    let out = html;
    for (const src of srcs) {
        const blob = await (await fetch(src)).blob();
        const url = await uploadBoardImage(new File([blob], `image.${blob.type.split("/")[1] || "png"}`, { type: blob.type }), site);
        out = out.split(src).join(url);
    }
    return out;
}
