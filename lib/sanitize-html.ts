/**
 * HTML 정화 공용 헬퍼
 *
 * isomorphic-dompurify는 서버 렌더링 때 jsdom을 불러오는데 Vercel에서 ESM 오류로 실패해
 * 해당 페이지 전체가 500이 됐다 (2026-10-05). 서버에서는 jsdom 없이 처리한다.
 *
 * - sanitizeHtml: 브라우저에서만 DOMPurify로 정화. 서버에서는 빈 문자열
 * - sanitizeRichHtml: sanitizeHtml + YouTube embed iframe만 허용 (이전 콘텐츠 본문 — MADzine·RooK). 브라우저 전용
 *   (게시글 본문은 클라이언트에서 불러온 뒤 렌더되므로 서버 출력에 영향 없음)
 * - textWithBold: 일반 텍스트 + **굵게** 표기 → 안전한 HTML (서버·브라우저 공통)
 */
import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string | null | undefined): string {
    if (!html || typeof window === 'undefined') return '';
    return DOMPurify.sanitize(html);
}

const YOUTUBE_EMBED = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//i;

export function sanitizeRichHtml(html: string | null | undefined): string {
    if (!html || typeof window === 'undefined') return '';
    DOMPurify.addHook('uponSanitizeElement', (node, data) => {
        if (data.tagName === 'iframe') {
            const src = (node as Element).getAttribute('src') ?? '';
            if (!YOUTUBE_EMBED.test(src)) node.parentNode?.removeChild(node);
        }
    });
    const clean = DOMPurify.sanitize(html, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allowfullscreen', 'frameborder'],
        FORBID_ATTR: ['style'],
    });
    DOMPurify.removeHook('uponSanitizeElement');
    return clean;
}

export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function textWithBold(text: string, boldClass: string): string {
    return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, `<strong class="${boldClass}">$1</strong>`);
}
