/**
 * 문의 폼 첨부파일 규칙 — 브라우저(폼)·서버(/api/contact) 공용
 * 비공개 버킷 contact-attachments (sql/contact-attachments.sql)
 */

export const CONTACT_ATTACHMENT_BUCKET = "contact-attachments";
export const CONTACT_ATTACHMENT_MAX_FILES = 3;
export const CONTACT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const CONTACT_ATTACHMENT_EXTS = ["pdf", "ppt", "pptx", "doc", "docx", "hwp", "hwpx", "zip", "jpg", "jpeg", "png", "webp"];
export const CONTACT_ATTACHMENT_ACCEPT = CONTACT_ATTACHMENT_EXTS.map(e => `.${e}`).join(",");
export const CONTACT_ATTACHMENT_GUIDE = `PDF·PPT·Word·한글·ZIP·이미지 · 파일당 10MB · 최대 ${CONTACT_ATTACHMENT_MAX_FILES}개`;

export interface ContactAttachmentMeta {
    name: string;
    size: number;
    type: string;
}

export interface ContactAttachment extends ContactAttachmentMeta {
    path: string;
}

export function attachmentExt(name: string): string {
    return name.split(".").pop()?.toLowerCase() ?? "";
}

/** 문제가 있으면 사용자에게 보여줄 메시지, 없으면 null */
export function validateAttachments(files: ContactAttachmentMeta[]): string | null {
    if (files.length > CONTACT_ATTACHMENT_MAX_FILES) return `첨부파일은 최대 ${CONTACT_ATTACHMENT_MAX_FILES}개까지 올릴 수 있습니다.`;
    for (const f of files) {
        if (!CONTACT_ATTACHMENT_EXTS.includes(attachmentExt(f.name))) return `${f.name}: 올릴 수 없는 파일 형식입니다.`;
        if (f.size > CONTACT_ATTACHMENT_MAX_BYTES) return `${f.name}: 10MB를 넘습니다. 용량을 줄이거나 링크로 보내 주세요.`;
        if (f.size <= 0) return `${f.name}: 빈 파일입니다.`;
    }
    return null;
}

/** 링크 입력 보정 — 'notion.so/...'처럼 주소만 써도 https:// 붙임. http(s)가 아니면 null */
export function normalizeLink(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const v = raw.trim();
    if (!v) return null;
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
    try {
        const u = new URL(withScheme);
        return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
    } catch {
        return null;
    }
}
