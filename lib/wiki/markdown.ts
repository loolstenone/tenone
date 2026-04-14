/**
 * 위키 마크다운 유틸리티
 * [[wikilink]] 파싱 + 마크다운 렌더링 헬퍼
 */

/** [[wikilink]] 정규식 */
const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

/**
 * [[wikilink]] → 마크다운 링크로 변환
 * [[MADLeague]] → [MADLeague](/brands/madleague)
 * [[D-001]] → [D-001](/decisions/d-001)
 *
 * slugMap: title → slug 매핑 (DB에서 가져온 것)
 */
export function resolveWikiLinks(
    content: string,
    slugMap: Record<string, string>
): string {
    return content.replace(WIKILINK_REGEX, (_, linkText: string) => {
        const trimmed = linkText.trim();
        const slug = slugMap[trimmed];
        if (slug) {
            return `[${trimmed}](/wiki/${slug})`;
        }
        // 매핑 없으면 이탤릭 텍스트로 표시 (페이지 미존재)
        return `*${trimmed}*`;
    });
}

/**
 * 콘텐츠에서 [[wikilink]] 목록 추출
 */
export function extractWikiLinks(content: string): string[] {
    const links: string[] = [];
    let match;
    while ((match = WIKILINK_REGEX.exec(content)) !== null) {
        links.push(match[1].trim());
    }
    return links;
}

/**
 * slug에서 카테고리 추출
 * 'brands/madleague' → 'brands'
 */
export function categoryFromSlug(slug: string): string {
    const parts = slug.split('/');
    return parts.length > 1 ? parts[0] : '';
}

/**
 * 마크다운에서 첫 N줄 요약 추출
 */
export function extractSummary(content: string, maxLines = 3): string {
    const lines = content
        .split('\n')
        .filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'))
        .slice(0, maxLines);
    return lines.join(' ').slice(0, 200);
}
